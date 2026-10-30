// Seed script: creates demo users, metrics, activities, notifications
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("demo123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: { password, role: "ADMIN" },
    create: { name: "Admin User", email: "admin@demo.com", password, role: "ADMIN" },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@demo.com" },
    update: { password, role: "USER" },
    create: { name: "Demo User", email: "demo@demo.com", password, role: "USER" },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "northstar-demo" },
    update: { name: "Northstar Demo" },
    create: { name: "Northstar Demo", slug: "northstar-demo" },
  });

  await prisma.membership.upsert({ where: { userId_workspaceId: { userId: admin.id, workspaceId: workspace.id } }, update: { role: "OWNER" }, create: { userId: admin.id, workspaceId: workspace.id, role: "OWNER" } });
  await prisma.membership.upsert({ where: { userId_workspaceId: { userId: demo.id, workspaceId: workspace.id } }, update: { role: "MEMBER" }, create: { userId: demo.id, workspaceId: workspace.id, role: "MEMBER" } });

  const plan = await prisma.plan.upsert({ where: { name: "Growth" }, update: {}, create: { name: "Growth", description: "For growing SaaS teams", monthlyPrice: 4999 } });
  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  const subscription = await prisma.subscription.upsert({ where: { razorpaySubscriptionId: "demo_sub_growth" }, update: { currentPeriodStart: periodStart, currentPeriodEnd: periodEnd }, create: { workspaceId: workspace.id, userId: admin.id, planId: plan.id, razorpaySubscriptionId: "demo_sub_growth", currentPeriodStart: periodStart, currentPeriodEnd: periodEnd } });
  await prisma.invoice.create({ data: { workspaceId: workspace.id, subscriptionId: subscription.id, amount: 4999, paidAt: new Date() } });

  // 30 days of metrics
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const base = 10000 + i * 150;
    const m = {
      date,
      revenue: Math.round(base + Math.sin(i / 4) * 1200),
      users: 300 + i * 8 + Math.round(Math.sin(i / 3) * 25),
      orders: 100 + i * 4 + Math.round(Math.cos(i / 5) * 15),
      visits: 4500 + i * 90 + Math.round(Math.sin(i / 2) * 300),
    };
    await prisma.metric.upsert({ where: { date: m.date }, update: m, create: m });
  }

  // Activities for demo user
  const acts = [
    { action: "SIGNIN", entity: "session", detail: "Signed in" },
    { action: "VIEW_DASHBOARD", entity: "dashboard", detail: "Viewed main dashboard" },
    { action: "EXPORT", entity: "report", detail: "Exported metrics CSV" },
    { action: "SETTINGS_UPDATE", entity: "profile", detail: "Updated profile settings" },
  ];
  for (const a of acts) {
    await prisma.activity.create({ data: { userId: demo.id, workspaceId: workspace.id, ...a } });
  }

  // Notifications for demo user
  const notifs = [
    { title: "Welcome!", message: "Your account is ready. Explore the dashboard." },
    { title: "New report available", message: "October metrics report is now available." },
    { title: "System update", message: "Maintenance scheduled for this weekend." },
  ];
  for (const n of notifs) {
    await prisma.notification.create({ data: { userId: demo.id, workspaceId: workspace.id, ...n } });
  }

  console.log("Seed complete: users, 30 metrics, activities, notifications");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
