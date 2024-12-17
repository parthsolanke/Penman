# Backend

This backend uses Python 3.6. To run the application, follow these steps:

## Using Virtual Environment

1. Create a virtual environment:
    ```sh
    python3.6 -m venv venv
    ```

2. Activate the virtual environment:
    - On Windows:
        ```sh
        venv\Scripts\activate
        ```
    - On Unix or MacOS:
        ```sh
        source venv/bin/activate
        ```

3. Install the requirements:
    ```sh
    pip install -r requirements.txt
    ```

4. Set environment variables by referring to the `.env.example` file.

5. Execute `run.sh` to start the application:
    ```sh
    ./run.sh
    ```

## Using Docker

1. Build the Docker image:
    ```sh
    docker build -t penman-backend .
    ```

2. Run the Docker container:
    ```sh
    docker run -p 8000:8000 --env-file .env penman-backend
    ```

3. Run Docker container in detached mode and restart always:
    ```sh
    docker run -d --restart always -p 8000:8000 --env-file .env penman-backend
    ```