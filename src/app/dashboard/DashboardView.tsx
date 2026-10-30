"use client";

import { signOut } from "next-auth/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  Download,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Package,
  Search,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type DashboardData = {
  customers: number;
  invoices: { _sum: { amount: number | null }; _count: number };
  subscription: { plan: { name: string; monthlyPrice: number; currency: string }; status: string } | null;
  activities: { id: string; action: string; entity: string; detail: string | null; createdAt: string }[];
};

const monthly = [
  { label: "May 1", revenue: 42, users: 24 },
  { label: "May 5", revenue: 54, users: 32 },
  { label: "May 9", revenue: 48, users: 29 },
  { label: "May 13", revenue: 68, users: 40 },
  { label: "May 17", revenue: 61, users: 36 },
  { label: "May 21", revenue: 78, users: 48 },
  { label: "May 25", revenue: 72, users: 44 },
  { label: "May 30", revenue: 92, users: 57 },
];

const week = [
  { label: "Mon", revenue: 58, users: 36 },
  { label: "Tue", revenue: 72, users: 44 },
  { label: "Wed", revenue: 64, users: 40 },
  { label: "Thu", revenue: 86, users: 52 },
  { label: "Fri", revenue: 78, users: 47 },
  { label: "Sat", revenue: 48, users: 30 },
  { label: "Sun", revenue: 62, users: 38 },
];

