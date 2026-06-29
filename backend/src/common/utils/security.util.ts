import * as CryptoJS from 'crypto-js';

export class SecurityUtil {
  /**
   * Generates a SHA256 hash of the given content.
   * Useful for message integrity signatures or sensitive data hashing.
   */
  static hashSHA256(content: string): string {
    return CryptoJS.SHA256(content).toString();
  }

  /**
   * Validates if a hash matches the content.
   */
  static validateHash(content: string, hash: string): boolean {
    const newHash = this.hashSHA256(content);
    return newHash === hash;
  }
}
