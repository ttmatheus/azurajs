import type {
  OpenAPIDocument,
  OpenAPIPaths,
  Operation,
  PathItem,
  Parameter,
  Response,
  Schema,
  Reference,
  MediaType,
  SwaggerConfig,
  RequestBody,
} from "../../types/swagger.type";
import { getSwaggerMetadata } from "../../decorators/Swagger";
import type { RouteDefinition } from "../../types/routes.type";

export class SwaggerGenerator {
  private config: Required<SwaggerConfig>;
  private document: OpenAPIDocument;

  constructor(config?: SwaggerConfig) {
    this.config = {
      enabled: config?.enabled ?? true,
      path: config?.path ?? "/docs",
      title: config?.title ?? "AzuraJS API",
      description: config?.description ?? "API documentation powered by AzuraJS",
      version: config?.version ?? "1.0.0",
      servers: config?.servers ?? [{ url: "http://localhost:3000" }],
      security: config?.security ?? [],
      tags: config?.tags ?? [],
      contact: config?.contact ?? {},
      license: config?.license ?? { name: "MIT" },
    };

    this.document = {
      openapi: "3.0.3",
      info: {
        title: this.config.title,
        description: this.config.description,
        version: this.config.version,
        contact: this.config.contact,
        license: this.config.license,
      },
      servers: this.config.servers,
      paths: {},
      components: {
        schemas: {},
        responses: {},
        parameters: {},
        securitySchemes: {},
      },
      tags: this.config.tags,
      security: this.config.security,
    };
  }

  /**
   * Add routes from a controller to the OpenAPI document
   */
  public addController(controller: any, routes: RouteDefinition[], prefix = ""): void {
    const metadata = getSwaggerMetadata(controller.constructor);
    const controllerTags = metadata.tags ?? [];

    for (const route of routes) {
      const fullPath = this.normalizePath(prefix + route.path);
      const method = route.method.toLowerCase() as keyof PathItem;

      if (!this.document.paths[fullPath]) {
        this.document.paths[fullPath] = {};
      }

      const methodMetadata = metadata.metadata?.get(route.propertyKey);
      const responses = metadata.responses?.get(route.propertyKey) ?? [];
      const parameters = metadata.parameters?.get(route.propertyKey) ?? [];
      const body = metadata.body?.get(route.propertyKey);

      const operation: Operation = {
        summary: methodMetadata?.summary ?? route.description,
        description: methodMetadata?.description,
        tags: methodMetadata?.tags ?? controllerTags,
        operationId:
          methodMetadata?.operationId ??
          `${route.method}_${fullPath.replace(/[^a-zA-Z0-9]/g, "_")}`,
        deprecated: methodMetadata?.deprecated,
        security: methodMetadata?.security,
        parameters: this.buildParameters(parameters, route),
        responses: this.buildResponses(responses),
      };

      if (body) {
        operation.requestBody = this.buildRequestBody(body);
      }

      (this.document.paths[fullPath] as any)[method] = operation;
    }
  }

