const FALLBACK_PRODUCT_IMAGE =
  "https://picsum.photos/seed/fallback-product/600/600";

function isLikelyJsonArray(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("[") && trimmed.endsWith("]");
}

export function parseProductImages(imageValue: string | null | undefined) {
  if (!imageValue?.trim()) {
    return [FALLBACK_PRODUCT_IMAGE];
  }

  if (isLikelyJsonArray(imageValue)) {
    try {
      const parsed = JSON.parse(imageValue);
      if (Array.isArray(parsed)) {
        const images = parsed
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
        if (images.length > 0) {
          return images;
        }
      }
    } catch {
      // Ignore invalid JSON and try plain splitting fallback.
    }
  }

  const images = imageValue
    .split(/[\n,|]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return images.length > 0 ? images : [FALLBACK_PRODUCT_IMAGE];
}
