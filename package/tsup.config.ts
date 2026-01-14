import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    decorators: 'src/decorators/index.ts',
    middleware: 'src/middleware/index.ts',
    types: 'src/types/index.ts',
    infra: 'src/infra/index.ts',
    router: 'src/infra/Router.ts',
    config: 'src/shared/config/index.ts',
    plugins: 'src/shared/plugins/index.ts',
    cors: 'src/shared/plugins/CORSPlugin.ts',
    'rate-limit': 'src/shared/plugins/RateLimitPlugin.ts',
    utils: 'src/utils/index.ts',
    cookies: 'src/utils/cookies/index.ts',
    validators: 'src/utils/validators/index.ts',
    logger: 'src/utils/Logger.ts',
    'http-error': 'src/infra/utils/HttpError.ts',
    swagger: 'src/swagger.ts',
  },

  // Formatos de saída: ESM (modules) e CJS (CommonJS)
  format: ['esm', 'cjs'],

  // Gerar arquivos .d.ts (TypeScript definitions)
  dts: true,

  // Limpar pasta dist antes de cada build
  clean: true,

  // Diretório de saída
  outDir: 'dist',

  // Minificar código (opcional - desabilite para desenvolvimento)
  minify: false,

  // Source maps para debugging
  sourcemap: true,

  // Dividir em chunks para otimização
  splitting: false,

  // Preservar módulos (cada arquivo fonte terá seu próprio arquivo de saída)
  // Desabilite se quiser um bundle único
  treeshake: true,

  // Target do JavaScript
  target: 'es2020',

  // Suporte experimental a decorators
  esbuildOptions(options) {
    options.tsconfig = './tsconfig.build.json';
  },

  // Hook para copiar arquivos estáticos após o build
  onSuccess: async () => {
    // Copiar swagger-ui-modern.html para dist
    const srcHtml = join('src', 'shared', 'swagger', 'swagger-ui-modern.html');
    const distDir = join('dist', 'shared', 'swagger');
    const distHtml = join(distDir, 'swagger-ui-modern.html');
    
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true });
    }
    
    copyFileSync(srcHtml, distHtml);
    console.log('✓ Copied swagger-ui-modern.html to dist');
  },
});
