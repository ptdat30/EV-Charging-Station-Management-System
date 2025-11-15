# 🔌 EV Charging Station Management System

A comprehensive microservices-based platform for managing electric vehicle charging stations, providing real-time monitoring, payment processing, user management, and analytics capabilities.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality
- **Station Management**: Complete CRUD operations for charging stations and chargers
- **Charging Sessions**: Real-time session management with start/stop functionality
- **Reservations**: Booking system for charging slots
- **Payment Processing**: Multiple payment methods including wallet, cash, and card payments
- **User Management**: Support for individual users, business accounts, and staff members
- **Loyalty Program**: Points-based reward system with tier management
- **Notifications**: Real-time push notifications via Firebase Cloud Messaging (FCM)
- **Analytics**: Comprehensive dashboard with revenue reports and usage statistics

### User Roles
- **Driver**: Book charging sessions, manage wallet, view history
- **Station Owner**: Manage stations, view revenue, monitor operations
- **Staff**: Monitor and control charging sessions, handle incidents
- **Admin**: Full system administration and configuration

### Advanced Features
- Real-time charging status monitoring
- Interactive map with station locations
- QR code-based session initiation
- Invoice generation
- Price calculation with dynamic pricing
- Incident reporting and management
- Remote station control

## 🛠 Technology Stack

### Frontend
- **React 19.1.1** - UI library
- **Vite 7.1.11** - Build tool and dev server
- **React Router 7.9.4** - Client-side routing
- **Axios 1.12.2** - HTTP client
- **Leaflet & React-Leaflet** - Interactive maps
- **Recharts 3.3.0** - Data visualization
- **Firebase 10.7.1** - Push notifications
- **React Icons & Lucide React** - Icon libraries

### Backend
- **Spring Boot 2.7.18 / 3.3.12** - Application framework
- **Spring Cloud 2021.0.9 / 2023.0.3** - Microservices framework
- **Spring Cloud Gateway** - API Gateway
- **Netflix Eureka** - Service discovery
- **Spring Cloud Config** - Centralized configuration
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Data persistence
- **MySQL** - Relational database
- **RabbitMQ** - Message broker
- **Lombok** - Boilerplate code reduction
- **JWT** - Token-based authentication

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Maven** - Dependency management

## 🏗 Architecture

This project follows a **microservices architecture** pattern with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                      Port: 5181 (Vite)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Spring Cloud)                │
│                         Port: 8080                           │
└──────────┬───────────────────────────────────────┬──────────┘
           │                                       │
           ▼                                       ▼
    ┌─────────────┐                         ┌─────────────┐
    │   Eureka    │                         │    Config   │
    │   Server    │                         │   Server    │
    │  Port: 8761 │                         │  Port: 8888 │
    └─────────────┘                         └─────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────┐
    │              Microservices (Eureka Clients)           │
    ├──────────┬──────────┬──────────┬──────────┬─────────┤
    │   Auth   │   User   │ Station  │ Charging │ Payment │
    │ Service  │ Service  │ Service  │ Service  │ Service │
    ├──────────┼──────────┼──────────┼──────────┼─────────┤
    │Notification│Loyalty │Analytics │          │         │
    │  Service   │Service │ Service  │          │         │
    └────────────┴────────┴──────────┴──────────┴─────────┘
           │
           ▼
    ┌─────────────┬─────────────┐
    │   MySQL     │  RabbitMQ   │
    │  Database   │  Message    │
    │             │   Broker     │
    └─────────────┴─────────────┘
```

### Microservices Overview

| Service | Port | Description |
|---------|------|-------------|
| **API Gateway** | 8080 | Single entry point, routing, authentication |
| **Eureka Server** | 8761 | Service discovery and registration |
| **Config Server** | 8888 | Centralized configuration management |
| **Auth Service** | - | Authentication and JWT token generation |
| **User Service** | 9000 | User management and profiles |
| **Station Service** | - | Station and charger management |
| **Charging Service** | - | Charging session management |
| **Payment Service** | 8083 | Payment processing and wallet management |
| **Notification Service** | - | Push notifications via FCM |
| **Loyalty Service** | 8088 | Loyalty points and rewards |
| **Analytics Service** | - | Data analytics and reporting |

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17** or higher
- **Node.js 18+** and **npm** or **yarn**
- **Maven 3.6+**
- **MySQL 8.0+**
- **Docker** and **Docker Compose** (for RabbitMQ)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EV-Charging-Station-Management-System
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE ev_charging_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update database credentials in configuration files (see [Configuration](#-configuration) section).

### 3. Backend Setup

#### Start Infrastructure Services

```bash
# Start RabbitMQ using Docker Compose
cd backend
docker-compose up -d
```

#### Build Backend Services

```bash
# Build all services (run from backend/services directory)
cd backend/services
mvn clean install
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

Configuration files are located in `backend/services/config-repo/`. Key configurations:

#### Database Configuration
Update database connection in each service's `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ev_charging_db
    username: your_username
    password: your_password
