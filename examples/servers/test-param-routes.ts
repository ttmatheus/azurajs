/**
 * Test for routes starting with params
 */

import { AzuraClient } from '../../package/src/infra/Server';

const app = new AzuraClient();

// Test 1: Route starting with param
app.get('/:id', (req, res) => {
  res.json({ 
    route: '/:id',
    id: req.params.id,
    message: 'Route with param at root works!' 
  });
});

// Test 2: Normal route with param
app.get('/users/:id', (req, res) => {
  res.json({ 
    route: '/users/:id',
    id: req.params.id,
    message: 'Normal route with param works!' 
  });
});

// Test 3: Multiple params starting with param
app.get('/:category/:id', (req, res) => {
  res.json({ 
    route: '/:category/:id',
    category: req.params.category,
    id: req.params.id,
    message: 'Multiple params at root works!' 
  });
});

app.listen(3000).then(() => {
  console.log('\n🧪 Testing routes with params at root');
  console.log('Test these URLs:');
  console.log('  GET http://localhost:3000/123');
  console.log('  GET http://localhost:3000/users/456');
  console.log('  GET http://localhost:3000/electronics/789\n');
});
