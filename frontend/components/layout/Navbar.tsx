"use client";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard":             "Dashboard",
  "/dashboard/ventas":      "Ventas",
  "/dashboard/productos":   "Productos",
  "/dashboard/usuarios":    "Usuarios",
};

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header style={{
      height: "64px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      background: "var(--bg-primary)",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Botón hamburguesa — solo visible en móvil */}
        <button
          onClick={onMenuClick}
          className="hamburger-btn"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0.4rem",
            borderRadius: "0.5rem",
            color: "var(--text-secondary)",
            fontSize: "1.25rem",
            lineHeight: 1,
            transition: "all 0.15s",
            display: "none", // Oculto por defecto, visible en móvil via CSS
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          ☰
        </button>

        <h2 style={{
          margin: 0,
          fontFamily: "Sora, sans-serif",
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "var(--text-primary)",
        }}>
          {titles[pathname] ?? "BizDash"}
        </h2>
      </div>

      {/* Indicador API activa */}
      <div style={{
        width: "8px", height: "8px",
        borderRadius: "50%",
        background: "var(--success)",
        boxShadow: "0 0 8px var(--success)",
      }} title="API conectada" />
    </header>
  );
}