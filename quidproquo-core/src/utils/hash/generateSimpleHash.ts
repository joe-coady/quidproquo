/**
 * Generates a short 8-character hash string from the given input strings.
 * This function uses a simple hashing algorithm based on the FNV-1a hash.
 *
 * @param {...string[]} inputStrings - The input strings to generate the hash for.
 * @returns {string} A hexadecimal string representing the generated hash.
 */
export function generateSimpleHash(input: string, ...rest: string[]): string {
  const megaString = [input, ...rest].join('');
  let hash = 0;

  for (let i = 0; i < megaString.length; i++) {
    const char = megaString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }

  // Convert the hash to a hexadecimal string
  const hexHash = Math.abs(hash).toString(16);

  // Pad the hash with leading zeros if necessary
  const paddedHash = hexHash.padStart(8, '0');

  return paddedHash;
}
