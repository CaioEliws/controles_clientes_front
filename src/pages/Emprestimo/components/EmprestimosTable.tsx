import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

  const actionsDisabled =
  actions.loadingRefinance ||
  actions.loadingQuit ||
  actions.loadingDelete;

  return (
    <>
      <section className="mt-4 min-w-0 max-w-full sm:mt-6">
        <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5 sm:py-4 lg:px-6">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold text-slate-800 sm:text-base lg:text-lg">
                  Tabela de Empréstimos
                </CardTitle>

                <CardDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {selectedClienteName
                    ? `Visualizando os empréstimos de ${selectedClienteName}.`
                    : "Selecione um cliente para visualizar os empréstimos."}
                </CardDescription>
              </div>

              <div className="flex items-center justify-between gap-3 lg:justify-end">
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 sm:text-xs">
                  {loading ? "Carregando..." : `${emprestimos.length} resultado(s)`}
                </span>

                <span className="text-[11px] text-slate-400 xl:hidden">
                  Arraste para o lado →
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <div className="min-w-[1180px] xl:min-w-[1240px]">
                <Table className="min-w-full table-fixed whitespace-nowrap text-xs sm:text-sm">
                  <EmprestimosTableHeader />
                  
                  <TableBody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={TABLE_COLS}
                          className="px-4 py-14 text-center sm:px-6 sm:py-16"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="text-sm font-medium text-slate-500">
                              Carregando dados...
                            </span>
                            <span className="text-xs text-slate-400">
                              Aguarde enquanto os empréstimos são carregados.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : emprestimos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={TABLE_COLS}
                          className="px-4 py-14 text-center sm:px-6 sm:py-16"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="text-sm font-medium text-slate-500">
                              Nenhum empréstimo encontrado
                            </span>
                            <span className="text-xs text-slate-400">
                              Ajuste os filtros ou selecione outro cliente para continuar.
                            </span>
                          </div>
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
                          onDelete={actions.openDelete}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <ConfirmActionDialog
        open={actions.isOpen}
        onOpenChange={(open) => {
          if (!open) actions.close();
        }}
        title={
          actions.actionType === "REFINANCIAR"
            ? "Refinanciar empréstimo"
            : actions.actionType === "QUITAR"
            ? "Quitar empréstimo"
            : "Deletar empréstimo"
        }
        description={
          actions.actionType === "REFINANCIAR" ? (
            <>
              Isso vai marcar todas as parcelas em aberto como pagas e alterar o
              status para <b>REFINANCIADO</b>.
            </>
          ) : actions.actionType === "QUITAR" ? (
            <>
              Isso vai marcar todas as parcelas restantes como pagas e alterar o
              status para <b>QUITADO</b>.
            </>
          ) : (
            <>
              Isso vai excluir permanentemente este <b>empréstimo</b>. Essa ação não
              poderá ser desfeita.
            </>
          )
        }
        confirmText={
          actions.actionType === "DELETAR" ? "Excluir" : "Confirmar"
        }
        loading={
          actions.actionType === "REFINANCIAR"
            ? actions.loadingRefinance
            : actions.actionType === "QUITAR"
            ? actions.loadingQuit
            : actions.loadingDelete
        }
        onConfirm={actions.confirm}
      />
    </>
  );
}