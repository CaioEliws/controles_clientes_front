import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Cliente } from "@/types";

const normalizar = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type Props = {
  clientes: Cliente[];
  excluirClienteId: number | null;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  triggerRef: (element: HTMLButtonElement | null) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

export function FiadorSelector({ clientes, excluirClienteId, value, onChange, onBlur, triggerRef, disabled, invalid, describedBy }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [indice, setIndice] = useState(0);
  const disponiveis = useMemo(() => clientes.filter(cliente => cliente.id !== excluirClienteId)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })), [clientes, excluirClienteId]);
  const resultados = useMemo(() => disponiveis.filter(cliente => normalizar(cliente.nome).includes(normalizar(busca.trim()))), [disponiveis, busca]);
  const selected = disponiveis.find(cliente => String(cliente.id) === value);
  const ativo = resultados[Math.min(indice, resultados.length - 1)];
  const ativoId = ativo ? `${id}-opcao-${ativo.id}` : undefined;
  useEffect(() => {
    if (open && ativoId) document.getElementById(ativoId)?.scrollIntoView({ block: "nearest" });
  }, [open, ativoId]);
  const mudarAbertura = (next: boolean) => { setOpen(next); setBusca(""); setIndice(0); };
  const selecionar = (cliente: Cliente) => { onChange(String(cliente.id)); mudarAbertura(false); };

  return <Popover modal open={open} onOpenChange={mudarAbertura}>
    <PopoverTrigger asChild>
      <Button id="fiadorId" ref={triggerRef} type="button" variant="outline" role="combobox"
        aria-label="Fiador" aria-expanded={open} aria-controls={`${id}-lista`} aria-haspopup="listbox"
        aria-required="true" aria-invalid={invalid} aria-describedby={describedBy} disabled={disabled} onBlur={onBlur}
        onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); mudarAbertura(true); } }}
        className="h-11 w-full rounded-lg border-slate-200 min-w-0 justify-between gap-3 text-left">
        <span className="truncate">{selected?.nome ?? "Buscar e selecionar fiador..."}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] rounded-xl border-slate-200 p-2 shadow-lg"
      onOpenAutoFocus={event => { event.preventDefault(); inputRef.current?.focus(); }}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input ref={inputRef} aria-label="Buscar fiador" role="combobox" aria-expanded={open}
          aria-controls={`${id}-lista`} aria-autocomplete="list" aria-activedescendant={ativoId}
          placeholder="Buscar fiador..." value={busca} autoComplete="off" className="pl-9"
          onChange={event => { setBusca(event.target.value); setIndice(0); }}
          onKeyDown={event => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setIndice(current => Math.max(0, Math.min(resultados.length - 1, current + (event.key === "ArrowDown" ? 1 : -1))));
            } else if (event.key === "Enter") { event.preventDefault(); if (ativo) selecionar(ativo); }
          }} />
      </div>
      <div id={`${id}-lista`} role="listbox" aria-label="Fiadores disponíveis" className="mt-2 max-h-[min(16rem,var(--radix-popover-content-available-height))] overflow-y-auto overscroll-contain">
        {resultados.map(cliente => <button id={`${id}-opcao-${cliente.id}`} key={cliente.id} type="button" role="option"
          aria-selected={String(cliente.id) === value} tabIndex={-1}
          className={`block w-full rounded-lg px-3 py-2 text-left text-sm break-words hover:bg-slate-100 ${ativo?.id === cliente.id ? "bg-slate-100" : ""}`}
          onClick={() => selecionar(cliente)}>{cliente.nome}</button>)}
      </div>
      {resultados.length === 0 && <p role="status" className="p-3 text-sm text-slate-500">Nenhum cliente encontrado.</p>}
    </PopoverContent>
  </Popover>;
}
