import { NextResponse } from 'next/server';
import { z } from 'zod';

export function parseJson<T extends z.ZodTypeAny>(schema: T, body: unknown) {
  const result = schema.safeParse(body);
  if (!result.success) {
    return { response: NextResponse.json({ error: 'Invalid request', details: result.error.flatten() }, { status: 400 }) };
  }
  return { data: result.data as z.infer<T> };
}

export function serverError(error: unknown) {
  console.error(error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
