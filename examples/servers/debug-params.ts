/**
 * Debug test for params issue
 */

import { AzuraClient } from '../../package/src/infra/Server';
import { ConfigModule } from '../../package/src/shared/config/ConfigModule';

// Create app with debug enabled
const app = new AzuraClient();

console.log('\n=== Setting up route ===\n');

// Simple route with param
app.get('/users/:id', (req, res) => {
  console.log('\n=== Handler Called ===');
  console.log('req.params:', req.params);
  console.log('req.params.id:', req.params.id);
  console.log('Type of req.params.id:', typeof req.params.id);
  
  res.json({
    received_id: req.params.id,
    params_object: req.params,
    is_null: req.params.id === null,
    is_undefined: req.params.id === undefined,
  });
});

app.listen(3002).then(() => {
  console.log('\n✅ Server running on http://localhost:3002');
  console.log('\nTest: curl http://localhost:3002/users/123\n');
});
