import { useState, useMemo } from "react";
import { useClientes } from "@/hooks/useClients";
import { useEmprestimo } from "@/hooks/useEmprestimo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Emprestimo() {
  const { clientes } = useClientes();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    onSubmit,
  } = useEmprestimo();

  const watchClienteId = watch("clienteId");

  const [clienteBusca, setClienteBusca] = useState("");

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) =>
      c.nome.toLowerCase().includes(clienteBusca.toLowerCase())
    );
  }, [clienteBusca, clientes]);

  const clienteSelecionado = clientes.find(
    (c) => String(c.id) === watchClienteId
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-6">
      <div className="w-full max-w-xl">

        <Card className="shadow-xl border-0 rounded-3xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Novo Empréstimo
            </CardTitle>
            <p className="text-sm text-slate-500">
              Preencha as informações abaixo para criar um novo empréstimo.
            </p>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >

              {/* CLIENTE */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-slate-700">
                  Cliente
                </label>

                {!clienteSelecionado ? (
                  <>
                    <Input
                      placeholder="Digite o nome do cliente..."
                      value={clienteBusca}
                      onChange={(e) =>
                        setClienteBusca(e.target.value)
                      }
                      className="focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                    />

                    {clienteBusca && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto animate-in fade-in-0 zoom-in-95">
                        {clientesFiltrados.length > 0 ? (
                          clientesFiltrados.map((cliente) => (
                            <div
                              key={cliente.id}
                              className="px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                              onClick={() => {
                                setValue("clienteId", String(cliente.id));
                                setClienteBusca("");
                              }}
                            >
                              {cliente.nome}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-slate-400">
                            Nenhum cliente encontrado
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
                    <span className="font-semibold text-blue-700">
                      {clienteSelecionado.nome}
                    </span>

                    <button
                      type="button"
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      onClick={() => {
                        setValue("clienteId", "");
                        setClienteBusca("");
                      }}
                    >
                      Alterar
                    </button>
                  </div>
                )}

                {errors.clienteId && (
                  <p className="text-xs text-red-500">
                    {errors.clienteId.message}
                  </p>
                )}
              </div>

              {/* VALOR */}
              <div className="space-y-1">
                <Input
                  type="number"
                  placeholder="Valor Emprestado"
                  {...register("valorEmprestado")}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                />
                {errors.valorEmprestado && (
                  <p className="text-xs text-red-500">
                    {errors.valorEmprestado.message}
                  </p>
                )}
              </div>

              {/* PARCELAS */}
              <div className="space-y-1">
                <Input
                  type="number"
                  placeholder="Quantidade de Parcelas"
                  {...register("quantidadeParcelas")}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                />
                {errors.quantidadeParcelas && (
                  <p className="text-xs text-red-500">
                    {errors.quantidadeParcelas.message}
                  </p>
                )}
              </div>

              {/* JUROS */}
              <div className="space-y-1">
                <Input
                  type="number"
                  placeholder="Juros (%)"
                  {...register("jurosCobrado")}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                />
                {errors.jurosCobrado && (
                  <p className="text-xs text-red-500">
                    {errors.jurosCobrado.message}
                  </p>
                )}
              </div>

              {/* FORMA PAGAMENTO */}
              <div className="space-y-1">
                <Select
                  onValueChange={(value) =>
                    setValue("formaPagamento", value)
                  }
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="DINHEIRO">DINHEIRO</SelectItem>
                  </SelectContent>
                </Select>

                {errors.formaPagamento && (
                  <p className="text-xs text-red-500">
                    {errors.formaPagamento.message}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting
                    ? "Criando empréstimo..."
                    : "Criar Empréstimo"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}