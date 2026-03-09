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
  return (
    <TableRow
      key={emprestimo.id}
      role="button"
      tabIndex={0}
      className="cursor-pointer transition-colors hover:bg-slate-50/50"
      onClick={(ev) => {
        const target = ev.target as HTMLElement;
        if (target.closest("[data-stop-row-click='true']")) return;

        onOpenParcelas({
          emprestimoId: emprestimo.id,
          cliente: emprestimo.nomeCliente,
        });
      }}
      onKeyDown={(ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          onOpenParcelas({
            emprestimoId: emprestimo.id,
            cliente: emprestimo.nomeCliente,
          });
        }
      }}
    >
      <TableCell className="max-w-[180px] truncate font-semibold text-slate-700">
        {emprestimo.nomeCliente}
      </TableCell>

      <TableCell className="whitespace-nowrap text-slate-500">
        {formatDate(emprestimo.dataEmprestimo)}
      </TableCell>

      <TableCell className="max-w-[120px] truncate font-medium text-slate-600">
        {emprestimo.formaPagamento}
      </TableCell>

      <TableCell className="whitespace-nowrap text-slate-600">
        {formatFrequencia(emprestimo.frequenciaPagamento)}
      </TableCell>

      <TableCell className="whitespace-nowrap text-slate-600">
        {formatContrato(emprestimo.tipoContrato)}
      </TableCell>

      <TableCell className="whitespace-nowrap font-semibold">
        {formatCurrency(emprestimo.valorEmprestado)}
      </TableCell>

      <TableCell className="whitespace-nowrap font-bold text-emerald-600">
        {formatCurrency(emprestimo.valorAReceber)}
      </TableCell>

      <TableCell className="whitespace-nowrap font-medium">
        {formatCurrency(emprestimo.valorParcela)}
      </TableCell>

      <TableCell className="whitespace-nowrap font-bold text-emerald-700">
        {formatCurrency(emprestimo.valorRecebido)}
      </TableCell>

      <TableCell className="whitespace-nowrap font-semibold">
        {formatCurrency(emprestimo.valorTotalEmprestimo)}
      </TableCell>

      <TableCell className="whitespace-nowrap text-slate-500">
        {formatDate(emprestimo.inicioPagamento)}
      </TableCell>

      <TableCell className="whitespace-nowrap text-slate-500">
        {formatDate(emprestimo.finalPagamento)}
      </TableCell>

      <TableCell className="whitespace-nowrap">
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