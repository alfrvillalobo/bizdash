"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/ui/Modal";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface Sale {
  id: number;
  quantity: number;
  total: number;
  created_at: string;
  product: { id: number; name: string; price: number };
  user: { id: number; name: string; email: string };
}

export default function VentasPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [sales, setSales]         = useState<Sale[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // Formulario
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity]               = useState("1");
  const [preview, setPreview]                 = useState<number | null>(null);

  // ─── Cargar ventas ───────────────────────────────────────────────
  const fetchSales = async () => {
    try {
      const endpoint = isAdmin ? "/sales/" : "/sales/my-sales";
      const { data } = await api.get(endpoint);
      setSales(data);
    } catch {
      setError("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  };

  // ─── Cargar productos disponibles ────────────────────────────────
  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products/");
      // Solo productos con stock disponible
      setProducts(data.filter((p: Product) => p.stock > 0));
    } catch {}
  };

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  // ─── Calcular preview del total en tiempo real ───────────────────
  useEffect(() => {
    const product = products.find((p) => p.id === parseInt(selectedProduct));
    if (product && quantity) {
      setPreview(product.price * parseInt(quantity));
    } else {
      setPreview(null);
    }
  }, [selectedProduct, quantity, products]);

  // ─── Abrir modal ─────────────────────────────────────────────────
  const handleOpenModal = () => {
    setSelectedProduct("");
    setQuantity("1");
    setPreview(null);
    setError("");
    setShowModal(true);
  };

  // ─── Registrar venta ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedProduct || !quantity || parseInt(quantity) < 1) {
      setError("Selecciona un producto e ingresa una cantidad válida");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/sales/", {
        product_id: parseInt(selectedProduct),
        quantity: parseInt(quantity),
      });
      setShowModal(false);
      fetchSales();
      fetchProducts(); // Actualiza stock
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al registrar la venta");
    } finally {
      setSaving(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-CL", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  const selectedProductData = products.find(
    (p) => p.id === parseInt(selectedProduct)
  );

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{
            margin: 0, fontFamily: "Sora, sans-serif",
            fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)",
          }}>Ventas</h1>
          <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {sales.length} ventas registradas
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          style={{
            padding: "0.7rem 1.25rem",
            background: "var(--accent)", color: "white",
            border: "none", borderRadius: "0.75rem",
            fontFamily: "Sora, sans-serif", fontWeight: 600,
            fontSize: "0.875rem", cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--accent-hover)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "var(--accent)"}
        >
          + Nueva Venta
        </button>
      </div>

      {/* Card resumen (solo admin) */}
      {isAdmin && sales.length > 0 && (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "1rem", padding: "1.25rem 1.5rem",
          display: "flex", alignItems: "center", gap: "1rem",
        }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.25)",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1.3rem", flexShrink: 0,
          }}>💰</div>
          <div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Ingresos en esta vista
            </p>
            <p style={{
              margin: "0.1rem 0 0", fontSize: "1.4rem", fontWeight: 700,
              color: "var(--text-primary)", fontFamily: "Sora, sans-serif",
            }}>
              ${totalRevenue.toLocaleString("es-CL")}
            </p>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "1rem", overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Cargando ventas...
          </div>
        ) : sales.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "2rem", margin: 0 }}>💰</p>
            <p>No hay ventas registradas</p>
            <button
              onClick={handleOpenModal}
              style={{
                padding: "0.6rem 1.2rem", background: "var(--accent)",
                color: "white", border: "none", borderRadius: "0.75rem",
                cursor: "pointer", fontWeight: 600,
              }}
            >
              Registrar primera venta
            </button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  "#", "Producto", "Cantidad", "Total",
                  ...(isAdmin ? ["Vendedor"] : []),
                  "Fecha"
                ].map((h) => (
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
              {sales.map((sale, i) => (
                <tr
                  key={sale.id}
                  style={{
                    borderBottom: i < sales.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {/* ID */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      fontSize: "0.8rem", color: "var(--text-secondary)",
                      fontFamily: "monospace",
                    }}>
                      #{sale.id}
                    </span>
                  </td>

                  {/* Producto */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                      {sale.product.name}
                    </span>
                  </td>

                  {/* Cantidad */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      padding: "0.2rem 0.6rem", borderRadius: "999px",
                      background: "var(--accent-soft)", color: "var(--accent)",
                      fontSize: "0.8rem", fontWeight: 600,
                    }}>
                      x{sale.quantity}
                    </span>
                  </td>

                  {/* Total */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ fontWeight: 700, color: "var(--success)" }}>
                      ${sale.total.toLocaleString("es-CL")}
                    </span>
                  </td>

                  {/* Vendedor (solo admin) */}
                  {isAdmin && (
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {sale.user.name}
                      </span>
                    </td>
                  )}

                  {/* Fecha */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {formatDate(sale.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Nueva Venta ──────────────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Registrar Nueva Venta"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Selector de producto */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{
              fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)",
            }}>
              Producto <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{
                padding: "0.75rem 1rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                color: selectedProduct ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: "0.95rem", outline: "none",
                cursor: "pointer", transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            >
              <option value="">Selecciona un producto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ${p.price.toLocaleString("es-CL")} (stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{
              fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)",
            }}>
              Cantidad <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              type="number"
              min="1"
              max={selectedProductData?.stock || 999}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{
                padding: "0.75rem 1rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                color: "var(--text-primary)",
                fontSize: "0.95rem", outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
            {selectedProductData && (
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Stock disponible: {selectedProductData.stock} unidades
              </span>
            )}
          </div>

          {/* Preview del total */}
          {preview !== null && (
            <div style={{
              padding: "1rem", borderRadius: "0.75rem",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                Total a cobrar
              </span>
              <span style={{
                fontSize: "1.25rem", fontWeight: 700,
                color: "var(--success)", fontFamily: "Sora, sans-serif",
              }}>
                ${preview.toLocaleString("es-CL")}
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              padding: "0.75rem", borderRadius: "0.75rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5", fontSize: "0.875rem",
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                flex: 1, padding: "0.75rem",
                background: "transparent", color: "var(--text-secondary)",
                border: "1px solid var(--border)", borderRadius: "0.75rem",
                cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--text-secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1, padding: "0.75rem",
                background: saving ? "var(--border)" : "var(--accent)",
                color: "white", border: "none", borderRadius: "0.75rem",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 600, fontSize: "0.9rem",
                fontFamily: "Sora, sans-serif", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--accent-hover)" }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--accent)" }}
            >
              {saving ? "Registrando..." : "Registrar venta"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}