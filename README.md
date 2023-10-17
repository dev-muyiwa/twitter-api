# Twitter API

This is a Twitter API built using microservices architecture with Node.js and TypeScript. It allows you to interact with Twitter data programmatically, enabling features such as retrieving user timelines, posting tweets, and searching for tweets.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Microservices](#microservices)
- [Endpoints](#endpoints)
- [Authentication](#authentication)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)


Certainly, if you've set up your project to run with Docker Compose, you can simplify the prerequisites section like this:

## Prerequisites

Before you begin, ensure you have `docker` and `docker-compose` installed on your system.

## Getting Started

1. Clone this repository:

   ```bash
   git clone https://github.com/dev-muyiwa/twitter-api.git
   ```

2. Navigate to the project directory:

   ```bash
   cd twitter-api
   ```

3. Run the application in detached mode using Docker Compose:

   ```bash
   docker-compose up -d
   ```

This will start all the necessary services and containers, making it easier for users to get started with your Twitter API.

## Microservices

This project is organized into microservices, each serving a specific function:

- **Account**: Handles user authentication and other user-related operations.
- **Tweets**: Manages tweet-related operations.
- **Followings**: Manages user followings and followers.
- **Notification**: Manages user notifications, ranging from SMS to Email.

Each microservice is a separate Node.js application with its own Mongo database.

## Endpoints

For detailed information on available endpoints and their usage, refer to the API documentation provided in each microservice's README.

## Authentication

This Twitter API uses OAuth 1.0a for authentication. Users must authenticate themselves to obtain an access token that allows them to make requests on behalf of their Twitter account. The account service handles this process.

## Deployment

For production deployment, consider containerization using Docker and container orchestration platforms like Kubernetes. Each microservice should be deployed separately to ensure scalability and maintainability.

## Contributing

Contributions are welcome! If you want to contribute to this project, please follow the [Contributing Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.