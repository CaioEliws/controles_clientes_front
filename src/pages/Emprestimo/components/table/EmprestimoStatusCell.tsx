import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, Pencil } from "lucide-react";
import type { EmprestimoDetalhado } from "@/types";
import { EmprestimoStatusBadge } from "@/pages/Emprestimo/components/EmprestimoStatusBadge";

type Props = {
  emprestimo: EmprestimoDetalhado;
  canAct: boolean;
  disabled?: boolean;
  onRefinance: (e: EmprestimoDetalhado) => void;
  onQuit: (e: EmprestimoDetalhado) => void;
};

export function EmprestimoStatusCell({
  emprestimo,
  canAct,
  disabled,
  onRefinance,
  onQuit,
}: Props) {
  const status = String(emprestimo.status);
  const isEmAberto = status === "EM_ABERTO";

  // ✅ badge SEMPRE com limite, pra não estourar layout
  const badge = (
    <span className="inline-flex max-w-[120px] sm:max-w-[160px] truncate">
      <EmprestimoStatusBadge status={status} />
    </span>
  );

  if (!isEmAberto) {
    return <span className="inline-flex p-1">{badge}</span>;
  }

  return (
    <div
      data-stop-row-click="true"
      className="inline-flex items-center"
      onClick={(ev) => ev.stopPropagation()}
      onKeyDown={(ev) => ev.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-2 py-0 rounded-md hover:bg-slate-100 max-w-[180px]"
            disabled={!canAct || disabled}
          >
            {badge}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[280px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Ações do status
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-1 bg-slate-200" />

          <DropdownMenuItem
            onClick={() => onRefinance(emprestimo)}
            className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer focus:bg-slate-100"
          >
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
              <Pencil className="h-4 w-4 text-slate-700" />
            </span>

            <span className="flex flex-col leading-tight">
              <span className="font-medium text-slate-900">
                Marcar como <span className="font-semibold">REFINANCIADO</span>
              </span>
              <span className="text-xs text-slate-500">
                Quita parcelas em aberto e troca o status.
              </span>
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onQuit(emprestimo)}
            className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer focus:bg-slate-100"
          >
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
              <CheckCircle2 className="h-4 w-4 text-slate-700" />
            </span>

            <span className="flex flex-col leading-tight">
              <span className="font-medium text-slate-900">
                Marcar como <span className="font-semibold">QUITADO</span>
              </span>
              <span className="text-xs text-slate-500">
                Marca todas as parcelas restantes como pagas.
              </span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}