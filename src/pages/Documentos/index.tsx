import { useCallback, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/contexts/ProfileContext";
import { clientesService } from "@/services/clientes.service";
import { emprestimosService } from "@/services/emprestimos.service";
import type { Cliente } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { ClienteSelector } from "./components/ClienteSelector";
import { DocumentosEmprestimo } from "./components/DocumentosEmprestimo";
import { useConsulta } from "./useConsulta";

function EmprestimosCliente({ cliente }: { cliente: Cliente }) {
  const carregar = useCallback(() => emprestimosService.getByCliente(cliente.id), [cliente.id]);
  const consulta = useConsulta(carregar);
  const [emprestimoId, setEmprestimoId] = useState<number | null>(null);
  const ordenados = useMemo(() => [...(consulta.data ?? [])].sort((a, b) => Date.parse(b.dataEmprestimo) - Date.parse(a.dataEmprestimo) || b.id - a.id), [consulta.data]);
  return <div className="space-y-5">
    <section className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm">
      <Label htmlFor="documentos-emprestimo">Empréstimo</Label>
      {consulta.loading && <p role="status" className="text-sm text-slate-500">Carregando empréstimos...</p>}
      {consulta.error && <div className="space-y-2"><p role="alert" className="text-sm text-red-600">Erro ao carregar empréstimos: {consulta.error}</p><Button variant="outline" onClick={consulta.recarregar}>Tentar novamente</Button></div>}
      <select id="documentos-emprestimo" value={emprestimoId ?? ""} disabled={consulta.loading || !!consulta.error || ordenados.length === 0} onChange={(event) => setEmprestimoId(event.target.value ? Number(event.target.value) : null)} className="min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm">
        <option value="">Selecione um empréstimo</option>
        {ordenados.map((e) => <option key={e.id} value={e.id}>#{e.id} — {formatCurrency(e.valorEmprestado)} — {e.quantidadeParcelas} parcelas — {formatDate(e.dataEmprestimo)}</option>)}
      </select>
      {!consulta.loading && !consulta.error && ordenados.length === 0 && <p className="text-sm text-slate-500">Este cliente não possui empréstimos cadastrados.</p>}
    </section>
    {emprestimoId === null && ordenados.length > 0 && <Button disabled>Gerar contrato + promissória</Button>}
    {emprestimoId !== null && <DocumentosEmprestimo key={emprestimoId} clienteId={cliente.id} emprestimoId={emprestimoId} />}
  </div>;
}

function DocumentosPerfil() {
  const carregar = useCallback(() => clientesService.getAll(), []);
  const clientes = useConsulta(carregar);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  return <div className="space-y-5">
    <section className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
      {clientes.loading && <p role="status" className="text-sm text-slate-500">Carregando clientes...</p>}
      {clientes.error && <div className="space-y-2"><p role="alert" className="text-sm text-red-600">Erro ao carregar clientes: {clientes.error}</p><Button variant="outline" onClick={clientes.recarregar}>Tentar novamente</Button></div>}
      <ClienteSelector clientes={clientes.data ?? []} selected={cliente} onSelect={setCliente} disabled={clientes.loading || !!clientes.error} />
      {!clientes.loading && !clientes.error && clientes.data?.length === 0 && <p className="text-sm text-slate-500">Nenhum cliente cadastrado neste Perfil.</p>}
      {cliente && <dl className="grid gap-3 sm:grid-cols-3"><div><dt className="text-xs text-slate-500">Cliente</dt><dd className="text-sm">{cliente.nome}</dd></div><div><dt className="text-xs text-slate-500">CPF</dt><dd className="text-sm">{cliente.cpf || "—"}</dd></div><div><dt className="text-xs text-slate-500">Cidade/UF</dt><dd className="text-sm">{[cliente.enderecoCidade, cliente.enderecoEstado].filter(Boolean).join(" / ") || "—"}</dd></div></dl>}
    </section>
    {!cliente && <div className="space-y-3"><p className="text-sm text-slate-500">Selecione um cliente para começar.</p><Button disabled>Gerar contrato + promissória</Button></div>}
    {cliente && <EmprestimosCliente key={cliente.id} cliente={cliente} />}
  </div>;
}

export function Documentos() {
  const { perfilAtivo } = useProfile();
  return <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
    <header><h1 className="flex items-center gap-3 text-2xl font-semibold"><FileText className="h-6 w-6" />Documentos</h1><p className="mt-2 text-sm text-slate-500">Gere contratos e promissórias dos empréstimos.</p></header>
    {perfilAtivo ? <DocumentosPerfil key={perfilAtivo.id} /> : <p className="text-sm text-slate-500">Selecione um Perfil em Configurações para começar.</p>}
  </div>;
}
