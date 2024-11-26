import winston, { format } from "winston";
import fs from "fs";
import path from "path";

const { combine, timestamp, label, printf } = format;

// create logger folder is foes not exist
const logFolder = path.resolve("logs");
if (!fs.existsSync(logFolder)) {
  fs.mkdirSync(logFolder);
}

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(label({ label: "right meow!" }), timestamp(), myFormat),
  defaultMeta: { service: "user-service" },
  transports: [
    // Log errors to logs/error.log
    new winston.transports.File({
      filename: path.join(logFolder, "error.log"),
      level: "error",
    }),
    // Log all levels to logs/logs.log
    new winston.transports.File({
      filename: path.join(logFolder, "logs.log"),
    }),
  ],
});
