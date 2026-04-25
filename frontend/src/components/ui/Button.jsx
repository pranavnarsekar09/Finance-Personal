import { haptic } from "../../lib/utils";

export function Button({ children, variant = "primary", className = "", onClick, type = "button", ...props }) {
  const styles = variant === "secondary" ? "secondary-button" : "action-button";
  
  const handleClick = (e) => {
    haptic(10);
    if (onClick) onClick(e);
  };

  return (
    <button type={type} className={`${styles} ${className}`} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
