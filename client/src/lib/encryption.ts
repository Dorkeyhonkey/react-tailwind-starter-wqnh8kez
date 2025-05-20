import CryptoJS from 'crypto-js';

/**
 * Client-side encryption utility using AES-256
 */

// Generate a random encryption key
export const generateEncryptionKey = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

// Encrypt data with a given key
export const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

// Decrypt data with a given key
export const decryptData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Encrypt a file and return both the encrypted data and the key
export const encryptFile = async (file: File): Promise<{ encryptedData: string, key: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const key = generateEncryptionKey();
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        const data = event.target.result.toString();
        const encryptedData = encryptData(data, key);
        resolve({ encryptedData, key });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Decrypt a file with a given key
export const decryptFile = (encryptedData: string, key: string, fileName: string, mimeType: string): File => {
  const decryptedData = decryptData(encryptedData, key);
  
  // Convert base64 string to Blob
  const byteString = atob(decryptedData.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  const blob = new Blob([ab], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
};

// Hash a password or other sensitive data
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};
