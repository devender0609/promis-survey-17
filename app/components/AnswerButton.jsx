// app/components/AnswerButton.jsx
"use client";
export default function AnswerButton({ children, onClick }) {
  return (
    <button type="button" className="btn" onClick={onClick}>
      {children}
    </button>
  );
}
