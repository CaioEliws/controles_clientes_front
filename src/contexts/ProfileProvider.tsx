import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { apiClient } from "@/services/apiClient";
import { ProfileContext, type Perfil, type PerfilUpdatePayload } from "./profileContextState";

const PERFIL_STORAGE_KEY = "perfil_ativo_id";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [perfilAtivo, setPerfilAtivoState] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(false);
  const ativoIdRef = useRef<number | null>(null);

  const setPerfilAtivo = useCallback((perfil: Perfil | null) => {
    ativoIdRef.current = perfil?.id ?? null;
    setPerfilAtivoState(perfil);

    if (perfil) {
      localStorage.setItem(PERFIL_STORAGE_KEY, String(perfil.id));
    } else {
      localStorage.removeItem(PERFIL_STORAGE_KEY);
    }
  }, []);

  const carregarPerfis = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiClient.get<Perfil[] | { perfis?: Perfil[]; data?: Perfil[] }>("/perfis");

      const lista = Array.isArray(response)
        ? response
        : Array.isArray(response?.perfis)
        ? response.perfis
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setPerfis(lista);

      const perfilSalvoId = localStorage.getItem(PERFIL_STORAGE_KEY);

      if (perfilSalvoId) {
        const perfilEncontrado = lista.find(
          (perfil) => perfil.id === Number(perfilSalvoId)
        );

        if (perfilEncontrado) {
          ativoIdRef.current = perfilEncontrado.id;
          setPerfilAtivoState(perfilEncontrado);
          return;
        }
      }

      if (lista.length > 0) {
        setPerfilAtivo(lista[0]);
      } else {
        setPerfilAtivo(null);
      }
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
      setPerfis([]);
      setPerfilAtivo(null);
    } finally {
      setLoading(false);
    }
  }, [setPerfilAtivo]);

  const criarPerfil = useCallback(async (nome: string) => {
    try {
      setLoading(true);

      const novoPerfil = await apiClient.post<Perfil, { nome: string }>("/perfis", {
        nome,
      });

      setPerfis((lista) => [...lista, novoPerfil]);
      setPerfilAtivo(novoPerfil);
    } catch (error) {
      console.error("Erro ao criar perfil:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setPerfilAtivo]);

  const aplicarDadosPerfil = useCallback((perfil: Perfil) => {
    setPerfis((lista) => lista.map((item) => item.id === perfil.id ? { ...item, ...perfil } : item));
    if (ativoIdRef.current === perfil.id) {
      setPerfilAtivoState((atual) => atual?.id === perfil.id ? { ...atual, ...perfil } : atual);
    }
  }, []);

  const carregarPerfilDetalhado = useCallback(async (id: number) => {
    if (ativoIdRef.current !== id) throw new Error("Selecione o perfil antes de consultar seus dados.");
    const perfil = await apiClient.get<Perfil>(`/perfis/${id}`);
    if (ativoIdRef.current === id) aplicarDadosPerfil(perfil);
    return perfil;
  }, [aplicarDadosPerfil]);

  const atualizarPerfil = useCallback(async (id: number, payload: PerfilUpdatePayload) => {
    if (ativoIdRef.current !== id) throw new Error("O perfil ativo mudou. Abra os dados do perfil atual.");
    const perfil = await apiClient.put<Perfil, PerfilUpdatePayload>(`/perfis/${id}`, payload);
    aplicarDadosPerfil(perfil);
    return perfil;
  }, [aplicarDadosPerfil]);

  useEffect(() => {
    void carregarPerfis();
  }, [carregarPerfis]);

  const value = useMemo(
    () => ({
      perfis,
      perfilAtivo,
      setPerfilAtivo,
      carregarPerfis,
      criarPerfil,
      carregarPerfilDetalhado,
      atualizarPerfil,
      loading,
    }),
    [perfis, perfilAtivo, loading, setPerfilAtivo, carregarPerfis, criarPerfil, carregarPerfilDetalhado, atualizarPerfil]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

