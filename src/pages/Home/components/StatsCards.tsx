import { Card, CardContent } from "@/components/ui/card";

interface Props {
  totalEmprestado: number;
  totalRecebido: number;
  totalAberto: number;
  totalAtraso: number;
}

export function StatsCards({
  totalEmprestado,
  totalRecebido,
  totalAberto,
  totalAtraso,
}: Props) {
  const format = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-sm mb-2">
            Total Emprestado
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            {format(totalEmprestado)}
          </h2>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-sm mb-2">
            Total Recebido
          </p>
          <h2 className="text-3xl font-bold text-green-600">
            {format(totalRecebido)}
          </h2>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-sm mb-2">
            Em Aberto
          </p>
          <h2 className="text-3xl font-bold text-yellow-600">
            {format(totalAberto)}
          </h2>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-sm mb-2">
            Em Atraso
          </p>
          <h2 className="text-3xl font-bold text-red-600">
            {format(totalAtraso)}
          </h2>
        </CardContent>
      </Card>
    </div>
  );
}