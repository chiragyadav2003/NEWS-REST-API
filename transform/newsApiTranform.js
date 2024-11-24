import {
  getDateTime,
  getDefaultProfilePicture,
  getImageUrl,
} from "../utils/helper.js";

// "parentFolderName" for profile : profile_images , for news : news_images
export class NewsApiTransform {
  static transform(news, parentFolderName) {
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      image: getImageUrl(news.image, parentFolderName),
      created_at: getDateTime(news.created_at),
      writer_info: {
        id: news.user.id,
        name: news.user.name,
        email: news.user.email,
        profile_image:
          news.user?.profile !== null
            ? getImageUrl(news.user.profile, "profile_images")
            : getDefaultProfilePicture(),
      },
    };
  }
}
