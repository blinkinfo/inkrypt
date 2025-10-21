/**
 * File handling utilities for encryption/decryption
 */

/**
 * Reads a file as ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Downloads data as a file
 */
export function downloadFile(data: Uint8Array | ArrayBuffer, fileName: string): void {
  // Convert to Uint8Array if needed to ensure compatibility
  const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
  const blob = new Blob([uint8Data as BlobPart]);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates file size (max 100MB)
 */
export function validateFileSize(file: File, maxSizeMB: number = 100): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Sanitizes filename to remove potentially dangerous characters
 */
export function sanitizeFileName(fileName: string): string {
  // Remove or replace potentially dangerous characters
  return fileName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
}
