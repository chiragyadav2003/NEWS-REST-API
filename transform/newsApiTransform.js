import {
  getDateTime,
  getDefaultProfilePicture,
  getImageUrl,
} from "../utils/helper.js";

export class NewsApiTransform {
  static transform(news) {
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      image: getImageUrl(news.image, "news_images"),
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
