# Web Crawler API

![Go Version](https://img.shields.io/badge/Go-1.24.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)
![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-orange.svg)

A robust, scalable, and production-ready web crawler API built with Go that provides comprehensive website analysis capabilities. This multi-tenant system allows users to crawl websites and extract detailed information including page structure, links analysis, and technical insights.

> **⚡ Fast Development**: This entire project was built after learning Go in just one day! It demonstrates the power of Go's simplicity and the effectiveness of clean architecture patterns for rapid, yet robust development regardless of the programming language.

## 🚀 Features

### Core Functionality

- **Multi-Tenant Architecture**: Complete user registration, authentication, and authorization system
- **Comprehensive Web Crawling**: Detailed analysis of web pages including:
  - HTML version detection (HTML5, XHTML, HTML 4.01, etc.)
  - Page title extraction
  - Heading structure analysis (H1-H6 counts)
  - Internal vs. external link classification
  - Broken link detection with HTTP status codes
  - Login form presence detection
  - Processing time metrics
- **Real-time Updates**: WebSocket integration for live crawl status notifications
- **Asynchronous Processing**: Background job processing for crawl operations
- **RESTful API**: Well-documented REST endpoints with OpenAPI/Swagger documentation

### Technical Features

- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies
- **Database Persistence**: MySQL integration with GORM ORM for data persistence
- **Concurrent Processing**: Optimized concurrent crawling with goroutines
- **Link Caching**: Intelligent caching system for broken link detection
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Configurable CORS for frontend integration
- **Docker Support**: Full containerization with Docker Compose

## 📋 Table of Contents

- [Architecture](#-architecture)
- [API Endpoints](#-api-endpoints)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🏗️ Architecture

The application follows Clean Architecture principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   HTTP      │  │  WebSocket   │  │    Middleware       │ │
│  │  Handlers   │  │   Handlers   │  │  (Auth, CORS)       │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │    User     │  │    Crawl     │  │    Notification     │ │
│  │   Service   │  │   Service    │  │     Service         │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   User      │  │    Crawl     │  │    Repository       │ │
│  │  Entity     │  │   Entity     │  │   Interfaces        │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  Database   │  │   Crawler    │  │   Authentication    │ │
│  │ Repository  │  │   Engine     │  │    (JWT)            │ │
│  │   (GORM)    │  │  (Colly)     │  │                     │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  WebSocket  │  │  Database    │  │   Configuration     │ │
│  │     Hub     │  │  Connection  │  │     Manager         │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Presentation Layer

- **HTTP Handlers**: RESTful API endpoints for authentication and crawl operations
- **WebSocket Handlers**: Real-time communication for crawl status updates
- **Middleware**: Authentication, CORS, and request processing middleware

#### Application Layer

- **User Service**: User registration, authentication, and profile management
- **Crawl Service**: Crawl job management, processing, and result handling
- **Notification Service**: Real-time updates via WebSocket connections

#### Domain Layer

- **Entities**: Core business models (User, Crawl)
- **Repository Interfaces**: Data access contracts
- **Business Logic**: Domain-specific rules and validations

#### Infrastructure Layer

- **Database Layer**: MySQL integration with GORM ORM
- **Crawler Engine**: Web crawling implementation using Colly framework
- **Authentication**: JWT token management and validation
- **WebSocket Hub**: Real-time communication management
- **Configuration**: Environment-based configuration management

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint                | Description              | Authentication |
| ------ | ----------------------- | ------------------------ | -------------- |
| `POST` | `/api/v1/auth/register` | Register a new user      | ❌             |
| `POST` | `/api/v1/auth/login`    | User login               | ❌             |
| `POST` | `/api/v1/auth/logout`   | User logout              | ✅             |
| `GET`  | `/api/v1/auth/me`       | Get current user profile | ✅             |

### Crawl Endpoints

| Method   | Endpoint                    | Description               | Authentication |
| -------- | --------------------------- | ------------------------- | -------------- |
| `POST`   | `/api/v1/crawls`            | Start a new crawl job     | ✅             |
| `GET`    | `/api/v1/crawls`            | Get user's crawl history  | ✅             |
| `GET`    | `/api/v1/crawls/{id}`       | Get specific crawl result | ✅             |
| `POST`   | `/api/v1/crawls/{id}/rerun` | Re-run an existing crawl  | ✅             |
| `DELETE` | `/api/v1/crawls/{id}`       | Delete a crawl result     | ✅             |
| `DELETE` | `/api/v1/crawls/bulk`       | Bulk delete crawl results | ✅             |

### WebSocket Endpoint

| Endpoint | Description  | Authentication                             |     |
| -------- | ------------ | ------------------------------------------ | --- |
| `GET`    | `/api/v1/ws` | WebSocket connection for real-time updates | ✅  |

## 🛠️ Installation

### Prerequisites

- **Go**: Version 1.24.2 or higher
- **Docker**: For containerized deployment
- **Docker Compose**: For multi-service orchestration
- **MySQL**: Version 8.0 (if running locally)
- **Git**: For version control

### Quick Start with Docker

1. **Clone the repository**

   ```bash
   git clone https://github.com/diabahmed/sykell-crawler.git
   cd sykell-crawler && cd server
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration:

   ```env
   # Database Configuration
   DB_PASSWORD=your_secure_password
   DB_NAME=web_crawler_db
   DB_SOURCE="root:your_secure_password@tcp(db:3306)/web_crawler_db?charset=utf8mb4&parseTime=True&loc=Local"

   # Server Configuration
   SERVER_ADDRESS="0.0.0.0:8080"

   # JWT Configuration
   TOKEN_SYMMETRIC_KEY="your_32_character_secret_key_here"
   ACCESS_TOKEN_DURATION="24h"
   ```

3. **Start the application**

   ```bash
   docker-compose up --build -d
   ```

4. **Verify the installation**
   - API: http://localhost:8088

### Local Development Setup

1. **Install dependencies**

   ```bash
   go mod download
   ```

2. **Set up MySQL database**

   ```sql
   CREATE DATABASE web_crawler_db;
   ```

3. **Update environment variables**

   ```env
   DB_SOURCE="root:password@tcp(localhost:3306)/web_crawler_db?charset=utf8mb4&parseTime=True&loc=Local"
   SERVER_ADDRESS="localhost:8080"
   ```

4. **Run the application**
   ```bash
   go run cmd/api/main.go
   ```

## ⚙️ Configuration

The application uses environment-based configuration managed by Viper. Configuration can be provided via:

1. **Environment file** (`.env`)
2. **Environment variables**
3. **Command-line flags**

### Configuration Options

| Variable                | Description                        | Default        | Required |
| ----------------------- | ---------------------------------- | -------------- | -------- |
| `DB_SOURCE`             | MySQL database connection string   | -              | ✅       |
| `SERVER_ADDRESS`        | Server bind address and port       | `0.0.0.0:8080` | ✅       |
| `TOKEN_SYMMETRIC_KEY`   | JWT signing secret key (32+ chars) | -              | ✅       |
| `ACCESS_TOKEN_DURATION` | JWT token expiration time          | `24h`          | ✅       |

### Database Configuration

The application automatically creates and migrates database tables on startup. The following tables are created:

- **users**: User accounts and authentication data
- **crawls**: Crawl jobs and results with detailed analysis data

## 🚀 Usage

### 1. User Registration and Authentication

```bash
# Register a new user
curl -X POST http://localhost:8088/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'

# Login
curl -X POST http://localhost:8088/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

### 2. Starting a Crawl Job

```bash
# Start crawling a website
curl -X POST http://localhost:8088/api/v1/crawls \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{
    "url": "https://example.com"
  }'
```

### 3. Real-time Updates

Connect to the WebSocket endpoint to receive real-time crawl status updates:

```javascript
const token = "YOUR_JWT_TOKEN";
const ws = new WebSocket(`ws://localhost:8088/api/v1/ws?token=${token}`);

ws.onmessage = function (event) {
  const crawlUpdate = JSON.parse(event.data);
  console.log("Crawl Status Update:", crawlUpdate);
};
```

### 4. Crawl Results

The API provides comprehensive crawl analysis including:

```json
{
  "id": 1,
  "user_id": 1,
  "url": "https://example.com",
  "status": "COMPLETED",
  "html_version": "HTML5",
  "title": "Example Domain",
  "heading_counts": {
    "H1": 1,
    "H2": 3,
    "H3": 5
  },
  "internal_links": 15,
  "external_links": 8,
  "broken_links": 2,
  "broken_link_detail": [
    {
      "url": "https://broken-example.com",
      "status_code": 404
    }
  ],
  "total_links": 23,
  "has_login_form": false,
  "processing_time_ms": 1500,
  "created_at": "2025-01-16T10:30:00Z",
  "updated_at": "2025-01-16T10:30:02Z"
}
```

## 🧪 Testing

### Manual Testing

Use the provided test crawler in the `tests/` directory:

```bash
cd tests
go run crawler.go https://example.com --json
```

## 🚢 Deployment

### Docker Deployment

1. **Build and deploy with Docker Compose**

   ```bash
   docker-compose up -d --build
   ```

2. **Production considerations**
   - Use environment-specific `.env` files
   - Configure proper database backups
   - Set up reverse proxy (nginx/traefik)
   - Enable HTTPS/TLS termination
   - Configure monitoring and logging

## 🔧 Development

### Project Structure

```
web-crawler-api/
├── cmd/api/                    # Application entry point
├── internal/                   # Private application code
│   ├── application/            # Application services
│   │   └── service/           # Business logic services
│   ├── domain/                # Domain entities and interfaces
│   │   ├── entity/           # Business entities
│   │   └── repository/       # Repository interfaces
│   ├── infrastructure/        # External integrations
│   │   ├── auth/             # JWT authentication
│   │   ├── config/           # Configuration management
│   │   ├── crawler/          # Web crawling engine
│   │   ├── database/         # Database connection
│   │   ├── repository/       # Repository implementations
│   │   └── websockets/       # WebSocket hub
│   ├── presentation/          # HTTP/WebSocket handlers
│   │   ├── dto/              # Data transfer objects
│   │   └── http/             # HTTP handlers and middleware
│   └── shared/                # Shared utilities
└── test/                      # Test files and utilities
```

### Key Dependencies

- **[Gin](https://github.com/gin-gonic/gin)**: HTTP web framework
- **[GORM](https://gorm.io/)**: ORM library for Go
- **[Colly](https://github.com/gocolly/colly)**: Fast and elegant web scraping
- **[JWT-Go](https://github.com/golang-jwt/jwt)**: JWT implementation
- **[Viper](https://github.com/spf13/viper)**: Configuration management
- **[Gorilla WebSocket](https://github.com/gorilla/websocket)**: WebSocket implementation
- **[Swagger](https://github.com/swaggo/gin-swagger)**: API documentation

### Adding New Features

1. **Define domain entities** in `internal/domain/entity/`
2. **Create repository interfaces** in `internal/domain/repository/`
3. **Implement repository** in `internal/infrastructure/repository/`
4. **Create service layer** in `internal/application/service/`
5. **Add HTTP handlers** in `internal/presentation/http/handler/`
6. **Update router** in `internal/presentation/http/router/`
7. **Add tests** and documentation

## 📊 Monitoring and Observability

### Metrics Collection

- HTTP request metrics
- Database connection pool metrics
- Crawl job processing times
- WebSocket connection counts
- Error rates and response times

### Logging

- Structured logging with contextual information
- Request/response logging
- Error tracking and stack traces
- Crawl job progress logging

### Health Checks

- Database connectivity checks
- External service availability
- Resource utilization monitoring

## 🔒 Security

### Authentication & Authorization

- JWT-based authentication with HTTP-only cookies
- Password hashing using bcrypt
- User isolation and data access controls
- Session management and logout functionality

### Input Validation

- URL validation for crawl requests
- Request payload validation
- SQL injection prevention via ORM
- XSS protection headers

### Network Security

- CORS configuration for cross-origin requests
- Rate limiting capabilities
- Input sanitization
- Secure headers configuration
