# TypeScript Express PostgreSQL Boilerplate 

A lightweight, production-ready Express.js boilerplate with JWT authentication, PostgreSQL database support, TypeScript, Zod validation, and Docker configuration.

## Features

- **JWT Authentication**: Secure token-based authentication with route-level protection
- **TypeScript**: Full TypeScript support for type safety
- **PostgreSQL Database**: PostgreSQL integration with connection pooling
- **Zod Validation**: Type-safe request validation using Zod schemas
- **Docker Support**: Ready-to-use Docker and Docker Compose configuration
- **Modular Architecture**: Clean separation of concerns (Controllers, Services, Models)
- **Security**: Helmet.js for security headers, CORS configuration
- **Environment-based Configuration**: YAML-based configuration for different environments
- **Centralized Error Handling**: Standardized error responses with custom error classes

## Project Structure

```
|   appspec.yml
+-- /src/
    |   .gitignore
    |   docker_compose.yml
    |   Dockerfile
    |   package.json
    |   README.md
    |   server.ts   (Will be our standard name for the starting point of the app)
    |   tsconfig.json
    |
    +-- /api/
    |   +-- /v1/  (We will version our API codes by folder)
    |       +-- /controllers/  (Pass request data to service layer for futher processing)
    |       |   |_  example.controller.ts
    |       |
    |       +-- /documentations/
    |       |   +-- /jsons/
    |       |       |_  example.json
    |       |
    |       +-- /entities/ (Data types for typescript)
    |       |   +-- /interfaces/
    |       |   |   |_  request_response.interfaces.ts
    |       |   +-- /types/
    |       |       |_  example.types.ts
    |       |
    |       +-- /helpers/
    |       |   |-  database.helper.ts
    |       |   |_  global.helper.ts
    |       |
    |       +-- /middlewares/
    |       |   |-  errorHandler.middleware.ts
    |       |   |_  paramsValidator.middleware.ts
    |       |
    |       +-- /models/  (Only database queries)
    |       |   |-  example.model.ts
    |       |   +-- /migrations/
    |       |       |_  create-example-table.sql
    |       |
    |       +-- /routes/
    |       |   |-  index.ts
    |       |   |_  example.routes.ts
    |       |
    |       +-- /scripts/
    |       |   +-- /logs/
    |       |
    |       +-- /services/  (Business logics)
    |       |   |_  example.service.ts
    |       |
    |       +-- /tests/
    |       |   +-- /apis/
    |       |   +-- /integrations/
    |       |   |    |_  example.integration.test.ts
    |       |   +-- /units/
    |       |       +-- /helpers/
    |       |       |   |_  global.helper.test.ts
    |       |       +-- /models/
    |       |           |_  example.model.test.ts
    |       |
    |       +-- /validations/  (Validate request data using Zod)
    |           |_  example.validation.schema.ts
    |
    +-- /configs/
    |   |-  development.env.yml
    |   |-  development.sample.env.yml
    |   +-- /constants/
    |       |-  app.constants.ts
    |       |-  constants.entities.ts
    |       +-- env.constants.ts
    |
    +-- /devops/
        |-  buildspec.[environment].yml
        +-- /scripts/
            |_  [file].sh
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd typescript-postgresql-boilerplate/production
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment configuration:
```bash
# Copy the sample configuration
cp configs/development.sample.env.yml configs/development.env.yml

# Edit the configuration file with your settings
# Update JWT secret, database credentials, ports, etc.
```

## Configuration

Edit the `configs/development.env.yml` file with your configuration:

```yaml
PORT: 8008

SHOW_ERROR_DETAILS: true # Must be set to false for Prod environment

JWT:
  secretKey: your-secret-key-here
  options:
    issuer: your-app-name
    expiresIn: 86400  # 24 hours in seconds
DATABASE:
  host: localhost
  user: root
  password: your-password
  database: your-database
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
# Build the TypeScript code
npm run build

