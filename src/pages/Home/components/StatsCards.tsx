import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  totalEmprestado: number;
  totalRecebido: number;
  totalAberto: number;
  totalAtraso: number;
  loading?: boolean;
}

export function StatsCards({
  totalEmprestado,
  totalRecebido,
  totalAberto,
  totalAtraso,
  loading = false,
}: Props) {
  const format = (value: number) =>
    (value ?? 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-sm">
            <CardContent className="p-8 space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-44" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-sm mb-2">Total Emprestado</p>
          <h2 className="text-3xl font-bold tracking-tight">
            {format(totalEmprestado)}
          </h2>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-sm mb-2">Total Recebido</p>
          <h2 className="text-3xl font-bold text-green-600">
            {format(totalRecebido)}
          </h2>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-sm mb-2">Em Aberto</p>
          <h2 className="text-3xl font-bold text-yellow-600">
            {format(totalAberto)}
          </h2>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-sm mb-2">Em Atraso</p>
          <h2 className="text-3xl font-bold text-red-600">
            {format(totalAtraso)}
          </h2>
        </CardContent>
      </Card>
    </div>
  );
}