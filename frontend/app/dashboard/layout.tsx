"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Protección client-side: si no hay usuario redirige al login
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ color: "var(--text-secondary)", fontFamily: "Sora, sans-serif" }}>
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Navbar />
        <main style={{ flex: 1, padding: "1.5rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
}