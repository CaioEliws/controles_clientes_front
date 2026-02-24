import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSimulacaoEmprestimo } from "@/hooks/useSimulacao";

export function SimulacaoEmprestimo() {
  const {
    valor,
    juros,
    parcelas,
    setValor,
    setJuros,
    setParcelas,
    simulacao,
  } = useSimulacaoEmprestimo();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-6">
      <div className="w-full max-w-3xl">

        <Card className="shadow-xl border-0 rounded-3xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Simulação de Empréstimo (Tabela Price)
            </CardTitle>
            <p className="text-sm text-slate-500">
              Cálculo de financiamento de empréstimo.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* CAMPOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Valor do Empréstimo
                </label>
                <Input
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Juros Mensal (%)
                </label>
                <Input
                  type="number"
                  value={juros}
                  onChange={(e) => setJuros(e.target.value)}
                  className="h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Parcelas
                </label>
                <Input
                  type="number"
                  value={parcelas}
                  onChange={(e) => setParcelas(e.target.value)}
                  className="h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>

            </div>

            {simulacao && (
              <div className="space-y-6">

                {/* RESUMO */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3 shadow-sm">

                  <div className="flex justify-between">
                    <span>Valor da Parcela</span>
                    <span className="font-bold text-blue-700">
                      R$ {simulacao.valorParcela.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total á pagar</span>
                    <span className="font-semibold">
                      R$ {simulacao.totalPago.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total de Juros</span>
                    <span className="font-semibold">
                      R$ {simulacao.totalJuros.toFixed(2)}
                    </span>
                  </div>

                </div>

                {/* TABELA */}
                <div className="max-h-64 overflow-y-auto border rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">Parcela</th>
                        <th className="p-2 text-left">Juros</th>
                        <th className="p-2 text-left">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulacao.listaParcelas.map((p) => (
                        <tr key={p.numero} className="border-t">
                          <td className="p-2">{p.numero}</td>
                          <td className="p-2">R$ {p.valorParcela.toFixed(2)}</td>
                          <td className="p-2">R$ {p.jurosParcela.toFixed(2)}</td>
                          <td className="p-2">R$ {p.saldoDevedor.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}