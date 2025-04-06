# Hoagie Hub API

Backend API for Hoagie Hub, a collaborative platform designed for creating, sharing, and discussing delicious hoagie sandwich recipes. This project was built as part of the Senior Full-Stack Technical Assessment.

## Table of Contents

- [Technologies](#technologies)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Sample API Requests/Responses](#sample-api-requestsresponses)
- [Database Schema](#database-schema)
- [Architecture](#architecture)
- [Bonus Activities Completed](#bonus-activities-completed)
  - [Collaborators in Hoagie Schema](#collaborators-in-hoagie-schema)
  - [Contributor Count via Aggregation](#contributor-count-via-aggregation)
  - [Rate Limiting](#rate-limiting)
  - [Input Validation](#input-validation)
- [Testing](#testing)
- [Seed Data](#seed-data)

## Technologies

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Swagger/OpenAPI](https://swagger.io/) - API documentation
- [class-validator](https://github.com/typestack/class-validator) - Input validation
- [NestJS Throttler](https://docs.nestjs.com/security/rate-limiting) - Rate limiting

## Features

- User management (creation, search, authentication)
- Hoagie recipe creation and management
- Collaborative editing of hoagie recipes
- Commenting system on hoagie recipes
- Pagination and search functionality
- Rate limiting for API protection
- Comprehensive API documentation with Swagger
- Standardized error handling

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MongoDB (local or remote instance)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/hoagie-hub-backend.git
   cd hoagie-hub-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

1. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/hoagie-hub
   ```

2. Adjust the MongoDB URI as needed for your environment.

### Running the Application

- Development mode:

  ```bash
  npm run start:dev
  ```

- Production mode:
  ```bash
  npm run build
  npm run start:prod
  ```

## API Documentation

Complete API documentation is available via Swagger UI when the application is running:

```
http://localhost:3000/v1/docs
```

### API Endpoints Overview

- **Users**

  - `GET /v1/users` - Get all users (paginated)
  - `GET /v1/users/:id` - Get user by ID
  - `GET /v1/users/search?q=query` - Search for users
  - `POST /v1/users` - Create a new user
  - `POST /v1/users/login` - Login with email

- **Hoagies**

  - `GET /v1/hoagies` - Get all hoagies (paginated)
  - `GET /v1/hoagies/:id` - Get hoagie by ID
  - `POST /v1/hoagies` - Create a new hoagie
  - `PATCH /v1/hoagies/:id/user/:userId` - Update a hoagie
  - `POST /v1/hoagies/:hoagieId/collaborators/:collaboratorId/user/:userId` - Add a collaborator
  - `DELETE /v1/hoagies/:hoagieId/collaborators/:collaboratorId/user/:userId` - Remove a collaborator
  - `GET /v1/hoagies/:id/comment-count` - Get comment count for a hoagie

- **Comments**
  - `GET /v1/comments/hoagie/:hoagieId` - Get comments for a hoagie (paginated)
  - `POST /v1/comments` - Create a new comment
  - `DELETE /v1/comments/:id` - Delete a comment

### Sample API Requests/Responses

#### Create a User

**Request:**

```http
POST /v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Response:**

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "createdAt": "2023-07-25T12:34:56.789Z",
  "updatedAt": "2023-07-25T12:34:56.789Z"
}
```

#### Create a Hoagie

**Request:**

```http
POST /v1/hoagies
Content-Type: application/json

{
  "name": "Italian Hoagie",
  "ingredients": ["Ham", "Provolone", "Lettuce", "Tomato", "Onion"],
  "userId": "64a1b2c3d4e5f6g7h8i9j0k2",
  "picture": "https://example.com/images/italian-hoagie.jpg"
}
```

**Response:**

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
  "name": "Italian Hoagie",
  "ingredients": ["Ham", "Provolone", "Lettuce", "Tomato", "Onion"],
  "picture": "https://example.com/images/italian-hoagie.jpg",
  "creator": "64a1b2c3d4e5f6g7h8i9j0k2",
  "collaborators": [],
  "commentCount": 0,
  "createdAt": "2023-07-25T12:40:56.789Z",
  "updatedAt": "2023-07-25T12:40:56.789Z"
}
```

#### Get Paginated Hoagies

**Request:**

```http
GET /v1/hoagies?page=1&limit=10
```

**Response:**

```json
{
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
      "name": "Italian Hoagie",
      "ingredients": ["Ham", "Provolone", "Lettuce", "Tomato", "Onion"],
      "picture": "https://example.com/images/italian-hoagie.jpg",
      "creator": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "commentCount": 0,
      "createdAt": "2023-07-25T12:40:56.789Z",
      "updatedAt": "2023-07-25T12:40:56.789Z"
    }
    // ... more hoagies
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

#### Add a Comment

**Request:**

```http
POST /v1/comments
Content-Type: application/json

{
  "text": "This hoagie looks delicious!",
  "userId": "64a1b2c3d4e5f6g7h8i9j0k2",
  "hoagieId": "64a1b2c3d4e5f6g7h8i9j0k3"
}
```

**Response:**

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k4",
  "text": "This hoagie looks delicious!",
  "user": "64a1b2c3d4e5f6g7h8i9j0k2",
  "hoagie": "64a1b2c3d4e5f6g7h8i9j0k3",
  "createdAt": "2023-07-25T12:45:56.789Z",
  "updatedAt": "2023-07-25T12:45:56.789Z"
}
```

#### Add a Collaborator

**Request:**

```http
POST /v1/hoagies/64a1b2c3d4e5f6g7h8i9j0k3/collaborators/64a1b2c3d4e5f6g7h8i9j0k5/user/64a1b2c3d4e5f6g7h8i9j0k2
```

**Response:**

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
  "name": "Italian Hoagie",
  "ingredients": ["Ham", "Provolone", "Lettuce", "Tomato", "Onion"],
  "picture": "https://example.com/images/italian-hoagie.jpg",
  "creator": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "collaborators": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k5",
      "name": "Jane Smith",
      "email": "jane.smith@example.com"
    }
  ],
  "commentCount": 1,
  "createdAt": "2023-07-25T12:40:56.789Z",
  "updatedAt": "2023-07-25T12:50:56.789Z"
}
```

## Database Schema

### User

```typescript
{
  email: string; // Unique, indexed
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Hoagie

```typescript
{
  name: string;  // Indexed
  ingredients: string[];
  picture?: string;  // Optional
  creator: User;  // Reference to User, indexed
  collaborators?: User[];  // Array of User references, added for bonus activity
  commentCount: number;  // Counter cache for efficient comment counts
  createdAt: Date;
  updatedAt: Date;
}
```

### Comment

```typescript
{
  text: string;
  user: User; // Reference to User, indexed
  hoagie: Hoagie; // Reference to Hoagie, indexed
  createdAt: Date;
  updatedAt: Date;
}
```

## Architecture

The application follows a modular architecture based on NestJS best practices:

1. **Controllers** - Handle HTTP requests and define API endpoints
2. **Services** - Contain business logic and data operations
3. **Models/Schemas** - Define data structure using Mongoose schemas
4. **DTOs (Data Transfer Objects)** - Define data validation rules
5. **Filters** - Handle exceptions and standardize error responses

```
src/
├── common/                  # Shared code and utilities
│   ├── exceptions/          # Custom exception classes
│   └── filters/             # Exception filters
├── users/                   # User module
│   ├── dto/                 # Data transfer objects
│   ├── schemas/             # MongoDB schemas
│   ├── users.controller.ts  # HTTP endpoints
│   └── users.service.ts     # Business logic
├── hoagies/                 # Hoagie module
│   ├── dto/
│   ├── schemas/
│   ├── hoagies.controller.ts
│   └── hoagies.service.ts
├── comments/                # Comments module
│   ├── dto/
│   ├── schemas/
│   ├── comments.controller.ts
│   └── comments.service.ts
└── app.module.ts            # Main application module
```

## Bonus Activities Completed

### Collaborators in Hoagie Schema

- Implemented collaborator support in the Hoagie schema
- Added endpoints to add and remove collaborators
- Created permission checks to ensure only creators can manage collaborators

### Contributor Count via Aggregation

- Implemented a method to calculate the total number of contributors for a hoagie
- Used MongoDB aggregation patterns to efficiently count contributors

### Rate Limiting

- Implemented NestJS Throttler for API rate limiting protection
- Created granular rate limiting for different operations:
  - General API: 100 requests per minute
  - Hoagie Creation: 5 requests per minute
  - Comment Creation: 10 requests per minute
  - User Creation: 3 requests per minute
  - User Search: 20 requests per minute
  - Hoagie Update: 10 requests per minute

### Input Validation

- Used class-validator for comprehensive input validation
- Created DTOs with detailed validation rules
- Implemented global validation pipe in NestJS application
- Added descriptive Swagger documentation for input requirements

## Testing

Run tests with the following command:

```bash
npm test
```

For end-to-end tests:

```bash
npm run test:e2e
```

## Seed Data

This project includes a seed script to create initial data for testing purposes.

### Seed Content
- 5 users with predefined names and emails
- 5 hoagies for each user with random images from a predefined set
- Random ingredients for each hoagie

### How to Run the Seed
```bash
# Using npm
npm run seed

# Using yarn
yarn seed

# Using pnpm
pnpm seed
```
