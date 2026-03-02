import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Filter, Pencil, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { EmprestimoDetalhado } from "@/types";
import { EmprestimoStatusBadge } from "@/pages/Emprestimo/components/EmprestimoStatusBadge";
import { formatCurrency, formatDate } from "@/utils/format";
import { emprestimosService } from "@/services/emprestimos.service";

type Props = {
  loading?: boolean;
  emprestimos: EmprestimoDetalhado[];
  selectedClienteName?: string | null;
  selectedClienteId?: number | null;

  onOpenParcelas: (payload: { emprestimoId: number; cliente: string }) => void;
  onRefetch?: () => void;
};

export function EmprestimosTable({
  loading,
  emprestimos,
  selectedClienteName,
  selectedClienteId,
  onOpenParcelas,
  onRefetch,
}: Props) {
  const [refinanceTarget, setRefinanceTarget] =
    useState<EmprestimoDetalhado | null>(null);

  const [quitTarget, setQuitTarget] =
    useState<EmprestimoDetalhado | null>(null);

  // ✅ loaders separados
  const [refinanceLoading, setRefinanceLoading] = useState(false);
  const [quitLoading, setQuitLoading] = useState(false);

  const canAct = useMemo(() => !!selectedClienteId, [selectedClienteId]);

  async function confirmRefinance() {
    if (!selectedClienteId || !refinanceTarget) return;

    try {
      setRefinanceLoading(true);
      await emprestimosService.refinanciar(selectedClienteId, refinanceTarget.id);
      setRefinanceTarget(null);
      await onRefetch?.();
    } catch (err) {
      console.error(err);
      alert("Erro ao refinanciar empréstimo.");
    } finally {
      setRefinanceLoading(false);
    }
  }

  async function confirmQuit() {
    if (!selectedClienteId || !quitTarget) return;

    try {
      setQuitLoading(true);
      await emprestimosService.quitar(selectedClienteId, quitTarget.id);
      setQuitTarget(null);
      await onRefetch?.();
    } catch (err) {
      console.error(err);
      alert("Erro ao quitar empréstimo.");
    } finally {
      setQuitLoading(false);
    }
  }

  return (
    <>
      <Card className="rounded-xl shadow-sm border-slate-200 overflow-hidden mt-6">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="min-w-[220px]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                          Cliente
                          <Filter
                            className={`w-3.5 h-3.5 ${
                              selectedClienteName ? "text-blue-600" : "text-slate-400"
                            }`}
                          />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2" align="start">
                        <p className="text-xs font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
                          Selecionado
                        </p>
                        <p className="text-sm px-2 pb-1">
                          {selectedClienteName ?? "Nenhum"}
                        </p>
                      </PopoverContent>
                    </Popover>
                  </TableHead>

                  <TableHead className="min-w-[130px]">Data do empréstimo</TableHead>
                  <TableHead className="min-w-[120px]">Forma Pgto</TableHead>
                  <TableHead className="min-w-[140px]">Valor emprestado</TableHead>
                  <TableHead className="min-w-[140px]">Valor a receber</TableHead>
                  <TableHead className="min-w-[130px]">Valor parcela</TableHead>
                  <TableHead className="min-w-[140px]">Valor recebido</TableHead>
                  <TableHead className="min-w-[160px]">Valor total empréstimo</TableHead>
                  <TableHead className="min-w-[130px]">Início pagamento</TableHead>
                  <TableHead className="min-w-[130px]">Final pagamento</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-20 text-slate-400">
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : emprestimos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-20 text-slate-400">
                      Nenhum empréstimo encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  emprestimos.map((e) => {
                    const status = String(e.status);
                    const isEmAberto = status === "EM_ABERTO";

                    const hasActions = isEmAberto;

                    return (
                      <TableRow
                        key={e.id}
                        role="button"
                        tabIndex={0}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={(ev) => {
                          const target = ev.target as HTMLElement;
                          if (target.closest("[data-stop-row-click='true']")) return;
                          onOpenParcelas({ emprestimoId: e.id, cliente: e.nomeCliente });
                        }}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            onOpenParcelas({ emprestimoId: e.id, cliente: e.nomeCliente });
                          }
                        }}
                      >
                        <TableCell className="font-semibold text-slate-700">
                          {e.nomeCliente}
                        </TableCell>

                        <TableCell className="text-slate-500">
                          {formatDate(e.dataEmprestimo)}
                        </TableCell>

                        <TableCell className="text-slate-600 font-medium">
                          {e.formaPagamento}
                        </TableCell>

                        <TableCell className="font-semibold">
                          {formatCurrency(e.valorEmprestado)}
                        </TableCell>

                        <TableCell className="text-emerald-600 font-bold">
                          {formatCurrency(e.valorAReceber)}
                        </TableCell>

                        <TableCell className="font-medium">
                          {formatCurrency(e.valorParcela)}
                        </TableCell>

                        <TableCell className="text-emerald-700 font-bold">
                          {formatCurrency(e.valorRecebido)}
                        </TableCell>

                        <TableCell className="font-semibold">
                          {formatCurrency(e.valorTotalEmprestimo)}
                        </TableCell>

                        <TableCell className="text-slate-500">
                          {formatDate(e.inicioPagamento)}
                        </TableCell>

                        <TableCell className="text-slate-500">
                          {formatDate(e.finalPagamento)}
                        </TableCell>

                        <TableCell>
                          {hasActions ? (
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
                                    className="h-8 px-2 py-0 rounded-md hover:bg-slate-100"
                                    disabled={!canAct || refinanceLoading || quitLoading}
                                  >
                                    <EmprestimoStatusBadge status={status} />
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

                                  {/* ✅ EM_ABERTO: pode REFINANCIAR */}
                                  <DropdownMenuItem
                                    onClick={() => setRefinanceTarget(e)}
                                    className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer focus:bg-slate-100"
                                  >
                                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
                                      <Pencil className="h-4 w-4 text-slate-700" />
                                    </span>

                                    <span className="flex flex-col leading-tight">
                                      <span className="font-medium text-slate-900">
                                        Marcar como{" "}
                                        <span className="font-semibold">REFINANCIADO</span>
                                      </span>
                                      <span className="text-xs text-slate-500">
                                        Quita parcelas em aberto e troca o status.
                                      </span>
                                    </span>
                                  </DropdownMenuItem>

                                  {/* ✅ EM_ABERTO: pode QUITAR */}
                                  <DropdownMenuItem
                                    onClick={() => setQuitTarget(e)}
                                    className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer focus:bg-slate-100"
                                  >
                                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
                                      <CheckCircle2 className="h-4 w-4 text-slate-700" />
                                    </span>

                                    <span className="flex flex-col leading-tight">
                                      <span className="font-medium text-slate-900">
                                        Marcar como{" "}
                                        <span className="font-semibold">QUITADO</span>
                                      </span>
                                      <span className="text-xs text-slate-500">
                                        Marca todas as parcelas restantes como pagas.
                                      </span>
                                    </span>
                                  </DropdownMenuItem>

                                  {!selectedClienteId && (
                                    <>
                                      <DropdownMenuSeparator className="my-1 bg-slate-200" />
                                      <div className="px-2 py-2 text-xs text-slate-500">
                                        Selecione um cliente para executar ações.
                                      </div>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ) : (
                            // ✅ QUITADO ou REFINANCIADO: sem ações (só badge)
                            <span className="inline-flex p-1">
                              <EmprestimoStatusBadge status={status} />
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Refinanciar */}
      <Dialog
        open={!!refinanceTarget}
        onOpenChange={(open) => {
          if (!open && !refinanceLoading) setRefinanceTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refinanciar empréstimo</DialogTitle>
            <DialogDescription>
              Isso vai marcar todas as parcelas em aberto como pagas e alterar o status para{" "}
              <b>REFINANCIADO</b>.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRefinanceTarget(null)}
              disabled={refinanceLoading}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={confirmRefinance}
              disabled={!selectedClienteId || refinanceLoading}
            >
              {refinanceLoading ? "Refinanciando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Quitar */}
      <Dialog
        open={!!quitTarget}
        onOpenChange={(open) => {
          if (!open && !quitLoading) setQuitTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitar empréstimo</DialogTitle>
            <DialogDescription>
              Isso vai marcar todas as parcelas restantes como pagas e alterar o status para{" "}
              <b>QUITADO</b>.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuitTarget(null)}
              disabled={quitLoading}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={confirmQuit}
              disabled={!selectedClienteId || quitLoading}
            >
              {quitLoading ? "Quitando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}