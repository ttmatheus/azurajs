import express from 'express';

const app = express();

app.use(express.json());

// GET /
app.get('/', (req, res) => {
  res.send('Hello World');
});

// GET /json
app.get('/json', (req, res) => {
  res.json({ message: 'Hello World' });
});

// POST /echo
app.post('/echo', (req, res) => {
  res.json(req.body);
});

// GET /user/:id
app.get('/user/:id', (req, res) => {
  res.json({ id: req.params.id });
});

// GET /query
app.get('/query', (req, res) => {
  res.json({ name: req.query.name || 'Guest' });
});

app.listen(3004, () => {
  console.log('Express server started on http://localhost:3004');
});
