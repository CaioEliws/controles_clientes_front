import { CalendarDays, ClipboardList, Clock3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
interface Props { total: number; atrasadas: number; vencendoSemana: number }
export function ParcelasStats({ total, atrasadas, vencendoSemana }: Props) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    {[
      { label: "Total de Parcelas", value: total, icon: ClipboardList },
      { label: "Parcelas Atrasadas", value: atrasadas, icon: Clock3 },
      { label: "Vencendo Esta Semana", value: vencendoSemana, icon: CalendarDays },
    ].map(({ label, value, icon: Icon }) => <Card key={label} className="rounded-2xl border-slate-200/80 shadow-sm">
      <CardContent className="flex h-full items-center justify-between gap-3 p-5 sm:p-6">
        <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p></div>
        <span className="shrink-0 rounded-xl bg-slate-100 p-2.5 text-slate-500"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      </CardContent>
    </Card>)}
  </div>;
}
