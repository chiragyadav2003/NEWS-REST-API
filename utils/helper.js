import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { SupportedMimes } from "../config/fileSystem.config.js";

export const imageValidator = (size, mime) => {
  if (bytesToMb(size) > 2) {
    return "Image size must be less than 2 MB";
  } else if (!SupportedMimes.includes(mime)) {
    return "Image must be of type png, jpg, jpeg, gif, svg, webp...";
  }
  return null;
};

export const bytesToMb = (bytes) => {
  return bytes / (1024 * 1024);
};

export const generateRandomNumber = () => {
  return uuidv4();
};

export const getImageUrl = (imageName, parentFolderName) => {
  return `${process.env.APP_URL}/${parentFolderName}/${imageName}`;
};

export const getDateTime = (timestamp) => {
  const date = new Date(timestamp);

  const day = date.getDate(); // Get the day of the month
  const month = date.toLocaleString("en-US", { month: "short" }); // Get the short month name
  const year = date.getFullYear().toString().slice(-2); // Get the last two digits of the year
  let hour = date.getHours(); // Get the hour
  const minute = date.getMinutes().toString().padStart(2, "0"); // Get the minutes, padded with 0
  const amPm = hour >= 12 ? "PM" : "AM"; // Determine AM/PM
  hour = hour % 12 || 12; // Convert to 12-hour format

  return `${day} ${month} ${year}, ${hour}:${minute} ${amPm}`;
};

export const getDefaultProfilePicture = () => {
  return getImageUrl("default_profile.jpeg", "default");
};

export const removeImage = (imageName, parentFolderName) => {
  const imagePath = path.join(
    process.cwd(),
    `public/${parentFolderName}`,
    imageName
  );

  if (fs.existsSync(path)) fs.unlinkSync(imagePath);
};

export const uploadImage = (image, parentFolderName) => {
  // get image extension and change image name
  const imageExt = image?.name.split(".");
  const imageName = generateRandomNumber() + "." + imageExt[1];

  // make path where we'll upload the file and move file there
  const uploadPath = path.join(
    process.cwd(),
    `/public/${parentFolderName}`,
    imageName
  );

  image.mv(uploadPath, (err) => {
    if (err) {
      return null;
    }
  });

  return imageName;
};
