"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

interface ProductStat {
  name: string;
  sales_count: number;
  revenue: number;
}

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function ProductPieChart() {
  const [data, setData]       = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/sales/stats/by-product")
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "0.75rem", padding: "0.75rem 1rem",
      }}>
        <p style={{ margin: 0, color: "var(--text-primary)", fontWeight: 600 }}>
          {payload[0].name}
        </p>
        <p style={{ margin: "0.25rem 0 0", color: "var(--success)", fontWeight: 600 }}>
          ${payload[0].value?.toLocaleString("es-CL")}
        </p>
        <p style={{ margin: "0.15rem 0 0", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
          {payload[0].payload.sales_count} ventas
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
        Ingresos por Producto
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
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}