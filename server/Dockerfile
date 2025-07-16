# Stage 1: Build the application
FROM golang:1.24-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files to leverage Docker cache
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the application.
# CGO_ENABLED=0 is important for creating a static binary
# GOOS=linux ensures the binary is built for the Linux container environment
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/main ./cmd/api/main.go

# Stage 2: Create the final, lean production image
FROM alpine:latest

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/main .

# Copy the configuration file. The container needs this to start.
# We will mount the actual .env file using docker-compose.
COPY .env.example .env

# Expose the port the application runs on
EXPOSE 8080

# The command to run the application
CMD ["./main"]