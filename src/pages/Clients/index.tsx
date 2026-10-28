import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditarClienteDialog } from "@/components/EditarClienteDialog";
import { useProfile } from "@/contexts/ProfileContext";
import type { Cliente } from "@/types";
import { ArrowDownAZ, Search, SquarePen, Trash2, UserPlus, UsersRound, WalletCards } from "lucide-react";
import { useClientes } from "@/hooks/useClients";
import { ModalCadastro } from "@/components/ModalCadastro";
import { ModalRelatorio } from "@/components/ModalRelatorio";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ordemPorNome = new Intl.Collator("pt-BR", { sensitivity: "base" });

export function Clientes() {
  const { perfilAtivo } = useProfile();
  return <ClientesDoPerfil key={perfilAtivo?.id ?? "sem-perfil"} />;
}

function ClientesDoPerfil() {
  const { perfilAtivo } = useProfile();
  const [edicao, setEdicao] = useState<{ perfilId: number; cliente: Cliente } | null>(null);
  const [exclusao, setExclusao] = useState<Cliente | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    erro,
    clientes,
    loading,
    totalEmprestimos,
    fetchClientes,
    deletarCliente,
  } = useClientes();

  const [search, setSearch] = useState("");

  const clientesOrdenados = useMemo(
    () => [...clientes].sort((a, b) => ordemPorNome.compare(a.nome, b.nome)),
    [clientes]
  );

  const filtrados = useMemo(() => {
    const termo = search.toLowerCase();

    return clientesOrdenados.filter((c) => {
      return (
        c.nome.toLowerCase().includes(termo) ||
        (c.nomeIndicador && c.nomeIndicador.toLowerCase().includes(termo))
      );
    });
  }, [clientesOrdenados, search]);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <main className="mx-auto min-w-0 max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-3 text-white"><UsersRound className="h-5 w-5" aria-hidden="true" /></div>
            <div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Clientes</h1>
              <p className="mt-1 text-sm text-slate-500">Consulte os cadastros e acompanhe seus empréstimos.</p></div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative min-w-0 flex-1 lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input aria-label="Pesquisar clientes" placeholder="Buscar por nome ou indicador"
                className="h-11 rounded-xl border-slate-200 bg-white pl-10 shadow-sm"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <ModalCadastro onSuccess={fetchClientes} trigger={<Button type="button" disabled={!perfilAtivo} className="h-11 gap-2 rounded-xl px-5 shadow-sm"><UserPlus className="h-4 w-4" />Novo Cliente</Button>} />
          </div>
        </header>

        {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
        {aviso && <p role="status" className="text-sm text-emerald-700">{aviso}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {loading ? (
            <>
              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-10 w-24" />
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-10 w-28" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {[
                { label: "Total de Clientes", value: clientes.length, icon: UsersRound, detalhe: "Cadastros no perfil selecionado" },
                { label: "Total de Empréstimos", value: totalEmprestimos, icon: WalletCards, detalhe: "Vinculados aos clientes deste perfil" },
              ].map(({ label, value, icon: Icon, detalhe }) => <Card key={label} className="rounded-2xl border-slate-200/80 shadow-sm">
                <CardContent className="flex items-center justify-between gap-4 p-5 sm:p-6">
                  <div><p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
                    <p className="mt-1 text-xs text-slate-500">{detalhe}</p></div>
                  <div className="shrink-0 rounded-xl bg-slate-100 p-3 text-slate-600"><Icon className="h-5 w-5" aria-hidden="true" /></div>
                </CardContent>
              </Card>)}
            </>
          )}
        </div>

        <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200/80 py-0 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div><h2 className="font-semibold text-slate-900">Lista de clientes</h2>
              <p className="mt-1 text-sm text-slate-500">{loading ? "Carregando cadastros..." : `${filtrados.length} ${filtrados.length === 1 ? "cliente encontrado" : "clientes encontrados"}`}</p></div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600"><ArrowDownAZ className="h-4 w-4" aria-hidden="true" />Ordem alfabética</span>
          </div>
          <CardContent className="p-0">
            <Table aria-label="Lista de clientes" className="block w-full md:table [&_td]:block md:[&_td]:table-cell [&_tr]:block md:[&_tr]:table-row">
              <TableHeader className="hidden bg-slate-50 md:table-header-group">
                <TableRow className="hover:bg-slate-50">
                  <TableHead className="h-12 pl-6 font-semibold text-slate-600">Nome</TableHead>
                  <TableHead className="h-12 font-semibold text-slate-600">Indicador</TableHead>
                  <TableHead className="h-12 pr-6 text-right font-semibold text-slate-600">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="block md:table-row-group">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-[220px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[180px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-[110px]" />
                          <Skeleton className="h-8 w-[90px]" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtrados.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-16 text-slate-400"
                    >
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrados.map((cliente) => (
                    <TableRow key={cliente.id} className="border-slate-100 transition-colors hover:bg-slate-50/80">
                      <TableCell className="break-words px-5 pb-1 pt-5 font-semibold text-slate-900 md:py-4 md:pl-6 md:pr-4">
                        {cliente.nome}
                      </TableCell>
                      <TableCell className="break-words px-5 py-1 text-slate-500 md:px-4 md:py-4"><span className="mr-1.5 text-xs text-slate-400 md:hidden">Indicador:</span>{cliente.nomeIndicador || "Não informado"}</TableCell>
                      <TableCell className="px-5 pb-5 pt-3 md:py-4 md:pl-4 md:pr-6 md:text-right">
                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          <ModalRelatorio
                            clienteId={cliente.id}
                            nomeCliente={cliente.nome}
                            className="h-9 rounded-lg text-xs"
                          />
                          <Button variant="outline" size="sm" className="h-9 rounded-lg border-slate-200 text-xs text-slate-700" disabled={!perfilAtivo} onClick={() => { if (perfilAtivo) setEdicao({ perfilId: perfilAtivo.id, cliente }); }}>
                            <SquarePen className="mr-1 h-4 w-4" /> Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-9 rounded-lg text-xs"
                            onClick={() => setExclusao(cliente)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />Deletar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <ConfirmDialog open={!!exclusao} onOpenChange={open => { if (!open) setExclusao(null); }} title="Excluir cliente?" description={<>Deseja realmente deletar {exclusao?.nome}?</>} confirmText="Excluir cliente" destructive onConfirm={async () => { if (exclusao) await deletarCliente(exclusao.id); }} />
      {edicao && perfilAtivo?.id === edicao.perfilId && (
        <EditarClienteDialog key={`${edicao.perfilId}-${edicao.cliente.id}`} cliente={edicao.cliente} onClose={() => setEdicao(null)} onSuccess={async () => { await fetchClientes(); setAviso("Dados cadastrais atualizados."); }} />
      )}
    </div>
  );
}
