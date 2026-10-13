import { createContext } from "react";
import type { DadosPessoais } from "@/types";

export interface Perfil extends DadosPessoais {
  id: number;
  nome: string;
  nomeCompleto?: string | null;
  dataCriacao?: string;
}

export interface PerfilUpdatePayload extends DadosPessoais {
  nome: string;
  nomeCompleto: string | null;
}

interface ProfileContextType {
  perfis: Perfil[];
  perfilAtivo: Perfil | null;
  setPerfilAtivo: (perfil: Perfil | null) => void;
  carregarPerfis: () => Promise<void>;
  criarPerfil: (nome: string) => Promise<void>;
  carregarPerfilDetalhado: (id: number) => Promise<Perfil>;
  atualizarPerfil: (id: number, payload: PerfilUpdatePayload) => Promise<Perfil>;
  loading: boolean;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

