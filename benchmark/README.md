# AzuraJS Benchmark Suite

Benchmark de performance comparando **AzuraJS** com outros frameworks populares: **Elysia**, **Hono**, **Fastify** e **Express**.

## 📋 Frameworks Testados

- **AzuraJS** - Framework web moderno e rápido
- **Elysia** - Framework Bun-first extremamente rápido
- **Hono** - Framework web ultrarrápido
- **Fastify** - Framework web rápido e de baixo overhead
- **Express** - Framework web tradicional e popular

## 🧪 Testes Realizados

Os benchmarks testam cenários comuns de aplicações web:

1. **Simple GET** - Rota GET básica retornando texto
2. **JSON Response** - Rota GET retornando JSON
3. **POST JSON Echo** - Rota POST que recebe e retorna JSON
4. **Route Params** - Rota com parâmetros dinâmicos
5. **Query String** - Rota processando query parameters

## ⚙️ Configurações do Benchmark

- **Duração:** 10 segundos por teste
- **Conexões:** 100 simultâneas
- **Pipelining:** 10
- **Ferramenta:** Autocannon

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ ou Bun (para Elysia)
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Ou com yarn
yarn install

# Ou com bun
bun install
```

### Executar Benchmark

```bash
# Executar todos os benchmarks
npm run bench

# Ou
node benchmark.js
```

### Executar Servidores Individualmente

Para testar ou debugar servidores individuais:

```bash
# AzuraJS
npm run start:azura

# Elysia (requer Bun)
npm run start:elysia

# Hono
npm run start:hono

# Fastify
npm run start:fastify

# Express
npm run start:express
```

## 📊 Exemplo de Resultado

```
════════════════════════════════════════════════════════════════════════════════
                             BENCHMARK RESULTS                                     
════════════════════════════════════════════════════════════════════════════════

📊 Simple GET
────────────────────────────────────────────────────────────────────────────────
  Framework          Req/Sec             Total Requests      Latency (ms)        Throughput (MB/s)   Errors
────────────────────────────────────────────────────────────────────────────────
🥇 Elysia            75234.50            752345              1.25                125.45              0
🥈 AzuraJS           68420.30            684203              1.35                115.20              0
🥉 Hono              62150.20            621502              1.48                105.80              0
   Fastify           58920.10            589201              1.62                98.50               0
   Express           28450.80            284508              3.42                48.20               0

🏆 Overall Winner: Elysia with 325489.40 total req/sec across all tests
════════════════════════════════════════════════════════════════════════════════
```

## 📝 Notas

- Os resultados podem variar dependendo do hardware e sistema operacional
- Elysia roda com Bun, que tem vantagens de performance sobre Node.js
- Os outros frameworks rodam com Node.js para comparação justa
- Todos os servidores estão configurados sem logging para evitar overhead

## 🤝 Contribuindo

Para adicionar mais frameworks ou testes:

1. Crie um novo arquivo em `servers/` com o mesmo padrão de endpoints
2. Adicione o framework no array em `benchmark.js`
3. Execute o benchmark

## 📄 Licença

MIT
