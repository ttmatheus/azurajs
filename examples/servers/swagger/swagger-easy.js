/**
 * SWAGGER FÁCIL - JavaScript
 * A forma mais simples de documentar sua API! 🎉
 */

const { AzuraClient } = require('../../../package/src/infra/Server');
const { setupSwagger } = require('../../../package/src/swagger');

const app = new AzuraClient();
const swagger = setupSwagger(app, {
  title: 'API Super Fácil',
  version: '1.0.0',
  description: 'Documentação simplificada ao extremo!'
});

// ============================================
// Rota 1: GET simples
// ============================================
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

swagger.addDoc({
  method: 'GET',
  path: '/hello',
  summary: 'Diz olá',
  tags: ['Greetings'],
  responses: {
    200: {
      description: 'Sucesso',
      example: { message: 'Hello World!' }
    }
  }
});

// ============================================
// Rota 2: GET com parâmetro de path
// ============================================
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'John Doe' });
});

swagger.addDoc({
  method: 'GET',
  path: '/users/:id',
  summary: 'Busca usuário por ID',
  description: 'Retorna os dados de um usuário específico',
  tags: ['Users'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'ID do usuário',
      required: true,
      schema: { type: 'string' },
      example: '123'
    }
  ],
  responses: {
    200: {
      description: 'Usuário encontrado',
      example: { id: '123', name: 'John Doe', email: 'john@example.com' }
    },
    404: {
      description: 'Usuário não encontrado',
      example: { error: 'User not found' }
    }
  }
});

// ============================================
// Rota 3: GET com query parameters
// ============================================
app.get('/search', (req, res) => {
  const { q, page, limit } = req.query;
  res.json({ query: q, page, limit, results: [] });
});

swagger.addDoc({
  method: 'GET',
  path: '/search',
  summary: 'Busca com filtros',
  tags: ['Search'],
  parameters: [
    {
      name: 'q',
      in: 'query',
      description: 'Termo de busca',
      required: true,
      schema: { type: 'string' },
      example: 'javascript'
    },
    {
      name: 'page',
      in: 'query',
      description: 'Número da página',
      schema: { type: 'number' },
      example: 1
    },
    {
      name: 'limit',
      in: 'query',
      description: 'Items por página',
      schema: { type: 'number' },
      example: 10
    }
  ],
  responses: {
    200: {
      description: 'Resultados encontrados',
      example: {
        query: 'javascript',
        page: 1,
        limit: 10,
        results: [
          { id: 1, title: 'Item 1' },
          { id: 2, title: 'Item 2' }
        ]
      }
    }
  }
});

// ============================================
// Rota 4: POST com body
// ============================================
app.post('/users', (req, res) => {
  const newUser = { id: Date.now(), ...req.body };
  res.status(201).json(newUser);
});

swagger.addDoc({
  method: 'POST',
  path: '/users',
  summary: 'Cria novo usuário',
  tags: ['Users'],
  requestBody: {
    description: 'Dados do usuário',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        age: { type: 'number' }
      },
      required: ['name', 'email']
    },
    example: {
      name: 'João Silva',
      email: 'joao@example.com',
      age: 25
    }
  },
  responses: {
    201: {
      description: 'Usuário criado com sucesso',
      example: {
        id: 1234567890,
        name: 'João Silva',
        email: 'joao@example.com',
        age: 25
      }
    },
    400: {
      description: 'Dados inválidos',
      example: { error: 'Invalid data' }
    }
  }
});

// ============================================
// Rota 5: Exemplo do seu código (binário)
// ============================================
app.get('/binary/encode', (req, res) => {
  const text = req.query.q;
  if (!text) {
    return res.status(400).json({
      error: true,
      message: 'Query is required'
    });
  }
  
  const binary = text.split('').map(c => 
    c.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
  
  res.json({
    error: false,
    type: 'encode',
    entry: {
      input: text,
      output: binary
    }
  });
});

swagger.addDoc({
  method: 'GET',
  path: '/binary/encode',
  summary: 'Codifica um texto em binário',
  description: 'Retorna o texto codificado em binário via query parameter.',
  tags: ['code-binary'],
  security: [],
  parameters: [
    {
      name: 'q',
      in: 'query',
      description: 'O texto a ser codificado.',
      required: true,
      schema: { type: 'string' },
      example: 'Hello, World!'
    }
  ],
  responses: {
    200: {
      description: 'Texto codificado com sucesso.',
      example: {
        error: false,
        type: 'encode',
        entry: {
          input: 'Hello, World!',
          output: '01001000011001010110110001101100011011110010110000100000010101110110111101110010011011000110010000100001'
        }
      }
    },
    400: {
      description: 'Parâmetro \'q\' ausente ou inválido.',
      example: {
        error: true,
        message: 'Query is required'
      }
    }
  }
});

app.listen(3000).then(() => {
  console.log('\n🚀 Server: http://localhost:3000');
  console.log('📚 Docs: http://localhost:3000/docs');
  console.log('\n💡 Muito mais fácil, não? 😊\n');
});
