export const toNullable = (value: string) => {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};
