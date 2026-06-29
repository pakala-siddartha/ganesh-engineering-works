import { Link } from "react-router-dom";
import { Factory, ShoppingCart, Package, Layers, BarChart3, ArrowRight } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { MetricCard } from "../components/ui/Card";
import { ROUTES } from "../constants/routes";

const mockMetrics = {
  todayProduction: 56,
  todaySales: 42,
  stock: 628,
  cementBags: 90,
};

const links = [
  { label: "GHMC Production", sub: "Entry work", href: ROUTES.GHMC_PRODUCTION, icon: Factory, featured: true },
  { label: "GHMC Sales", sub: "Dispatch work", href: ROUTES.GHMC_SALES, icon: ShoppingCart },
  { label: "GHMC Stock", sub: "Available stock", href: ROUTES.GHMC_STOCK, icon: Package },
  { label: "GHMC Cement", sub: "Cement bags", href: ROUTES.GHMC_CEMENT, icon: Layers },
  { label: "GHMC Statistics", sub: "Date reports", href: ROUTES.GHMC_STATISTICS, icon: BarChart3 },
];

export default function GhmcDashboardPage() {
  return (
    <Layout>
      <Header title="GHMC Operations Dashboard" subtitle="GHMC Work" />
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Today Production" value={mockMetrics.todayProduction} sub="GHMC produced" icon={Factory} color="violet" />
          <MetricCard label="Today Sales" value={mockMetrics.todaySales} sub="GHMC sold" icon={ShoppingCart} color="emerald" />
          <MetricCard label="Stock" value={mockMetrics.stock} sub="GHMC available" icon={Package} color="sky" />
          <MetricCard label="Cement" value={mockMetrics.cementBags} sub="GHMC bags" icon={Layers} color="amber" />
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">GHMC Workflows</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`group flex flex-col gap-2 p-5 rounded-3xl border transition-all duration-300 active:scale-[0.98] ${
                  link.featured
                    ? "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border-violet-500/15 hover:shadow-[0_8px_24px_rgba(139,92,246,0.06)]"
                    : "bg-white border-black/5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${link.featured ? "bg-violet-50" : "bg-[#f2f2f7]"}`}>
                    <link.icon size={18} className={link.featured ? "text-violet-500" : "text-gray-500"} />
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{link.label}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{link.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
