"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import FormInput from "@/components/ui/FormInput";
import {
  validateName, validateEmail,
  validatePassword, validateCreateForm
} from "@/lib/validations";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: "admin" | "seller";
  created_at: string;
}

interface CreateForm {
  name: string;
  email: string;
  password: string;
  role: "admin" | "seller";
}

interface EditForm {
  name: string;
  role: "admin" | "seller";
}

const emptyCreateForm: CreateForm = { name: "", email: "", password: "", role: "seller" };

export default function UsuariosPage() {
  const { user }   = useAuth();
  const router     = useRouter();

  const [users, setUsers]             = useState<UserData[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showCreate, setShowCreate]   = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const [createForm, setCreateForm]   = useState<CreateForm>(emptyCreateForm);
  const [editForm, setEditForm]       = useState<EditForm>({ name: "", role: "seller" });
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [nameError, setNameError]         = useState("");
  const [emailError, setEmailError]       = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [editNameError, setEditNameError] = useState("");

  // Protección de ruta
  useEffect(() => {
    if (user && user.role !== "admin") router.push("/dashboard");
  }, [user, router]);

  // ─── Cargar usuarios ─────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/auth/users");
      setUsers(data);
    } catch {
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ─── Crear usuario ───────────────────────────────────────────────
  const handleCreate = async () => {
  // Validación frontend antes de llamar al backend
  const formError = validateCreateForm(createForm);
    if (formError) { setError(formError); return; }

    setSaving(true);
    setError("");
    try {
      await api.post("/auth/users", createForm);
      setShowCreate(false);
      setCreateForm(emptyCreateForm);
      setNameError(""); setEmailError(""); setPasswordError("");
      fetchUsers();
    } catch (err: any) {
      // Muestra el mensaje limpio que viene del backend
      setError(err?.response?.data?.detail || "Error al crear usuario");
    } finally {
      setSaving(false);
    }
  };

  // ─── Abrir modal editar ──────────────────────────────────────────
  const handleOpenEdit = (u: UserData) => {
    setEditingUser(u);
    setEditForm({ name: u.name, role: u.role });
    setError("");
    setShowEdit(true);
  };

  // ─── Editar usuario ──────────────────────────────────────────────
  const handleEdit = async () => {
    const nameValidation = validateName(editForm.name);
    if (!nameValidation.valid) { setError(nameValidation.message); return; }

    setSaving(true);
    setError("");
    try {
      await api.patch(`/auth/users/${editingUser!.id}`, editForm);
      setShowEdit(false);
      setEditNameError("");
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al actualizar usuario");
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
      await api.delete(`/auth/users/${deletingId}`);
      setShowConfirm(false);
      fetchUsers();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.detail || "Error al eliminar usuario");
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-CL", {
      day: "2-digit", month: "short", year: "numeric",
    });

  if (user?.role !== "admin") return null;

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{
            margin: 0, fontFamily: "Sora, sans-serif",
            fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)",
          }}>Usuarios</h1>
          <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {users.length} usuarios registrados
          </p>
        </div>
        <button
          onClick={() => { setCreateForm(emptyCreateForm); setError(""); setShowCreate(true); }}
          style={{
            padding: "0.7rem 1.25rem", background: "var(--accent)",
            color: "white", border: "none", borderRadius: "0.75rem",
            fontFamily: "Sora, sans-serif", fontWeight: 600,
            fontSize: "0.875rem", cursor: "pointer", transition: "background 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--accent-hover)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "var(--accent)"}
        >
          + Nuevo Usuario
        </button>
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
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Usuario", "Email", "Rol", "Miembro desde", "Acciones"].map((h) => (
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
                        fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
                        color: u.role === "admin" ? "var(--accent)" : "var(--success)",
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                        {u.name}
                        {u.id === user?.id && (
                          <span style={{
                            marginLeft: "0.5rem", fontSize: "0.7rem",
                            color: "var(--text-secondary)",
                            background: "var(--bg-secondary)",
                            padding: "0.1rem 0.4rem", borderRadius: "999px",
                          }}>tú</span>
                        )}
                      </span>
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

                  {/* Acciones */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    {u.id === user?.id ? (
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                        —
                      </span>
                    ) : (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          style={{
                            padding: "0.4rem 0.85rem",
                            background: "var(--accent-soft)", color: "var(--accent)",
                            border: "1px solid rgba(99,102,241,0.3)",
                            borderRadius: "0.5rem", cursor: "pointer",
                            fontSize: "0.8rem", fontWeight: 600, transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "var(--accent-soft)"}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(u.id)}
                          style={{
                            padding: "0.4rem 0.85rem",
                            background: "rgba(239,68,68,0.1)", color: "var(--danger)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "0.5rem", cursor: "pointer",
                            fontSize: "0.8rem", fontWeight: 600, transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Crear Usuario ────────────────────────────────────── */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Usuario">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <FormInput
            label="Nombre completo" value={createForm.name} required
            error={nameError}
            onChange={(v) => {
              setCreateForm({ ...createForm, name: v });
              setNameError(validateName(v).message);
            }}
            placeholder="Ej: Juan Pérez"
          />
          <FormInput
            label="Email" type="email" value={createForm.email} required
            error={emailError}
            hint="Debe terminar en @bizdash.com"
            onChange={(v) => {
              setCreateForm({ ...createForm, email: v });
              setEmailError(validateEmail(v).message);
            }}
            placeholder="juan@bizdash.com"
          />
          <FormInput
            label="Contraseña" type="password" value={createForm.password} required
            error={passwordError}
            hint="Mínimo 6 caracteres"
            onChange={(v) => {
              setCreateForm({ ...createForm, password: v });
              setPasswordError(validatePassword(v).message);
            }}
            placeholder="••••••••"
          />

          {/* Selector de rol */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Rol <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {(["seller", "admin"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setCreateForm({ ...createForm, role })}
                  style={{
                    flex: 1, padding: "0.65rem",
                    borderRadius: "0.75rem", cursor: "pointer",
                    fontSize: "0.875rem", fontWeight: 600,
                    transition: "all 0.15s",
                    border: createForm.role === role
                      ? `1px solid ${role === "admin" ? "rgba(99,102,241,0.5)" : "rgba(16,185,129,0.5)"}`
                      : "1px solid var(--border)",
                    background: createForm.role === role
                      ? role === "admin" ? "var(--accent-soft)" : "rgba(16,185,129,0.12)"
                      : "transparent",
                    color: createForm.role === role
                      ? role === "admin" ? "var(--accent)" : "var(--success)"
                      : "var(--text-secondary)",
                  }}
                >
                  {role === "admin" ? "👑 Admin" : "🛒 Vendedor"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              padding: "0.75rem", borderRadius: "0.75rem",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5", fontSize: "0.875rem",
            }}>⚠️ {error}</div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button
              onClick={() => setShowCreate(false)}
              style={{
                flex: 1, padding: "0.75rem", background: "transparent",
                color: "var(--text-secondary)", border: "1px solid var(--border)",
                borderRadius: "0.75rem", cursor: "pointer", fontWeight: 600,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate} disabled={saving}
              style={{
                flex: 1, padding: "0.75rem",
                background: saving ? "var(--border)" : "var(--accent)",
                color: "white", border: "none", borderRadius: "0.75rem",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 600, fontFamily: "Sora, sans-serif",
              }}
            >
              {saving ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Editar Usuario ───────────────────────────────────── */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Editar Usuario">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <FormInput
            label="Nombre completo" value={editForm.name} required
            error={editNameError}
            onChange={(v) => {
              setEditForm({ ...editForm, name: v });
              setEditNameError(validateName(v).message);
            }}
            placeholder="Nombre del usuario"
          />

          {/* Selector de rol */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Rol
            </label>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {(["seller", "admin"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setEditForm({ ...editForm, role })}
                  style={{
                    flex: 1, padding: "0.65rem",
                    borderRadius: "0.75rem", cursor: "pointer",
                    fontSize: "0.875rem", fontWeight: 600,
                    transition: "all 0.15s",
                    border: editForm.role === role
                      ? `1px solid ${role === "admin" ? "rgba(99,102,241,0.5)" : "rgba(16,185,129,0.5)"}`
                      : "1px solid var(--border)",
                    background: editForm.role === role
                      ? role === "admin" ? "var(--accent-soft)" : "rgba(16,185,129,0.12)"
                      : "transparent",
                    color: editForm.role === role
                      ? role === "admin" ? "var(--accent)" : "var(--success)"
                      : "var(--text-secondary)",
                  }}
                >
                  {role === "admin" ? "👑 Admin" : "🛒 Vendedor"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              padding: "0.75rem", borderRadius: "0.75rem",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5", fontSize: "0.875rem",
            }}>⚠️ {error}</div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button
              onClick={() => setShowEdit(false)}
              style={{
                flex: 1, padding: "0.75rem", background: "transparent",
                color: "var(--text-secondary)", border: "1px solid var(--border)",
                borderRadius: "0.75rem", cursor: "pointer", fontWeight: 600,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleEdit} disabled={saving}
              style={{
                flex: 1, padding: "0.75rem",
                background: saving ? "var(--border)" : "var(--accent)",
                color: "white", border: "none", borderRadius: "0.75rem",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 600, fontFamily: "Sora, sans-serif",
              }}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Confirmar Eliminación ────────────────────────────── */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Eliminar usuario">
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {deleteError ? (
            <div style={{
              padding: "0.75rem 1rem", borderRadius: "0.75rem",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5", fontSize: "0.875rem", lineHeight: 1.6,
            }}>⚠️ {deleteError}</div>
          ) : (
            <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              ¿Estás seguro que quieres eliminar este usuario?
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
                flex: 1, padding: "0.75rem", background: "transparent",
                color: "var(--text-secondary)", border: "1px solid var(--border)",
                borderRadius: "0.75rem", cursor: "pointer", fontWeight: 600,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={deleteError ? () => setShowConfirm(false) : handleDelete}
              style={{
                flex: 1, padding: "0.75rem",
                background: deleteError ? "var(--border)" : "var(--danger)",
                color: "white", border: "none", borderRadius: "0.75rem",
                cursor: "pointer", fontWeight: 600, fontFamily: "Sora, sans-serif",
              }}
            >
              {deleteError ? "Cerrar" : "Sí, eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}