  /**
   * Add a single route manually without decorators (for JavaScript/plain TypeScript users)
   * 
   * @example
   * ```javascript
   * const swagger = setupSwagger(app, { title: "My API" });
   * 
   * app.get('/users/:id', (req, res) => {
   *   res.json({ id: req.params.id, name: 'John' });
   * });
   * 
   * swagger.addRoute({
   *   method: 'GET',
   *   path: '/users/:id',
   *   summary: 'Get user by ID',
   *   description: 'Returns a single user',
   *   tags: ['Users'],
   *   parameters: [{
   *     name: 'id',
   *     in: 'path',
   *     required: true,
   *     schema: { type: 'string' },
   *     description: 'User ID'
   *   }],
   *   responses: {
   *     200: {
   *       description: 'Successful response',
   *       content: {
   *         'application/json': {
   *           schema: {
   *             type: 'object',
   *             properties: {
   *               id: { type: 'string' },
   *               name: { type: 'string' }
   *             }
   *           }
   *         }
   *       }
   *     }
   *   }
   * });
   * ```
   */
  public addRoute(config: {
    method: string;
    path: string;
    summary?: string;
    description?: string;
    tags?: string[];
    operationId?: string;
    deprecated?: boolean;
    security?: Array<Record<string, string[]>>;
    parameters?: Parameter[];
    requestBody?: RequestBody;
    responses?: Record<string, Response>;
  }): void {
    const fullPath = this.normalizePath(config.path);
    const method = config.method.toLowerCase() as keyof PathItem;

    if (!this.document.paths[fullPath]) {
      this.document.paths[fullPath] = {};
    }

    const pathParams = this.extractPathParams(config.path);
    const allParameters: Parameter[] = [
      ...(config.parameters || []),
      ...pathParams
        .filter(param => !config.parameters?.some(p => p.name === param))
        .map(param => ({
          name: param,
          in: 'path' as const,
          required: true,
          schema: { type: 'string' as const },
          description: `Path parameter: ${param}`,
        })),
    ];

    const operation: Operation = {
      summary: config.summary,
      description: config.description,
      tags: config.tags,
      operationId: config.operationId ?? `${config.method}_${fullPath.replace(/[^a-zA-Z0-9]/g, "_")}`,
      deprecated: config.deprecated,
      security: config.security,
      parameters: allParameters.length > 0 ? allParameters : undefined,
      responses: config.responses || {
        200: {
          description: 'Successful response',
        },
      },
    };

    if (config.requestBody) {
      operation.requestBody = config.requestBody;
    }

    (this.document.paths[fullPath] as any)[method] = operation;
  }

  /**
   * SIMPLE API - Add route with easy object structure
   * This is the easiest way to document routes without decorators!
   * 
   * @example
   * ```javascript
   * swagger.addDoc({
   *   method: 'GET',
   *   path: '/users/:id',
   *   summary: 'Get user by ID',
   *   tags: ['Users'],
   *   parameters: [
   *     { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '123' }
   *   ],
   *   responses: {
   *     200: { description: 'User found', example: { id: '123', name: 'John' } },
   *     404: { description: 'Not found', example: { error: 'User not found' } }
   *   }
   * });
   * ```
   */
  public addDoc(config: {
    method: string;
    path: string;
    summary?: string;
    description?: string;
    tags?: string[];
    operationId?: string;
    deprecated?: boolean;
    security?: Array<Record<string, string[]>>;
    parameters?: Array<{
      name: string;
      in: "query" | "header" | "path" | "cookie";
      description?: string;
      required?: boolean;
      schema?: Schema | Reference;
      example?: any;
    }>;
    requestBody?: {
      description?: string;
      required?: boolean;
      schema?: Schema | Reference;
      example?: any;
    };
    responses?: Record<number, {
      description: string;
      example?: any;
      schema?: Schema | Reference;
    }>;
  }): void {
    const fullPath = this.normalizePath(config.path);
    const method = config.method.toLowerCase() as keyof PathItem;

    if (!this.document.paths[fullPath]) {
      this.document.paths[fullPath] = {};
    }

    // Auto-detect path parameters and merge with provided parameters
    const pathParams = this.extractPathParams(config.path);
    const providedParams = config.parameters || [];
    
    const allParameters: Parameter[] = [
      ...providedParams.map(p => ({
        name: p.name,
        in: p.in,
        description: p.description,
        required: p.required ?? (p.in === 'path'),
        schema: p.schema,
        example: p.example,
      })),
      // Add missing path params
      ...pathParams
        .filter(param => !providedParams.some(p => p.name === param))
        .map(param => ({
          name: param,
          in: 'path' as const,
          required: true,
          schema: { type: 'string' as const },
          description: `Path parameter: ${param}`,
        })),
    ];

    // Build responses
    const responses: Record<string, Response> = {};
    if (config.responses) {
      for (const [code, resp] of Object.entries(config.responses)) {
        responses[code] = {
          description: resp.description,
          content: resp.schema || resp.example ? {
            'application/json': {
              schema: resp.schema,
              ...(resp.example && { examples: { default: { value: resp.example } } }),
            },
          } : undefined,
        };
      }
    } else {
      responses['200'] = { description: 'Successful response' };
    }

    const operation: Operation = {
      summary: config.summary,
      description: config.description,
      tags: config.tags,
      operationId: config.operationId ?? `${config.method}_${fullPath.replace(/[^a-zA-Z0-9]/g, "_")}`,
      deprecated: config.deprecated,
      security: config.security,
      parameters: allParameters.length > 0 ? allParameters : undefined,
      responses,
    };

    // Add request body if provided
    if (config.requestBody) {
      operation.requestBody = {
        description: config.requestBody.description,
        required: config.requestBody.required ?? false,
        content: {
          'application/json': {
            schema: config.requestBody.schema,
            ...(config.requestBody.example && { 
              examples: { default: { value: config.requestBody.example } } 
            }),
          },
        },
      };
    }

    (this.document.paths[fullPath] as any)[method] = operation;
  }

