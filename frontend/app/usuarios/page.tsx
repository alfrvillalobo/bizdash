"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "seller";
  created_at: string;
}

export default function UsuariosPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Protección: si no es admin, redirige
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    api.get("/auth/users")
      .then((r) => setUsers(r.data))
      .catch(() => setError("Error al cargar usuarios"))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-CL", {
      day: "2-digit", month: "short", year: "numeric",
    });

  if (user?.role !== "admin") return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div>
        <h1 style={{
          margin: 0, fontFamily: "Sora, sans-serif",
          fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)",
        }}>
          Usuarios
        </h1>
        <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {users.length} usuarios registrados
        </p>
      </div>

      {/* Tabla */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "1rem", overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Cargando usuarios...
          </div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--danger)" }}>
            {error}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Usuario", "Email", "Rol", "Miembro desde"].map((h) => (
                  <th key={h} style={{
                    padding: "1rem 1.25rem", textAlign: "left",
                    fontSize: "0.8rem", fontWeight: 600,
                    color: "var(--text-secondary)", textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {/* Avatar + Nombre */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: u.role === "admin" ? "var(--accent-soft)" : "rgba(16,185,129,0.12)",
                        border: `1px solid ${u.role === "admin" ? "rgba(99,102,241,0.3)" : "rgba(16,185,129,0.25)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.85rem", fontWeight: 700,
                        color: u.role === "admin" ? "var(--accent)" : "var(--success)",
                        flexShrink: 0,
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 500, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                          {u.name}
                          {u.id === user?.id && (
                            <span style={{
                              marginLeft: "0.5rem", fontSize: "0.7rem",
                              color: "var(--text-secondary)",
                              background: "var(--bg-secondary)",
                              padding: "0.1rem 0.4rem", borderRadius: "999px",
                            }}>tú</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      {u.email}
                    </span>
                  </td>

                  {/* Rol */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      padding: "0.25rem 0.75rem", borderRadius: "999px",
                      fontSize: "0.75rem", fontWeight: 600,
                      background: u.role === "admin" ? "var(--accent-soft)" : "rgba(16,185,129,0.12)",
                      color: u.role === "admin" ? "var(--accent)" : "var(--success)",
                      border: `1px solid ${u.role === "admin" ? "rgba(99,102,241,0.3)" : "rgba(16,185,129,0.25)"}`,
                    }}>
                      {u.role === "admin" ? "👑 Admin" : "🛒 Vendedor"}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {formatDate(u.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}