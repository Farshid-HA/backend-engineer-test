# Use an official Node.js runtime as a parent image
FROM oven/bun:1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the rest of the application code
COPY . .

RUN bun install
RUN bun add inversify reflect-metadata

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
ENTRYPOINT bun start
