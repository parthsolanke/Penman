## Run Using Docker

1. Build the Docker image:
    ```sh
    docker build -t penman-frontend .
    ```

2. Run the Docker container:
    ```sh
    docker run -p 3000:3000 --env-file .env penman-frontend
    ```

3. Run Docker container in detached mode and restart always:
    ```sh
    docker run -d --restart always -p 3000:3000 --env-file .env penman-frontend
    ```