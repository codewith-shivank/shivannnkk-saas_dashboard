import { describe, expect, it } from 'vitest';
import crypto from 'node:crypto';
import { verifyRazorpaySignature } from '../src/lib/billing';

describe('Razorpay webhook signatures', () => {
  it('accepts a valid HMAC signature', () => {
    const payload = '{"event":"subscription.updated"}';
    const secret = 'test-secret';
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    expect(verifyRazorpaySignature(payload, signature, secret)).toBe(true);
  });

  it('rejects an invalid signature', () => {
    expect(verifyRazorpaySignature('{}', 'invalid', 'test-secret')).toBe(false);
    expect(verifyRazorpaySignature('{}', null, 'test-secret')).toBe(false);
  });
});
