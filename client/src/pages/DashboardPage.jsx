import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { MetricCard } from "../components/ui/Card";
import { ROUTES } from "../constants/routes";
import ganeshImage from "../assets/ganesh_image.jpeg";
import api from "../services/api";

const dailyQuickLinks = [
  { label: "Production Entry", sub: "Covers and frames", href: ROUTES.PRODUCTION, icon: Factory },
  { label: "Sales Entry", sub: "Customer dispatch", href: ROUTES.SALES, icon: ShoppingCart },
  { label: "Stock Dashboard", sub: "Available stock", href: ROUTES.STOCK, icon: Package },
  { label: "Cement Stock", sub: "Cement bags", href: ROUTES.CEMENT, icon: Layers },
  { label: "GHMC Work", sub: "GHMC dashboard", href: ROUTES.GHMC, icon: Building2 },
  { label: "Statistics", sub: "Date reports", href: ROUTES.STATISTICS, icon: BarChart3 },
];

function QuickLinkCard({ label, sub, href, icon: Icon }) {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setIsFlipped(true);
    setTimeout(() => {
      navigate(href);
    }, 450);
  };

  return (
    <div
      onClick={handleClick}
      className="perspective-1000 w-full h-[120px] sm:h-[140px] lg:h-[185px] cursor-pointer select-none"
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden group flex flex-col gap-1.5 sm:gap-2 lg:gap-4 p-3 sm:p-5 lg:p-7 rounded-2xl sm:rounded-3xl lg:rounded-[28px] border bg-white border-black/5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="p-1.5 sm:p-2.5 lg:p-3.5 rounded-xl sm:rounded-2xl bg-[#f2f2f7] group-hover:bg-blue-50 transition-colors">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
            </div>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <p className="text-[11px] sm:text-sm lg:text-base font-bold text-gray-800 transition-colors group-hover:text-blue-600 line-clamp-1">{label}</p>
            <p className="text-[9px] sm:text-xs lg:text-sm text-gray-400 font-medium mt-0.5 line-clamp-1">{sub}</p>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl sm:rounded-3xl lg:rounded-[28px] border border-blue-500/20 flex flex-col items-center justify-center p-3 gap-1 shadow-lg shadow-blue-500/10">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white animate-pulse" />
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider mt-1 text-blue-50">Opening</p>
          <p className="text-[8px] sm:text-[10px] lg:text-xs text-cyan-100 font-medium opacity-80 line-clamp-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];

  // Fetch today's production, sales, and cement from Supabase
  const { data: prodData } = useQuery({
    queryKey: ["production", "regular"],
    queryFn: () => api.get("/production?type=regular"),
  });
  const { data: salesData } = useQuery({
    queryKey: ["sales", "regular"],
    queryFn: () => api.get("/sales?type=regular"),
  });
  const { data: cementData } = useQuery({
    queryKey: ["cement", "regular"],
    queryFn: () => api.get("/cement?type=regular"),
  });

  // Today totals
  const todayProduction = (prodData?.data ?? [])
    .filter((e) => e.date === today)
    .reduce((s, e) => s + (e.total_quantity || 0), 0);

  const todaySales = (salesData?.data ?? [])
    .filter((e) => e.date === today)
    .reduce((s, e) => s + (e.total_quantity || 0), 0);

  // Total stock = all production - all sales
  const totalProduced = (prodData?.data ?? []).reduce((s, e) => s + (e.total_quantity || 0), 0);
  const totalSold = (salesData?.data ?? []).reduce((s, e) => s + (e.total_quantity || 0), 0);
  const stock = totalProduced - totalSold;

  // Cement current stock = in - out
  const cementBags = (cementData?.data ?? []).reduce((s, e) => {
    return e.direction === "in" ? s + e.quantity : s - e.quantity;
  }, 0);

  return (
    <Layout>
      {/* Mobile Branding Header */}
      <div className="md:hidden flex items-center gap-4 px-5 pt-6 pb-2">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-black/5 flex items-center justify-center bg-white shadow-md shrink-0">
          <img src={ganeshImage} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1d1d1f] tracking-tight leading-tight">
            Ganesh Engineering Works
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 max-w-5xl mx-auto w-full lg:flex lg:flex-col lg:justify-center lg:py-12">
        {/* ── Daily Production Section ── */}
        <section className="space-y-4">
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Today Production"
              value={todayProduction}
              sub="Produced today"
              icon={Factory}
              color="orange"
            />
            <MetricCard
              label="Today Sales"
              value={todaySales}
              sub="Sold today"
              icon={ShoppingCart}
              color="emerald"
            />
            <MetricCard
              label="Stock"
              value={stock}
              sub="Available now"
              icon={Package}
              color="sky"
            />
            <MetricCard
              label="Cement"
              value={cementBags}
              sub="Bags in stock"
              icon={Layers}
              color="amber"
            />
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {dailyQuickLinks.map((link) => (
              <QuickLinkCard key={link.href} {...link} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
