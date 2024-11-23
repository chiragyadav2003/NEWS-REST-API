import { v4 as uuidv4 } from "uuid";
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
