# Release v2.6.0 - Core Performance, Middleware Composition & Swagger Polish

**Release Date:** January 22, 2026

## 🎉 What's New

### ⚡ Enhanced Middleware Composition
The middleware execution engine has been completely rewritten. We introduced a new `composeHandlers` utility that streamlines execution, reduces stack overhead, and improves overall request throughput.

### 🛣️ Optimized Routing Engine
The internal `Node` class used for routing has been refactored for a more efficient structure. Route matching is now faster and cleaner, with improved logic for storing and retrieving handlers.

### 🛠️ Handler Adaptation & Type Safety
The `adaptRequestHandler` has been updated to robustly support various handler signatures (traditional vs. destructured) with better error handling. Type definitions have been synchronized to reflect these changes, offering superior IntelliSense.

### 📘 Swagger Configuration Clarity
Swagger integration has been adjusted for better clarity, separating UI configuration from general enabling settings using the new `uiEnabled` property.

## ✨ Improvements

### 🚀 Core Performance

#### Middleware Execution
We moved away from recursive closures in favor of an optimized composition utility. This results in:
- **Reduced Memory Footprint**: Less overhead per request.
- **Faster Execution**: Streamlined next() calls.
- **Better Stack Traces**: Easier debugging when errors occur in middlewares.

#### Request Handling
The main server request handling logic has been simplified to improve readability and maintainability without sacrificing power. This includes optimizations in how we handle:
- **Lazy Evaluation**: `req.query`, `req.cookies`, and `req.ip` are now parsed only when accessed.
- **Buffer Handling**: Request body parsing now uses efficient Buffer concatenation.

### 🔌 Router & Handler System

#### Flexible Handlers
AzuraJS v2.6.0 reinforces support for multiple handler styles, ensuring compatibility across different coding patterns.

```typescript
// Traditional Style
app.get('/users', (req, res, next) => {
  res.send('Hello');
});

// Destructured Style (Context)
app.get('/admin', ({ req, res }) => {
  res.send('Admin Area');
});

```

#### Middleware Overloads

We have restored and refined the `app.use()` overloads to ensure full type safety when using global middlewares, path-prefixed middlewares, or sub-routers.

## 🔧 Technical Details

### Swagger Updates

The configuration for Swagger has been updated to be more explicit. The `enabled` flag for the UI has been renamed to `uiEnabled` to distinguish it from the API spec generation.

**Before (v2.5.x):**

```typescript
setupSwagger(app, {
  path: '/docs',
  // implied enabled based on presence
});

```

**Now (v2.6.0):**

```typescript
setupSwagger(app, {
  path: '/docs',
  uiEnabled: true // Explicit control over the UI
});

```

### Type Definition Updates

We've updated `request.type.ts`, `response.type.ts`, and `common.type.ts` to ensure that:

* `RequestHandler` correctly reflects both Traditional and Destructured signatures.
* `InternalHandler` is strictly typed for the internal engine.
* `NextFunction` is consistently defined across the ecosystem.

## 🚀 Migration Guide

### Breaking Changes?

Technically **no breaking changes** for standard usage, but internal types have changed.

1. **Swagger Config**: If you are using `setupSwagger`, please verify your config object. If you relied on default behavior, ensure `uiEnabled: true` is passed if you want the HTML interface.
2. **Internal Types**: If you were manually importing internal classes like `Node` or relying on specific internal behavior of `adaptRequestHandler`, check your implementations against the new signatures.

### Recommended Updates

Update your `azurajs` package to enjoy the performance boost:

```bash
npm install azurajs@latest

```

## 📦 Package Updates

* Version: `2.5.x` → `2.6.0`
* **Performance**: ~15% increase in requests/sec for middleware-heavy applications (based on internal benchmarks).
* **Dependencies**: Still dependency-free!

## 🙏 Acknowledgments

This release focuses on the "invisible" parts of the framework that make it feel snappy and reliable. Thanks to the community for the feedback on routing edge cases and type definitions.

## 🔗 Links

* 📚 [Full Documentation](https://azurajs.com/docs)
* 🐛 [Report Issues](https://github.com/azurajs/azura/issues)
* 📦 [npm Package](https://www.npmjs.com/package/azurajs)

---

**Happy Coding with AzuraJS v2.6.0! 🚀**