import { TableCell, TableRow } from "@/components/ui/table";
import type { EmprestimoDetalhado } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { EmprestimoStatusCell } from "./EmprestimoStatusCell";

type Props = {
  emprestimo: EmprestimoDetalhado;
  canAct: boolean;
  actionsDisabled?: boolean;
  onOpenParcelas: (payload: { emprestimoId: number; cliente: string }) => void;
  onRefinance: (e: EmprestimoDetalhado) => void;
  onQuit: (e: EmprestimoDetalhado) => void;
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

export function EmprestimosTableRow({
  emprestimo,
  canAct,
  actionsDisabled,
  onOpenParcelas,
  onRefinance,
  onQuit,
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
      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/70 focus-within:bg-slate-50/70"
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
      <TableCell className="whitespace-nowrap px-3 py-3 text-xs text-slate-500 sm:px-4 sm:text-sm">
        {formatDate(emprestimo.dataEmprestimo)}
      </TableCell>

      <TableCell className="max-w-[140px] truncate px-3 py-3 text-xs font-medium text-slate-600 sm:px-4 sm:text-sm">
        {emprestimo.formaPagamento}
      </TableCell>

      <TableCell className="whitespace-nowrap px-3 py-3 text-xs text-slate-600 sm:px-4 sm:text-sm">
        {formatFrequencia(emprestimo.frequenciaPagamento)}
      </TableCell>

      <TableCell className="whitespace-nowrap px-3 py-3 text-xs text-slate-600 sm:px-4 sm:text-sm">
        {formatContrato(emprestimo.tipoContrato)}
      </TableCell>

      <TableCell className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-700 sm:px-4 sm:text-sm">
        {formatCurrency(emprestimo.valorEmprestado)}
      </TableCell>

      <TableCell className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-blue-700 sm:px-4 sm:text-sm">
        {formatCurrency(emprestimo.valorAReceber)}
      </TableCell>

      <TableCell className="whitespace-nowrap px-3 py-3 text-xs font-medium text-slate-700 sm:px-4 sm:text-sm">
        {formatCurrency(emprestimo.valorParcela)}
      </TableCell>

      <TableCell className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-emerald-700 sm:px-4 sm:text-sm">
        {formatCurrency(emprestimo.valorRecebido)}
      </TableCell>

      <TableCell className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-800 sm:px-4 sm:text-sm">
        {formatCurrency(emprestimo.valorTotalEmprestimo)}
      </TableCell>

      <TableCell className="whitespace-nowrap px-3 py-3 text-xs text-slate-500 sm:px-4 sm:text-sm">
        {formatDate(emprestimo.inicioPagamento)}
      </TableCell>

      <TableCell className="whitespace-nowrap px-3 py-3 text-xs text-slate-500 sm:px-4 sm:text-sm">
        {formatDate(emprestimo.finalPagamento)}
      </TableCell>

      <TableCell className="whitespace-nowrap px-3 py-3 align-middle sm:px-4">
        <EmprestimoStatusCell
          emprestimo={emprestimo}
          canAct={canAct}
          disabled={actionsDisabled}
          onRefinance={onRefinance}
          onQuit={onQuit}
        />
      </TableCell>
    </TableRow>
  );
}