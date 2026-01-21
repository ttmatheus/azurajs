const DTOS = new WeakMap<Function, Map<string, Array<{ index: number; dto: unknown }>>>();

export function validateDto(dto: unknown): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const ctor = typeof target === "function" ? (target as Function) : (target as any).constructor;

    let map = DTOS.get(ctor);
    if (!map) {
      map = new Map();
      DTOS.set(ctor, map);
    }

    const key = String(propertyKey);
    const list = map.get(key) ?? [];

    list.push({
      index: parameterIndex,
      dto,
    });

    map.set(key, list);
  };
}

export function getDtoValidators(
  ctor: Function,
  propertyKey: string
): Array<{ index: number; dto: unknown }> {
  return DTOS.get(ctor)?.get(propertyKey) ?? [];
}
