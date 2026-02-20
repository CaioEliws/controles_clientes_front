import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Parcela {
  cliente: string;
  diasAtraso: number;
  valor: number;
}

interface Props {
  parcelas: Parcela[];
}

export function AtrasadasTable({ parcelas }: Props) {
  return (
    <Card className="mt-8 rounded-2xl shadow-sm">
      <CardContent className="p-8">
        <h3 className="text-2xl font-semibold text-red-600 mb-6">
          Parcelas Atrasadas
        </h3>

        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Cliente</TableHead>
              <TableHead className="w-1/4 text-center">Dias</TableHead>
              <TableHead className="w-1/4 text-center">Valor</TableHead>
              <TableHead className="w-1/4 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {parcelas.map((parcela, index) => (
              <TableRow key={index} >
                <TableCell className="font-medium">
                  {parcela.cliente}
                </TableCell>

                <TableCell className="text-center">
                  {parcela.diasAtraso}
                </TableCell>

                <TableCell className="text-center">
                  {parcela.valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>

                <TableCell className="text-right">
                  <Badge variant="destructive">
                    ATRASADO
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