  /**
   * Build parameters for operation
   */
  private buildParameters(
    parameters: Array<{
      name: string;
      in: "query" | "header" | "path" | "cookie";
      description?: string;
      required?: boolean;
      type?: any;
      example?: any;
      schema?: Schema;
    }>,
    route: RouteDefinition
  ): Parameter[] {
    const params: Parameter[] = [];

    // Add path parameters from route
    const pathParams = this.extractPathParams(route.path);
    for (const paramName of pathParams) {
      const existing = parameters.find((p) => p.name === paramName && p.in === "path");
      params.push({
        name: paramName,
        in: "path",
        required: true,
        description: existing?.description ?? `Path parameter ${paramName}`,
        schema: existing?.schema ?? this.typeToSchema(existing?.type) ?? { type: "string" },
        example: existing?.example,
      });
    }

    // Add other parameters
    for (const param of parameters) {
      if (param.in !== "path") {
        params.push({
          name: param.name,
          in: param.in,
          required: param.required ?? false,
          description: param.description,
          schema: param.schema ?? this.typeToSchema(param.type) ?? { type: "string" },
          example: param.example,
        });
      }
    }

    return params;
  }

  /**
   * Build responses for operation
   */
  private buildResponses(
    responses: Array<{
      statusCode: number;
      description: string;
      type?: any;
      examples?: Record<string, any>;
      headers?: Record<string, any>;
    }>
  ): { [statusCode: string]: Response } {
    const result: { [statusCode: string]: Response } = {};

    if (responses.length === 0) {
      result["200"] = {
        description: "Successful response",
        content: {
          "application/json": {
            schema: { type: "object" },
          },
        },
      };
    } else {
      for (const response of responses) {
        const content: Record<string, MediaType> = {};

        if (response.type) {
          content["application/json"] = {
            schema: this.typeToSchema(response.type) ?? { type: "object" },
            examples: response.examples
              ? Object.entries(response.examples).reduce((acc, [key, value]) => {
                  acc[key] = { value };
                  return acc;
                }, {} as Record<string, { value: any }>)
              : undefined,
          };
        }

        result[String(response.statusCode)] = {
          description: response.description,
          content: Object.keys(content).length > 0 ? content : undefined,
          headers: response.headers,
        };
      }
    }

    return result;
  }

  /**
   * Build request body
   */
  private buildRequestBody(body: {
    description?: string;
    type?: any;
    required?: boolean;
    examples?: Record<string, any>;
  }): RequestBody {
    return {
      description: body.description,
      required: body.required ?? false,
      content: {
        "application/json": {
          schema: this.typeToSchema(body.type) ?? { type: "object" },
          examples: body.examples
            ? Object.entries(body.examples).reduce((acc, [key, value]) => {
                acc[key] = { value };
                return acc;
              }, {} as Record<string, { value: any }>)
            : undefined,
        },
      },
    };
  }

