import { Badge } from "@/components/ui/badge";

export function EmprestimoStatusBadge({ status }: { status: string }) {
  const s = String(status);

  const variant = s === "QUITADO" ? "default" : "outline";
  const label = s === "EM_ABERTO" ? "EM ABERTO" : s;

  return <Badge variant={variant}>{label}</Badge>;
}