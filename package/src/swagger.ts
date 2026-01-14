/**
 * AzuraJS Swagger/OpenAPI Integration
 * Import from "azurajs/swagger" to use Swagger documentation
 */

import { SwaggerGenerator } from "./swagger";

// Main Swagger exports
export { setupSwagger, SwaggerIntegration } from "./shared/swagger";
export { SwaggerGenerator } from "./shared/swagger/SwaggerGenerator";
export { setupSwaggerWithControllers } from "./shared/swagger/SwaggerHelper";

// Swagger decorators (for decorator-based approach)
export {
  ApiDoc,
  ApiResponse,
  ApiParameter,
  ApiBody,
  ApiTags,
  ApiDeprecated,
  ApiSecurity,
  Swagger,
  getSwaggerMetadata,
} from "./decorators/Swagger";

// Swagger types
export type * from "./types/swagger.type";

// Re-export helpers for manual route documentation (for JavaScript/plain TypeScript)
export const SwaggerHelpers = {
  createResponse: SwaggerGenerator.createResponse,
  createRequestBody: SwaggerGenerator.createRequestBody,
  createParameter: SwaggerGenerator.createParameter,
  createSchema: SwaggerGenerator.createSchema,
};
