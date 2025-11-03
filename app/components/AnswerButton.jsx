"use client";
export default function AnswerButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="promis-btn"
      style={{
        padding: "16px 22px",
        borderRadius: 14,
        border: "1px solid #cfe4f1",
        background: "linear-gradient(180deg,#0e5c85,#0a3e5a)",
        color: "white",
        fontWeight: 700,
        fontSize: 18,
        boxShadow: "0 4px 12px rgba(8,59,102,.16)",
        cursor: "pointer",
        minWidth: 180,
      }}
    >
      {children}
    </button>
  );
}
