"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    console.log("🔄 Intentando login con:", email);
    console.log("🌐 API URL:", process.env.NEXT_PUBLIC_API_URL);
    await login(email, password);
    console.log("✅ Login exitoso, redirigiendo...");
    router.push("/dashboard");
  } catch (err: any) {
    console.error("❌ Error completo:", err);
    console.error("❌ Response data:", err?.response?.data);
    console.error("❌ Status:", err?.response?.status);
    setError("Email o contraseña incorrectos");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none"
      }}>
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }} />
      </div>

      {/* Card de Login */}
      <div style={{
        width: "100%", maxWidth: "420px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "1.5rem",
        padding: "2.5rem",
        position: "relative",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "56px", height: "56px", borderRadius: "16px",
            background: "var(--accent-soft)", marginBottom: "1rem",
            border: "1px solid rgba(99,102,241,0.3)",
          }}>
            <span style={{ fontSize: "1.5rem" }}>📊</span>
          </div>
          <h1 style={{
            fontFamily: "Sora, sans-serif", fontSize: "1.75rem",
            fontWeight: 700, color: "var(--text-primary)", margin: 0,
          }}>BizDash</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            Panel de control de ventas
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{
              display: "block", fontSize: "0.85rem", fontWeight: 500,
              color: "var(--text-secondary)", marginBottom: "0.5rem"
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              style={{
                width: "100%", padding: "0.75rem 1rem",
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                borderRadius: "0.75rem", color: "var(--text-primary)",
                fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          <div>
            <label style={{
              display: "block", fontSize: "0.85rem", fontWeight: 500,
              color: "var(--text-secondary)", marginBottom: "0.5rem"
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "0.75rem 1rem",
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                borderRadius: "0.75rem", color: "var(--text-primary)",
                fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          {error && (
            <div style={{
              padding: "0.75rem 1rem", borderRadius: "0.75rem",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5", fontSize: "0.875rem",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "0.875rem",
              background: loading ? "var(--border)" : "var(--accent)",
              color: "white", border: "none", borderRadius: "0.75rem",
              fontSize: "0.95rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s", marginTop: "0.5rem",
              fontFamily: "Sora, sans-serif",
            }}
            onMouseEnter={(e) => !loading && ((e.target as HTMLElement).style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => !loading && ((e.target as HTMLElement).style.background = "var(--accent)")}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}