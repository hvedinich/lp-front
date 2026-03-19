export const toNullable = (value: string) => {
  if (!value) return null;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};
