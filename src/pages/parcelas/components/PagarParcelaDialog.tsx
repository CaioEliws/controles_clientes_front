import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/services/apiClient";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idEmprestimo: number;
  numeroParcela: number;
  valorParcela: number;
  onSuccess: () => Promise<void>;
};

export function PagarParcelaDialog({
  open,
  onOpenChange,
  idEmprestimo,
  numeroParcela,
  valorParcela,
  onSuccess,
}: Props) {
  const [valorDigitado, setValorDigitado] = useState<number>(valorParcela);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValorDigitado(valorParcela);
      setErro(null);
    }
  }, [open, valorParcela]);

  const pagamentoTotal =
    Math.abs(valorDigitado - valorParcela) < 0.01;

  const invalido =
    !valorDigitado ||
    valorDigitado <= 0 ||
    valorDigitado > valorParcela + 0.01;

  async function handlePagamento() {
    if (invalido) return;

    try {
      setLoading(true);

      if (pagamentoTotal) {
        await apiClient.post("/parcelas/pagar", {
          idEmprestimo,
          numeroParcela,
        });
      } else {
        await apiClient.post("/parcelas/pagar-parcial", {
          idEmprestimo,
          numeroParcela,
          valorPago: valorDigitado,
        });
      }

      await onSuccess();
      onOpenChange(false);

    } catch (error) {
      setErro("Erro ao processar pagamento.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white border-none">
        <DialogHeader>
          <DialogTitle>
            Pagar Parcela #{numeroParcela}
          </DialogTitle>
          <DialogDescription>
            Quanto o cliente está pagando deste saldo?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
              Saldo Devedor
            </p>
            <p className="text-2xl font-black text-slate-900">
              {valorParcela.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Valor a Abater
            </label>

            <Input
              type="number"
              step="0.01"
              value={valorDigitado}
              onChange={(e) => {
                const val = Number(e.target.value);
                setValorDigitado(val);
                setErro(
                  val > valorParcela
                    ? "Valor excede o saldo!"
                    : null
                );
              }}
              className="text-lg font-bold"
            />

            {erro && (
              <p className="text-xs text-red-600 font-bold">
                {erro}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>

          <Button
            onClick={handlePagamento}
            disabled={loading || invalido}
          >
            {loading ? "Processando..." : "Confirmar Pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}