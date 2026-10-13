import { useId, useMemo, useState } from "react";
import { Search, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cliente } from "@/types";

const normalizar = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function ClienteSelector({ clientes, selected, onSelect, disabled }: { clientes: Cliente[]; selected: Cliente | null; onSelect: (cliente: Cliente) => void; disabled?: boolean }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const resultados = useMemo(() => {
    const termo = normalizar(busca.trim());
    const digitos = busca.replace(/\D/g, "");
    return clientes.filter((cliente) => normalizar(cliente.nome).includes(termo) ||
      (digitos.length > 0 && (cliente.cpf ?? "").replace(/\D/g, "").includes(digitos)));
  }, [clientes, busca]);
  return <div className="space-y-2">
    <Label htmlFor={id}>Cliente / Devedor</Label>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" role="combobox" aria-expanded={open} disabled={disabled} className="h-auto min-h-11 w-full justify-between gap-3 text-left">
          <span className="truncate">{selected?.nome ?? "Buscar cliente..."}</span><ChevronsUpDown className="h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-2">
        <Label htmlFor={`${id}-busca`} className="sr-only">Buscar cliente por nome ou CPF</Label>
        <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input id={`${id}-busca`} placeholder="Nome ou CPF..." value={busca} onChange={(event) => setBusca(event.target.value)} className="pl-9" autoComplete="off" /></div>
        <div className="mt-2 max-h-64 overflow-y-auto">
          {resultados.slice(0, 50).map((cliente) => <button key={cliente.id} type="button" className="flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 focus:bg-slate-100" onClick={() => { onSelect(cliente); setOpen(false); setBusca(""); }}>
            <span className="font-medium">{cliente.nome}</span><span className="text-xs text-slate-500">{cliente.cpf ? `CPF ${cliente.cpf}` : "CPF não informado"}</span>
          </button>)}
          {resultados.length === 0 && <p className="p-3 text-sm text-slate-500">Nenhum cliente encontrado.</p>}
          {resultados.length > 50 && <p className="p-3 text-xs text-slate-500">Mostrando 50 resultados. Refine a busca por nome ou CPF.</p>}
        </div>
      </PopoverContent>
    </Popover>
  </div>;
}
