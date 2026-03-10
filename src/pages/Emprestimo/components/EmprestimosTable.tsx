import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";

import type { EmprestimoDetalhado } from "@/types";
import { EmprestimosTableHeader } from "@/pages/Emprestimo/components/table/EmprestimosTableHeader";
import { EmprestimosTableRow } from "@/pages/Emprestimo/components/table/EmprestimosTableRow";
import { ConfirmActionDialog } from "@/pages/Emprestimo/components/table/ConfirmActionDialog";
import { useEmprestimoStatusActions } from "@/pages/Emprestimo/components/table/useEmprestimosActions";

type Props = {
  loading?: boolean;
  emprestimos: EmprestimoDetalhado[];
  selectedClienteName?: string | null;
  selectedClienteId?: number | null;
  onOpenParcelas: (payload: { emprestimoId: number; cliente: string }) => void;
  onRefetch?: () => void;
};

const TABLE_COLS = 13;

export function EmprestimosTable({
  loading,
  emprestimos,
  selectedClienteName,
  selectedClienteId,
  onOpenParcelas,
  onRefetch,
}: Props) {
  const actions = useEmprestimoStatusActions({ selectedClienteId, onRefetch });

  const actionsDisabled = actions.loadingRefinance || actions.loadingQuit;

  return (
    <>
      <div className="mt-6 min-w-0 max-w-full">
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="w-full max-w-full overflow-x-auto">
              <Table className="w-max min-w-[1500px] table-fixed">
                <EmprestimosTableHeader
                  selectedClienteName={selectedClienteName}
                />

                <TableBody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={TABLE_COLS}
                        className="py-20 text-center text-slate-400"
                      >
                        Carregando dados...
                      </td>
                    </tr>
                  ) : emprestimos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={TABLE_COLS}
                        className="py-20 text-center text-slate-400"
                      >
                        Nenhum empréstimo encontrado.
                      </td>
                    </tr>
                  ) : (
                    emprestimos.map((e) => (
                      <EmprestimosTableRow
                        key={e.id}
                        emprestimo={e}
                        canAct={actions.canAct}
                        actionsDisabled={actionsDisabled}
                        onOpenParcelas={onOpenParcelas}
                        onRefinance={actions.openRefinance}
                        onQuit={actions.openQuit}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmActionDialog
        open={actions.isOpen}
        onOpenChange={(open) => {
          if (!open) actions.close();
        }}
        title={
          actions.actionType === "REFINANCIAR"
            ? "Refinanciar empréstimo"
            : "Quitar empréstimo"
        }
        description={
          actions.actionType === "REFINANCIAR" ? (
            <>
              Isso vai marcar todas as parcelas em aberto como pagas e alterar o
              status para <b>REFINANCIADO</b>.
            </>
          ) : (
            <>
              Isso vai marcar todas as parcelas restantes como pagas e alterar o
              status para <b>QUITADO</b>.
            </>
          )
        }
        confirmText="Confirmar"
        loading={
          actions.actionType === "REFINANCIAR"
            ? actions.loadingRefinance
            : actions.loadingQuit
        }
        onConfirm={actions.confirm}
      />
    </>
  );
}