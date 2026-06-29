// GHMC pages — reuse main pages with isGhmc=true and GHMC product list
import ProductionPage from "./ProductionPage";
import SalesPage from "./SalesPage";
import StockPage from "./StockPage";
import CementPage from "./CementPage";
import StatisticsPage from "./StatisticsPage";
import { GHMC_PRODUCTS } from "../constants/products";

export function GhmcProductionPage() {
  return <ProductionPage isGhmc={true} products={GHMC_PRODUCTS} />;
}

export function GhmcSalesPage() {
  return <SalesPage isGhmc={true} products={GHMC_PRODUCTS} />;
}

export function GhmcStockPage() {
  return <StockPage isGhmc={true} products={GHMC_PRODUCTS} />;
}

export function GhmcCementPage() {
  return <CementPage isGhmc={true} />;
}

export function GhmcStatisticsPage() {
  return <StatisticsPage isGhmc={true} />;
}
