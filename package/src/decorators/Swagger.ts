import type {
  ApiDocMetadata,
  ApiResponseMetadata,
  ApiParameterMetadata,
  ApiBodyMetadata,
  Schema,
  SecurityRequirement,
  Header,
} from "../types/swagger.type";

const API_METADATA = new WeakMap<Function, Map<string, ApiDocMetadata>>();
const API_RESPONSES = new WeakMap<Function, Map<string, ApiResponseMetadata[]>>();
const API_PARAMETERS = new WeakMap<Function, Map<string, ApiParameterMetadata[]>>();
const API_BODY = new WeakMap<Function, Map<string, ApiBodyMetadata>>();
const API_TAGS = new WeakMap<Function, string[]>();

export function ApiDoc(metadata: Omit<ApiDocMetadata, "method" | "path">): MethodDecorator {
  return (target, propertyKey) => {
    const ctor = typeof target === "function" ? (target as Function) : (target as any).constructor;
    let map = API_METADATA.get(ctor);
    if (!map) {
      map = new Map<string, ApiDocMetadata>();
      API_METADATA.set(ctor, map);
    }
    map.set(String(propertyKey), metadata);
  };
}

export function ApiResponse(
  statusCode: number,
  description: string,
  options?: {
    type?: any;
    examples?: Record<string, any>;
    headers?: Record<string, Header>;
  },
): MethodDecorator {
  return (target, propertyKey) => {
    const ctor = typeof target === "function" ? (target as Function) : (target as any).constructor;
    let map = API_RESPONSES.get(ctor);
    if (!map) {
      map = new Map<string, ApiResponseMetadata[]>();
      API_RESPONSES.set(ctor, map);
    }
    const key = String(propertyKey);
    const responses = map.get(key) ?? [];
    responses.push({
      statusCode,
      description,
      type: options?.type,
      examples: options?.examples,
      headers: options?.headers,
    });
    map.set(key, responses);
  };
}

export function ApiParameter(
  name: string,
  paramIn: "query" | "header" | "path" | "cookie",
  options?: {
    description?: string;
    required?: boolean;
    type?: any;
    example?: any;
    schema?: Schema;
  },
): MethodDecorator {
  return (target, propertyKey) => {
    const ctor = typeof target === "function" ? (target as Function) : (target as any).constructor;
    let map = API_PARAMETERS.get(ctor);
    if (!map) {
      map = new Map<string, ApiParameterMetadata[]>();
      API_PARAMETERS.set(ctor, map);
    }
    const key = String(propertyKey);
    const params = map.get(key) ?? [];
    params.push({
      name,
      in: paramIn,
      description: options?.description,
      required: options?.required,
      type: options?.type,
      example: options?.example,
      schema: options?.schema,
    });
    map.set(key, params);
  };
}

export function ApiBody(
  description: string,
  options?: {
    type?: any;
    required?: boolean;
    examples?: Record<string, any>;
  },
): MethodDecorator {
  return (target, propertyKey) => {
    const ctor = typeof target === "function" ? (target as Function) : (target as any).constructor;
    let map = API_BODY.get(ctor);
    if (!map) {
      map = new Map<string, ApiBodyMetadata>();
      API_BODY.set(ctor, map);
    }
    map.set(String(propertyKey), {
      description,
      type: options?.type,
      required: options?.required,
      examples: options?.examples,
    });
  };
}

export function ApiTags(...tags: string[]): ClassDecorator {
  return (target) => {
    API_TAGS.set(target as Function, tags);
  };
}

export function ApiDeprecated(): MethodDecorator {
  return (target, propertyKey) => {
    const ctor = typeof target === "function" ? (target as Function) : (target as any).constructor;
    let map = API_METADATA.get(ctor);
    if (!map) {
      map = new Map<string, ApiDocMetadata>();
      API_METADATA.set(ctor, map);
    }
    const key = String(propertyKey);
    const existing = map.get(key) ?? {};
    map.set(key, { ...existing, deprecated: true });
  };
}

