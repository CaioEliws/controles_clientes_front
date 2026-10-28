import { useCallback, useState } from "react";
import { CobrarWhatsappButton } from "@/components/CobrarWhatsappButton";
import { Button } from "@/components/ui/button";
import { normalizarWhatsapp } from "@/utils/whatsapp";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";

import type { Cliente, ParcelaResponse, StatusParcela } from "@/types";
import { ParcelasTableHeader } from "@/pages/Parcelas/components/table/ParcelasTableHeader";
import { ParcelasTableRow } from "@/pages/Parcelas/components/table/ParcelasTableRow";

interface Props {
  loading: boolean;
  parcelas: ParcelaResponse[];
  parcelasFiltradas: ParcelaResponse[];
  uniqueClients: string[];
  selectedClients: string[];
  selectedStatuses: StatusParcela[];
  selectedMonth: number | "ALL";
  toggleClient: (client: string) => void;
  toggleStatus: (status: StatusParcela) => void;
  setSelectedMonth: (value: number | "ALL") => void;
  setSortOrder: (value: "asc" | "desc") => void;
  onPagar: (parcela: ParcelaResponse) => void;
  onAlterarParcela: (parcela: ParcelaResponse) => void;
  onDesfazerPagamento: (parcela: ParcelaResponse) => void;
}

const TABLE_COLS = 7;

export function ParcelasTable({
  loading,
  parcelas,
  parcelasFiltradas,
  uniqueClients,
  selectedClients,
  selectedStatuses,
  selectedMonth,
  toggleClient,
  toggleStatus,
  setSelectedMonth,
  setSortOrder,
  onPagar,
  onAlterarParcela,
  onDesfazerPagamento,
}: Props) {
  const [contatos, setContatos] = useState<Record<number, Cliente>>({});
  const atualizarContato = useCallback((cliente: Cliente) => setContatos((atuais) => ({ ...atuais, [cliente.id]: cliente })), []);
  const primeiro = parcelasFiltradas[0];
  const clienteUnico = primeiro?.clienteId && parcelasFiltradas.every((p) => p.clienteId === primeiro.clienteId) ? primeiro : null;
  const contatoUnico = clienteUnico?.clienteId ? contatos[clienteUnico.clienteId] : undefined;
  const semTelefone = clienteUnico && !normalizarWhatsapp(contatoUnico ? contatoUnico.telefoneWhatsapp : clienteUnico.telefoneWhatsapp);
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <CardContent className="p-0">
        {semTelefone && clienteUnico && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600" role="status">
          <p>{clienteUnico.nomeCliente} ainda não possui WhatsApp válido cadastrado.</p>
          <CobrarWhatsappButton parcela={clienteUnico} contatoAtualizado={contatoUnico} onContatoAtualizado={atualizarContato} renderControls={({ editar, ocupado }) => <Button type="button" variant="outline" className="h-9 rounded-lg border-slate-200 bg-white text-sm" onClick={editar} disabled={ocupado}>{ocupado ? "Consultando contato..." : "Cadastrar WhatsApp"}</Button>} />
        </div>}
        <div aria-label="Tabela de parcelas — role horizontalmente em telas menores" tabIndex={0} className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300 [-webkit-overflow-scrolling:touch]">
          <div className="min-w-[1080px]">
            <Table aria-label="Parcelas dos clientes" className="w-full whitespace-nowrap text-sm">
              <ParcelasTableHeader
                uniqueClients={uniqueClients}
                selectedClients={selectedClients}
                selectedStatuses={selectedStatuses}
                selectedMonth={selectedMonth}
                toggleClient={toggleClient}
                toggleStatus={toggleStatus}
                setSelectedMonth={setSelectedMonth}
                setSortOrder={setSortOrder}
              />

              <TableBody>
                {loading ? (
                  <tr className="hover:bg-white">
                    <td colSpan={TABLE_COLS} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-sm font-medium text-slate-500">
                          Carregando parcelas...
                        </span>
                        <span className="text-xs text-slate-400">
                          Aguarde enquanto os dados são carregados.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : parcelas.length === 0 ? (
                  <tr className="hover:bg-white">
                    <td colSpan={TABLE_COLS} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-sm font-medium text-slate-500">
                          Nenhum resultado encontrado
                        </span>
                        <span className="text-xs text-slate-400">
                          Ajuste os filtros para visualizar outras parcelas.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  parcelas.map((parcela) => (
                    <ParcelasTableRow
                      key={`${parcela.idEmprestimo}-${parcela.numeroParcela}`}
                      parcela={parcela}
                      contatoAtualizado={parcela.clienteId ? contatos[parcela.clienteId] : undefined}
                      onContatoAtualizado={atualizarContato}
                      mostrarIndicadorContato={!clienteUnico}
                      onPagar={onPagar}
                      onAlterarParcela={onAlterarParcela}
                      onDesfazerPagamento={onDesfazerPagamento}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}