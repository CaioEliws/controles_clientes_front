import { Card } from "@/components/ui/card";

export type CardVariant = "success" | "danger" | "neutral";

interface CardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant: CardVariant;
  className?: string;
}

export function StatSmallCard({
  label,
  value,
  icon,
  variant,
  className,
}: CardProps) {
  const colors = {
    success: "bg-emerald-50 text-emerald-700",
    danger: "bg-rose-50 text-rose-700",
    neutral: "bg-slate-50 text-slate-700",
  };

  return (
    <Card
      className={`p-4 flex items-center gap-4 border shadow-none ${colors[variant]} ${className}`}
    >
      <div className="p-2 bg-white/60 rounded-lg">{icon}</div>
      <div>
        <p className="text-xs font-semibold opacity-70 uppercase">
          {label}
        </p>
        <h3 className="text-lg font-bold">{value}</h3>
      </div>
    </Card>
  );
}