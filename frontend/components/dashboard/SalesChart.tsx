"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

interface DayData {
  date: string;
  sales_count: number;
  revenue: number;
}

export default function SalesChart() {
  const [data, setData]     = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/sales/stats/by-day")
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "0.75rem", padding: "0.75rem 1rem",
      }}>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.8rem" }}>{label}</p>
        <p style={{ margin: "0.25rem 0 0", color: "#6366F1", fontWeight: 600 }}>
          ${payload[0]?.value?.toLocaleString("es-CL")}
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
        Ingresos — Últimos 7 días
      </h3>

      {loading ? (
        <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Cargando gráfico...</p>
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Sin ventas en los últimos 7 días</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="revenue"
              stroke="#6366F1" strokeWidth={2.5}
              dot={{ fill: "#6366F1", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#6366F1" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}