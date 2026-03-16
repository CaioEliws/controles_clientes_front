import { useState } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { Settings, UserRound, Plus, CheckCircle2, Shield } from "lucide-react";

export function Configuracoes() {
  const {
    perfis,
    perfilAtivo,
    setPerfilAtivo,
    criarPerfil,
    loading,
  } = useProfile();

  const [novoPerfil, setNovoPerfil] = useState("");
  const [criando, setCriando] = useState(false);

  async function handleCriarPerfil() {
    const nome = novoPerfil.trim();
    if (!nome) return;

    try {
      setCriando(true);
      await criarPerfil(nome);
      setNovoPerfil("");
    } catch {
      alert("Não foi possível criar o perfil.");
    } finally {
      setCriando(false);
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-white p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white md:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Settings className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Configurações
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  Gerencie o perfil ativo do sistema e crie novos ambientes para
                  separar seus dados com segurança e organização.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white/5 px-4 py-4 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Perfil ativo
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {perfilAtivo?.nome ?? "Nenhum perfil"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 px-4 py-4 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Perfis cadastrados
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {perfis.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 px-4 py-4 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Status
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {loading ? "Carregando..." : "Pronto"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Shield className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Perfil ativo
                </h2>
                <p className="text-sm leading-6 text-slate-500">
                  O perfil selecionado será usado em todo o sistema para listar,
                  criar e gerenciar clientes, empréstimos e parcelas.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Selecionar perfil
                </label>

                <select
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  value={perfilAtivo?.id ?? ""}
                  onChange={(e) => {
                    const perfil = perfis.find(
                      (p) => p.id === Number(e.target.value)
                    );
                    setPerfilAtivo(perfil ?? null);
                  }}
                  disabled={loading}
                >
                  <option value="">Selecione um perfil</option>
                  {perfis.map((perfil) => (
                    <option key={perfil.id} value={perfil.id}>
                      {perfil.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      Perfil em uso
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {perfilAtivo?.nome ?? "Nenhum perfil selecionado"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Todas as ações feitas no sistema serão vinculadas a este
                      perfil enquanto ele estiver selecionado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-700">
                  Perfis disponíveis
                </p>

                <div className="mt-4 space-y-3">
                  {perfis.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                      Nenhum perfil cadastrado ainda.
                    </div>
                  ) : (
                    perfis.map((perfil) => {
                      const ativo = perfilAtivo?.id === perfil.id;

                      return (
                        <button
                          key={perfil.id}
                          type="button"
                          onClick={() => setPerfilAtivo(perfil)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                            ativo
                              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                ativo
                                  ? "bg-white/10 text-white"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              <UserRound className="h-5 w-5" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold">
                                {perfil.nome}
                              </p>
                              <p
                                className={`text-xs ${
                                  ativo
                                    ? "text-slate-300"
                                    : "text-slate-500"
                                }`}
                              >
                                {ativo ? "Perfil ativo" : "Clique para ativar"}
                              </p>
                            </div>
                          </div>

                          {ativo && (
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                              Ativo
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Plus className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Criar novo perfil
                </h2>
                <p className="text-sm leading-6 text-slate-500">
                  Crie um novo perfil para separar clientes, empréstimos,
                  parcelas e relatórios em um ambiente independente.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nome do perfil
                </label>

                <input
                  type="text"
                  value={novoPerfil}
                  onChange={(e) => setNovoPerfil(e.target.value)}
                  placeholder="Ex: Perfil Caio, Financeiro, Testes..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <button
                type="button"
                onClick={handleCriarPerfil}
                disabled={criando || loading || !novoPerfil.trim()}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {criando ? "Criando..." : "Criar perfil"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}