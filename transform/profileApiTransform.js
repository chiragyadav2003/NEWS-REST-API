import {
  getDateTime,
  getDefaultProfilePicture,
  getImageUrl,
} from "../utils/helper.js";

export class ProfileApiTransform {
  static transform(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_image:
        user?.profile !== null
          ? getImageUrl(user.profile, "profile_images")
          : getDefaultProfilePicture(),
    };
  }
}
