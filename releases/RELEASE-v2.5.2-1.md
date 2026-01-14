# Release v2.5.2-1

## Bug Fixes

### Swagger UI HTML Not Found

- Corrigido um bug crítico onde o Swagger UI não era carregado corretamente e exibia o erro:
  ```json
  {
    "error": "Failed to load Swagger UI",
    "details": "Swagger UI HTML not found at ..."
  }
  ```
- O mecanismo de busca do arquivo `swagger-ui-modern.html` foi ajustado para garantir que o arquivo seja localizado corretamente, tanto em ambientes de desenvolvimento quanto de produção.
- Melhorado o tratamento de resposta para diferentes tipos de objetos de resposta (`res`), garantindo compatibilidade com múltiplos frameworks.

---

Esta versão é focada exclusivamente na correção desse bug, melhorando a experiência de integração com a documentação Swagger/OpenAPI.
