import { useState } from "react";
import { RefreshCw, Download, Package } from "lucide-react";
import toast from "react-hot-toast";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Table";
import { cn } from "../lib/utils";
import { DAILY_PRODUCTS } from "../constants/products";
import { downloadCsv } from "../utils/csvUtils";

// Mock data generator
const generateMockStock = (products) =>
  products.map((p) => ({
    product: p.name,
    cover: p.cover,
    frame: p.frame,
    coverKey: p.coverKey,
    frameKey: p.frameKey,
    coverStock: Math.floor(Math.random() * 200 + 20),
    frameStock: Math.floor(Math.random() * 200 + 20),
  }));

function StockCardMobile({ item }) {
  const total = item.coverStock + item.frameStock;
  const isLow = total < 50;
  const isEmpty = total === 0;

  return (
    <div
      className={cn(
        "bg-white border rounded-3xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all",
        isEmpty
          ? "border-red-200 bg-red-50/10"
          : isLow
          ? "border-amber-200 bg-amber-50/10"
          : "border-black/5"
      )}
    >
      <div className="flex justify-between items-center">
        <p className="font-extrabold text-sm text-gray-800">{item.product}</p>
        <div className="flex gap-1.5">
          {isEmpty && <Badge variant="error">No Stock</Badge>}
          {isLow && !isEmpty && <Badge variant="warning">Low Stock</Badge>}
          {!isLow && <Badge variant="success">Available</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-2xl">
        <div className="text-center border-r border-black/5">
          <p className="text-3xl font-black text-sky-500">{item.coverStock}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Covers</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-violet-500">{item.frameStock}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Frames</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-black/5">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Pcs</span>
        <span className={cn("text-xl font-extrabold", isEmpty ? "text-red-500" : isLow ? "text-amber-500" : "text-slate-800")}>
          {total}
        </span>
      </div>
    </div>
  );
}

function StockRowDesktop({ item }) {
  const total = item.coverStock + item.frameStock;
  const isLow = total < 50;
  const isEmpty = total === 0;

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_120px_120px_120px] gap-4 items-center px-5 py-4 rounded-2xl border transition-all duration-300",
        isEmpty
          ? "bg-red-50/10 border-red-200"
          : isLow
          ? "bg-amber-50/10 border-amber-200"
          : "bg-white border-black/5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)]"
      )}
    >
      <div>
        <p className="text-sm font-bold text-gray-800">{item.product}</p>
        <div className="mt-1 flex gap-1.5">
          {isEmpty && <Badge variant="error">Out of stock</Badge>}
          {isLow && !isEmpty && <Badge variant="warning">Low stock</Badge>}
        </div>
      </div>

      <div className="text-center">
        <p className="text-2xl font-black text-sky-500">{item.coverStock}</p>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cover</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-black text-violet-500">{item.frameStock}</p>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Frame</p>
      </div>
      <div className="text-center">
        <p className={cn("text-base font-bold", isEmpty ? "text-red-500" : isLow ? "text-amber-500" : "text-slate-800")}>
          {total}
        </p>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</p>
      </div>
    </div>
  );
}

export default function StockPage({ isGhmc = false, products = DAILY_PRODUCTS }) {
  const [stock, setStock] = useState(() => generateMockStock(products));
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function handleRefresh() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setStock(generateMockStock(products));
    setLastRefresh(new Date());
    toast.success("Stock dashboard refreshed");
    setLoading(false);
  }

  const grandTotal = stock.reduce((s, i) => s + i.coverStock + i.frameStock, 0);

  return (
    <Layout>
      <Header
        title={isGhmc ? "GHMC Stock Dashboard" : "Stock Dashboard"}
        subtitle={isGhmc ? "GHMC Work" : "Daily Operations"}
      />
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Summary card grids */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center py-4 px-2">
            <p className="text-3xl font-black text-emerald-500">{grandTotal}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">Total Stock</p>
          </Card>
          <Card className="text-center py-4 px-2">
            <p className="text-3xl font-black text-sky-500">{stock.reduce((s, i) => s + i.coverStock, 0)}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">Covers</p>
          </Card>
          <Card className="text-center py-4 px-2">
            <p className="text-3xl font-black text-violet-500">{stock.reduce((s, i) => s + i.frameStock, 0)}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">Frames</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-sky-500" />
              <h3 className="text-base font-extrabold text-gray-800 tracking-tight">Stock Levels</h3>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block space-y-2.5">
            <div className="grid grid-cols-[1fr_120px_120px_120px] gap-4 px-5 pb-3 border-b border-black/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Product</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Cover</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Frame</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Total</span>
            </div>
            <div className="space-y-2 mt-3">
              {stock.map((item) => (
                <StockRowDesktop key={item.coverKey} item={item} />
              ))}
            </div>
          </div>

          {/* Mobile View */}
          <div className="block sm:hidden space-y-3.5">
            {stock.map((item) => (
              <StockCardMobile key={item.coverKey} item={item} />
            ))}
          </div>

          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-5 text-right px-1">
            Last checked: {lastRefresh.toLocaleTimeString("en-IN")}
          </p>
        </Card>
      </div>
    </Layout>
  );
}
