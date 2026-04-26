const API_ORIGIN = 'http://localhost:8080';

function splitImageValue(imageValue) {
  if (!imageValue) return [];
  return String(imageValue)
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
}

export function getResourceImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_ORIGIN}${imageUrl}`;
  }
  return imageUrl;
}

export function getPrimaryResourceImage(resource) {
  const imageUrl = [
    ...splitImageValue(resource?.imageUrl),
    ...(resource?.imageUrls || []).flatMap(splitImageValue),
  ][0];
  return getResourceImageUrl(imageUrl);
}

export function getResourceImageGallery(resource) {
  const images = new Set();
  (resource?.imageUrls || []).flatMap(splitImageValue).forEach((url) => images.add(getResourceImageUrl(url)));
  splitImageValue(resource?.imageUrl).forEach((url) => images.add(getResourceImageUrl(url)));
  return Array.from(images).filter(Boolean);
}
