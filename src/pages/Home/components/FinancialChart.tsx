import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Point = {
  key: string;
  year: number;
  label: string;
  recebido: number;
};

interface Props {
  data: Point[];
  loading?: boolean;
}

type Size = {
  width: number;
  height: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const p = payload[0].payload as {
    label: string;
    valueLabel: string;
  };

  return (
    <div className="space-y-1 rounded-xl border bg-background p-4 shadow-md">
      <p className="text-sm text-muted-foreground">{p.label}</p>
      <p className="text-lg font-semibold text-foreground">{p.valueLabel}</p>
    </div>
  );
}

const formatCurrency = (value: number) =>
  (value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatCompact = (value: number) =>
  (value ?? 0).toLocaleString("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

export function FinancialChart({ data, loading = false }: Props) {
  const [yearFilter, setYearFilter] = useState<number | "ALL">("ALL");
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const chartRef = useCallback((node: HTMLDivElement | null) => {
    setContainer(node);
  }, []);

  useEffect(() => {
    if (!container) {
      setSize({ width: 0, height: 0 });
      return;
    }

    const updateSize = () => {
      const rect = container.getBoundingClientRect();

      setSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(container);
    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [container]);

  const years = useMemo(() => {
    return Array.from(new Set((data ?? []).map((p) => p.year))).sort(
      (a, b) => a - b
    );
  }, [data]);

  const yearlyData = useMemo(() => {
    const grouped = new Map<number, number>();

    for (const p of data ?? []) {
      grouped.set(p.year, (grouped.get(p.year) ?? 0) + p.recebido);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, recebido]) => ({
        label: String(year),
        recebido,
        valueLabel: formatCurrency(recebido),
      }));
  }, [data]);

  const monthlyData = useMemo(() => {
    const filtered = (data ?? [])
      .filter((p) => p.year === yearFilter)
      .sort((a, b) => a.key.localeCompare(b.key));

    return filtered.map((p) => ({
      label: p.label,
      recebido: p.recebido,
      valueLabel: formatCurrency(p.recebido),
    }));
  }, [data, yearFilter]);

  const chartData = yearFilter === "ALL" ? yearlyData : monthlyData;
  const chartReady = size.width > 0 && size.height > 0;

  return (
    <Card className="w-full min-w-0 rounded-2xl border shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex min-w-0 items-start justify-between gap-6">
          <div className="min-w-0">
            <CardTitle className="text-xl">Recebimentos</CardTitle>
            <CardDescription>
              {yearFilter === "ALL" ? "Total por ano" : `Mensal em ${yearFilter}`}
            </CardDescription>
          </div>

          {loading ? (
            <Skeleton className="h-10 w-44 shrink-0" />
          ) : (
            <select
              className="h-10 shrink-0 rounded-xl border bg-white px-3 text-sm shadow-sm outline-none"
              value={yearFilter === "ALL" ? "ALL" : String(yearFilter)}
              onChange={(e) =>
                setYearFilter(
                  e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                )
              }
            >
              <option value="ALL">Todos os anos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </CardHeader>

      <CardContent className="min-w-0">
        <div ref={chartRef} className="h-96 w-full min-w-0">
          {loading ? (
            <div className="h-full w-full space-y-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-[calc(100%-2rem)] w-full rounded-xl" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
              Nenhum dado para este filtro.
            </div>
          ) : !chartReady ? (
            <div className="flex h-full w-full items-center justify-center">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          ) : (
            <BarChart
              width={size.width}
              height={size.height}
              data={chartData}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />

              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="recebido" radius={[10, 10, 0, 0]} />
            </BarChart>
          )}
        </div>
      </CardContent>
    </Card>
  );
}