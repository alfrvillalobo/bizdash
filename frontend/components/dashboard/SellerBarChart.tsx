"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

interface SellerStat {
  name: string;
  sales_count: number;
  revenue: number;
}

export default function SellerBarChart() {
  const [data, setData]       = useState<SellerStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/sales/stats/by-seller")
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "0.75rem", padding: "0.75rem 1rem",
      }}>
        <p style={{ margin: 0, color: "var(--text-primary)", fontWeight: 600 }}>
          {label}
        </p>
        <p style={{ margin: "0.25rem 0 0", color: "#6366F1", fontWeight: 600 }}>
          ${payload[0]?.value?.toLocaleString("es-CL")}
        </p>
        <p style={{ margin: "0.15rem 0 0", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
          {payload[0]?.payload?.sales_count} ventas
        </p>
      </div>
    );
  };

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "1rem", padding: "1.5rem",
    }}>
      <h3 style={{
        margin: "0 0 1.5rem", fontFamily: "Sora, sans-serif",
        fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)",
      }}>
        Ingresos por Vendedor
      </h3>

      {loading ? (
        <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Cargando...</p>
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Sin datos aún</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="revenue" fill="#6366F1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}