# Start the production server
npm start
```

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Authentication System

This boilerplate uses a route-based authentication approach:

### How It Works
The `authenticatorHandler` middleware is positioned in `routes/index.ts`:
- **Public routes** are registered BEFORE `authenticatorHandler` - no authentication required
- All requests to public routes are open to the public
- **Protected routes** are registered AFTER `authenticatorHandler` - authentication automatically enforced
- All requests to protected routes must include a valid JWT Bearer token

### Route Registration Pattern

```typescript
// routes/index.ts
export default ( App: Application ) => {
    /* All Unauth routes registered BEFORE authenticatorHandler */
    App.use(`/api/${API.versionNumber}/unauth/auth`, AuthRoute); 
    App.use(`/api/${API.versionNumber}/unauth/examples`, ExampleRoute); 

    /* Authentication handler - everything after requires authentication */
    App.use(authenticatorHandler); 

    /* All Protected routes registered AFTER authenticatorHandler */
    App.use(`/api/${API.versionNumber}/users`, UserRoute);
    App.use(`/api/${API.versionNumber}/examples`, ExampleRoute);
}
```

### Creating Routes

```typescript
import { Router } from "express";
import { exec } from "../helpers/global.helper";
import { paramsValidator } from "../middlewares/params_validator.middleware";
import AuthController from "../controllers/auth.controller";
import { signinSchema } from "../validations/auth.validation.schema";

const AuthRoute: Router = Router();

// All routes in unauth routes use exec() wrapper
AuthRoute.post("/signup", exec(AuthController.signup));
AuthRoute.post("/signin", exec(AuthController.signin));

// Protected routes also use exec() - authentication enforced by route position
UserRoute.get("/profile", exec(UserController.getProfile));
UserRoute.post(
    "/update-email",
    exec(paramsValidator(emailSchema)),
    exec(UserController.updateEmail)
);

export default AuthRoute;
```

### Making Authenticated Requests

Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

**Example with cURL:**
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:8008/api/v1/example
```

## Response Formatting System

This boilerplate implements a unified response formatting system across all API endpoints. All responses follow a consistent structure, making it easier for frontend applications to handle success and error cases.

### Key Features
- Consistent response structure across all endpoints
- Type-safe response formatting with TypeScript
- Custom error classes for different error types
- Automatic error handling via `exec()` wrapper and global middleware
- Controllable error details for development vs production
- Clean separation: Services handle business logic, Controllers format responses

### Request/Response Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Request                                                 │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │  authenticatorHandler│ ──► Optional: validates JWT if present
         │  (Global Middleware) │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────┐
         │  Zod Validator       │ ──► formatResponse (validation errors)
         │  (Middleware)        │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────┐
         │  Controller          │ ──► formatResponse (success only)
         │  (wrapped by exec()) │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────┐
         │  Service             │ ──► Returns raw data OR throws error
         └───────────┬──────────┘
                     │
                ┌────┴───┐
                │        │
         ┌──────▼──┐   ┌─▼──────────┐
         │ Success │   │ Error      │
         │         │   │ (thrown)   │
         └──────┬──┘   └─┬──────────┘
                │        │
                │    ┌───▼────────┐
                │    │ exec()     │ ──► Catches error, calls next(error)
                │    │ (Wrapper)  │
                │    └────┬───────┘
                │         │
                │    ┌────▼─────────────┐
                │    │ errorHandler     │ ──► formatResponse (all errors)
                │    │ (Middleware)     │
                │    └──────────────────┘
                │
         ┌──────▼──────────┐
         │  Formatted JSON │
         │  Response       │
         └─────────────────┘
```

### Integration Points

#### 1. Params Validator Middleware
Automatically formats Zod validation errors.

```typescript
// middlewares/params_validator.middleware.ts
return res.status(RESPONSE_STATUS.client_error).json(formatResponse({
    type: 'validation_error',
    code: 'VE400',
    errors: validation_errors
}));
```

#### 2. Service Layer - Returns Raw Data or Throws Errors
Services focus on business logic and data retrieval.

```typescript
// services/example.service.ts
async getExampleData(validated_user_data: ValidatedUserDataType): Promise<ExampleResponse> {
    const data = await this.model.getData();
    
    // Validate business rules
    if(!data){
        throw new BusinessLogicError("Data not found");
    }
    
    // Return raw data (no formatting)
    return data;
}
```

#### 3. Controller Layer - Formats Success Responses Only
Controllers format successful responses. Errors are caught by `exec()`.

```typescript
// controllers/example.controller.ts

