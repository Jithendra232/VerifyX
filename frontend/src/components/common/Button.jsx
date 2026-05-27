function Button({ children, type = "button", ...props }) {
  return (
    <button type={type} className="rounded border border-gray-300 px-3 py-1 text-sm" {...props}>
      {children}
    </button>
  );
}

export default Button;
