Project Overview

This API is designed to provide essential services for a web application, including user authentication, file uploads, job queues, email notifications, and logging. It uses popular libraries like express, jsonwebtoken, bcryptjs, bullmq, and prisma for efficient backend operations.
Getting Started

Follow these instructions to set up and run the backend locally.
Prerequisites

Ensure you have the following installed:

    Node.js (v16 or later)
    Yarn (or npm)

Installation

- Clone the repository:

  ```
  git clone <https://github.com/chiragyadav2003/NEWS-REST-API.git>
  cd `NEWS-REST-API`
  ```

- Install dependencies:
  ```
  yarn install
  ```

Set up your environment variables by creating a .env file in the root of the project. Example :

```
PORT=8000
NODE_ENV=development
APP_URL=http://localhost:8000

# JWT
ACCESS_TOKEN_SECRET=<YOUR_SECRET>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=<YOUR_SECRET>
REFRESH_TOKEN_EXPIRY=7d

# database connection
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/backend"

# email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<YOUR_EMAIL>
SMTP_PASS=<YOUR_PASSWORD>
FROM_EMAIL=<YOUR_FROM_EMAIL>

# redis connection
REDIS_HOST=localhost
REDIS_PORT=6379
```

Running the API

    For development, use nodemon to automatically restart the server on file changes:

yarn dev

For production, start the API normally:

    yarn start

Available Scripts

    yarn start: Starts the API in production mode.
    yarn dev: Starts the API with nodemon for development.

Dependencies

The project uses the following dependencies:

    Prisma: ORM for interacting with the database.
    vinejs: For schema validation.
    bcryptjs: For password hashing.
    bullmq: Job and task queue management.
    cookie-parser: Middleware for parsing cookies.
    cors: Middleware for handling CORS (Cross-Origin Resource Sharing).
    dotenv: Loads environment variables from a .env file.
    express: Web framework for handling HTTP requests.
    express-fileupload: Middleware for handling file uploads.
    express-rate-limit: Rate-limiting for API endpoints.
    helmet: Security middleware for setting HTTP headers.
    ioredis: Redis client for BullMQ and other services.
    jsonwebtoken: For generating and verifying JWT tokens.
    nodemailer: For sending emails.
    uuid: For generating unique identifiers.
    winston: Logger for server-side logging.

Development Dependencies

    prisma: ORM tool for database schema management and migrations.

API Endpoints

The API provides various routes for authentication, file uploads, job handling, and more. Check the server.js or any route files to see the available endpoints.
Logging

The API uses winston for logging requests and errors. Logs are written to the console by default, but you can configure them to write to a file or a remote logging service as needed.
License

This project is licensed under the MIT License.

# NEWS-REST-API
