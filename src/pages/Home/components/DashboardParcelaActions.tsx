import { CalendarClock, CircleDollarSign, MessageCircle } from "lucide-react";
import { CobrarWhatsappButton } from "@/components/CobrarWhatsappButton";
import { Button } from "@/components/ui/button";
import type { ParcelaTable } from "@/mappers/parcela.mapper";

interface Props {
  parcela: ParcelaTable;
  incluirHoje: boolean;
  onEditar: () => void;
  onPagar: () => void;
}

export function DashboardParcelaActions({ parcela, incluirHoje, onEditar, onPagar }: Props) {
  return <CobrarWhatsappButton parcela={parcela.origem} incluirHoje={incluirHoje} renderControls={({ cobrar, ocupado, telefoneValido, cobravel }) => (
    <div className="flex h-8 flex-nowrap items-center justify-end gap-2">
      {parcela.origem.clienteId && telefoneValido && cobravel && <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5 border-emerald-200 px-2 text-emerald-800 hover:bg-emerald-50" title="Cobrar pelo WhatsApp" aria-label="Cobrar pelo WhatsApp" disabled={ocupado} onClick={cobrar}>
        <MessageCircle className="h-4 w-4" /><span className="hidden lg:inline">Cobrar</span>
      </Button>}
      <Button type="button" size="sm" variant="ghost" className="h-8 gap-1.5 px-2 text-amber-600 hover:bg-amber-50 hover:text-amber-700" title="Editar parcela" aria-label="Editar parcela" onClick={onEditar}>
        <CalendarClock className="h-4 w-4" /><span className="hidden lg:inline">Editar</span>
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5 border-slate-300 px-2 hover:border-blue-600 hover:bg-blue-600 hover:text-white" title="Pagar parcela" aria-label="Pagar parcela" onClick={onPagar}>
        <CircleDollarSign className="h-4 w-4 lg:hidden" /><span className="hidden lg:inline">Pagar</span>
      </Button>
    </div>
  )} />;
}
