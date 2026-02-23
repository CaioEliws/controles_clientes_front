import { useState } from "react";
import { useClientes } from "@/hooks/useClients";
import { ModalCadastro } from "@/components/ModalCadastro";
import { ModalRelatorio } from "@/components/ModalRelatorio";
import { StatCard } from "@/components/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Clientes() {
  const { clientes, loading, totalEmprestimos, fetchClientes, deletarCliente, API } = useClientes();
  const [search, setSearch] = useState("");

  const filtrados = clientes.filter(c => {
    const termo = search.toLowerCase();
    return (
      c.nome.toLowerCase().includes(termo) || 
      (c.nomeIndicador && c.nomeIndicador.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="flex min-h-screen bg-muted/40">
      <main className="flex-1 p-10 space-y-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold italic">Clientes</h1>
          <div className="flex gap-4">
            <Input 
              placeholder="Pesquisar..." 
              className="w-64 bg-white" 
              onChange={e => setSearch(e.target.value)} 
            />
            <ModalCadastro onSuccess={fetchClientes} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard label="Total de Clientes" value={clientes.length} />
          <StatCard label="Total de Empréstimos" value={totalEmprestimos} />
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
                  <TableRow>
                    <TableCell colSpan={3}>Carregando...</TableCell>
                  </TableRow>
                ) : (
                  filtrados.map(cliente => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{cliente.nomeIndicador}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <ModalRelatorio clienteId={cliente.id} API={API} />
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => deletarCliente(cliente.id)}
                        >
                          Deletar
                        </Button>
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