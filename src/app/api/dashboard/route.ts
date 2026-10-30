import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentWorkspace } from '@/lib/workspace';
import { serverError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const membership = await getCurrentWorkspace();
    if (!membership) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

    const [subscription, customers, invoices, activities] = await Promise.all([
      prisma.subscription.findFirst({ where: { workspaceId: membership.workspaceId, status: 'ACTIVE' }, include: { plan: true }, orderBy: { createdAt: 'desc' } }),
      prisma.customer.count({ where: { workspaceId: membership.workspaceId, status: 'ACTIVE' } }),
      prisma.invoice.aggregate({ where: { workspaceId: membership.workspaceId, status: 'PAID' }, _sum: { amount: true }, _count: true }),
      prisma.activity.findMany({ where: { workspaceId: membership.workspaceId }, orderBy: { createdAt: 'desc' }, take: 6 }),
    ]);

    return NextResponse.json({ workspace: membership.workspace, subscription, customers, invoices, activities });
  } catch (error) {
    return serverError(error);
  }
}
