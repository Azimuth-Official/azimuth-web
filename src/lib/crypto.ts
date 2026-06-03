import { randomBytes, createHash } from 'crypto';

export function generateApiKey(): string {
  return randomBytes(32).toString('hex'); // 64-char hex string
}

export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}
