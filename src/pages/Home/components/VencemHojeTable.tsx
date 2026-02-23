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

import type { ParcelaTable } from "@/mappers/parcela.mapper";

interface Props {
  parcelas: ParcelaTable[];
  onPagar: (
    idEmprestimo: number,
    numeroParcela: number
  ) => void;
}

export function VencemHojeTable({
  parcelas,
  onPagar,
}: Props) {
  return (
    <Card className="mt-8 rounded-2xl shadow-sm">
      <CardContent className="p-8">
        <h3 className="text-2xl font-semibold mb-6">
          Vencem Hoje
        </h3>

        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">
                Ação
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {parcelas.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  Nenhuma parcela vencendo hoje
                </TableCell>
              </TableRow>
            )}

            {parcelas.map((parcela) => (
              <TableRow
                key={`${parcela.idEmprestimo}-${parcela.numeroParcela}`}
              >
                <TableCell className="font-medium">
                  {parcela.cliente}
                </TableCell>

                <TableCell>
                  {parcela.valor.toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    }
                  )}
                </TableCell>

                <TableCell>
                  {new Date(
                    parcela.dataVencimento
                  ).toLocaleDateString("pt-BR")}
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() =>
                      onPagar(
                        parcela.idEmprestimo,
                        parcela.numeroParcela
                      )
                    }
                  >
                    Marcar como Pago
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}