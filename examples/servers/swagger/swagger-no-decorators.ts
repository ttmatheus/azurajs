/**
 * Swagger WITHOUT decorators - TypeScript Example
 * Perfect for TypeScript users who prefer not to use decorators
 */

import { AzuraClient } from '../../../package/src/infra/Server';
import { setupSwagger, SwaggerHelpers } from '../../../package/src/swagger';
import type { Schema } from '../../../package/src/types/swagger.type';

const app = new AzuraClient();

// Setup Swagger
const swagger = setupSwagger(app, {
  title: 'My TypeScript API',
  description: 'API documentation without decorators',
  version: '1.0.0',
  servers: [{ url: 'http://localhost:3000' }],
  tags: [
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Products', description: 'Product management endpoints' },
  ],
});

// Define reusable schemas
const UserSchema: Schema = SwaggerHelpers.createSchema(
  {
    id: { type: 'number', description: 'User ID' },
    name: { type: 'string', description: 'User full name' },
    email: { type: 'string', format: 'email', description: 'User email address' },
    age: { type: 'number', minimum: 0, description: 'User age' },
    createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
  },
  ['id', 'name', 'email']
);

const CreateUserSchema: Schema = SwaggerHelpers.createSchema(
  {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    email: { type: 'string', format: 'email' },
    age: { type: 'number', minimum: 0, maximum: 150 },
  },
  ['name', 'email']
);

const ProductSchema: Schema = SwaggerHelpers.createSchema({
  id: { type: 'number' },
  name: { type: 'string' },
  description: { type: 'string' },
  price: { type: 'number', minimum: 0 },
  category: { type: 'string' },
  inStock: { type: 'boolean' },
});

// Add schemas to Swagger components for reuse
swagger.addSchema('User', UserSchema);
swagger.addSchema('CreateUser', CreateUserSchema);
swagger.addSchema('Product', ProductSchema);

// ============================================
// Users API
// ============================================

// GET /users - List all users
app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, createdAt: new Date().toISOString() },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, createdAt: new Date().toISOString() }
  ]);
});

swagger.addRoute({
  method: 'GET',
  path: '/users',
  summary: 'List all users',
  description: 'Retrieve a paginated list of all users',
  tags: ['Users'],
  parameters: [
    SwaggerHelpers.createParameter('page', 'query', { type: 'number', default: 1 }, {
      description: 'Page number'
    }),
    SwaggerHelpers.createParameter('limit', 'query', { type: 'number', default: 10 }, {
      description: 'Items per page'
    })
  ],
  responses: {
    200: SwaggerHelpers.createResponse(
      'List of users',
      { type: 'array', items: { $ref: '#/components/schemas/User' } },
      [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, createdAt: '2026-01-13T00:00:00Z' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, createdAt: '2026-01-13T00:00:00Z' }
      ]
    )
  }
});

// GET /users/:id - Get user by ID
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ 
    id: Number(userId), 
    name: 'John Doe', 
    email: 'john@example.com', 
    age: 30,
    createdAt: new Date().toISOString()
  });
});

swagger.addRoute({
  method: 'GET',
  path: '/users/:id',
  summary: 'Get user by ID',
  description: 'Retrieve a single user by their unique identifier',
  tags: ['Users'],
  parameters: [
    SwaggerHelpers.createParameter('id', 'path', { type: 'number' }, {
      description: 'Unique user identifier',
      required: true,
      example: 1
    })
  ],
  responses: {
    200: SwaggerHelpers.createResponse(
      'User found',
      { $ref: '#/components/schemas/User' }
    ),
    404: SwaggerHelpers.createResponse('User not found', 
      SwaggerHelpers.createSchema({
        error: { type: 'string', example: 'User not found' }
      })
    )
  }
});

// POST /users - Create new user
app.post('/users', (req, res) => {
  const newUser = {
    id: Date.now(),
    ...(req.body as Record<string, any>),
    createdAt: new Date().toISOString()
  };
  res.status(201).json(newUser);
});

swagger.addRoute({
  method: 'POST',
  path: '/users',
  summary: 'Create a new user',
  description: 'Create a new user with the provided information',
  tags: ['Users'],
  requestBody: SwaggerHelpers.createRequestBody(
    { $ref: '#/components/schemas/CreateUser' },
    'User information',
    true,
    { name: 'John Doe', email: 'john@example.com', age: 30 }
  ),
  responses: {
    201: SwaggerHelpers.createResponse(
      'User created successfully',
      { $ref: '#/components/schemas/User' }
    ),
    400: SwaggerHelpers.createResponse('Invalid request data',
      SwaggerHelpers.createSchema({
        error: { type: 'string' },
        details: { type: 'array', items: { type: 'string' } }
      })
    )
  }
});

