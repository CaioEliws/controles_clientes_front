import { StatCard } from "@/components/StatCard";

interface Props {
  total: number;
  atrasadas: number;
  vencendoSemana: number;
}

export function ParcelasStats({
  total,
  atrasadas,
  vencendoSemana,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatCard label="Total de Parcelas" value={total} />
      <StatCard label="Parcelas Atrasadas" value={atrasadas} />
      <StatCard label="Vencendo Esta Semana" value={vencendoSemana} />
    </div>
  );
}