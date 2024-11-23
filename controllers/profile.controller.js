import { prisma } from "../DB/db.config.js";
import { generateRandomNumber, imageValidator } from "../utils/helper.js";

export class ProfileController {
  static async index(req, res) {
    try {
      const user = req.user;
      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong...",
      });
    }
  }

  static async store() {}

  static async show() {}

  static async update(req, res) {
    const { id } = req.params; //id in params if of string type
    const authUser = req.user;

    // console.log(id, authUser.id, typeof id, typeof authUser.id);
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

    // get image extension and change image name
    const imageExt = profile?.name.split(".");
    const imageName = generateRandomNumber() + "." + imageExt[1];
    // make path where we'll upload the file
    const uploadPath = process.cwd() + "/public/images/" + imageName;

    profile.mv(uploadPath, (err) => {
      if (err) throw err;
    });

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
      response,
    });
  }

  static async destroy() {}
}