// Use RESPONSE_STATUS.success(200) for success fetching and updating data
getExample = async (req: Request, res: Response): Promise<void> => {
    const exampleService = new ExampleService();
    const result = await exampleService.getExampleData(...);
    
    // Format success responses only
    res.status(RESPONSE_STATUS.success).json(
        formatResponse({
            type: 'success',
            code: STATUS_CODE.valid.success,
            result: response_data
        })
    );
}

// Use RESPONSE_STATUS.created(201) for successfully creating data
createExample = async (req: Request, res: Response): Promise<void> => {
    const exampleService = new ExampleService();
    const result = await exampleService.createExampleData(...);
    
    // Format success responses only
    res.status(RESPONSE_STATUS.created).json(
        formatResponse({
            type: 'success',
            code: STATUS_CODE.valid.success,
            result: response_data
        })
    );
}

// Use RESPONSE_STATUS.created(204) for successfully deleting data
deleteExample = async (req: Request, res: Response): Promise<void> => {
    const exampleService = new ExampleService();
    const result = await exampleService.deleteExampleData(...);
    
    // Format success responses only
    res.status(RESPONSE_STATUS.no_content).json(
        formatResponse({
            type: 'success',
            code: STATUS_CODE.valid.success,
            result: response_data
        })
    );
}
```

#### 4. exec() Wrapper - Catches All Errors
Wraps controller functions to catch errors and pass them to error handler.

```typescript
// helpers/global.helper.ts
export const exec = (executable: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await executable(req, res, next);
        } 
        catch(error){
            return next(error);  // Pass to errorHandler middleware
        }
    }
}
```

#### 5. Error Handler Middleware - Formats All Errors
Global error handler catches and formats all errors.

```typescript
// middlewares/error_handler.middleware.ts
import { FormatResponseParams, FormattedResponse } from "../entities/types/global.type";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    // Explicitly type error_response to allow dynamic status codes
    const error_response: {status: number, data: FormattedResponse<unknown>} = {
        status: RESPONSE_STATUS.server_error,
        data: formatResponse({
            type: 'error',
            code: STATUS_CODE.invalid.internal_server_error,
            title: 'Internal Server Error',
            message: 'Something went wrong.',
            error: error
        })
    }

    /* Handle custom BaseError subclasses */
    if(error instanceof BaseError){
        error_response.status = error.http_status_code
        error_response.data = formatResponse({
            type: error.error_type,
            code: error.error_code,
            title: error.title,
            message: error.message,
            error: error
        } as FormatResponseParams);
    }
    
    /* Handle JWT errors */
    if(error instanceof JsonWebTokenError){
        error_response.status = RESPONSE_STATUS.unauthorized
        error_response.data = formatResponse({
            type: 'authentication_error',
            code: STATUS_CODE.invalid.unauthorized,
            title: 'Authentication Error',
            message: error.message,
            error: error
        });
    }

    // if(ENABLE_SENTRY){
    //     sentry.log(error_response.data)
    // }
    
    /* Fallback for unknown errors */
    return res.status(error_response.status).json(error_response.data);
}
```

## Custom Error Classes

The system provides three custom error classes that extend a powerful `BaseError` class. Each error class automatically includes HTTP status code, error code, error type, and title properties.

### BaseError Class
All custom errors extend from `BaseError`, which includes:
- **`http_status_code`**: HTTP status code (e.g., 400, 500)
- **`error_code`**: Application-specific error code. It will depend on the project lead what to use (e.g., "BLE400")
- **`error_type`**: Error type identifier (e.g., "business_logic_error")
- **`title`**: Human-readable error title, to be passed on frontend
- **`message`**: Detailed error message, to be passed on frontend
- **Automatic stack trace capture** via `Error.captureStackTrace()`

```typescript
export class BaseError extends Error{
    constructor(
        message: string,
        public readonly http_status_code: number,
        public readonly error_code: string,
        public readonly error_type: string,
        public readonly title: string
    ){
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
```

### 1. BusinessLogicError
Use when business rules are violated.

**Signature:**
```typescript
new BusinessLogicError(message: string, http_status_code?: number)
```

**Usage:**
```typescript
// Default 400 status
if(existingUser){
    throw new BusinessLogicError("User with this email already exists");
}

// Custom status code
if(insufficientFunds){
    throw new BusinessLogicError("Insufficient balance", 400);
}
```

**Default Response:**
- HTTP Status: `400` (customizable)
- Status Code: `BLE400`
- Error Type: `business_logic_error`
- Title: `Business Logic Error`

### 2. DatabaseError
Use for database-related errors.

**Signature:**
```typescript
new DatabaseError(message: string, http_status_code?: number)
```

**Usage:**
```typescript
// Default 500 status
const error_message = error instanceof Error ? error.message : String(error);
throw new DatabaseError(error_message);

// Custom status code
throw new DatabaseError("Database connection pool exhausted", 503);
```

**Default Response:**
- HTTP Status: `500` (customizable)
- Status Code: `DBE500`
- Error Type: `database_error`
- Title: `Database Error`

### 3. ValidationError
Use for validation failures (alternative to Zod validation).

**Signature:**
```typescript
new ValidationError(message: string, http_status_code?: number)
```

**Usage:**
```typescript
// Default 400 status
if(!isValidEmail(email)){
    throw new ValidationError("Invalid email format");
}

// Custom status code
throw new ValidationError("Request payload too large", 400);
```

**Default Response:**
- HTTP Status: `400` (customizable)
- Status Code: `VE400`
- Error Type: `validation_error`
- Title: `Validation Error`

## API Response Format

### Success Response
```json
{
  "code": "VS200",
  "result": {
    "id": 1,
    "name": "Example data"
  }
}
```

### Error Response
```json
{
  "code": "BLE400",
  "error": {
    "title": "Business Logic Error",
    "message": "User-friendly error message",
    "details": "Technical error details (only if SHOW_ERROR_DETAILS=true)"
  }
}
```

### Error Types
- `VE400` - Validation Error (Zod validation failures)
- `BLE400` - Business Logic Error (business rule violations)
- `DBE500` - Database Error (database connection/query errors)
- `UA401` - Unauthorized (authentication failures)
- `ISE500` - Internal Server Error (unhandled errors)

## Adding New Routes

### 1. Create Route File (`api/v1/routes/user.route.ts`)

```typescript
import { Router } from "express";
import { exec } from "../helpers/global.helper";
import { paramsValidator } from "../middlewares/params_validator.middleware";
import UserController from "../controllers/user.controller.ts";
import { createUserSchema } from "../validations/user.validation.schema";

const UserRoute: Router = Router();

// Unauth route
UserRoute.post("/signup", exec(UserController.signup));

// Protected routes
UserRoute.get("/profile", exec(UserController.getProfile));
UserRoute.post(
    "/create",
    exec(paramsValidator(createUserSchema)),
    exec(UserController.createUser)
);

export default UserRoute;
```

### 2. Create Controller (`api/v1/controllers/user.controller.ts`)

```typescript
import { Request, Response } from "express";
import { formatResponse } from "../helpers/global.helper";
import { STATUS_CODE } from "@constants/api_request.constants";
import UserService from "../services/user.service";

class UserController {
    getProfile = async (req: Request, res: Response): Promise<void> => {
        const userService = new UserService();
        const user_id = req.validated_user_data?.id;
        
        const result = await userService.getUserProfile(user_id);
        
        res.status(RESPONSE_STATUS.success).json(formatResponse({
            type: 'success',
            code: STATUS_CODE.valid.success,
            result
        }));
    };
}

export default new UserController();
```

### 3. Create Service (`api/v1/services/user.service.ts`)

```typescript
import { BusinessLogicError } from "../helpers/global.helper";
import UserModel from "../models/user.model";

class UserService {
    constructor() {}
    
    async getUserProfile(user_id: string) {
        const userModel = new UserModel();
        const user = await userModel.findById(user_id);
        
        if(!user){
            throw new BusinessLogicError("User not found");
        }
        
        return user;
    }
}

export default UserService;
```

### 4. Create Model (`api/v1/models/user.model.ts`)

**Model Naming Convention:** Model class name should match the table name (e.g., `users` table → `UserModel`)

**Standard Structure:** Every model should have exactly 4 functions:
1. `fetchTableName()` - Fetch records (flexible query building)
2. `insertTableName()` - Insert records (single or batch)
3. `updateTableName()` - Update records (single or batch)
4. `deleteTableName()` - Delete records (single or batch)

```typescript
/* Vendor modules */
import { QueryResultRow } from "pg";
import { format } from 'pg-format';

/* Models */
import DatabaseModel from "./database.model";

/* Types */
import { OkPacketParams } from "../entities/types/global.type";

/**
 * @class UserModel
 * Model for users table operations
 * Last Updated: Nov 13, 2025
 * @author Kirt
 */
class UserModel extends DatabaseModel {

    /**
     * DOCU: Fetch users record/s with flexible query building
     * Query building done in service layer for flexibility
     * Triggered by: UserService functions
     * Last Updated: Nov 13, 2025
     * @param ModelParametersInterface params - Query parameters
     * @returns Promise<FetchUsersResult> - Fetched records
     * @author Kirt
     */
    fetchUsers = async <FetchUsersResult extends QueryResultRow>(params: ModelParametersInterface): Promise<FetchUsersResult[]> => {
        const {fields_to_select, join_statement, where_params, where_values, group_by, order_by, limit, offset} = params;
		const last_index = where_values?.length || NUMBERS.one;

        const join_clause = join_statement || "";
        const where_clause = (where_params) ? `WHERE ${where_params}` : "";
        const group_by_clause = (group_by) ? `GROUP BY ${group_by}` : "";
        const order_by_clause = (order_by) ? `ORDER BY ${order_by}` : "";
        const limit_clause = (limit !== undefined) ? `LIMIT $${last_index++}` : "";
        const offset_clause = (offset !== undefined) ? `OFFSET $${last_index}` : "";
        
        /* Build flexible query - structure defined by service layer */
        const fetch_users_query = `
            ${cte ? `WITH ${cte}` : ""}
			SELECT ${fields_to_select || "*"} 
            FROM users 
            ${join_clause} 
            ${where_clause}
            ${group_by_clause}
            ${order_by_clause} 
            ${limit_clause} 
            ${offset_clause}
		`;

        const fetch_users_response = await this.executeQuery<FetchUsersResult>(fetch_users_query, where_values || [], USE_READ_REPLICA);
        return fetch_users_response;
    };

	/**
	 * Create a new record
	 * Triggered by: UserService functions
	 * Last Updated: Nov 13, 2025
	 * @param {(string | number | boolean | Date)[][]} record_details - Data object to insert
	 * @returns {number} Inserted record ID
	 * @author Kirt
	 */
	insertUsers = async (record_details: (string | number | boolean | Date)[][]) => {  
		let create_user_query = format(`
			INSERT INTO users (username, email, password_hash, status, created_at) 
			VALUES %L
			RETURNING id
		`, record_details);
		let create_user_result = await this.executeQuery(create_user_query);

		return create_user_result.rows[0].id;
	};

    /**
	 * DOCU: Update an existing record
	 * Triggered by: UserService functions
	 * Last Updated: Nov 13, 2025
	 * @param {string} set_fields - Fields to update
	 * @param {string} where_params - WHERE clause
	 * @param {object} set_values - Fields to update
	 * @param {number} where_values - ID of record to update
	 * @returns {boolean} True if updated successfully\
	 * @author Kirt
	 */
	updateUserRecord = async (set_fields: string, where_params: string, set_values: (string | number | boolean | Date)[], where_values: (string | number | boolean | Date)[] = []): Promise<boolean> => {  
		let update_user_result = await this.executeQuery(`UPDATE users SET ${set_fields} WHERE ${where_params}`, [...set_values, ...where_values]);

		return !!update_user_result.rowCount;
	};

	/**
	 * DOCU: Delete a record
	 * Triggered by: UserService functions
	 * Last Updated: Nov 13, 2025
	 * @param {string} where_params - WHERE clause
	 * @param {object} where_values - Fields to update
	 * @returns {boolean} True if deleted successfully
	 * @author Kirt
	 */
	deleteUserRecord = async (where_params: string, where_values: (string | number | boolean | Date)[] = []): Promise<boolean> => {  
		let delete_user_result = await this.executeQuery(`DELETE FROM users WHERE ${where_params}`, where_values);

		return !!delete_user_result.rowCount;
	};
}

export default UserModel;
```

**Service Layer Examples (Query Building):**

```typescript
// Service using the flexible model functions
class UserService {
    async getUserById(user_id: number) {
        const userModel = new UserModel();
        // Fetch with specific conditions
        const [users] = await userModel.fetchUsers<User[]>({
            fields_to_select: "id, email, name, created_at",
            where_params: "id = $1 AND is_active = $2",
            where_values: [user_id, 1],
            limit: 1
        });
        
        return users;
    }
    
    async getUsersWithPagination(page: number, per_page: number) {
        const userModel = new UserModel();
        const offset = (page - 1) * per_page;
        
        // Fetch with pagination and ordering
        const users = await userModel.fetchUsers<User[]>({
            fields_to_select: "id, email, name, created_at",
            where_params: "is_active = $1",
            where_values: [1],
            order_by: "created_at DESC",
            limit: per_page,
            offset: offset
        });
        
        return users;
    }
    
    async createUser(user_data: CreateUserData) {
        const userModel = new UserModel();
        // Single insert
        const result = await userModel.insertUsers([[user_data.email, user_data.name, user_data.hashed_password]]);
        
        return { user_id: result.rows[0].id };
    }
    
    async updateUser(user_id: number, update_data: Partial<User>) {
        const userModel = new UserModel();
        
		let { set_fields, set_values, next_index } = buildSetClause(update_data);

        // Single update
        const result = await userModel.updateUsers(
            set_fields,
            "id = $1",
            set_values,
			[user_id]
        );
        
        return { updated: result.rowCount };
    }
    
    async deactivateMultipleUsers(user_ids: number[]) {
        const userModel = new UserModel();
        
        // Batch update
        const result = await userModel.updateUsers(
            "is_active = $1",
			/* format() is used to prevent SQL injection, since pg cannot catch array values for dynamic insert */
            format("id IN (%L)", user_ids),
            [1]
        );
        
        return { updated_count: result.affectedRows };
    }
    
    async deleteUser(user_id: number) {
        const userModel = new UserModel();
        
        // Single delete
        const result = await userModel.deleteUsers("id = $1", [user_id]);
        return { deleted: result.affectedRows > 0 };
    }
    
    async deleteInactiveUsers(days: number) {
        const userModel = new UserModel();
        
        // Batch delete with condition
        const result = await userModel.deleteUsers(
            "is_active = $1 AND DATEDIFF(NOW(), last_login_at) > $2",
            [0, days]
        );
        
        return { deleted_count: result.affectedRows };
    }
}
```

### 5. Create Validation Schema (`api/v1/validations/user.validation.schema.ts`)

```typescript
import { z } from "zod";

export const createUserSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        name: z.string().min(2, "Name must be at least 2 characters"),
        password: z.string().min(8, "Password must be at least 8 characters")
    })
});
```

### 6. Register Route (`api/v1/routes/index.ts`)

```typescript
import UserRoutes from "./user.route";

export default (App: Express) => {
    App.use("/api/v1/users", UserRoutes);
};
```

## Error Handling

Use custom error classes in your services:

```typescript
import { BusinessLogicError, DatabaseError, ValidationError } from "../helpers/global.helper";

// Business rule violation
if (existingUser) {
    throw new BusinessLogicError("Email already exists");
}

// Database error
if (dbError) {
    throw new DatabaseError("Failed to connect to database");
}

// Validation error (alternative to Zod)
if (!isValidFormat) {
    throw new ValidationError("Invalid data format");
}
```

## Security Features

- **Helmet.js**: Sets security HTTP headers
- **CORS**: Configurable Cross-Origin Resource Sharing
- **JWT Authentication**: Token-based authentication with route-level protection
- **Request Validation**: Type-safe validation using Zod schemas
- **SQL Injection Protection**: Parameterized queries with pg and pg-format
- **Error Sanitization**: Production mode hides error details

## Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run staging`: Start staging environment
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm run lint`: Run ESLint

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

**Last Updated:** November 12, 2025

example
