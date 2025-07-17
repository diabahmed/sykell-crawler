# Sykell Web Crawler Platform

![Go Version](https://img.shields.io/badge/Go-1.24.2-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)
![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-orange.svg)

<img width="1920" height="1080" alt="Screenshot 2025-07-16 103733" src="https://github.com/user-attachments/assets/9ffe1416-401b-4a5b-91a5-b6f662ca7b48" />
<img width="1920" height="1080" alt="Screenshot 2025-07-16 103726" src="https://github.com/user-attachments/assets/3f506173-9c9f-45c5-82c7-2db4ec7ee0a5" />
<img width="1920" height="1080" alt="Screenshot 2025-07-16 103759" src="https://github.com/user-attachments/assets/69b86f55-0598-4d38-8062-cb59da50f92e" />
<img width="1920" height="1080" alt="Screenshot 2025-07-16 103815" src="https://github.com/user-attachments/assets/685129f1-986c-4584-9dbe-532af1997076" />


A comprehensive, full-stack web crawling platform that provides powerful website analysis capabilities through a modern web interface. Built with Go backend and Next.js frontend, this platform offers real-time crawling, detailed analytics, and an exceptional user experience.

> **⚡ Rapid Development Achievement**: This entire full-stack application was built after learning Go in just one day! It showcases the power of modern development tools, clean architecture patterns, and the effectiveness of well-structured frameworks for building robust applications quickly.

## 🌟 Platform Overview

Sykell is a multi-tenant web crawling platform that combines:

- **Powerful Backend**: High-performance Go API with clean architecture
- **Modern Frontend**: React-based dashboard with real-time updates
- **Scalable Infrastructure**: Docker-containerized deployment ready for production
- **Real-time Features**: WebSocket integration for live status updates
- **Comprehensive Analytics**: Detailed website analysis and reporting

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  Dashboard  │  │  Real-time   │  │   Authentication    │ │
│  │     UI      │  │   Updates    │  │        UI           │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP/WebSocket
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Go)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │    RESTful  │  │   WebSocket  │  │   Authentication    │ │
│  │     API     │  │     Hub      │  │   & Authorization   │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   Crawler   │  │   Business   │  │    Data Access      │ │
│  │   Engine    │  │    Logic     │  │      Layer          │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Database (MySQL)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │    Users    │  │    Crawls    │  │    Audit Logs       │ │
│  │   Tables    │  │   Results    │  │   & Sessions        │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Features

### 🕷️ Web Crawling

- **Comprehensive Analysis**: HTML version detection, title extraction, heading structure analysis
- **Link Analysis**: Internal vs. external link classification with broken link detection
- **Form Detection**: Login form presence identification
- **Performance Metrics**: Processing time tracking and optimization insights
- **Real-time Processing**: Background job processing with live status updates

### 👨‍💻 User Experience

- **Multi-tenant System**: Complete user registration and authentication
- **Modern Dashboard**: Responsive design with dark mode support
- **Real-time Updates**: WebSocket integration for live crawl notifications
- **Data Visualization**: Interactive tables with advanced filtering and sorting
- **Bulk Operations**: Manage multiple crawls efficiently

### 🛠️ Technical Excellence

- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **Type Safety**: Full TypeScript coverage across the frontend
- **Security**: JWT authentication with secure session management
- **Performance**: Optimized concurrent processing and caching systems
- **Scalability**: Docker containerization ready for production deployment

## 📦 Repository Structure

```
sykell-crawler/
├── 📁 client/                       # Next.js Frontend Application
│   ├── 📁 app/                     # Next.js App Router
│   ├── 📁 components/              # React Components
│   ├── 📁 store/                   # State Management (Zustand)
│   ├── 📁 hooks/                   # Custom React Hooks
│   ├── 📁 lib/                     # Utility Libraries
│   ├── 📁 types/                   # TypeScript Definitions
│   ├── 📁 tests/                   # E2E Tests (Playwright)
│   ├── 📄 Dockerfile               # Frontend Container Config
│   └── 📄 README.md                # Frontend Documentation
├── 📁 server/                       # Go Backend API
│   ├── 📁 cmd/api/                 # Application Entry Point
│   ├── 📁 internal/                # Private Application Code
│   │   ├── 📁 application/         # Business Logic Services
│   │   ├── 📁 domain/              # Domain Entities & Interfaces
│   │   ├── 📁 infrastructure/      # External Integrations
│   │   └── 📁 presentation/        # HTTP/WebSocket Handlers
│   ├── 📁 tests/                   # API Tests & Test Utilities
│   ├── 📄 Dockerfile               # Backend Container Config
│   └── 📄 README.md                # Backend Documentation
├── 📄 docker-compose.yml           # Multi-service Orchestration
├── 📄 .env.example                 # Environment Configuration Template
├── 📄 LICENSE                      # MIT License
└── 📄 README.md                    # This File
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (Recommended)
- **Go 1.24.2+** (for local development)
- **Node.js 20+** (for local development)
- **MySQL 8.0** (if running locally)

### 🐳 Docker Deployment (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/diabahmed/sykell-crawler.git
   cd sykell-crawler
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   # Database Configuration
   DB_PASSWORD=your_secure_password
   DB_NAME=web_crawler_db
   DB_SOURCE="root:your_secure_password@tcp(db:3306)/web_crawler_db?charset=utf8mb4&parseTime=True&loc=Local"

   # Frontend Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8088/api/v1
   NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8088/api/v1/ws

   # JWT Configuration
   TOKEN_SYMMETRIC_KEY="your_32_character_secret_key_here"
   ACCESS_TOKEN_DURATION="24h"
   ```

3. **Launch the platform**

   ```bash
   docker-compose up --build -d
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8088
   - **Database**: localhost:3306

### 🔧 Local Development

For detailed local development instructions, refer to the component-specific READMEs:

- **[Backend Development Guide](./server/README.md)** - Go API setup, testing, and development
- **[Frontend Development Guide](./client/README.md)** - Next.js setup, components, and testing

## 📖 Documentation

### Component Documentation

- **[📚 Backend API Documentation](./server/README.md)**

  - Architecture overview
  - API endpoints
  - Database schema
  - Configuration options
  - Development guide

- **[📚 Frontend Documentation](./client/README.md)**
  - Component architecture
  - State management
  - UI components
  - Testing strategy
  - Performance optimizations

### API Documentation

- **API Endpoints**: Detailed in [Backend README](./server/README.md#-api-endpoints)

## 🔐 Security

### Authentication & Authorization

- JWT-based authentication with HTTP-only cookies
- Multi-tenant user isolation
- Secure password hashing with bcrypt
- Session management and automatic logout

### API Security

- Input validation and sanitization
- CORS configuration
- Rate limiting capabilities
- SQL injection prevention via ORM

### Infrastructure Security

- Container security best practices
- Secure environment variable handling
- Network isolation with Docker

### Environment Configurations

- **Development**: Local development with hot reload
- **Staging**: Production-like environment for testing
- **Production**: Optimized for performance and security

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

For detailed component documentation, please refer to:

- [🔧 Backend Documentation](./server/README.md)
- [🎨 Frontend Documentation](./client/README.md)
