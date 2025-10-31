"use client";
export default function AnswerButton({ children, onClick }) {
  return (
    <button className="choice" onClick={onClick} type="button">
      {children}
    </button>
  );
}