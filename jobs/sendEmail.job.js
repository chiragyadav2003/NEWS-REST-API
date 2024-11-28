import { Queue, Worker } from "bullmq";
import { redisConnection } from "../config/redisConnection.config.js";
import { defaultQueueConfig } from "../config/queue.config.js";
import { logger } from "../config/logger.js";
import { sendEmail } from "../config/mailer.config.js";

export const emailQueueName = "email_queue";

export const emailQueue = new Queue(emailQueueName, {
  connection: redisConnection,
  defaultJobOptions: defaultQueueConfig,
});

// * worker

export const emailHandlerWorker = new Worker(
  emailQueueName,
  async (job) => {
    try {
      logger.info({
        jobId: job.id,
        data: job.data,
        message: "Processing email job.",
      });
      console.log("The email worker data is:", job.data);

      const data = job.data;

      if (!Array.isArray(data)) {
        throw new Error("Job data is not an array");
      }

      // Process each email task
      for (const item of data) {
        try {
          await sendEmail(item.toEmail, item.subject, item.body);
          logger.info({
            toEmail: item.toEmail,
            subject: item.subject,
            message: `Email sent successfully for job_id: ${job.id}.`,
          });
        } catch (emailError) {
          logger.warn({
            error: emailError,
            toEmail: item.toEmail,
            subject: item.subject,
            message: `Failed to send email for job_id: ${job.id}.`,
          });
        }
      }
    } catch (error) {
      logger.warn({
        error: error,
        jobId: job.id,
        message: "Failed to process email job.",
      });
      throw error; // Ensure the worker registers the job as failed
    }
  },
  {
    connection: redisConnection,
  }
);

// * worker listeners
emailHandlerWorker.on("completed", (job) => {
  logger.info({
    job: job,
    message: `SendEmailJob with job_id:${job.id} completed successfully.`,
  });
  console.log(`the job ${job.id} is completed`);
});

emailHandlerWorker.on("failed", (job) => {
  logger.warn({
    job: job,
    message: "SendEmailJob with job_id:${job.id} failed.",
  });
  console.log(`the job ${job.id} is failed`);
});
