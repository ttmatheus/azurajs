# AzuraJS Server Examples

Exemplos organizados por categoria. Execute com `bun run servers/<categoria>/<arquivo>`.

## 📁 Estrutura

### `/basic` - Exemplos Básicos
- `server.js` - Servidor básico com rotas simples
- `crud-api.js` - API CRUD completa
- `cookies.js` - Manipulação de cookies
- `error-handling.js` - Tratamento de erros

### `/middleware` - Middlewares
- `basic.js` - Logging e autenticação

### `/router` - Roteamento
- `prefix.js` - Routers com prefixos de caminho

### `/proxy` - Sistema de Proxy
- `simple.js` - Proxy básico entre dois servidores
- `microservices.js` - Gateway para microsserviços

### `/advanced` - Exemplos Avançados
- `bun-server.ts` - Usando Bun.serve
- `plugins.js` - Plugins (CORS, Rate Limit)

## 📚 Swagger/OpenAPI Documentation

AzuraJS suporta **duas formas** de documentar sua API:

### 1️⃣ Com Decorators (TypeScript)
```typescript
@Controller('/users')
class UserController {
  @Get('/')
  @ApiDoc({ summary: 'Get users' })
  getUsers(req, res) { /* ... */ }
}
```
✅ Limpo e declarativo | ❌ Apenas TypeScript com decorators

### 2️⃣ Sem Decorators (JavaScript/TypeScript)
```javascript
const swagger = setupSwagger(app, { title: 'My API' });

app.get('/users', (req, res) => { /* ... */ });

swagger.addRoute({
  method: 'GET',
  path: '/users',
  summary: 'Get users',
  responses: { 200: { description: 'Success' } }
});
```
✅ Funciona com JS/TS | ✅ Mais flexível | ❌ Mais verboso

**Exemplos completos:**
- [swagger-simple.js](./servers/swagger-simple.js) - JavaScript sem decorators
- [swagger-no-decorators.ts](./servers/swagger-no-decorators.ts) - TypeScript sem decorators  
- [swagger-simple.ts](./servers/swagger-simple.ts) - TypeScript com decorators
- [SWAGGER_GUIDE.md](./servers/SWAGGER_GUIDE.md) - Guia completo

## ⚠️ Problemas Comuns

### `req.ip` retorna vazio ou undefined

Se `req.ip` está retornando vazio, você precisa configurar `trustProxy` no seu `azura.config.ts`:

```typescript
// azura.config.ts
export default {
  server: {
    // Para apps atrás de proxy (Nginx, Cloudflare, AWS ELB, etc):
    trustProxy: true,
    
    // Ou confie apenas em IPs específicos:
    // trustProxy: ['10.0.0.0/8', '172.16.0.0/12'],
  }
}
```

**Quando usar cada opção:**
- `trustProxy: false` (padrão) - Conexões diretas, desenvolvimento local
- `trustProxy: true` - Atrás de qualquer proxy/load balancer
- `trustProxy: ['IP/CIDR']` - Apenas proxies conhecidos (mais seguro)

Veja o exemplo completo em [ip-resolution.example.ts](./servers/ip-resolution.example.ts)

## 🚀 Quick Start

```bash
# Servidor básico
bun run servers/basic/server.js

# Proxy simples
bun run servers/proxy/simple.js

# Router modular
bun run servers/router/prefix.js

# Microsserviços
bun run servers/proxy/microservices.js
```

## 📖 Documentação

Para documentação completa sobre cada recurso:
- [Proxy System](../../docs/PROXY.md)
- [API Reference](../../docs/API.md)
- [Getting Started](../../docs/GETTING_STARTED.md)
