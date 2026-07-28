/** snake_case → camelCase (récursif) pour les réponses Jackson snake_case du backend. */
export const snakeToCamel = (s: string): string =>
  s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

export const deepCamelize = (input: any): any => {
  if (Array.isArray(input)) return input.map(deepCamelize);
  if (input && typeof input === 'object') {
    const out: Record<string, any> = {};
    for (const key of Object.keys(input)) {
      out[snakeToCamel(key)] = deepCamelize(input[key]);
    }
    return out;
  }
  return input;
};
