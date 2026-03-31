export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isPhoneValid(value: string): boolean {
  const cleaned = value.replace(/\s+/g, "");
  return /^[0-9+()-]{6,20}$/.test(cleaned);
}
