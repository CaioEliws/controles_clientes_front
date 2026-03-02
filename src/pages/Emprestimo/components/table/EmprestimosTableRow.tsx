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
      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
      onClick={(ev) => {
        const target = ev.target as HTMLElement;
        if (target.closest("[data-stop-row-click='true']")) return;
        onOpenParcelas({ emprestimoId: emprestimo.id, cliente: emprestimo.nomeCliente });
      }}
      onKeyDown={(ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          onOpenParcelas({ emprestimoId: emprestimo.id, cliente: emprestimo.nomeCliente });
        }
      }}
    >
      {/* ✅ aqui a gente trunca pra nunca estourar */}
      <TableCell className="font-semibold text-slate-700 truncate max-w-[180px]">
        {emprestimo.nomeCliente}
      </TableCell>

      <TableCell className="text-slate-500 whitespace-nowrap">
        {formatDate(emprestimo.dataEmprestimo)}
      </TableCell>

      <TableCell className="text-slate-600 font-medium truncate max-w-[120px]">
        {emprestimo.formaPagamento}
      </TableCell>

      <TableCell className="font-semibold whitespace-nowrap">
        {formatCurrency(emprestimo.valorEmprestado)}
      </TableCell>

      <TableCell className="text-emerald-600 font-bold whitespace-nowrap">
        {formatCurrency(emprestimo.valorAReceber)}
      </TableCell>

      <TableCell className="font-medium whitespace-nowrap">
        {formatCurrency(emprestimo.valorParcela)}
      </TableCell>

      <TableCell className="text-emerald-700 font-bold whitespace-nowrap">
        {formatCurrency(emprestimo.valorRecebido)}
      </TableCell>

      <TableCell className="font-semibold whitespace-nowrap">
        {formatCurrency(emprestimo.valorTotalEmprestimo)}
      </TableCell>

      <TableCell className="text-slate-500 whitespace-nowrap">
        {formatDate(emprestimo.inicioPagamento)}
      </TableCell>

      <TableCell className="text-slate-500 whitespace-nowrap">
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