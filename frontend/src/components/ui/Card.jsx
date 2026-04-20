import { memo } from "react";

export const Card = memo(function Card({ children, className = "" }) {
  return <div className={`glass rounded-[28px] p-5 ${className}`}>{children}</div>;
});
