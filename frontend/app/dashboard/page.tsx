"use client";
import { useAuth } from "@/lib/auth-context";
import StatsCards from "@/components/dashboard/StatsCards";
import SalesChart from "@/components/dashboard/SalesChart";
import ProductPieChart from "@/components/dashboard/ProductPieChart";
import SellerBarChart from "@/components/dashboard/SellerBarChart";
import SellerDashboard from "@/components/dashboard/SellerDashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin  = user?.role === "admin";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div>
        <h1 style={{
          margin: 0, fontFamily: "Sora, sans-serif",
          fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)",
        }}>
          Bienvenido, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {isAdmin ? "Resumen general del negocio" : "Tu resumen personal de ventas"}
        </p>
      </div>

      {/* Vista Admin */}
      {isAdmin && (
        <>
          <StatsCards />
          <SalesChart />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1rem",
          }}>
            <ProductPieChart />
            <SellerBarChart />
          </div>
        </>
      )}

      {/* Vista Vendedor */}
      {!isAdmin && <SellerDashboard />}
    </div>
  );
}
