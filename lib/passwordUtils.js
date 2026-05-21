/**
 * Normalize legacy bcrypt prefixes before password comparison.
 * PHP stores bcrypt hashes with "$2y$"; bcryptjs expects "$2a$" / "$2b$".
 */
export function normalizeBcryptHash(hash) {
  if (!hash || typeof hash !== 'string') return hash;
  const trimmed = hash.trim();
  if (trimmed.startsWith('$2y$')) {
    return `$2a$${trimmed.slice(4)}`;
  }
  return trimmed;
}

export async function comparePassword(plainTextPassword, storedHash, bcrypt) {
  if (!plainTextPassword || !storedHash) return false;
  const normalizedHash = normalizeBcryptHash(storedHash);
  return bcrypt.compare(plainTextPassword, normalizedHash);
}
