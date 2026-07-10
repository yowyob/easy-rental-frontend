/** Max upload size for driver documents (CNI, permis, photo) — must match backend `application.file.max-upload-bytes`. */
export const MAX_DRIVER_DOCUMENT_BYTES = 16 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function isAllowedDriverDocument(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type.startsWith('image/')
    || file.type === 'application/pdf'
    || name.endsWith('.pdf')
    || name.endsWith('.jpg')
    || name.endsWith('.jpeg')
    || name.endsWith('.png')
    || name.endsWith('.webp')
  );
}

export function validateDriverDocument(file: File): string | null {
  if (!isAllowedDriverDocument(file)) {
    return 'Format non supporté (JPG, PNG, WEBP ou PDF uniquement).';
  }
  if (file.size > MAX_DRIVER_DOCUMENT_BYTES) {
    return `Fichier trop volumineux (max ${formatFileSize(MAX_DRIVER_DOCUMENT_BYTES)}).`;
  }
  return null;
}
