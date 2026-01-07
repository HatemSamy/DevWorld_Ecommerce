# Swagger Documentation

This directory contains Swagger/OpenAPI documentation for all API routes. The documentation is organized into separate files for better maintainability and cleaner route files.

## Structure

Each route module has its corresponding Swagger documentation file:

- `cart.swagger.js` - Shopping cart endpoints documentation
- `banner.swagger.js` - Banner management endpoints documentation

## Usage

The Swagger documentation files are imported into their respective route files. For example:

```javascript
// In routes/cart.routes.js
import '../swagger/cart.swagger.js';
```

This approach keeps the route files clean and focused on routing logic while maintaining comprehensive API documentation.

## Adding New Documentation

When creating a new route module:

1. Create a new file: `src/swagger/[module-name].swagger.js`
2. Add Swagger JSDoc comments for all endpoints
3. Import the documentation file in the corresponding route file

Example structure:

```javascript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     summary: Endpoint description
 *     tags: [TagName]
 *     responses:
 *       200:
 *         description: Success
 */
```

## Benefits

- **Separation of Concerns**: Route logic and documentation are separated
- **Maintainability**: Easier to update and manage API documentation
- **Cleaner Code**: Route files are more focused and readable
- **Scalability**: Easy to add documentation for new endpoints
