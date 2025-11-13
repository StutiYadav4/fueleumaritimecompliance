# Fuel EU Maritime Compliance Backend

## Overview
This backend service is designed to support the Fuel EU Maritime compliance platform. It provides APIs for managing routes, calculating compliance balances, and handling banking and pooling operations as per the Fuel EU Maritime Regulation (EU) 2023/1805.

## Architecture
The backend follows a Hexagonal Architecture (Ports & Adapters) which separates the core business logic from the infrastructure and presentation layers. The core contains domain models, application use cases, and ports for repositories. The adapters implement the inbound HTTP routes and outbound database interactions.

### Core Structure
- **Domain**: Contains the core business models and services.
- **Application**: Contains use cases that define the application's business logic.
- **Ports**: Interfaces for repositories that abstract data access.

### Adapters
- **Inbound**: HTTP routes for handling requests.
- **Outbound**: Implementations for data access using PostgreSQL.

## Setup & Run Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd fuel-eu-maritime-compliance/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the environment variables:
   - Copy `.env.example` to `.env` and configure your database connection.

4. Run the database migrations and seed the database:
   ```
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the server:
   ```
   npm run dev
   ```

## API Endpoints
- **Routes**
  - `GET /routes`: Fetch all routes.
  - `POST /routes/:id/baseline`: Set a route as baseline.
  - `GET /routes/comparison`: Get comparison data for routes.

- **Compliance**
  - `GET /compliance/cb`: Compute compliance balance.
  - `GET /compliance/adjusted-cb`: Get adjusted compliance balance.

- **Banking**
  - `GET /banking/records`: Fetch banking records.
  - `POST /banking/bank`: Bank positive compliance balance.
  - `POST /banking/apply`: Apply banked surplus.

- **Pooling**
  - `POST /pools`: Create a new pool.

## Testing
To run the tests, use:
```
npm run test
```

## Observations
This backend service is designed to be scalable and maintainable, adhering to best practices in software architecture and development. The use of TypeScript ensures type safety and better developer experience.

## License
This project is licensed under the MIT License.