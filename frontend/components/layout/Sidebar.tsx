"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/dashboard",           icon: "📊", label: "Dashboard",  adminOnly: false },
  { href: "/dashboard/ventas",    icon: "💰", label: "Ventas",     adminOnly: false },
  { href: "/dashboard/productos", icon: "📦", label: "Productos",  adminOnly: false },
  { href: "/dashboard/usuarios",  icon: "👥", label: "Usuarios",   adminOnly: true  },
];
export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside style={{
      width: "240px", minHeight: "100vh", flexShrink: 0,
      background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      padding: "1.5rem 1rem",
      position: "sticky", top: 0, height: "100vh",
    }}>
      {/* Logo */}
      <div style={{ padding: "0.5rem 0.75rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "var(--accent-soft)", border: "1px solid rgba(99,102,241,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem",
          }}>📊</div>
          <span style={{
            fontFamily: "Sora, sans-serif", fontWeight: 700,
            fontSize: "1.1rem", color: "var(--text-primary)",
          }}>BizDash</span>
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {navItems
          .filter((item) => !item.adminOnly || user?.role === "admin")
          .map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.7rem 0.75rem", borderRadius: "0.75rem", border: "none",
                cursor: "pointer", textAlign: "left", width: "100%",
                background: isActive ? "var(--accent-soft)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.9rem", transition: "all 0.15s",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive)(e.currentTarget.style.background = "rgba(255,255,255,0.04)")
              }}
              onMouseLeave={(e) => {
                if (!isActive)(e.currentTarget.style.background = "transparent")
              }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Usuario + Logout */}
      <div style={{
        borderTop: "1px solid var(--border)", paddingTop: "1rem",
        display: "flex", flexDirection: "column", gap: "0.5rem",
      }}>
        <div style={{
          padding: "0.75rem", borderRadius: "0.75rem",
          background: "var(--bg-card)",
        }}>
          <p style={{
            margin: 0, fontSize: "0.85rem", fontWeight: 600,
            color: "var(--text-primary)", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>{user?.name}</p>
          <span style={{
            fontSize: "0.75rem", color: "var(--accent)",
            background: "var(--accent-soft)", padding: "0.1rem 0.5rem",
            borderRadius: "999px", fontWeight: 600,
          }}>
            {user?.role === "admin" ? "Admin" : "Vendedor"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.65rem", borderRadius: "0.75rem", border: "none",
            background: "transparent", color: "var(--text-secondary)",
            cursor: "pointer", fontSize: "0.875rem", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.color = "#FCA5A5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  );
}