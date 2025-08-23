export const toPascalCase = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/(?:^|\s|_|-|:)(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
};

export const isUuid = (input: unknown): boolean => {
  if (typeof input !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    input
  );
};
