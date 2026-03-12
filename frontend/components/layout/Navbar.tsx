"use client";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard":            "Dashboard",
  "/dashboard/ventas":     "Ventas",
  "/dashboard/productos":  "Productos",
};

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header style={{
      height: "64px", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 1.5rem", background: "var(--bg-primary)",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <h2 style={{
        margin: 0, fontFamily: "Sora, sans-serif",
        fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)",
      }}>
        {titles[pathname] ?? "BizDash"}
      </h2>
      <div style={{
        width: "8px", height: "8px", borderRadius: "50%",
        background: "var(--success)",
        boxShadow: "0 0 8px var(--success)",
      }} title="API conectada" />
    </header>
  );
}