import { useState } from "react";
import { useProfile } from "@/contexts/ProfileContext";

export function ProfileSwitcher() {
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
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Perfil ativo
        </p>
        <p className="text-sm font-semibold">
          {perfilAtivo?.nome ?? "Nenhum perfil selecionado"}
        </p>
      </div>

      <select
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        value={perfilAtivo?.id ?? ""}
        onChange={(e) => {
          const perfil = perfis.find((p) => p.id === Number(e.target.value));
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

      <div className="space-y-2">
        <input
          type="text"
          value={novoPerfil}
          onChange={(e) => setNovoPerfil(e.target.value)}
          placeholder="Novo perfil"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />

        <button
          type="button"
          onClick={handleCriarPerfil}
          disabled={criando || loading || !novoPerfil.trim()}
          className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {criando ? "Criando..." : "Criar perfil"}
        </button>
      </div>
    </div>
  );
}