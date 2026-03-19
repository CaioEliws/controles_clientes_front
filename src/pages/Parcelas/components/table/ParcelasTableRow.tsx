import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";

import type { ParcelaResponse } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  getParcelaStatusBadgeClassName,
  toNumberCurrency,
} from "@/utils/parcelasTable";

import { PagarParcelaButton } from "@/components/actions/PagarParcelaButton";
import { AlterarParcelaButton } from "@/components/actions/AlterarParcelaButton";
import { Button } from "@/components/ui/button";

interface Props {
  parcela: ParcelaResponse;
  onPagar: (parcela: ParcelaResponse) => void;
  onAlterarParcela: (parcela: ParcelaResponse) => void;
  onDesfazerPagamento: (parcela: ParcelaResponse) => void;
}

export function ParcelasTableRow({
  parcela,
  onPagar,
  onAlterarParcela,
  onDesfazerPagamento,
}: Props) {
  const valorParcela = toNumberCurrency(parcela.valorParcela);
  const valorPago = toNumberCurrency(parcela.valorPago);

  return (
    <TableRow className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
      <TableCell className="max-w-[280px] px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-800">
            {parcela.nomeCliente}
          </p>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3">
        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          #{parcela.numeroParcela}
        </span>
      </TableCell>

      <TableCell className="px-4 py-3 font-semibold text-slate-700">
        {formatCurrency(valorParcela)}
      </TableCell>

      <TableCell className="px-4 py-3 font-semibold text-emerald-700">
        {formatCurrency(valorPago)}
      </TableCell>

      <TableCell className="px-4 py-3 text-slate-600">
        {formatDate(parcela.dataVencimento)}
      </TableCell>

      <TableCell className="px-4 py-3">
        <Badge
          variant="outline"
          className={getParcelaStatusBadgeClassName(parcela.status)}
        >
          {parcela.status}
        </Badge>
      </TableCell>

      <TableCell className="px-4 py-3 text-right">
        {parcela.status !== "PAGO" ? (
          <div className="flex justify-end gap-2">
            <AlterarParcelaButton onClick={() => onAlterarParcela(parcela)} />
            <PagarParcelaButton onClick={() => onPagar(parcela)} />
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <AlterarParcelaButton onClick={() => onAlterarParcela(parcela)} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDesfazerPagamento(parcela)}
            >
              Desfazer pagamento
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}