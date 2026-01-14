# Release v2.5.1 - Simplified Swagger API

**Release Date:** January 13, 2026

## 🚀 New Features

### Unified @Swagger Decorator

Simplified API documentation with a single unified decorator that combines all Swagger decorators in one place:

```typescript
import { Swagger } from "azurajs/swagger";

@Controller("/users")
class UserController {
  @Get("/:id")
  @Swagger({
    summary: "Get user by ID",
    description: "Retrieve detailed information about a specific user",
    tags: ["Users"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        example: "123"
      }
    ],
    responses: {
      200: {
        description: "User found",
        example: { id: "123", name: "John Doe", email: "john@example.com" }
      },
      404: {
        description: "User not found",
        example: { error: "User not found" }
      }
    }
  })
  async getUser(@Req() req, @Res() res) {
    res.json({ id: req.params.id, name: "John Doe" });
  }
}
```

**Benefits:**
- ✅ All documentation in one place
- ✅ More readable and organized
- ✅ Less code than multiple decorators
- ✅ Full TypeScript support with autocomplete
- ✅ Integrated examples directly in responses

### Simplified addDoc() Method for JavaScript

New simplified method for documenting APIs without decorators:

```javascript
import { SwaggerGenerator } from "azurajs/swagger";

const swagger = new SwaggerGenerator({
  title: "My API",
  version: "1.0.0"
});

// Document route with addDoc() - EASY!
swagger.addDoc({
  method: "GET",
  path: "/users/:id",
  summary: "Get user by ID",
  tags: ["Users"],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string" },
      example: "123"
    }
  ],
  responses: {
    200: {
      description: "User found",
      example: { id: "123", name: "John Doe" }
    },
    404: {
      description: "User not found"
    }
  }
});
```

**Benefits:**
- ✅ Pure JavaScript - no decorators needed
- ✅ Less verbose than SwaggerHelpers
- ✅ Automatic OpenAPI response generation from examples
- ✅ Flexible - mix with traditional routes

## 🐛 Bug Fixes

### IP Resolution Improvements

- Fixed `req.ip` returning empty/undefined in fetch handler
- Added IPv6 address normalization (`::1` → `127.0.0.1`)
- Removed `::ffff:` prefix from IPv4-mapped addresses
- Added socket mock with remoteAddress in fetch() handler

### Router Parameter Extraction

- Fixed routes starting with parameters (e.g., `/:id`) not working correctly
- Improved parameter extraction logic to prevent paramName overwriting
- Enhanced debug logging for better troubleshooting

### Build System

- Fixed Swagger UI HTML file not being copied to dist during build
- Added onSuccess hook in tsup.config.ts to copy static assets
- Improved path resolution with fallback logic for swagger-ui-modern.html

## 📚 Documentation Updates

- Added comprehensive documentation for new `@Swagger` decorator (EN/PT)
- Added examples for `addDoc()` method (EN/PT)
- Updated swagger.mdx with three documentation approaches:
  - ⭐ `@Swagger` - Recommended (easy, unified)
  - 📝 `addDoc()` - For JavaScript without decorators
  - 🔧 Individual decorators - For fine-grained control

## 🔧 Examples

### New Example Files

- `examples/servers/swagger-easy.js` - JavaScript with addDoc()
- `examples/servers/swagger-easy.ts` - TypeScript with @Swagger decorator

## 📦 Migration Guide

### From Multiple Decorators to @Swagger

**Before (v2.5.0):**
```typescript
@Get("/:id")
@ApiDoc({ summary: "Get user" })
@ApiResponse(200, "Success")
@ApiResponse(404, "Not found")
@ApiParameter("id", "path", { required: true })
async getUser() { }
```

**After (v2.5.1):**
```typescript
@Get("/:id")
@Swagger({
  summary: "Get user",
  parameters: [{ name: "id", in: "path", required: true }],
  responses: {
    200: { description: "Success" },
    404: { description: "Not found" }
  }
})
async getUser() { }
```

### From SwaggerHelpers to addDoc()

**Before (v2.5.0):**
```javascript
swagger.addRoute({
  method: "GET",
  path: "/users/:id",
  operation: {
    summary: "Get user",
    responses: {
      "200": SwaggerHelpers.createResponse("Success", {
        example: { id: 1, name: "John" }
      })
    }
  }
});
```

**After (v2.5.1):**
```javascript
swagger.addDoc({
  method: "GET",
  path: "/users/:id",
  summary: "Get user",
  responses: {
    200: {
      description: "Success",
      example: { id: 1, name: "John" }
    }
  }
});
```

## 🔄 Breaking Changes

**None** - This release is fully backward compatible. All existing decorators (`@ApiDoc`, `@ApiResponse`, etc.) continue to work as before.

## 📝 Notes

- The new `@Swagger` decorator and `addDoc()` method are **recommended** for new projects
- Existing projects can continue using individual decorators
- Both approaches generate the same OpenAPI 3.0 specification
- Complete TypeScript support with type inference and validation

## 🙏 Contributors

Thanks to all contributors who helped improve AzuraJS!

---

**Full Changelog:** [v2.5.0...v2.5.1](https://github.com/azurajs/azurajs/compare/v2.5.0...v2.5.1)
