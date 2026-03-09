import { Badge } from "@/components/ui/badge";

export function EmprestimoStatusBadge({ status }: { status: string }) {
  const s = String(status);

  const variant =
    s === "QUITADO"
      ? "default"
      : s === "REFINANCIADO"
      ? "secondary"
      : "outline";

  const label =
    s === "EM_ABERTO"
      ? "ABERTO"
      : s === "REFINANCIADO"
      ? "REFIN."
      : s;

  return (
    <Badge
      variant={variant}
      className="h-5 px-2 text-[11px] font-medium whitespace-nowrap"
    >
      {label}
    </Badge>
  );
}