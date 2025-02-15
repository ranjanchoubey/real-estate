# Detailed Documentation for Deploying FastAPI on AWS EC2 with Docker

This guide will walk you through the steps to deploy a FastAPI application on an AWS EC2 instance using Docker.

## **Prerequisites**
1. AWS Account: Ensure you have an AWS account.
2. Docker Installed: Docker should be installed on your local machine.
3. EC2 Instance: An EC2 instance running a Linux distribution (e.g., Amazon Linux 2 or Ubuntu).

## **Step 1: Prepare Your FastAPI Application**
Ensure your FastAPI application is structured correctly. Here is an example directory structure:
```
webapps/
└── backend/
    ├── app.py
    ├── Dockerfile
    ├── requirements.txt
    ├── start_api.sh
    └── .gitignore
```

**Dockerfile**
- Create a Dockerfile to containerize your FastAPI application.

```
# Use the official Python image from the Docker Hub
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 7878

# Command to run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7878"]
```


## **Step 2: Build and Test the Docker Image Locally**

- Navigate to the webapps/backend directory and build the Docker image:

``` 
cd backend
sudo docker build -t real-estate-api .
sudo docker run -p 7878:7878 real-estate-api
```

- This will build the Docker image and run it locally on port 7878.

## **Step 3: Push the Docker Image to a Container Registry**

1. Log in to Docker Hub:

```
sudo docker login
```

2. Tag your Docker image & Push the Docker image to Docker Hub:

```
sudo docker tag real-estate-api ranjan999/real-estate-api:latest

sudo docker push ranjan999/real-estate-api:latest
```

3. Verify the Docker image is pushed to Docker Hub:

```
sudo docker images

```
## **Step 4: Set Up an AWS EC2 Instance**

1. Launch an EC2 Instance: From the AWS Management Console, launch an EC2 instance.
2. Choose an AMI: Select an Amazon Machine Image (AMI), such as Amazon Linux 2 or Ubuntu.
3. Instance Type: Choose an instance type (e.g., t2.micro for testing).
4. Configure Security Group: Ensure the security group allows traffic on your port (e.g., 7878).
5. Connect to the Instance: Use SSH to connect to your EC2 instance.

## **Step 5: Install Docker on the EC2 Instance**

1. Connect to your EC2 instance and install Docker:

```
# Update the package database
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Start Docker
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

```

## **Step 6: Pull and Run the Docker Image on the EC2 Instance**

1. Log in to Docker Hub on the EC2 instance:

```
sudo docker login
```
2. Pull the Docker image:

```
sudo docker pull ranjan999/real-estate-api
```
3. Run the Docker container:

Find the container ID of the running container
```
sudo docker ps
```

Stop and remove the running container
```
sudo docker stop <container_id>
sudo docker rm <container_id>
```

```
sudo docker run -p 7878:7878 ranjan999/real-estate-api
```

## **Step 7: Access Your FastAPI Application**

Your FastAPI application should now be accessible via the public IP address of your EC2 instance on port 7878. For example:

```
http://<your-ec2-public-ip>:7878
```