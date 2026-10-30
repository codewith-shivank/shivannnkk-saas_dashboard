import crypto from 'node:crypto';

export function verifyRazorpaySignature(payload: string, signature: string | null, secret: string | undefined) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const provided = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return provided.length === expectedBuffer.length && crypto.timingSafeEqual(expectedBuffer, provided);
}
