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

  static async update() {}

  static async destroy() {}
}