export function ApiSecurity(...requirements: SecurityRequirement[]): MethodDecorator {
  return (target, propertyKey) => {
    const ctor = typeof target === "function" ? (target as Function) : (target as any).constructor;
    let map = API_METADATA.get(ctor);
    if (!map) {
      map = new Map<string, ApiDocMetadata>();
      API_METADATA.set(ctor, map);
    }
    const key = String(propertyKey);
    const existing = map.get(key) ?? {};
    map.set(key, { ...existing, security: requirements });
  };
}

export function getSwaggerMetadata(target: Function) {
  return {
    metadata: API_METADATA.get(target),
    responses: API_RESPONSES.get(target),
    parameters: API_PARAMETERS.get(target),
    body: API_BODY.get(target),
    tags: API_TAGS.get(target),
  };
}

export function Swagger(config: {
  summary?: string;
  description?: string;
  tags?: string[];
  operationId?: string;
  deprecated?: boolean;
  security?: SecurityRequirement[];
  parameters?: Array<{
    name: string;
    in: "query" | "header" | "path" | "cookie";
    description?: string;
    required?: boolean;
    schema?: Schema;
    example?: any;
  }>;
  requestBody?: {
    description?: string;
    required?: boolean;
    content?: any;
    example?: any;
  };
  responses?: Record<
    number,
    {
      description: string;
      example?: any;
      schema?: Schema;
      headers?: Record<string, Header>;
    }
  >;
}): MethodDecorator {
  return (target, propertyKey) => {
    const ctor = typeof target === "function" ? (target as Function) : (target as any).constructor;
    const key = String(propertyKey);

    // Ensure metadata map exists so other decorators/readers always find it
    let metaMap = API_METADATA.get(ctor);
    if (!metaMap) {
      metaMap = new Map<string, ApiDocMetadata>();
      API_METADATA.set(ctor, metaMap);
    }

    const existingMeta = metaMap.get(key) ?? {};
    const newMeta: ApiDocMetadata = {
      summary: config.summary ?? existingMeta.summary,
      description: config.description ?? existingMeta.description,
      operationId: config.operationId ?? existingMeta.operationId,
      deprecated: config.deprecated ?? existingMeta.deprecated,
      security: config.security ?? existingMeta.security,
      tags: config.tags ?? existingMeta.tags,
    };
    metaMap.set(key, newMeta);

    if (config.parameters && config.parameters.length > 0) {
      let paramMap = API_PARAMETERS.get(ctor);
      if (!paramMap) {
        paramMap = new Map<string, ApiParameterMetadata[]>();
        API_PARAMETERS.set(ctor, paramMap);
      }
      const existingParams = paramMap.get(key) ?? [];
      const newParams = config.parameters.map((p) => ({
        name: p.name,
        in: p.in,
        description: p.description,
        required: p.required,
        schema: p.schema,
        example: p.example,
      }));
      paramMap.set(key, [...existingParams, ...newParams]);
    }

    if (config.requestBody) {
      let bodyMap = API_BODY.get(ctor);
      if (!bodyMap) {
        bodyMap = new Map<string, ApiBodyMetadata>();
        API_BODY.set(ctor, bodyMap);
      }
      bodyMap.set(key, {
        description: config.requestBody.description,
        required: config.requestBody.required,
        type: config.requestBody.content,
        examples: config.requestBody.example ? { default: config.requestBody.example } : undefined,
      });
    }

    if (config.responses) {
      let respMap = API_RESPONSES.get(ctor);
      if (!respMap) {
        respMap = new Map<string, ApiResponseMetadata[]>();
        API_RESPONSES.set(ctor, respMap);
      }
      const existing = respMap.get(key) ?? [];
      const responses = Object.entries(config.responses).map(([code, resp]) => ({
        statusCode: Number(code),
        description: resp.description,
        type: resp.schema,
        examples: resp.example ? { default: resp.example } : undefined,
        headers: resp.headers,
      }));
      respMap.set(key, [...existing, ...responses]);
    }
  };
}
