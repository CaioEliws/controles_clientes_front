// import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PeriodType = "3" | "6" | "12" | "all";

interface Props {
  period: PeriodType;
  setPeriod: React.Dispatch<React.SetStateAction<PeriodType>>;
}

export function DashboardHeader({ period, setPeriod }: Props) {
  return (
    <div className="flex items-center justify-between">
      
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Visão geral financeira
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* <Input
          placeholder="Buscar cliente..."
          className="w-64"
        /> */}

        <Select 
          value={period} 
          onValueChange={(value) =>
          setPeriod(value as PeriodType)
        }>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Últimos 12 meses</SelectItem>
            <SelectItem value="all">Todo o período</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}