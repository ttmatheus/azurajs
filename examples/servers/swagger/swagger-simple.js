/**
 * Swagger WITHOUT decorators - JavaScript Example
 * Perfect for JavaScript users or those who prefer not to use decorators
 */

const { AzuraClient } = require('../../../package/src/infra/Server');
const { setupSwagger, SwaggerHelpers } = require('../../../package/src/swagger');

const app = new AzuraClient();

// Setup Swagger
const swagger = setupSwagger(app, {
  title: 'My JavaScript API',
  description: 'API documentation without decorators',
  version: '1.0.0',
  servers: [{ url: 'http://localhost:3000' }],
});

// ============================================
// Example 1: Simple GET route
// ============================================
app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]);
});

// Add Swagger documentation for this route
swagger.addRoute({
  method: 'GET',
  path: '/users',
  summary: 'Get all users',
  description: 'Returns a list of all users',
  tags: ['Users'],
  responses: {
    200: SwaggerHelpers.createResponse(
      'Successful response',
      {
        type: 'array',
        items: SwaggerHelpers.createSchema({
          id: { type: 'number' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' }
        })
      },
      [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ]
    )
  }
});

// ============================================
// Example 2: GET with path parameter
// ============================================
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ id: userId, name: 'John Doe', email: 'john@example.com' });
});

swagger.addRoute({
  method: 'GET',
  path: '/users/:id',
  summary: 'Get user by ID',
  description: 'Returns a single user by their ID',
  tags: ['Users'],
  parameters: [
    SwaggerHelpers.createParameter('id', 'path', { type: 'string' }, {
      description: 'User ID',
      required: true
    })
  ],
  responses: {
    200: SwaggerHelpers.createResponse(
      'User found',
      SwaggerHelpers.createSchema({
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' }
      }),
      { id: '1', name: 'John Doe', email: 'john@example.com' }
    ),
    404: SwaggerHelpers.createResponse('User not found')
  }
});

// ============================================
// Example 3: POST with request body
// ============================================
app.post('/users', (req, res) => {
  const newUser = {
    id: Date.now(),
    ...req.body
  };
  res.status(201).json(newUser);
});

swagger.addRoute({
  method: 'POST',
  path: '/users',
  summary: 'Create a new user',
  description: 'Creates a new user with the provided data',
  tags: ['Users'],
  requestBody: SwaggerHelpers.createRequestBody(
    SwaggerHelpers.createSchema({
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      age: { type: 'number', minimum: 0 }
    }, ['name', 'email']),
    'User data',
    true,
    { name: 'John Doe', email: 'john@example.com', age: 30 }
  ),
  responses: {
    201: SwaggerHelpers.createResponse(
      'User created successfully',
      SwaggerHelpers.createSchema({
        id: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string' },
        age: { type: 'number' }
      }),
      { id: 123456, name: 'John Doe', email: 'john@example.com', age: 30 }
    ),
    400: SwaggerHelpers.createResponse('Invalid request data')
  }
});

// ============================================
// Example 4: GET with query parameters
// ============================================
app.get('/products', (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  res.json({
    filters: { category, minPrice, maxPrice },
    products: [
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 }
    ]
  });
});

swagger.addRoute({
  method: 'GET',
  path: '/products',
  summary: 'Search products',
  description: 'Search products with filters',
  tags: ['Products'],
  parameters: [
    SwaggerHelpers.createParameter('category', 'query', { type: 'string' }, {
      description: 'Product category'
    }),
    SwaggerHelpers.createParameter('minPrice', 'query', { type: 'number' }, {
      description: 'Minimum price'
    }),
    SwaggerHelpers.createParameter('maxPrice', 'query', { type: 'number' }, {
      description: 'Maximum price'
    })
  ],
  responses: {
    200: SwaggerHelpers.createResponse(
      'Products found',
      SwaggerHelpers.createSchema({
        filters: { type: 'object' },
        products: {
          type: 'array',
          items: SwaggerHelpers.createSchema({
            id: { type: 'number' },
            name: { type: 'string' },
            price: { type: 'number' }
          })
        }
      })
    )
  }
});

// ============================================
// Example 5: PUT with path parameter and body
// ============================================
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const updatedUser = {
    id: userId,
    ...req.body
  };
  res.json(updatedUser);
});

swagger.addRoute({
  method: 'PUT',
  path: '/users/:id',
  summary: 'Update user',
  description: 'Updates an existing user',
  tags: ['Users'],
  parameters: [
    SwaggerHelpers.createParameter('id', 'path', { type: 'string' }, {
      description: 'User ID to update'
    })
  ],
  requestBody: SwaggerHelpers.createRequestBody(
    SwaggerHelpers.createSchema({
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      age: { type: 'number' }
    }),
    'Updated user data'
  ),
  responses: {
    200: SwaggerHelpers.createResponse('User updated successfully'),
    404: SwaggerHelpers.createResponse('User not found')
  }
});

// ============================================
// Example 6: DELETE
// ============================================
app.delete('/users/:id', (req, res) => {
  res.status(204).send();
});

swagger.addRoute({
  method: 'DELETE',
  path: '/users/:id',
  summary: 'Delete user',
  description: 'Deletes a user by ID',
  tags: ['Users'],
  parameters: [
    SwaggerHelpers.createParameter('id', 'path', { type: 'string' }, {
      description: 'User ID to delete'
    })
  ],
  responses: {
    204: { description: 'User deleted successfully' },
    404: SwaggerHelpers.createResponse('User not found')
  }
});

// Start server
app.listen(3000).then(() => {
  console.log('\n🚀 Server running on http://localhost:3000');
  console.log('📚 Swagger UI: http://localhost:3000/docs');
  console.log('📄 OpenAPI JSON: http://localhost:3000/api-spec.json\n');
});
