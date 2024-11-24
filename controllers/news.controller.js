import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/news.validation.js";
import { generateRandomNumber, imageValidator } from "../utils/helper.js";
import { prisma } from "../DB/db.config.js";
import { NewsApiTransform } from "../transform/newsApiTransform.js";

export class NewsController {
  static async index(req, res) {
    try {
      // limit and skip for pagination, query parameters are string, need to convert to number
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 1;

      // handle page and limit inconsistencies
      if (page <= 0) page = 1;
      if (limit <= 0 || limit >= 100) limit = 10;

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
        NewsApiTransform.transform(item, "news_images")
      );

      // metadata : total news count and with its help total pages
      const totalNews = await prisma.news.count();
      const totalPages = Math.ceil(totalNews / limit);

      return res.status(200).json({
        success: true,
        message: "News retrieved successfully.",
        news: transformedNews,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
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

      // get image extension and change image name
      const imageExt = image?.name.split(".");
      const imageName = generateRandomNumber() + "." + imageExt[1];

      // make path where we'll upload the file and move file there
      const uploadPath = process.cwd() + "/public/news_images/" + imageName;
      image.mv(uploadPath, (err) => {
        if (err) throw err;
      });

      // assign remaining news field : user_id, image
      payload.user_id = user.id;
      payload.image = imageName;

      // update in db
      const news = await prisma.news.create({
        data: payload,
      });

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

  static async show(req, res) {}

  static async update(req, res) {}

  static async destroy(req, res) {}
}
