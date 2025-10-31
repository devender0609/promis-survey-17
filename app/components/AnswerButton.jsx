export default function AnswerButton({ children, onClick }) {
  return (
    <button className="btn" onClick={onClick} type="button">
      {children}
    </button>
  );
}
