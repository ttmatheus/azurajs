export * from "./LoggingMiddleware";

const MIDDLEWARES = new WeakMap<object, string[]>();

export function Middleware() {
  return function (_: Function, context: ClassMethodDecoratorContext) {
    context.addInitializer(function () {
      const list = MIDDLEWARES.get(this as object) ?? [];
      list.push(String(context.name));

      MIDDLEWARES.set(this as object, list);
    });
  };
}
