import { MessageCircle, MoreHorizontal, Phone, PhoneOff, SquarePen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CobrarWhatsappButton } from "@/components/CobrarWhatsappButton";
import type { Cliente, ParcelaResponse } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { getParcelaStatusBadgeClassName, toNumberCurrency } from "@/utils/parcelasTable";
import { normalizarWhatsapp } from "@/utils/whatsapp";

interface Props {
  parcela: ParcelaResponse;
  contatoAtualizado?: Cliente;
  onContatoAtualizado: (cliente: Cliente) => void;
  mostrarIndicadorContato: boolean;
  onPagar: (parcela: ParcelaResponse) => void;
  onAlterarParcela: (parcela: ParcelaResponse) => void;
  onDesfazerPagamento: (parcela: ParcelaResponse) => void;
}
export function ParcelasTableRow({ parcela, contatoAtualizado, onContatoAtualizado, mostrarIndicadorContato, onPagar, onAlterarParcela, onDesfazerPagamento }: Props) {
  const valorParcela = toNumberCurrency(parcela.valorParcela), valorPago = toNumberCurrency(parcela.valorPago);
  const semTelefone = !normalizarWhatsapp(contatoAtualizado ? contatoAtualizado.telefoneWhatsapp : parcela.telefoneWhatsapp);
  return <TableRow className="h-14 border-slate-100 transition-colors hover:bg-slate-50/80">
    <TableCell className="max-w-[240px] px-4 py-2 align-middle"><div className="flex min-w-0 items-center gap-2">
      <span title={parcela.nomeCliente} className="truncate text-sm font-semibold text-slate-800">{parcela.nomeCliente}</span>
      {mostrarIndicadorContato && semTelefone && <PhoneOff role="img" aria-label="WhatsApp não cadastrado" className="h-3.5 w-3.5 shrink-0 text-slate-400"><title>WhatsApp não cadastrado — adicione em Mais opções</title></PhoneOff>}
    </div></TableCell>
    <TableCell className="px-4 py-2 align-middle text-sm font-medium tabular-nums text-slate-600">#{parcela.numeroParcela}</TableCell>
    <TableCell className="px-4 py-2 text-right align-middle text-sm font-semibold tabular-nums text-slate-800">{formatCurrency(valorParcela)}</TableCell>
    <TableCell className="px-4 py-2 text-right align-middle text-sm font-medium tabular-nums text-emerald-700">{formatCurrency(valorPago)}</TableCell>
    <TableCell className="px-4 py-2 align-middle text-sm tabular-nums text-slate-600">{formatDate(parcela.dataVencimento)}</TableCell>
    <TableCell className="px-4 py-2 align-middle"><Badge variant="outline" className={`h-6 whitespace-nowrap rounded-md px-2 text-xs font-medium ${getParcelaStatusBadgeClassName(parcela.status)}`}>{parcela.status}</Badge></TableCell>
    <TableCell className="px-4 py-2 text-right align-middle">
      <CobrarWhatsappButton parcela={parcela} contatoAtualizado={contatoAtualizado} onContatoAtualizado={onContatoAtualizado} renderControls={({ cobrar, editar, ocupado, telefoneValido, cobravel }) => <div className="flex h-9 items-center justify-end gap-2">
        {cobravel && telefoneValido && <Button type="button" variant="outline" className="h-9 gap-1.5 rounded-lg border-emerald-200 px-3 text-sm text-emerald-800 hover:bg-emerald-50" aria-label="Cobrar pelo WhatsApp" disabled={ocupado} onClick={cobrar}><MessageCircle className="h-4 w-4" />Cobrar</Button>}
        {parcela.status !== "PAGO" ? <Button type="button" className="h-9 rounded-lg px-3 text-sm" onClick={() => onPagar(parcela)}>Pagar</Button>
          : <Button type="button" variant="outline" className="h-9 rounded-lg border-slate-200 px-3 text-sm" onClick={() => onDesfazerPagamento(parcela)}>Desfazer pagamento</Button>}
        <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-lg border-slate-200 text-slate-600" aria-label={`Mais opções da parcela ${parcela.numeroParcela} de ${parcela.nomeCliente}`} title="Mais opções"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
            <DropdownMenuItem className="gap-2 rounded-lg py-2 text-sm" onSelect={() => onAlterarParcela(parcela)}><SquarePen className="h-4 w-4 text-slate-500" />Editar parcela</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 rounded-lg py-2 text-sm" disabled={!parcela.clienteId || ocupado} onSelect={editar}><Phone className="h-4 w-4 text-slate-500" />{telefoneValido ? "Editar WhatsApp" : "Cadastrar WhatsApp"}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>} />
    </TableCell>
  </TableRow>;
}
