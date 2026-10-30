import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyRazorpaySignature } from '@/lib/billing';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  if (!verifyRazorpaySignature(rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as { event?: string; payload?: { subscription?: { entity?: { id?: string; status?: string; current_start?: number; current_end?: number } } } };
  const entity = event.payload?.subscription?.entity;
  if (entity?.id) {
    await prisma.subscription.updateMany({
      where: { razorpaySubscriptionId: entity.id },
      data: {
        status: entity.status?.toUpperCase() ?? 'ACTIVE',
        ...(entity.current_start ? { currentPeriodStart: new Date(entity.current_start * 1000) } : {}),
        ...(entity.current_end ? { currentPeriodEnd: new Date(entity.current_end * 1000) } : {}),
      },
    });
  }

  return NextResponse.json({ received: true });
}
