import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FiBarChart2,
  FiDollarSign,
  FiCheckCircle,
  FiTrendingUp,
  FiLayers,
} from "react-icons/fi";

import { buscarRelatorioCliente } from "@/services/relatorio.service";
import { formatCurrency } from "@/utils/format";
import { StatSmallCard, type CardVariant } from "@/components/StatSmallCard";
import type { Relatorio } from "@/types";

interface Props {
  clienteId: number;
  API: string;
}

interface CardItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant: CardVariant;
  span?: boolean;
}

export function ModalRelatorio({ clienteId, API }: Props) {
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);

  async function handleBuscar() {
    try {
      setLoading(true);
      const data = await buscarRelatorioCliente(API, clienteId);
      setRelatorio(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const cards: CardItem[] = relatorio
  ? [
      {
        label: "Total Contratado",
        value: formatCurrency(relatorio.totalEmprestado),
        icon: <FiLayers />,
        variant: "neutral",
      },
      {
        label: "Total Recebido",
        value: formatCurrency(relatorio.totalPago),
        icon: <FiCheckCircle />,
        variant: "success",
      },
      {
        label: "Saldo Devedor",
        value: formatCurrency(relatorio.totalAberto),
        icon: <FiDollarSign />,
        variant: "danger",
        span: true,
      },
      {
        label: "Total de Empréstimos",
        value: relatorio.totalEmprestimos,
        icon: <FiBarChart2 />,
        variant: "neutral",
      },
      {
        label: "Total de Parcelas",
        value: relatorio.totalParcelas,
        icon: <FiLayers />,
        variant: "neutral",
      },
      {
        label: "Parcelas Pagas",
        value: relatorio.parcelasPagas,
        icon: <FiCheckCircle />,
        variant: "success",
      },
      {
        label: "Parcelas a Vencer",
        value: relatorio.parcelasAVencer,
        icon: <FiLayers />,
        variant: "neutral",
      },
      {
        label: "Parcelas em Atraso",
        value: relatorio.parcelasAtrasadas,
        icon: <FiDollarSign />,
        variant:
          relatorio.parcelasAtrasadas > 0 ? "danger" : "neutral",
        span: true,
      },
    ]
  : [];

  return (
    <Dialog onOpenChange={(o) => o && handleBuscar()}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <FiBarChart2 /> Relatório
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FiTrendingUp /> Resumo Financeiro
          </DialogTitle>
          <DialogDescription>
            Acompanhamento financeiro do cliente.
          </DialogDescription>
        </DialogHeader>

        {loading && <div className="pt-4">Carregando...</div>}

        {!loading && relatorio && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {cards.map((card, i) => (
              <StatSmallCard
                key={i}
                {...card}
                className={card.span ? "sm:col-span-2" : ""}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}