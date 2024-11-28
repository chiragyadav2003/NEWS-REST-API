export const defaultQueueConfig = {
  // delay: 5000,
  removeOnComplete: {
    count: 100,
    age: 60 * 60 * 24,
  },
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
  removeOnFail: {
    count: 3,
  },
};