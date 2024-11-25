import vine, { errors } from "@vinejs/vine";
import { newsSchema, updateSchema } from "../validations/news.validation.js";
import { imageValidator, removeImage, uploadImage } from "../utils/helper.js";
import { prisma } from "../DB/db.config.js";
import { NewsApiTransform } from "../transform/newsApiTransform.js";
import { client } from "../config/redis.client.config.js";

export class NewsController {
  static async index(req, res) {
    try {
      // limit and skip for pagination
      // query parameters are string, need to convert to number
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 1;

      // handle page and limit inconsistencies
      if (page <= 0) page = 1;
      if (limit <= 0 || limit >= 100) limit = 10;

      // NOTE: create a unique cache key based on pagination
      const cachedKey = `news:page:${page}:limit:${limit}`;
      const cachedNews = await client.get(cachedKey);
      if (cachedNews) {
        return res.status(200).json(JSON.parse(cachedNews));
      }

      // how many records we have to skip for getting next result or offset
      const skipRecords = (page - 1) * limit;
      const news = await prisma.news.findMany({
        take: limit,
        skip: skipRecords,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
            },
          },
        },
      });

      // handle case for no news
      if (!news || news.length === 0) {
        return res.status(200).json({
          success: true,
          news: null,
          message: "No news available.",
        });
      }

      // transform news
      const transformedNews = news.map((item) =>
        NewsApiTransform.transform(item)
      );

      // metadata : total news count and with its help total pages
      const totalNews = await prisma.news.count();
      const totalPages = Math.ceil(totalNews / limit);

      const responseData = {
        success: true,
        message: "News retrieved successfully.",
        news: transformedNews,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      };

      // NOTE: cache the response for 5 minutes
      await client.set(cachedKey, JSON.stringify(responseData), "EX", 300);

      return res.status(200).json(responseData);
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          errors: error.messages,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again later.",
        });
      }
    }
  }

  static async show(req, res) {
    try {
      const { id } = req.params;

      // * create a unique cache key for the specified news items
      const cachedKey = `news:id:${id}`;
      const cachedNews = await client.get(cachedKey);
      if (cachedNews) {
        return res.status(200).json(JSON.parse(cachedNews));
      }

      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
            },
          },
        },
      });

      // handle case for no news
      if (!news) {
        return res.status(200).json({
          success: true,
          news: null,
          message: "Invalid news request.",
        });
      }

      const transformedNews = NewsApiTransform.transform(news);

      const responseData = {
        success: true,
        message: "News retrieves successfully.",
        news: transformedNews,
      };

      // * cache the response for 5 minutes
      await client.set(cachedKey, JSON.stringify(responseData), "EX", 300);

      return res.status(200).json(responseData);
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          errors: error.messages,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again later.",
        });
      }
    }
  }

  static async store(req, res) {
    try {
      const user = req.user;
      const body = req.body;

      // validate form entities (title, content) with news schema
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      // validate file and its size and mimeType i.e, it is an image
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Image is required",
          errors: {
            image: "Image field is required",
          },
        });
      }

      const image = req.files.image; //our file name is image
      const message = imageValidator(image?.size, image?.mimetype);
      if (message !== null) {
        return res.status(400).json({
          success: false,
          errors: {
            image: message,
          },
        });
      }

      // upload  image
      const imageName = uploadImage(image, "news_images");
      if (!imageName) {
        return res.status(400).json({
          success: false,
          message: "Image upload failed",
        });
      }

      // assign remaining news field : user_id, image
      payload.user_id = user.id;
      payload.image = imageName;

      // update in db
      const news = await prisma.news.create({
        data: payload,
      });

      // * invalidate news cache list, new news added, remove old cached data
      await client.del("news:*");

      return res.status(200).json({
        success: true,
        message: "News created successfully!",
        news,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          errors: error.messages,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Something went wrong.Please try again...",
        });
      }
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const body = req.body;

      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      // handle case for no news
      if (!news) {
        return res.status(200).json({
          success: true,
          news: null,
          message: "Invalid news request.",
        });
      }

      // check if user is writer i.e, authorized for updating news
      if (user.id !== news.user_id) {
        return res.status(400).json({
          success: false,
          message: "UnAuthorized request.",
        });
      }

      // validate req body with updateSchema
      const validator = vine.compile(updateSchema);
      const payload = await validator.validate(body);

      // check if user also wants to update the image and validate its type also
      const image = req?.files?.image;
      if (image) {
        const message = imageValidator(image?.size, image?.mimetype);
        // validate image size and type
        if (message) {
          return res.status(400).json({
            success: false,
            message: "Invalid image type",
            errors: {
              image: message,
            },
          });
        }

        // upload new image
        const imageName = uploadImage(image, "news_images");
        if (!imageName) {
          return res.status(400).json({
            success: false,
            message: "Image upload failed",
          });
        }

        //update payload
        payload.image = imageName;

        // delete old image
        removeImage(news.image, "news_images");
      }

      // update payload in the database
      const updatedNews = await prisma.news.update({
        data: payload,
        where: { id: Number(id) },
      });

      // * invalidate specific news items cache and list cache
      await client.del(`news:id:${id}`); // Remove specific news item cache
      await client.del("news:*"); //wildcard deletion

      return res.status(200).json({
        success: true,
        message: "News updated successfully.",
        updatedNews,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          errors: error.messages,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again later.",
        });
      }
    }
  }

  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      // handle case for no news
      if (!news) {
        return res.status(200).json({
          success: true,
          news: null,
          message: "Invalid news request.",
        });
      }

      // check if user is writer i.e, authorized for updating news
      if (user.id !== news.user_id) {
        return res.status(400).json({
          success: false,
          message: "UnAuthorized request.",
        });
      }

      // delete image from file system
      removeImage(news.image, "news_images");

      // delete from db
      await prisma.news.delete({
        where: {
          id: Number(id),
        },
      });

      // * Invalidate specific news item cache and list caches
      await client.del(`news:id:${id}`); // Specific item deletion
      await client.del("news:*"); // Wildcard deletion

      return res.status(200).json({
        success: true,
        message: "News deleted successfully.",
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          errors: error.messages,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again later.",
        });
      }
    }
  }
}
