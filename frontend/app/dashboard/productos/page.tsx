"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/ui/Modal";
import FormInput from "@/components/ui/FormInput";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  created_at: string;
}

interface ProductForm {
  name: string;
  price: string;
  stock: string;
}

const emptyForm: ProductForm = { name: "", price: "", stock: "" };

export default function ProductosPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const [form, setForm]               = useState<ProductForm>(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [error, setError]             = useState("");

  // ─── Cargar productos ───────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products/");
      setProducts(data);
    } catch {
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // ─── Abrir modal para crear ──────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  // ─── Abrir modal para editar ─────────────────────────────────────
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name:  product.name,
      price: String(product.price),
      stock: String(product.stock),
    });
    setError("");
    setShowModal(true);
  };

  // ─── Guardar (crear o editar) ────────────────────────────────────
  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      setError("Todos los campos son requeridos");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name:  form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post("/products/", payload);
      }

      setShowModal(false);
      fetchProducts(); // Recargar lista
    } catch {
      setError("Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  // ─── Confirmar eliminación ───────────────────────────────────────
 const handleDeleteConfirm = (id: number) => {
  setDeletingId(id);
  setDeleteError("");
  setShowConfirm(true);
};
  const handleDelete = async () => {
  if (!deletingId) return;
  try {
    await api.delete(`/products/${deletingId}`);
    setShowConfirm(false);
    setDeleteError("");
    fetchProducts();
  } catch (err: any) {
    const message = err?.response?.data?.detail || "Error al eliminar el producto";
    setDeleteError(message);  // ← Muestra dentro del modal, no lo cierra
  }
};

  // ─── Helpers de estilo ───────────────────────────────────────────
  const getStockColor = (stock: number) => {
    if (stock === 0)  return "var(--danger)";
    if (stock < 5)    return "var(--warning)";
    return "var(--success)";
  };

  const getStockLabel = (stock: number) => {
    if (stock === 0) return "Sin stock";
    if (stock < 5)   return "Stock bajo";
    return "En stock";
  };

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{
            margin: 0, fontFamily: "Sora, sans-serif",
            fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)",
          }}>Productos</h1>
          <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {products.length} productos registrados
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
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
            + Nuevo Producto
          </button>
        )}
      </div>

      {/* Tabla */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "1rem", overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "2rem", margin: 0 }}>📦</p>
            <p>No hay productos aún</p>
            {isAdmin && (
              <button onClick={handleOpenCreate} style={{
                padding: "0.6rem 1.2rem", background: "var(--accent)",
                color: "white", border: "none", borderRadius: "0.75rem",
                cursor: "pointer", fontWeight: 600,
              }}>
                Crear primer producto
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Producto", "Precio", "Stock", "Estado", ...(isAdmin ? ["Acciones"] : [])].map((h) => (
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
              {products.map((product, i) => (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: i < products.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {/* Nombre */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      fontWeight: 500, color: "var(--text-primary)", fontSize: "0.95rem"
                    }}>
                      {product.name}
                    </span>
                  </td>

                  {/* Precio */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      ${product.price.toLocaleString("es-CL")}
                    </span>
                  </td>

                  {/* Stock */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      color: getStockColor(product.stock),
                      fontWeight: 600, fontSize: "0.95rem",
                    }}>
                      {product.stock}
                    </span>
                  </td>

                  {/* Badge estado */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      padding: "0.25rem 0.75rem", borderRadius: "999px",
                      fontSize: "0.75rem", fontWeight: 600,
                      background: `${getStockColor(product.stock)}18`,
                      color: getStockColor(product.stock),
                      border: `1px solid ${getStockColor(product.stock)}30`,
                    }}>
                      {getStockLabel(product.stock)}
                    </span>
                  </td>

                  {/* Acciones (solo admin) */}
                  {isAdmin && (
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleOpenEdit(product)}
                          style={{
                            padding: "0.4rem 0.85rem",
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            border: "1px solid rgba(99,102,241,0.3)",
                            borderRadius: "0.5rem", cursor: "pointer",
                            fontSize: "0.8rem", fontWeight: 600,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "var(--accent-soft)"}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(product.id)}
                          style={{
                            padding: "0.4rem 0.85rem",
                            background: "rgba(239,68,68,0.1)",
                            color: "var(--danger)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "0.5rem", cursor: "pointer",
                            fontSize: "0.8rem", fontWeight: 600,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Crear / Editar ───────────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <FormInput
            label="Nombre del producto"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="Ej: Notebook Lenovo"
            required
          />
          <FormInput
            label="Precio (CLP)"
            type="number"
            value={form.price}
            onChange={(v) => setForm({ ...form, price: v })}
            placeholder="Ej: 599990"
            required
          />
          <FormInput
            label="Stock inicial"
            type="number"
            value={form.stock}
            onChange={(v) => setForm({ ...form, stock: v })}
            placeholder="Ej: 10"
            required
          />

          {error && (
            <div style={{
              padding: "0.75rem", borderRadius: "0.75rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5", fontSize: "0.875rem",
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                flex: 1, padding: "0.75rem",
                background: "transparent", color: "var(--text-secondary)",
                border: "1px solid var(--border)", borderRadius: "0.75rem",
                cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
                transition: "all 0.15s",
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
              {saving ? "Guardando..." : editingProduct ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Confirmar Eliminación ────────────────────────────── */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Eliminar producto"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {deleteError ? (
              // Si hay error mostramos el mensaje en lugar de la pregunta
              <div style={{
                padding: "0.75rem 1rem", borderRadius: "0.75rem",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#FCA5A5", fontSize: "0.875rem", lineHeight: 1.6,
              }}>
                ⚠️ {deleteError}
              </div>
            ) : (
              <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                ¿Estás seguro que quieres eliminar este producto?
                <br />
                <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                  Esta acción no se puede deshacer.
                </span>
              </p>
            )}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                flex: 1, padding: "0.75rem",
                background: "transparent", color: "var(--text-secondary)",
                border: "1px solid var(--border)", borderRadius: "0.75rem",
                cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={deleteError ? () => setShowConfirm(false) : handleDelete}
              style={{
                flex: 1, padding: "0.75rem",
                background: deleteError ? "var(--border)" : "var(--danger)", color: "white",
                border: "none", borderRadius: "0.75rem",
                cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
                fontFamily: "Sora, sans-serif", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#DC2626"}
              onMouseLeave={(e) => e.currentTarget.style.background = "var(--danger)"}
            >
              {deleteError ? "Cerrar" : "Sí, eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}