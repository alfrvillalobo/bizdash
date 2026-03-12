"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

interface MyStats {
  my_total_sales: number;
  my_total_revenue: number;
  my_today_sales: number;
  my_today_revenue: number;
  daily_chart: { date: string; sales_count: number; revenue: number }[];
}

function MiniCard({ icon, label, value, color, prefix = "" }: {
  icon: string; label: string; value: number;
  color: string; prefix?: string;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplayed(value); clearInterval(timer); }
      else setDisplayed(Math.floor(current));
    }, 1000 / steps);
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
      transition: "transform 0.2s",
    }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{
        width: "48px", height: "48px", borderRadius: "12px",
        background: `${color}18`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "1.4rem", flexShrink: 0,
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

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    api.get("/sales/stats/my-stats")
      .then((r) => setStats(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "0.75rem", padding: "0.75rem 1rem",
      }}>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.8rem" }}>{label}</p>
        <p style={{ margin: "0.25rem 0 0", color: "#10B981", fontWeight: 600 }}>
          ${payload[0]?.value?.toLocaleString("es-CL")}
        </p>
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: "1rem" }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          height: "90px", borderRadius: "1rem",
          background: "var(--bg-card)", border: "1px solid var(--border)",
        }} />
      ))}
    </div>
  );

  if (error) return (
    <p style={{ color: "var(--danger)" }}>Error al cargar tus estadísticas</p>
  );

  if (!stats) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Sección Hoy */}
      <div>
        <p style={{
          margin: "0 0 0.75rem", fontSize: "0.8rem", fontWeight: 600,
          color: "var(--text-secondary)", textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Hoy
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}>
          <MiniCard
            icon="🧾" label="Ventas hoy"
            value={stats.my_today_sales} color="#6366F1"
          />
          <MiniCard
            icon="💵" label="Ingresos hoy"
            value={stats.my_today_revenue} color="#10B981" prefix="$"
          />
        </div>
      </div>

      {/* Sección Totales */}
      <div>
        <p style={{
          margin: "0 0 0.75rem", fontSize: "0.8rem", fontWeight: 600,
          color: "var(--text-secondary)", textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Totales
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}>
          <MiniCard
            icon="🧾" label="Total ventas"
            value={stats.my_total_sales} color="#F59E0B"
          />
          <MiniCard
            icon="💰" label="Total ingresos"
            value={stats.my_total_revenue} color="#10B981" prefix="$"
          />
        </div>
      </div>

      {/* Gráfico personal */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "1rem", padding: "1.5rem",
      }}>
        <h3 style={{
          margin: "0 0 1.5rem", fontFamily: "Sora, sans-serif",
          fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)",
        }}>
          Mis ingresos — Últimos 7 días
        </h3>

        {stats.daily_chart.length === 0 ? (
          <div style={{
            height: "200px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "0.75rem",
          }}>
            <p style={{ margin: 0, fontSize: "2rem" }}>📭</p>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Sin ventas en los últimos 7 días
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.daily_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="revenue"
                stroke="#10B981" strokeWidth={2.5}
                dot={{ fill: "#10B981", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* CTA ir a registrar venta */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.08))",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: "1rem", padding: "1.25rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <p style={{
            margin: 0, fontFamily: "Sora, sans-serif",
            fontWeight: 600, color: "var(--text-primary)",
          }}>
            ¿Listo para vender? 🚀
          </p>
          <p style={{ margin: "0.2rem 0 0", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Registra una nueva venta rápidamente
          </p>
        </div>
        <a href="/dashboard/ventas" style={{
          padding: "0.7rem 1.25rem",
          background: "var(--accent)", color: "white",
          borderRadius: "0.75rem", textDecoration: "none",
          fontFamily: "Sora, sans-serif", fontWeight: 600,
          fontSize: "0.875rem", transition: "background 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          + Nueva Venta
        </a>
      </div>
    </div>
  );
}