  /**
   * Convert TypeScript type to OpenAPI schema
   */
  private typeToSchema(type: any): Schema | undefined {
    if (!type) return undefined;

    // Handle primitive types
    if (type === String) return { type: "string" };
    if (type === Number) return { type: "number" };
    if (type === Boolean) return { type: "boolean" };
    if (type === Array) return { type: "array", items: { type: "object" } };
    if (type === Object) return { type: "object" };

    // Handle class types - extract properties
    if (typeof type === "function") {
      const instance = new type();
      const properties: Record<string, Schema> = {};

      for (const key of Object.keys(instance)) {
        const value = instance[key];
        properties[key] = this.inferSchema(value);
      }

      return {
        type: "object",
        properties,
      };
    }

    return undefined;
  }

  /**
   * Infer schema from value
   */
  private inferSchema(value: any): Schema {
    const type = typeof value;

    if (type === "string") return { type: "string" };
    if (type === "number") return { type: "number" };
    if (type === "boolean") return { type: "boolean" };
    if (Array.isArray(value)) {
      return {
        type: "array",
        items: value.length > 0 ? this.inferSchema(value[0]) : { type: "object" },
      };
    }
    if (type === "object" && value !== null) {
      const properties: Record<string, Schema> = {};
      for (const key in value) {
        properties[key] = this.inferSchema(value[key]);
      }
      return { type: "object", properties };
    }

    return { type: "object" };
  }

  /**
   * Extract path parameters from route path
   */
  private extractPathParams(path: string): string[] {
    const matches = path.match(/:([a-zA-Z0-9_]+)/g);
    return matches ? matches.map((m) => m.slice(1)) : [];
  }

  /**
   * Normalize path to OpenAPI format
   */
  private normalizePath(path: string): string {
    // Convert :param to {param}
    return path.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");
  }

  /**
   * Add a schema to components
   */
  public addSchema(name: string, schema: Schema): void {
    if (!this.document.components) {
      this.document.components = { schemas: {} };
    }
    if (!this.document.components.schemas) {
      this.document.components.schemas = {};
    }
    this.document.components.schemas[name] = schema;
  }

  /**
   * Add a security scheme to components
   */
  public addSecurityScheme(name: string, scheme: any): void {
    if (!this.document.components) {
      this.document.components = { securitySchemes: {} };
    }
    if (!this.document.components.securitySchemes) {
      this.document.components.securitySchemes = {};
    }
    this.document.components.securitySchemes[name] = scheme;
  }

  /**
   * Get the OpenAPI document
   */
  public getDocument(): OpenAPIDocument {
    return this.document;
  }

  /**
   * Get the config
   */
  public getConfig(): Required<SwaggerConfig> {
    return this.config;
  }

  /**
   * Get the document as JSON string
   */
  public toJSON(): string {
    return JSON.stringify(this.document, null, 2);
  }

  /**
   * Helper to create a simple response schema
   */
  public static createResponse(description: string, schema?: Schema | Reference, example?: any): Response {
    return {
      description,
      content: schema ? {
        'application/json': {
          schema,
          ...(example && { examples: { default: { value: example } } }),
        },
      } : undefined,
    };
  }

  /**
   * Helper to create a request body
   */
  public static createRequestBody(schema: Schema | Reference, description?: string, required = true, example?: any): RequestBody {
    return {
      description,
      required,
      content: {
        'application/json': {
          schema,
          ...(example && { examples: { default: { value: example } } }),
        },
      },
    };
  }

  /**
   * Helper to create a parameter
   */
  public static createParameter(
    name: string,
    location: 'query' | 'path' | 'header' | 'cookie',
    schema: Schema | Reference,
    options?: {
      description?: string;
      required?: boolean;
      deprecated?: boolean;
      example?: any;
    }
  ): Parameter {
    return {
      name,
      in: location,
      description: options?.description,
      required: options?.required ?? (location === 'path'),
      deprecated: options?.deprecated,
      schema,
      example: options?.example,
    };
  }

  /**
   * Helper to create a simple object schema
   */
  public static createSchema(properties: Record<string, Schema | Reference>, required?: string[]): Schema {
    return {
      type: 'object',
      properties,
      required,
    };
  }
}