const activities = [
  { initials: "JD", name: "Jordan Davis", action: "completed an order", detail: "Order #1048", time: "2 min ago", color: "coral" },
  { initials: "MK", name: "Maya Kim", action: "joined your workspace", detail: "New team member", time: "18 min ago", color: "blue" },
  { initials: "RB", name: "Riley Brown", action: "exported a report", detail: "May performance", time: "1 hr ago", color: "violet" },
  { initials: "AL", name: "Alex Lee", action: "updated billing details", detail: "•••• 4242", time: "3 hrs ago", color: "green" },
];

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${100 - value}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-10 w-24" aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function DashboardView({ userName = "Admin User" }: { userName?: string | null }) {
  const [range, setRange] = useState("This month");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [dataError, setDataError] = useState("");
  useEffect(() => {
    fetch('/api/dashboard')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load dashboard data')))
      .then(setData)
      .catch((error: Error) => setDataError(error.message));
  }, []);
  const chartData = range === "This week" ? week : monthly;
  const revenue = data?.invoices._sum.amount ?? 0;
  const activeCustomers = data?.customers ?? 0;
  const planName = data?.subscription?.plan.name ?? 'No active plan';
  const maxRevenue = Math.max(...chartData.map((item) => item.revenue));
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);

  function exportReport() {
    const rows = ["Period,Revenue index,Active users", ...chartData.map((item) => `${item.label},${item.revenue},${item.users}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "northstar-performance.csv";
    link.click();
    URL.revokeObjectURL(url);
    setToast("Report downloaded");
    window.setTimeout(() => setToast(""), 2400);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#14202b]">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-[#e5e8ec] bg-white px-5 py-6 transition-transform lg:static lg:translate-x-0`}>
          <div className="flex items-center justify-between px-2">
            <a href="/dashboard" className="flex items-center gap-3" aria-label="Northstar home">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#14202b] text-white"><TrendingUp size={19} /></span>
              <span className="font-display text-xl font-bold tracking-tight">northstar</span>
            </a>
            <button className="rounded-lg p-2 text-slate-500 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={20} /></button>
          </div>
          <div className="mt-12 space-y-7">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
            <nav className="space-y-1" aria-label="Main navigation">
              <a className="nav-link nav-link-active" href="#overview"><LayoutDashboard size={18} /> Overview</a>
              <a className="nav-link" href="#customers"><Users size={18} /> Customers <span className="ml-auto rounded-md bg-[#f1f3f5] px-2 py-0.5 text-[11px] font-semibold">2.4k</span></a>
              <a className="nav-link" href="#orders"><ShoppingCart size={18} /> Orders</a>
              <a className="nav-link" href="#products"><Package size={18} /> Products</a>
            </nav>
            <p className="px-3 pt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Manage</p>
            <nav className="space-y-1">
              <a className="nav-link" href="#settings"><Settings size={18} /> Settings</a>
            </nav>
          </div>
          <div className="mt-auto rounded-2xl bg-[#f4f6f7] p-4">
            <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold">Workspace usage</span><span className="text-xs text-slate-500">68%</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full w-[68%] rounded-full bg-[#f2765a]" /></div>
            <p className="mt-3 text-xs leading-5 text-slate-500">You&apos;re using 68% of your monthly plan.</p>
            <button className="mt-3 text-xs font-bold text-[#e05f45] hover:underline">Manage plan →</button>
          </div>
        </aside>
        {sidebarOpen && <button className="fixed inset-0 z-20 bg-slate-900/20 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation overlay" />}

        <main className="min-w-0 flex-1 px-5 py-5 sm:px-8 lg:px-12 lg:py-8">
          <header className="flex items-center justify-between gap-4">
            <button className="rounded-lg border border-[#e5e8ec] bg-white p-2 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
            <div className="relative hidden max-w-xs flex-1 sm:block"><Search size={17} className="absolute left-3 top-2.5 text-slate-400" /><input aria-label="Search" placeholder="Search anything..." className="w-full rounded-xl border border-[#e5e8ec] bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-[#f2765a]" /></div>
            <div className="ml-auto flex items-center gap-3">
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative rounded-xl border border-[#e5e8ec] bg-white p-2.5 text-slate-600 hover:bg-slate-50" aria-label="Notifications"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#f2765a]" /></button>
              <div className="hidden h-8 w-px bg-[#e5e8ec] sm:block" />
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2 rounded-xl p-1.5 text-left hover:bg-slate-50" title="Sign out"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e8d9d0] text-xs font-bold text-[#805a4a]">{(userName || "AU").split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span className="hidden text-sm font-semibold sm:block">{userName || "Admin User"}</span><ChevronDown size={15} className="hidden text-slate-400 sm:block" /></button>
            </div>
          </header>

          {notificationsOpen && <div className="absolute right-8 top-20 z-20 w-80 rounded-2xl border border-[#e5e8ec] bg-white p-4 shadow-xl"><div className="flex justify-between"><b className="text-sm">Notifications</b><span className="text-xs font-semibold text-[#e05f45]">3 new</span></div><p className="mt-4 text-sm text-slate-600">Your May performance report is ready to review.</p><p className="mt-3 text-sm text-slate-600">You&apos;re close to your monthly workspace limit.</p></div>}

          <section id="overview" className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-sm font-medium text-[#e05f45]">{greeting}, {userName?.split(" ")[0] || "there"}</p><h1 className="font-display mt-2 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Here&apos;s your overview.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">A clear view of what&apos;s happening across your business today.</p></div><div className="flex gap-3"><button onClick={exportReport} className="inline-flex items-center gap-2 rounded-xl border border-[#e5e8ec] bg-white px-4 py-2.5 text-sm font-semibold hover:border-slate-300"><Download size={16} /> Export</button><select value={range} onChange={(event) => setRange(event.target.value)} className="rounded-xl border border-[#e5e8ec] bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#f2765a]"><option>This month</option><option>This week</option></select></div></section>

          {dataError && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{dataError}. Showing available dashboard defaults.</div>}
          {!data && !dataError && <div role="status" className="mt-5 rounded-xl border border-[#e5e8ec] bg-white p-4 text-sm text-slate-500">Loading workspace analytics…</div>}
          <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[{ label: "Paid revenue", value: revenue ? `₹${revenue.toLocaleString('en-IN')}` : "₹0", change: planName, icon: TrendingUp, color: "#f2765a", values: [32, 38, 35, 48, 55, 51, 68, 73] }, { label: "Active customers", value: activeCustomers.toLocaleString(), change: "Workspace total", icon: Users, color: "#5b8def", values: [40, 42, 48, 45, 58, 62, 70, 77] }, { label: "Orders", value: "1,284", change: "+5.2%", icon: ShoppingCart, color: "#8b72d9", values: [62, 52, 58, 48, 55, 46, 50, 42] }, { label: "Conversion rate", value: "4.36%", change: "-1.1%", icon: TrendingUp, color: "#37a47a", values: [72, 70, 74, 68, 62, 65, 60, 57], down: true }].map((card) => <article key={card.label} className="rounded-2xl border border-[#e5e8ec] bg-white p-5"><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: `${card.color}18`, color: card.color }}><card.icon size={19} /></span><Sparkline values={card.values} color={card.color} /></div><p className="mt-5 text-sm text-slate-500">{card.label}</p><div className="mt-1 flex items-end justify-between"><p className="font-display text-2xl font-bold tracking-tight">{card.value}</p><span className={`flex items-center gap-0.5 text-xs font-bold ${card.down ? "text-[#df6a58]" : "text-[#2d9a70]"}`}>{card.down ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{card.change}</span></div></article>)}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
            <article className="rounded-2xl border border-[#e5e8ec] bg-white p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-display text-lg font-bold">Revenue overview</h2><p className="mt-1 text-xs text-slate-500">Revenue performance over time</p></div><div className="flex items-center gap-4 text-xs font-semibold"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#f2765a]" /> Revenue</span><span className="flex items-center gap-2 text-slate-500"><i className="h-2 w-2 rounded-full bg-[#b9c9ed]" /> Users</span></div></div><div className="mt-8 flex h-56 items-end gap-2 border-b border-l border-[#edf0f2] px-2 pb-0 sm:gap-4">{chartData.map((item) => <div key={item.label} className="group flex h-full flex-1 items-end gap-1.5"><div className="relative w-1/2 rounded-t-md bg-[#d6e0f4] transition-all group-hover:bg-[#b9c9ed]" style={{ height: `${(item.users / maxRevenue) * 80}%` }}><span className="absolute -top-6 hidden w-20 -translate-x-1/4 rounded bg-[#14202b] px-1 py-1 text-center text-[10px] text-white group-hover:block">{item.users}k users</span></div><div className="relative w-1/2 rounded-t-md bg-[#f2765a] transition-all group-hover:bg-[#e05f45]" style={{ height: `${(item.revenue / maxRevenue) * 100}%` }} /></div>)}</div><div className="mt-3 flex justify-between px-1 text-[10px] text-slate-400">{chartData.map((item) => <span key={item.label}>{item.label}</span>)}</div></article>
            <article className="rounded-2xl border border-[#e5e8ec] bg-[#14202b] p-6 text-white"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-slate-400">Monthly target</p><h2 className="font-display mt-2 text-3xl font-bold">$52,000</h2></div><span className="rounded-lg bg-white/10 p-2"><TrendingUp size={18} className="text-[#f9a089]" /></span></div><div className="mt-9"><div className="mb-2 flex justify-between text-xs"><span className="text-slate-400">Progress</span><b>92.8%</b></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[92.8%] rounded-full bg-[#f2765a]" /></div><p className="mt-4 text-xs leading-5 text-slate-400">You&apos;re <span className="font-bold text-white">$3,706</span> away from reaching your monthly target.</p></div><button className="mt-8 w-full rounded-xl bg-white/10 py-3 text-sm font-semibold transition hover:bg-white/15">View report</button></article>
          </section>

          <section className="mt-5 grid gap-5 pb-8 xl:grid-cols-[1.65fr_1fr]"><article id="customers" className="rounded-2xl border border-[#e5e8ec] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold">Recent activity</h2><p className="mt-1 text-xs text-slate-500">The latest updates from your workspace</p></div><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50" aria-label="More activity options"><MoreHorizontal size={19} /></button></div><div className="mt-5 divide-y divide-[#f0f1f3]">{activities.map((activity) => <div key={activity.name} className="flex items-center gap-3 py-3"><span className={`avatar avatar-${activity.color}`}>{activity.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-sm"><b>{activity.name}</b> <span className="text-slate-500">{activity.action}</span></p><p className="mt-0.5 text-xs text-slate-400">{activity.detail}</p></div><time className="text-xs text-slate-400">{activity.time}</time></div>)}</div><button className="mt-4 text-xs font-bold text-[#e05f45] hover:underline">View all activity →</button></article><article id="orders" className="rounded-2xl border border-[#e5e8ec] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold">Top products</h2><p className="mt-1 text-xs text-slate-500">Best performing this month</p></div><button className="text-xs font-bold text-[#e05f45]">View all</button></div><div className="mt-5 space-y-5">{[["01", "Aurora Desk Lamp", "$12,840", "#f5d8c7"], ["02", "Field Notes Journal", "$8,920", "#d5e2ef"], ["03", "Studio Headphones", "$6,410", "#ddd4ee"]].map(([number, name, amount, color]) => <div key={name} className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg text-xs font-bold" style={{ background: color }}>{number}</span><span className="flex-1 text-sm font-semibold">{name}</span><span className="text-sm font-bold">{amount}</span></div>)}</div></article></section>
          {toast && <div role="status" className="fixed bottom-6 right-6 rounded-xl bg-[#14202b] px-4 py-3 text-sm font-semibold text-white shadow-lg">{toast}</div>}
        </main>
      </div>
    </div>
  );
}
