# Release v2.5.5 - Bug Fixes & Improvements

**Release Date:** January 19, 2026

## 🐞 Bug Fixes

- Corrigido: decorators Swagger agora usam Symbols para evitar conflitos e vazamentos de metadata entre controllers.
- Corrigido: responses, parameters e bodies do Swagger agora são corretamente isolados por método, evitando sobrescrita e bugs em múltiplos endpoints.
- Corrigido: problemas de inferência de tipos e exemplos em parâmetros e bodies do Swagger.

## 🔧 Improvements

- Refatoração do SwaggerGenerator para simplificar e otimizar a geração do OpenAPI.
- Otimização na inferência de schemas e exemplos automáticos.
- Melhoria nas mensagens de erro e documentação interna.

## 📦 Installation

```bash
npm install azurajs@2.5.5
# ou
yarn add azurajs@2.5.5
# ou
pnpm add azurajs@2.5.5
# ou
bun add azurajs@2.5.5
```

## 🙏 Credits

Obrigado a todos que reportaram bugs e enviaram sugestões!

## 📊 Stats

- **Bugfixes:** 3 principais
- **Melhorias:** 3

---

**Full Changelog:** https://github.com/azurajs/azurajs/compare/v2.5.4...v2.5.5