// PUT /users/:id - Update user
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const updatedUser = {
    id: Number(userId),
    ...(req.body as Record<string, any>),
    updatedAt: new Date().toISOString()
  };
  res.json(updatedUser);
});

swagger.addRoute({
  method: 'PUT',
  path: '/users/:id',
  summary: 'Update user',
  description: 'Update an existing user\'s information',
  tags: ['Users'],
  parameters: [
    SwaggerHelpers.createParameter('id', 'path', { type: 'number' }, {
      description: 'User ID',
      required: true
    })
  ],
  requestBody: SwaggerHelpers.createRequestBody(
    { $ref: '#/components/schemas/CreateUser' },
    'Updated user information'
  ),
  responses: {
    200: SwaggerHelpers.createResponse('User updated', { $ref: '#/components/schemas/User' }),
    404: SwaggerHelpers.createResponse('User not found')
  }
});

// DELETE /users/:id - Delete user
app.delete('/users/:id', (req, res) => {
  res.status(204).send('');
});

swagger.addRoute({
  method: 'DELETE',
  path: '/users/:id',
  summary: 'Delete user',
  description: 'Permanently delete a user',
  tags: ['Users'],
  parameters: [
    SwaggerHelpers.createParameter('id', 'path', { type: 'number' }, {
      description: 'User ID to delete'
    })
  ],
  responses: {
    204: { description: 'User deleted successfully' },
    404: SwaggerHelpers.createResponse('User not found')
  }
});

// ============================================
// Products API
// ============================================

// GET /products - Search products
app.get('/products', (req, res) => {
  const { category, minPrice, maxPrice, inStock } = req.query;
  res.json({
    filters: { category, minPrice, maxPrice, inStock },
    products: [
      { id: 1, name: 'Product 1', description: 'Description 1', price: 100, category: 'Electronics', inStock: true },
      { id: 2, name: 'Product 2', description: 'Description 2', price: 200, category: 'Books', inStock: false }
    ]
  });
});

swagger.addRoute({
  method: 'GET',
  path: '/products',
  summary: 'Search products',
  description: 'Search and filter products with various criteria',
  tags: ['Products'],
  parameters: [
    SwaggerHelpers.createParameter('category', 'query', 
      { type: 'string', enum: ['Electronics', 'Books', 'Clothing', 'Food'] },
      { description: 'Filter by category' }
    ),
    SwaggerHelpers.createParameter('minPrice', 'query', { type: 'number', minimum: 0 }, {
      description: 'Minimum price filter'
    }),
    SwaggerHelpers.createParameter('maxPrice', 'query', { type: 'number', minimum: 0 }, {
      description: 'Maximum price filter'
    }),
    SwaggerHelpers.createParameter('inStock', 'query', { type: 'boolean' }, {
      description: 'Filter by stock availability'
    })
  ],
  responses: {
    200: SwaggerHelpers.createResponse(
      'Products found',
      SwaggerHelpers.createSchema({
        filters: { type: 'object' },
        products: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
      })
    )
  }
});

// POST /products - Create product
app.post('/products', (req, res) => {
  const newProduct = {
    id: Date.now(),
    ...(req.body as Record<string, any>)
  };
  res.status(201).json(newProduct);
});

swagger.addRoute({
  method: 'POST',
  path: '/products',
  summary: 'Create product',
  description: 'Add a new product to the catalog',
  tags: ['Products'],
  requestBody: SwaggerHelpers.createRequestBody(
    { $ref: '#/components/schemas/Product' },
    'Product information',
    true
  ),
  responses: {
    201: SwaggerHelpers.createResponse('Product created', { $ref: '#/components/schemas/Product' }),
    400: SwaggerHelpers.createResponse('Invalid product data')
  }
});

// Start server
app.listen(3000).then(() => {
  console.log('\n🚀 Server running on http://localhost:3000');
  console.log('📚 Swagger UI: http://localhost:3000/docs');
  console.log('📄 OpenAPI JSON: http://localhost:3000/api-spec.json');
  console.log('\n💡 This example shows how to use Swagger WITHOUT decorators!');
  console.log('   Perfect for JavaScript or plain TypeScript projects.\n');
});
