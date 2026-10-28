import { RelatorioParcelasTable } from "./components/RelatorioParcelasTable";
import { useRelatorioParcelasPage } from "@/hooks/useRelatorioParcelasPage";
import { useProfile } from "@/contexts/ProfileContext";
import { Button } from "@/components/ui/button";
import { ClienteAutoComplete } from "@/components/ClienteAutoComplete";
import { FileSpreadsheet, X } from "lucide-react";

const selectClass = "h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50 disabled:text-slate-400";
function RelatorioDoPerfil() {
  const vm = useRelatorioParcelasPage();
  const hasFilters = !!vm.clientSearch || !!vm.selectedClienteId || !!vm.selectedEmprestimoId;
  return <>
    <section aria-label="Filtros do relatório" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold text-slate-800">Selecione o empréstimo</h2>
        {hasFilters && <Button type="button" variant="ghost" onClick={vm.clearFilters} className="h-8 text-slate-500"><X className="mr-1 h-4 w-4" />Limpar filtros</Button>}</div>
      <div className="grid min-w-0 gap-4 md:grid-cols-3">
        <div className="relative z-20 min-w-0 [&>div]:!w-full [&_input]:h-11"><p className="mb-2 text-xs font-medium text-slate-500">Buscar cliente</p>
          <ClienteAutoComplete value={vm.clientSearch} error={vm.clientSearchError} suggestions={vm.suggestions} onChange={vm.handleClientSearchChange} onSelect={vm.selectCliente} />
          {vm.clientSearchError && <p role="alert" className="mt-2 text-xs text-red-600">{vm.clientSearchError}</p>}</div>
        <div className="min-w-0"><label htmlFor="relatorio-cliente" className="mb-2 block text-xs font-medium text-slate-500">Cliente</label>
          <select id="relatorio-cliente" className={selectClass} value={vm.selectedClienteId ?? ""} disabled={vm.loadingClientes}
            onChange={(e) => vm.handleSelectCliente(e.target.value ? Number(e.target.value) : null)}>
            <option value="">{vm.loadingClientes ? "Carregando clientes..." : "Selecione um cliente"}</option>
            {vm.clientesFiltrados.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select></div>
        <div className="min-w-0"><label htmlFor="relatorio-emprestimo" className="mb-2 block text-xs font-medium text-slate-500">Empréstimo</label>
          <select id="relatorio-emprestimo" className={selectClass} value={vm.selectedEmprestimoId ?? ""} disabled={!vm.selectedClienteId || vm.loadingEmprestimos}
            onChange={(e) => vm.setSelectedEmprestimoId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">{vm.loadingEmprestimos ? "Carregando empréstimos..." : "Selecione um empréstimo"}</option>
            {vm.emprestimos.map((e) => <option key={e.id} value={e.id}>#{e.id} · {e.label}</option>)}
          </select></div>
      </div>
      {vm.selectedClienteId && !vm.loadingEmprestimos && !vm.emprestimos.length && <p role="status" className="text-sm text-slate-500">Este cliente não possui empréstimos disponíveis.</p>}
    </section>
    <RelatorioParcelasTable key={`${vm.selectedClienteId}-${vm.selectedEmprestimoId}`} loading={vm.loadingParcelas} error={vm.erroParcelas}
      parcelas={vm.parcelas} selectedClienteName={vm.selectedClienteName} emprestimo={vm.selectedEmprestimo} />
  </>;
}
export function RelatorioParcelas() {
  const { perfilAtivo } = useProfile();
  return <div className="mx-auto min-w-0 max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">
    <header className="flex items-start gap-3"><div className="rounded-xl bg-slate-900 p-2.5 text-white"><FileSpreadsheet className="h-5 w-5" /></div>
      <div><h1 className="text-2xl font-semibold tracking-tight text-slate-900">Relatório de parcelas</h1>
        <p className="mt-1 text-sm leading-6 text-slate-500">Acompanhe o empréstimo e compartilhe todas as parcelas em uma única imagem.</p></div></header>
    {perfilAtivo ? <RelatorioDoPerfil key={perfilAtivo.id} /> : <p className="text-sm text-slate-500">Selecione um Perfil para consultar o relatório.</p>}
  </div>;
}
