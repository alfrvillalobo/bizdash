"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  total_sales: number;
  total_revenue: number;
  total_products: number;
  low_stock_count: number;
}

function StatCard({ icon, label, value, color, prefix = "" }: {
  icon: string; label: string; value: number;
  color: string; prefix?: string;
}) {
  const [displayed, setDisplayed] = useState(0);

  // Animación de conteo al montar el componente
  useEffect(() => {
    const duration = 1000;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplayed(value); clearInterval(timer); }
      else setDisplayed(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const formatted = prefix === "$"
    ? `$${displayed.toLocaleString("es-CL")}`
    : displayed.toLocaleString("es-CL");

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "1rem", padding: "1.25rem 1.5rem",
      display: "flex", alignItems: "center", gap: "1rem",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.3)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{
        width: "48px", height: "48px", borderRadius: "12px",
        background: `${color}18`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.4rem", flexShrink: 0,
      }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>
          {label}
        </p>
        <p style={{
          margin: "0.15rem 0 0", fontSize: "1.5rem", fontWeight: 700,
          color: "var(--text-primary)", fontFamily: "Sora, sans-serif",
        }}>
          {formatted}
        </p>
      </div>
    </div>
  );
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError]   = useState(false);

  useEffect(() => {
    api.get("/sales/stats/dashboard")
      .then((r) => setStats(r.data))
      .catch(() => setError(true));
  }, []);

  if (error) return (
    <p style={{ color: "var(--danger)", fontSize: "0.9rem" }}>
      Error al cargar estadísticas
    </p>
  );

  if (!stats) return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem"
    }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          height: "90px", borderRadius: "1rem",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          animation: "pulse 1.5s infinite",
        }} />
      ))}
    </div>
  );

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "1rem",
    }}>
      <StatCard icon="💰" label="Ingresos Totales"  value={stats.total_revenue}  color="#10B981" prefix="$" />
      <StatCard icon="🧾" label="Total Ventas"       value={stats.total_sales}    color="#6366F1" />
      <StatCard icon="📦" label="Productos"          value={stats.total_products} color="#F59E0B" />
      <StatCard icon="⚠️" label="Stock Bajo"         value={stats.low_stock_count}color="#EF4444" />
    </div>
  );
}