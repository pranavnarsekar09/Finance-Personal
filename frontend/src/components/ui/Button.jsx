export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = variant === "secondary" ? "secondary-button" : "action-button";
  return (
    <button className={`${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
