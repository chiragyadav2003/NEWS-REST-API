import Redis from "ioredis";
import { redisConnection } from "./redisConnection.config.js";

export const client = new Redis(redisConnection);
