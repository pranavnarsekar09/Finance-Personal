import { memo } from "react";
import { AppCard } from "../../ui/fintech";

export const Card = memo(function Card(props) {
  return <AppCard {...props} />;
});
