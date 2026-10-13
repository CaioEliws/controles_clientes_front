import { useMemo, useState } from "react";
import { EditarClienteDialog } from "@/components/EditarClienteDialog";
import { useProfile } from "@/contexts/ProfileContext";
import type { Cliente } from "@/types";
import { SquarePen } from "lucide-react";
import { useClientes } from "@/hooks/useClients";
import { ModalCadastro } from "@/components/ModalCadastro";
import { ModalRelatorio } from "@/components/ModalRelatorio";
import { StatCard } from "@/components/StatCard";
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

export function Clientes() {
  const { perfilAtivo } = useProfile();
  return <ClientesDoPerfil key={perfilAtivo?.id ?? "sem-perfil"} />;
}

function ClientesDoPerfil() {
  const { perfilAtivo } = useProfile();
  const [edicao, setEdicao] = useState<{ perfilId: number; cliente: Cliente } | null>(null);
  const {
    erro,
    clientes,
    loading,
    totalEmprestimos,
    fetchClientes,
    deletarCliente,
  } = useClientes();

  const [search, setSearch] = useState("");

  const filtrados = useMemo(() => {
    const termo = search.toLowerCase();

    return clientes.filter((c) => {
      return (
        c.nome.toLowerCase().includes(termo) ||
        (c.nomeIndicador && c.nomeIndicador.toLowerCase().includes(termo))
      );
    });
  }, [clientes, search]);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <main className="min-w-0 flex-1 p-4 sm:p-10 space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-3xl font-bold italic">Clientes</h1>

          <div className="flex w-full flex-wrap gap-4 sm:w-auto">
            <Input
              aria-label="Pesquisar clientes"
              placeholder="Pesquisar..."
              className="min-w-0 flex-1 sm:w-64 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ModalCadastro onSuccess={fetchClientes} />
          </div>
        </div>

        {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <StatCard label="Total de Clientes" value={clientes.length} />
              <StatCard label="Total de Empréstimos" value={totalEmprestimos} />
            </>
          )}
        </div>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Indicador</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
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
                    <TableRow key={cliente.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">
                        {cliente.nome}
                      </TableCell>
                      <TableCell>{cliente.nomeIndicador}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <ModalRelatorio
                            clienteId={cliente.id}
                            nomeCliente={cliente.nome}
                          />
                          <Button variant="outline" size="sm" disabled={!perfilAtivo} onClick={() => { if (perfilAtivo) setEdicao({ perfilId: perfilAtivo.id, cliente }); }}>
                            <SquarePen className="mr-1 h-4 w-4" /> Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => { void deletarCliente(cliente.id).catch((error: unknown) => alert(error instanceof Error ? error.message : "Não foi possível excluir o cliente.")); }}
                          >
                            Deletar
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
      {edicao && perfilAtivo?.id === edicao.perfilId && (
        <EditarClienteDialog key={`${edicao.perfilId}-${edicao.cliente.id}`} cliente={edicao.cliente} onClose={() => setEdicao(null)} onSuccess={fetchClientes} />
      )}
    </div>
  );
}
