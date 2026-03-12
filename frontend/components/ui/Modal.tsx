"use client";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Fondo oscuro
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Card del modal — stopPropagation evita cerrar al clickear adentro */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
          padding: "1.75rem",
          width: "100%", maxWidth: "460px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "1.5rem",
        }}>
          <h3 style={{
            margin: 0, fontFamily: "Sora, sans-serif",
            fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)",
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none",
              color: "var(--text-secondary)", cursor: "pointer",
              fontSize: "1.25rem", lineHeight: 1,
              padding: "0.25rem", borderRadius: "0.5rem",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}