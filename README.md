# Simple Cryptocurrency Exchange

This project is a simple Cryptocurrency exchange application built using `JavaScript`, `Node.js`, `Express`, and `MongoDB` as the database. The API documentation is available through `Swagger`, and the project can be containerized using `Docker`.

## Project Overview

- **Tech Stack**: JavaScript, Node.js, Express
- **Database**: MongoDB
- **Documentation**: Swagger
- **Containerization**: Docker

## Database Entity-Relationship Diagram (ERD)

![alt text](https://github.com/Little-BlackCat/simple-cryptocurrencies-exchange/blob/main/images/Cryptocurrency%20exchange.svg "Cryptocurrency exchange")

## Prerequisites

- [Docker](https://www.docker.com/get-started/)

## How to Run

1. Clone the project from Git:

   ```bash
   git clone git@github.com:Little-BlackCat/simple-cryptocurrencies-exchange.git
   ```
2. Navigate to the project directory.
    ```bash
    cd simple-cryptocurrencies-exchange
    ```
3. Build and start the project using Docker Compose:
    ```bash
    docker-compose up -d --build
    ```
This command will build the project and start the containers in detached mode.

The project should now be up and running.

![alt text](https://github.com/Little-BlackCat/simple-cryptocurrencies-exchange/blob/main/images/docker.png "docker")

## Access the Documentation
You can access the API documentation using Swagger at the following URL:
http://localhost:3000/api-docs

![alt text](https://github.com/Little-BlackCat/simple-cryptocurrencies-exchange/blob/main/images/swagger-docs.png "swagger-docs")

Enjoy using the Cryptocurrency Exchange project!

## Shutdown and Cleanup

When you're finished using the project, you can stop and remove the containers along with their volumes using the following command:
```bash
docker-compose down -v
```

This ensures a clean shutdown and removes any persisted data volumes.

That's it! You now know how to run and interact with the "Simple Cryptocurrency Exchange" project using Docker.