```

#### Service Ports
Default ports are configured in `config-repo/*.yml` files. Modify if needed.

#### RabbitMQ Configuration
Default RabbitMQ settings:
- Host: `localhost`
- Port: `5672`
- Management UI: `http://localhost:15672`
- Username: `guest`
- Password: `guest`

### Frontend Configuration

#### API Endpoint
Update API base URL in `frontend/src/config/` if needed (default: `http://localhost:8080`).

#### Firebase Configuration
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Cloud Messaging
3. Copy Firebase config to `frontend/src/config/firebase.js`

## 🏃 Running the Application

### Start Backend Services

**Important**: Services must be started in the following order:

1. **Eureka Server**
```bash
cd backend/services/eureka-server
mvn spring-boot:run
```

2. **Config Server**
```bash
cd backend/services/config-server
mvn spring-boot:run
```

3. **Core Services** (can be started in parallel)
```bash
# Auth Service
cd backend/services/auth-service
mvn spring-boot:run

# User Service
cd backend/services/user-service
mvn spring-boot:run

# Station Service
cd backend/services/station-service
mvn spring-boot:run

# Charging Service
cd backend/services/charging-service
mvn spring-boot:run

# Payment Service
cd backend/services/payment-service
mvn spring-boot:run

# Notification Service
cd backend/services/notification-service
mvn spring-boot:run

# Loyalty Service
cd backend/services/loyalty-service
mvn spring-boot:run

# Analytics Service
cd backend/services/analytics-service
mvn spring-boot:run
```

4. **API Gateway** (start last)
```bash
cd backend/services/api-gateway
mvn spring-boot:run
```

### Start Frontend

```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5181
- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761
- **RabbitMQ Management**: http://localhost:15672

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/validate` - Validate JWT token

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `GET /api/users/profile` - Get current user profile

#### Stations
- `GET /api/stations` - Get all stations
- `GET /api/stations/{id}` - Get station by ID
- `POST /api/stations` - Create station
- `PUT /api/stations/{id}` - Update station
- `DELETE /api/stations/{id}` - Delete station

#### Chargers
- `GET /api/chargers` - Get all chargers
- `GET /api/chargers/{id}` - Get charger by ID
- `POST /api/chargers` - Create charger

#### Charging Sessions
- `POST /api/sessions/start` - Start charging session
- `POST /api/sessions/{id}/stop` - Stop charging session
- `GET /api/sessions/{id}` - Get session details
- `GET /api/sessions/status/{id}` - Get real-time session status

#### Reservations
- `GET /api/reservations` - Get all reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/{id}/cancel` - Cancel reservation

#### Payments
- `POST /api/payments/process` - Process payment
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/top-up` - Top up wallet

#### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark as read

#### Loyalty
- `GET /api/loyalty/points` - Get loyalty points
- `GET /api/loyalty/history` - Get points history

## 📁 Project Structure

```
EV-Charging-Station-Management-System/
├── frontend/                    # React frontend application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── api/                 # API service calls
│   │   ├── components/          # React components
│   │   │   ├── admin/           # Admin components
│   │   │   ├── staff/           # Staff components
│   │   │   └── ...              # Common components
│   │   ├── config/              # Configuration files
│   │   ├── context/             # React context providers
│   │   ├── pages/               # Page components
│   │   ├── routes/              # Route definitions
│   │   ├── services/            # Business logic services
│   │   ├── styles/              # CSS stylesheets
│   │   └── utils/               # Utility functions
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Backend microservices
│   ├── services/
│   │   ├── api-gateway/         # API Gateway service
│   │   ├── eureka-server/       # Service discovery
│   │   ├── config-server/       # Configuration server
│   │   ├── auth-service/        # Authentication service
│   │   ├── user-service/        # User management
│   │   ├── station-service/     # Station management
│   │   ├── charging-service/    # Charging sessions
│   │   ├── payment-service/     # Payment processing
│   │   ├── notification-service/# Push notifications
│   │   ├── loyalty-service/     # Loyalty program
│   │   ├── analytics-service/   # Analytics & reporting
│   │   └── config-repo/         # Centralized configs
│   └── docker-compose.yml       # RabbitMQ container
│
└── README.md                    # This file
```

## 💻 Development

### Code Style
- **Backend**: Follow Spring Boot conventions and Java naming conventions
- **Frontend**: Follow React best practices and ESLint rules

### Running Tests
```bash
# Backend tests
cd backend/services/<service-name>
mvn test

# Frontend tests (if configured)
cd frontend
npm test
```

### Building for Production

#### Frontend
```bash
cd frontend
npm run build
```
Output will be in `frontend/dist/`

#### Backend
```bash
cd backend/services/<service-name>
mvn clean package
```
JAR files will be in `target/` directory

### Environment Variables
Create `.env` files for environment-specific configurations:
- Backend: Use Spring profiles (`application-{profile}.yml`)
- Frontend: Use Vite environment variables (`.env.local`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write clear commit messages
- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Write tests for new functionality

## 👥 Authors

- **Development Team** - Initial work

## 🙏 Acknowledgments

- Spring Boot and Spring Cloud communities
- React and Vite teams
- All open-source contributors

---

**Note**: This is an active development project. Some features may be in progress or subject to change.

