import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { EmprestimoDetalhado } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { EmprestimoStatusCell } from "./EmprestimoStatusCell";
import { SquarePen, Trash2 } from "lucide-react";

type Props = {
  emprestimo: EmprestimoDetalhado;
  canAct: boolean;
  actionsDisabled?: boolean;
  onOpenParcelas: (payload: { emprestimoId: number; cliente: string }) => void;
  onRefinance: (e: EmprestimoDetalhado) => void;
  onQuit: (e: EmprestimoDetalhado) => void;
  onDelete: (e: EmprestimoDetalhado) => void;
  onEdit: (e: EmprestimoDetalhado) => void;
};

function formatFrequencia(value: string) {
  switch (value) {
    case "DIARIO":
      return "Diário";
    case "SEMANAL":
      return "Semanal";
    case "QUINZENAL":
      return "Quinzenal";
    case "MENSAL":
      return "Mensal";
    default:
      return value;
  }
}

function formatContrato(value: string) {
  switch (value) {
    case "FISICO":
      return "Físico";
    case "DIGITAL":
      return "Digital";
    default:
      return value;
  }
}

const baseCellClass =
  "whitespace-nowrap overflow-hidden text-ellipsis px-3 py-3 text-xs sm:px-4 sm:text-sm";

export function EmprestimosTableRow({
  emprestimo,
  canAct,
  actionsDisabled,
  onOpenParcelas,
  onRefinance,
  onQuit,
  onDelete,
  onEdit,
}: Props) {
  const openParcelas = () => {
    onOpenParcelas({
      emprestimoId: emprestimo.id,
      cliente: emprestimo.nomeCliente,
    });
  };

  return (
    <TableRow
      key={emprestimo.id}
      role="button"
      tabIndex={0}
      className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 focus-within:bg-slate-50/70"
      onClick={(ev) => {
        const target = ev.target as HTMLElement;
        if (target.closest("[data-stop-row-click='true']")) return;
        openParcelas();
      }}
      onKeyDown={(ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          openParcelas();
        }
      }}
    >
      <TableCell className={`${baseCellClass} w-[120px] text-slate-500`}>
        {formatDate(emprestimo.dataEmprestimo)}
      </TableCell>

      <TableCell
        className={`${baseCellClass} w-[140px] font-medium text-slate-600`}
        title={emprestimo.formaPagamento}
      >
        {emprestimo.formaPagamento}
      </TableCell>

      <TableCell className={`${baseCellClass} w-[120px] text-slate-600`}>
        {formatFrequencia(emprestimo.frequenciaPagamento)}
      </TableCell>

      <TableCell className={`${baseCellClass} w-[120px] text-slate-600`}>
        {formatContrato(emprestimo.tipoContrato)}
      </TableCell>

      <TableCell className={`${baseCellClass} w-[130px] font-semibold text-slate-700`}>
        {formatCurrency(emprestimo.valorEmprestado)}
      </TableCell>

      <TableCell className={`${baseCellClass} w-[130px] font-semibold text-blue-700`}>
        {formatCurrency(emprestimo.valorAReceber)}
      </TableCell>

      <TableCell className={`${baseCellClass} w-[120px] font-medium text-slate-700`}>
        {formatCurrency(emprestimo.valorParcela)}
      </TableCell>

      <TableCell className={`${baseCellClass} w-[120px] font-semibold text-emerald-700`}>
        {formatCurrency(emprestimo.valorRecebido)}
      </TableCell>

      <TableCell className={`${baseCellClass} w-[130px] font-semibold text-slate-800`}>
        {formatCurrency(emprestimo.valorTotalEmprestimo)}
      </TableCell>

      <TableCell className={`${baseCellClass} w-[120px] text-slate-500`}>
        {formatDate(emprestimo.inicioPagamento)}
      </TableCell>

      <TableCell className={`${baseCellClass} w-[120px] text-slate-500`}>
        {formatDate(emprestimo.finalPagamento)}
      </TableCell>

      <TableCell className="w-[210px] whitespace-nowrap px-3 py-3 align-middle sm:px-4">
        <div
          className="flex items-center justify-end gap-2"
          data-stop-row-click="true"
        >
          <EmprestimoStatusCell
            emprestimo={emprestimo}
            canAct={canAct}
            disabled={actionsDisabled}
            onRefinance={onRefinance}
            onQuit={onQuit}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={actionsDisabled}
            className="h-8 w-8 shrink-0 border-slate-200 p-0 text-slate-600 hover:bg-slate-50 hover:text-slate-700"
            onClick={() => onEdit(emprestimo)}
          >
            <SquarePen className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={actionsDisabled}
            className="h-8 w-8 shrink-0 border-red-200 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDelete(emprestimo)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}