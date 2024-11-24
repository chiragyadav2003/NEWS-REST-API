import { getDateTime, getImageUrl } from "../utils/helper.js";

// for profile : profile_images , for news : news_images
export class NewsApiTransform {
  static transform(news, parentFolderName) {
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      image: getImageUrl(news.image, parentFolderName),
      created_at: getDateTime(news.created_at),
    };
  }
}
