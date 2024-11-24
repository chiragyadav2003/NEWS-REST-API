import { prisma } from "../DB/db.config.js";
import { ProfileApiTransform } from "../transform/profileApiTransform.js";
import {
  generateRandomNumber,
  imageValidator,
  uploadImage,
} from "../utils/helper.js";

export class ProfileController {
  static async index(req, res) {
    try {
      const user = req.user;
      console.log(user);
      return res
        .status(200)
        .json({ success: true, user: ProfileApiTransform.transform(user) });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong...",
      });
    }
  }

  static async store() {}

  static async show() {}

  static async update(req, res) {
    try {
      const { id } = req.params; //id in params if of string type
      const authUser = req.user;

      if (Number(id) !== authUser.id) {
        return res.status(400).json({
          success: false,
          message: "Unauthorized request",
        });
      }

      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Profile image is required" });
      }

      const profile = req.files.profile; //our file name is profile
      const message = imageValidator(profile?.size, profile?.mimetype);
      if (message !== null) {
        return res.status(400).json({
          success: false,
          errors: {
            profile: message,
          },
        });
      }

      // upload new image
      const imageName = uploadImage(profile, "profile_images");
      if (!imageName) {
        return res.status(400).json({
          success: false,
          message: "Image upload failed",
        });
      }

      // update in database
      const response = await prisma.user.update({
        data: {
          profile: imageName,
        },
        where: {
          id: Number(id), //param is of string type, convert to number
        },
      });

      return res.status(200).json({
        success: true,
        message: "Profile image updated successfully...",
        response: ProfileApiTransform.transform(response),
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Something went wrong.Please try again",
      });
    }
  }

  static async destroy() {}
}
