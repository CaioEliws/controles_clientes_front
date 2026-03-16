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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAlterarParcela } from "@/hooks/useAlterarParcela";
import { useEffect, useRef, useState } from "react";
import { formatCurrency, parseCurrency } from "@/utils/format";
import type { ParcelaObservacao } from "@/types/parcela-observacao";
import { parcelaObservacaoService } from "@/services/parcelas/parcela-observacao.service";

const schema = z.object({
  novaData: z.string().min(1, "Data obrigatória"),
  novoValor: z
    .string()
    .min(1, "Valor obrigatório")
    .refine(
      (value) => parseCurrency(value) > 0,
      "Valor deve ser maior que zero"
    ),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idEmprestimo: number;
  numeroParcela: number;
  dataAtual: string;
  valorAtual: number;
  onSuccess?: () => Promise<void> | void;
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

export function AlterarParcelaDialog({
  open,
  onOpenChange,
  idEmprestimo,
  numeroParcela,
  dataAtual,
  valorAtual,
  onSuccess,
}: Props) {
  const { alterarParcela, loading } = useAlterarParcela();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [observacoes, setObservacoes] = useState<ParcelaObservacao[]>([]);
  const [loadingObservacoes, setLoadingObservacoes] = useState(false);

  const [novaObservacao, setNovaObservacao] = useState("");
  const [salvandoObservacao, setSalvandoObservacao] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEdicao, setTextoEdicao] = useState("");
  const [acaoObservacaoId, setAcaoObservacaoId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      novaData: dataAtual,
      novoValor: formatCurrency(valorAtual),
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        novaData: dataAtual,
        novoValor: formatCurrency(valorAtual),
      });
      void carregarObservacoes();
    }
  }, [open, dataAtual, valorAtual, reset, idEmprestimo, numeroParcela]);

  const { ref: registerDataRef, ...restDataRegister } = register("novaData");
  const valorRegistrado = register("novoValor");
  // eslint-disable-next-line react-hooks/incompatible-library
  const valorAtualInput = watch("novoValor");

  async function carregarObservacoes() {
    try {
      setLoadingObservacoes(true);
      const lista = await parcelaObservacaoService.listar(
        idEmprestimo,
        numeroParcela
      );
      setObservacoes(lista);
    } catch {
      setObservacoes([]);
    } finally {
      setLoadingObservacoes(false);
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      await alterarParcela(
        idEmprestimo,
        numeroParcela,
        data.novaData,
        parseCurrency(data.novoValor)
      );

      await onSuccess?.();
      onOpenChange(false);
    } catch {
      // erro já tratado no hook
    }
  };

  async function handleCriarObservacao() {
    const texto = novaObservacao.trim();
    if (!texto) return;

    try {
      setSalvandoObservacao(true);

      await parcelaObservacaoService.criar({
        idEmprestimo,
        numeroParcela,
        observacao: texto,
      });

      setNovaObservacao("");
      await carregarObservacoes();
      await onSuccess?.();
    } catch {
      // trate com toast se quiser
    } finally {
      setSalvandoObservacao(false);
    }
  }

  async function handleSalvarEdicao(idObservacao: number) {
    const texto = textoEdicao.trim();
    if (!texto) return;

    try {
      setAcaoObservacaoId(idObservacao);

      await parcelaObservacaoService.editar({
        idObservacao,
        observacao: texto,
      });

      setEditandoId(null);
      setTextoEdicao("");
      await carregarObservacoes();
      await onSuccess?.();
    } catch {
      // trate com toast se quiser
    } finally {
      setAcaoObservacaoId(null);
    }
  }

  async function handleExcluirObservacao(idObservacao: number) {
    try {
      setAcaoObservacaoId(idObservacao);

      await parcelaObservacaoService.excluir(idObservacao);

      if (editandoId === idObservacao) {
        setEditandoId(null);
        setTextoEdicao("");
      }

      await carregarObservacoes();
      await onSuccess?.();
    } catch {
      // trate com toast se quiser
    } finally {
      setAcaoObservacaoId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl rounded-2xl border-none bg-white">
        <DialogHeader>
          <DialogTitle>Alterar Parcela #{numeroParcela}</DialogTitle>
          <DialogDescription>
            Escolha a nova data de vencimento, o novo valor da parcela e adicione
            observações se necessário.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Nova Data
            </label>

            <div className="relative">
              <Input
                type="date"
                {...restDataRegister}
                ref={(el) => {
                  registerDataRef(el);
                  inputRef.current = el;
                }}
                className="pr-12 text-lg font-medium [&::-webkit-calendar-picker-indicator]:opacity-0"
              />

              <button
                type="button"
                onClick={() =>
                  (
                    inputRef.current as
                      | (HTMLInputElement & { showPicker?: () => void })
                      | null
                  )?.showPicker?.()
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                📅
              </button>
            </div>

            {errors.novaData && (
              <p className="text-xs font-bold text-red-600">
                {errors.novaData.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Novo Valor
            </label>

            <Input
              type="text"
              inputMode="numeric"
              value={valorAtualInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                const numericValue = Number(raw) / 100;

                setValue("novoValor", formatCurrency(numericValue), {
                  shouldValidate: true,
                });
              }}
              onBlur={valorRegistrado.onBlur}
              name={valorRegistrado.name}
              ref={valorRegistrado.ref}
              className="text-lg font-medium"
            />

            {errors.novoValor && (
              <p className="text-xs font-bold text-red-600">
                {errors.novoValor.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="ghost"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>

        <div className="mt-2 border-t pt-6">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-800">
              Observações
            </h3>
            <p className="text-sm text-slate-500">
              Adicione acordos, anotações e alterações combinadas com o cliente.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Ex: Cliente pediu para mudar a data de pagamento para o dia 20/03."
              value={novaObservacao}
              onChange={(e) => setNovaObservacao(e.target.value)}
              rows={4}
            />

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={!novaObservacao.trim() || salvandoObservacao}
                onClick={handleCriarObservacao}
              >
                {salvandoObservacao ? "Adicionando..." : "Adicionar observação"}
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {loadingObservacoes ? (
              <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
                Carregando observações...
              </div>
            ) : observacoes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Nenhuma observação cadastrada para esta parcela.
              </div>
            ) : (
              observacoes.map((obs) => {
                const emEdicao = editandoId === obs.id;
                const carregandoAcao = acaoObservacaoId === obs.id;

                return (
                  <div
                    key={obs.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Criado em {formatDateTime(obs.dataCriacao)}
                        </p>
                        <p className="text-xs text-slate-400">
                          Atualizado em {formatDateTime(obs.dataAtualizacao)}
                        </p>
                      </div>

                      {!emEdicao && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={carregandoAcao}
                            onClick={() => {
                              setEditandoId(obs.id);
                              setTextoEdicao(obs.observacao);
                            }}
                          >
                            Editar
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={carregandoAcao}
                            onClick={() => handleExcluirObservacao(obs.id)}
                          >
                            Excluir
                          </Button>
                        </div>
                      )}
                    </div>

                    {emEdicao ? (
                      <div className="space-y-3">
                        <Textarea
                          rows={4}
                          value={textoEdicao}
                          onChange={(e) => setTextoEdicao(e.target.value)}
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setEditandoId(null);
                              setTextoEdicao("");
                            }}
                          >
                            Cancelar
                          </Button>

                          <Button
                            type="button"
                            disabled={!textoEdicao.trim() || carregandoAcao}
                            onClick={() => handleSalvarEdicao(obs.id)}
                          >
                            {carregandoAcao ? "Salvando..." : "Salvar edição"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {obs.observacao}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}