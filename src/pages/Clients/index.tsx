import { useMemo, useState } from "react";
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
  const {
    clientes,
    loading,
    totalEmprestimos,
    fetchClientes,
    deletarCliente,
    API,
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
      <main className="flex-1 p-10 space-y-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold italic">Clientes</h1>

          <div className="flex gap-4">
            <Input
              placeholder="Pesquisar..."
              className="w-64 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ModalCadastro onSuccess={fetchClientes} />
          </div>
        </div>

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
                            API={API}
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletarCliente(cliente.id)}
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
    </div>
  );
}