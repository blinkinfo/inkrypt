/**
 * Secure Encryption/Decryption Service using Web Crypto API
 *
 * Security features:
 * - PBKDF2 with 600,000 iterations for key derivation (OWASP recommendation 2023)
 * - AES-GCM 256-bit for authenticated encryption
 * - Random salt (16 bytes) for each encryption
 * - Random IV (12 bytes) for each encryption
 * - Base64 encoding for output
 */

const PBKDF2_ITERATIONS = 600000; // OWASP recommendation for 2023+
const SALT_LENGTH = 16; // 128 bits
const IV_LENGTH = 12; // 96 bits (recommended for AES-GCM)
const KEY_LENGTH = 256; // 256 bits

/**
 * Derives a cryptographic key from a password using PBKDF2
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as a key for PBKDF2
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-GCM key from password
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts plaintext with a password
 * Returns base64 encoded string containing: salt + iv + ciphertext
 */
export async function encrypt(
  plaintext: string,
  password: string
): Promise<string> {
  if (!plaintext) {
    throw new Error('Plaintext cannot be empty');
  }
  if (!password) {
    throw new Error('Password cannot be empty');
  }

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key from password
  const key = await deriveKey(password, salt);

  // Encrypt the plaintext
  const encoder = new TextEncoder();
  const plaintextBuffer = encoder.encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    plaintextBuffer
  );

  // Combine salt + iv + ciphertext
  const combined = new Uint8Array(
    salt.length + iv.length + ciphertext.byteLength
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  // Convert to base64
  return arrayBufferToBase64(combined);
}

/**
 * Decrypts ciphertext with a password
 * Input should be base64 encoded string containing: salt + iv + ciphertext
 */
export async function decrypt(
  encryptedData: string,
  password: string
): Promise<string> {
  if (!encryptedData) {
    throw new Error('Encrypted data cannot be empty');
  }
  if (!password) {
    throw new Error('Password cannot be empty');
  }

  try {
    // Decode from base64
    const combined = base64ToArrayBuffer(encryptedData);

    // Extract salt, iv, and ciphertext
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

    // Derive key from password
    const key = await deriveKey(password, salt);

    // Decrypt the ciphertext
    const plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(plaintextBuffer);
  } catch (error) {
    // Don't expose internal error details for security
    throw new Error('Decryption failed. Please check your password and try again.');
  }
}

/**
 * Converts ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

/**
 * Converts Base64 string to Uint8Array
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Validates if a string is valid base64
 */
export function isValidBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

/**
 * File Encryption/Decryption Functions
 */

/**
 * Encrypts a file (ArrayBuffer) with a password
 * Returns Uint8Array containing: filename length (4 bytes) + filename + salt + iv + ciphertext
 */
export async function encryptFile(
  fileData: ArrayBuffer,
  fileName: string,
  password: string
): Promise<Uint8Array> {
  if (!fileData || fileData.byteLength === 0) {
    throw new Error('File data cannot be empty');
  }
  if (!password) {
    throw new Error('Password cannot be empty');
  }

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key from password
  const key = await deriveKey(password, salt);

  // Encrypt the file data
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    fileData
  );

  // Encode filename
  const encoder = new TextEncoder();
  const fileNameBytes = encoder.encode(fileName);
  const fileNameLength = new Uint8Array(4);
  const view = new DataView(fileNameLength.buffer);
  view.setUint32(0, fileNameBytes.length, false); // Big-endian

  // Combine: filename length + filename + salt + iv + ciphertext
  const combined = new Uint8Array(
    4 + fileNameBytes.length + salt.length + iv.length + ciphertext.byteLength
  );
  let offset = 0;
  combined.set(fileNameLength, offset);
  offset += 4;
  combined.set(fileNameBytes, offset);
  offset += fileNameBytes.length;
  combined.set(salt, offset);
  offset += salt.length;
  combined.set(iv, offset);
  offset += iv.length;
  combined.set(new Uint8Array(ciphertext), offset);

  return combined;
}

/**
 * Decrypts a file with a password
 * Returns object containing the decrypted file data and original filename
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  password: string
): Promise<{ data: ArrayBuffer; fileName: string }> {
  if (!encryptedData || encryptedData.byteLength === 0) {
    throw new Error('Encrypted data cannot be empty');
  }
  if (!password) {
    throw new Error('Password cannot be empty');
  }

  try {
    const combined = new Uint8Array(encryptedData);

    // Extract filename length
    const fileNameLengthView = new DataView(combined.buffer, 0, 4);
    const fileNameLength = fileNameLengthView.getUint32(0, false); // Big-endian
    let offset = 4;

    // Extract filename
    const fileNameBytes = combined.slice(offset, offset + fileNameLength);
    const decoder = new TextDecoder();
    const fileName = decoder.decode(fileNameBytes);
    offset += fileNameLength;

    // Extract salt, iv, and ciphertext
    const salt = combined.slice(offset, offset + SALT_LENGTH);
    offset += SALT_LENGTH;
    const iv = combined.slice(offset, offset + IV_LENGTH);
    offset += IV_LENGTH;
    const ciphertext = combined.slice(offset);

    // Derive key from password
    const key = await deriveKey(password, salt);

    // Decrypt the file data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    return {
      data: decryptedData,
      fileName: fileName,
    };
  } catch (error) {
    // Don't expose internal error details for security
    throw new Error('Decryption failed. Please check your password and try again.');
  }
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
