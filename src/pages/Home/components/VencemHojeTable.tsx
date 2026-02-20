import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Parcela {
  id: string;
  cliente_nome: string;
  valor: number;
  status: "PENDENTE" | "PAGO" | "ATRASADO";
}

interface Props {
  parcelas: Parcela[];
  onPagar: (id: string) => void;
}

export function VencemHojeTable({ parcelas, onPagar }: Props) {
  return (
    <Card className="mt-8 rounded-2xl shadow-sm">
      <CardContent className="p-8">
        <h3 className="text-2xl font-semibold mb-6">
          Vencem Hoje
        </h3>

        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Cliente</TableHead>
              <TableHead className="w-1/4">Valor</TableHead>
              <TableHead className="w-1/4">Status</TableHead>
              <TableHead className="w-1/4 text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {parcelas.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Nenhuma parcela vencendo hoje
                </TableCell>
              </TableRow>
            )}

            {parcelas.map((parcela) => (
              <TableRow key={parcela.id}>
                <TableCell className="font-medium">
                  {parcela.cliente_nome}
                </TableCell>

                <TableCell>
                  {parcela.valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>

                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      parcela.status === "PAGO"
                        ? "bg-green-100 text-green-700"
                        : parcela.status === "ATRASADO"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {parcela.status}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  {parcela.status !== "PAGO" && (
                    <Button
                      size="sm"
                      onClick={() => onPagar(parcela.id)}
                    >
                      Marcar como Pago
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}