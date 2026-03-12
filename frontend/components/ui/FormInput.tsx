interface FormInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;       // Mensaje de error externo
  hint?: string;        // Texto de ayuda debajo del input
}

export default function FormInput({
  label, type = "text", value, onChange,
  placeholder, required, error, hint,
}: FormInputProps) {
  const hasError = !!error;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{
        fontSize: "0.85rem", fontWeight: 500,
        color: "var(--text-secondary)",
      }}>
        {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          padding: "0.75rem 1rem",
          background: "var(--bg-secondary)",
          border: `1px solid ${hasError ? "rgba(239,68,68,0.6)" : "var(--border)"}`,
          borderRadius: "0.75rem",
          color: "var(--text-primary)",
          fontSize: "0.95rem",
          outline: "none",
          transition: "border-color 0.2s",
          width: "100%",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = hasError ? "rgba(239,68,68,0.8)" : "var(--accent)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = hasError ? "rgba(239,68,68,0.6)" : "var(--border)";
        }}
      />

      {/* Mensaje de error inline */}
      {error && (
        <span style={{ fontSize: "0.78rem", color: "#FCA5A5" }}>
          ⚠️ {error}
        </span>
      )}

      {/* Texto de ayuda (solo si no hay error) */}
      {hint && !error && (
        <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
          {hint}
        </span>
      )}
    </div>
  );
}