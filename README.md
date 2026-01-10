<div align="center">
  <a href="https://azura.js.org">
    <img src="website/public/azurajs.png" width="500" height="auto" alt="AzuraJS"/>
  </a>
</div>

<hr />

[![NPM Version](https://img.shields.io/npm/v/azurajs)](https://www.npmjs.com/package/azurajs)
[![NPM Downloads](https://img.shields.io/npm/dm/azurajs)](https://www.npmjs.com/package/azurajs)
[![License](https://img.shields.io/npm/l/azurajs)](https://github.com/0xviny/azurajs/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/azurajs)](https://bundlephobia.com/result?p=azurajs)
[![Discord](https://img.shields.io/discord/1459038905667162223?label=Discord&logo=Discord)](https://discord.gg/gr63YzEYfp)

AzuraJS - _**means sky blue 🌌 in many languages**_ - is a minimal, decorator-based web framework built for TypeScript. It works on any JavaScript runtime: Node.js, Bun, Deno, Cloudflare Workers, Vercel Edge, and AWS Lambda.

Elegant, type-safe, and blazing fast.

```typescript
import { AzuraClient } from "azurajs";
import { Controller, Get } from "azurajs/decorators";

@Controller()
class AppController {
  @Get("/")
  home() {
    return { message: "Hello AzuraJS! 🚀" };
  }
}

const app = new AzuraClient();
app.applyDecorators([AppController]);

export default app;
```

## Quick Start

```bash
npm install azurajs
```

## Features

- **Zero Dependencies** 📦 - No external dependencies. Lightweight and efficient.
- **Decorator-Based** 🎯 - Clean, intuitive routing with TypeScript decorators.
- **Type-Safe** 🛡️ - Full TypeScript support with complete type inference.
- **Multi-Runtime** 🌍 - Works on Node.js, Bun, Deno, Cloudflare Workers, Vercel Edge, and more.
- **High Performance** ⚡ - Built for speed with minimal overhead and optimized routing.
- **Modular Imports** 🔧 - Tree-shakeable imports for optimal bundle size (70% smaller).
- **Built-in Features** 🔋 - CORS, Rate Limiting, Cookie handling, Cluster mode, and more.
- **Developer Experience** 😊 - Intuitive APIs with excellent IntelliSense support.

## Documentation

The documentation is available on [azura.js.org](https://azura.js.org).

## Example

```typescript
import { AzuraClient, applyDecorators } from "azurajs";
import { Controller, Get, Post, Body, Param, Res } from "azurajs/decorators";
import { HttpError } from "azurajs/http-error";
import type { ResponseServer } from "azurajs";

@Controller("/api/users")
class UserController {
  @Get()
  getAll(@Res() res: ResponseServer) {
    res.json({ users: [] });
  }

  @Get("/:id")
  getOne(@Param("id") id: string, @Res() res: ResponseServer) {
    if (id === "0") throw new HttpError(404, "User not found");
    res.json({ id, name: `User ${id}` });
  }

  @Post()
  create(@Body() body: any, @Res() res: ResponseServer) {
    res.status(201).json({ id: Date.now(), ...body });
  }
}

const app = new AzuraClient();
applyDecorators(app, [UserController]);

await app.listen(3000);
```

## Universal Runtime Support

AzuraJS works seamlessly across all JavaScript runtimes using the Web Standard Fetch API:

```typescript
// Bun
Bun.serve({ fetch: app.fetch.bind(app), port: 3000 });

// Deno
Deno.serve({ port: 3000 }, app.fetch.bind(app));

// Cloudflare Workers
export default { fetch: app.fetch.bind(app) };
```

## Why AzuraJS?

- **Decorator-First Design** - Express-style routing with modern TypeScript decorators
- **Zero Boilerplate** - Write less code, ship faster
- **Universal** - One codebase, runs everywhere
- **Production Ready** - Built-in cluster mode, CORS, rate limiting, and more
- **Tree-Shakeable** - Modular imports reduce bundle size by up to 70%

## Community

- 📚 [Documentation](https://azura.js.org/docs/en)
- 💬 [Discord](https://discord.gg/gr63YzEYfp)
- 🐦 [Twitter](https://twitter.com/azurajs)
- 📦 [NPM](https://www.npmjs.com/package/azurajs)

## Contributing

Contributions are welcome! You can contribute in the following ways:

- Create an Issue - Propose a new feature or report a bug
- Pull Request - Fix a bug, add a feature, or improve documentation
- Share - Share your thoughts and projects built with AzuraJS
- Spread the word - Star the repo and share with others

For more details, see [CONTRIBUTING.md](docs/CONTRIBUTING.md).

## Contributors

Thanks to [all contributors](https://github.com/0xviny/azurajs/graphs/contributors) who help make AzuraJS better!

## Author

Created by **0xviny** <https://github.com/0xviny>

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<div align="center">
  <sub>Built with ❤️ by the 0xviny & AzuraJS team</sub>
</div>
