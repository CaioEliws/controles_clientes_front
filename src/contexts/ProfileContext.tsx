import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiClient } from "@/services/apiClient";

export interface Perfil {
  id: number;
  nome: string;
  dataCriacao?: string;
}

interface ProfileContextType {
  perfis: Perfil[];
  perfilAtivo: Perfil | null;
  setPerfilAtivo: (perfil: Perfil | null) => void;
  carregarPerfis: () => Promise<void>;
  criarPerfil: (nome: string) => Promise<void>;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PERFIL_STORAGE_KEY = "perfil_ativo_id";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [perfilAtivo, setPerfilAtivoState] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(false);

  function setPerfilAtivo(perfil: Perfil | null) {
    setPerfilAtivoState(perfil);

    if (perfil) {
      localStorage.setItem(PERFIL_STORAGE_KEY, String(perfil.id));
    } else {
      localStorage.removeItem(PERFIL_STORAGE_KEY);
    }
  }

  async function carregarPerfis() {
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
  }

  async function criarPerfil(nome: string) {
    try {
      setLoading(true);

      const novoPerfil = await apiClient.post<Perfil, { nome: string }>("/perfis", {
        nome,
      });

      const novaLista = [...perfis, novoPerfil];
      setPerfis(novaLista);
      setPerfilAtivo(novoPerfil);
    } catch (error) {
      console.error("Erro ao criar perfil:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregarPerfis();
  }, []);

  const value = useMemo(
    () => ({
      perfis,
      perfilAtivo,
      setPerfilAtivo,
      carregarPerfis,
      criarPerfil,
      loading,
    }),
    [perfis, perfilAtivo, loading]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile deve ser usado dentro de ProfileProvider");
  }

  return context;
}