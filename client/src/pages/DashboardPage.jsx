import { Link } from "react-router-dom";
import {
  Factory,
  ShoppingCart,
  Package,
  Layers,
  BarChart3,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { MetricCard } from "../components/ui/Card";
import { ROUTES } from "../constants/routes";

// ─── Mock data (replace with TanStack Query + API when Supabase is ready) ───
const mockDailyMetrics = {
  todayProduction: 124,
  todaySales: 98,
  stock: 1842,
  cementBags: 340,
};

const mockGhmcMetrics = {
  todayProduction: 56,
  todaySales: 42,
  stock: 628,
  cementBags: 90,
};

const dailyQuickLinks = [
  { label: "Production Entry", sub: "Covers and frames", href: ROUTES.PRODUCTION, icon: Factory, featured: true },
  { label: "Sales Entry", sub: "Customer dispatch", href: ROUTES.SALES, icon: ShoppingCart },
  { label: "Stock Dashboard", sub: "Available stock", href: ROUTES.STOCK, icon: Package },
  { label: "Cement Stock", sub: "Cement bags", href: ROUTES.CEMENT, icon: Layers },
  { label: "Statistics", sub: "Date reports", href: ROUTES.STATISTICS, icon: BarChart3 },
];

const ghmcQuickLinks = [
  { label: "GHMC Dashboard", sub: "All GHMC controls", href: ROUTES.GHMC, icon: Building2, featured: true },
  { label: "GHMC Production", sub: "Entry work", href: ROUTES.GHMC_PRODUCTION, icon: Factory },
  { label: "GHMC Sales", sub: "Dispatch work", href: ROUTES.GHMC_SALES, icon: ShoppingCart },
  { label: "GHMC Stock", sub: "Available stock", href: ROUTES.GHMC_STOCK, icon: Package },
  { label: "GHMC Cement", sub: "Cement bags", href: ROUTES.GHMC_CEMENT, icon: Layers },
  { label: "GHMC Statistics", sub: "Date reports", href: ROUTES.GHMC_STATISTICS, icon: BarChart3 },
];

function QuickLinkCard({ label, sub, href, icon: Icon, featured }) {
  return (
    <Link
      to={href}
      className={`group flex flex-col gap-2 p-5 rounded-3xl border transition-all duration-300 active:scale-[0.98] ${
        featured
          ? "bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/15 hover:shadow-[0_8px_24px_rgba(249,115,22,0.06)]"
          : "bg-white border-black/5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl ${featured ? "bg-orange-50" : "bg-[#f2f2f7]"}`}>
          <Icon size={18} className={featured ? "text-orange-500" : "text-gray-500"} />
        </div>
        <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-transform" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{sub}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <Layout>
      <Header title="Operations Dashboard" subtitle="Home" />

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
        {/* ── Daily Production Section ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-1 h-5 bg-orange-500 rounded-full" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Regular Work</p>
              <h3 className="text-base font-extrabold text-gray-800 tracking-tight">Daily Operations</h3>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Today Production"
              value={mockDailyMetrics.todayProduction}
              sub="Produced today"
              icon={Factory}
              color="orange"
            />
            <MetricCard
              label="Today Sales"
              value={mockDailyMetrics.todaySales}
              sub="Sold today"
              icon={ShoppingCart}
              color="emerald"
            />
            <MetricCard
              label="Stock"
              value={mockDailyMetrics.stock}
              sub="Available now"
              icon={Package}
              color="sky"
            />
            <MetricCard
              label="Cement"
              value={mockDailyMetrics.cementBags}
              sub="Bags in stock"
              icon={Layers}
              color="amber"
            />
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
            {dailyQuickLinks.map((link) => (
              <QuickLinkCard key={link.href} {...link} />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-black/5" />

        {/* ── GHMC Section ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-1 h-5 bg-violet-500 rounded-full" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">GHMC Work</p>
              <h3 className="text-base font-extrabold text-gray-800 tracking-tight">GHMC Operations</h3>
            </div>
          </div>

          {/* GHMC Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Today Production"
              value={mockGhmcMetrics.todayProduction}
              sub="GHMC produced today"
              icon={Factory}
              color="violet"
            />
            <MetricCard
              label="Today Sales"
              value={mockGhmcMetrics.todaySales}
              sub="GHMC sold today"
              icon={ShoppingCart}
              color="emerald"
            />
            <MetricCard
              label="Stock"
              value={mockGhmcMetrics.stock}
              sub="GHMC available now"
              icon={Package}
              color="sky"
            />
            <MetricCard
              label="Cement"
              value={mockGhmcMetrics.cementBags}
              sub="GHMC bags in stock"
              icon={Layers}
              color="amber"
            />
          </div>

          {/* GHMC Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
            {ghmcQuickLinks.map((link) => (
              <QuickLinkCard key={link.href} {...link} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
