import { apiClient } from "./apiClient";
import type { SexoDocumento } from "@/types";

export interface OpcoesDocumento {
  ufs: { codigo: string; descricao: string }[];
  sexos: { codigo: SexoDocumento; descricao: string; nacionalidade: string }[];
}
let consulta: Promise<OpcoesDocumento> | undefined;
export const opcoesDocumentoService = {
  get: () => consulta ??= apiClient.get<OpcoesDocumento>("/documentos/opcoes-cadastro").catch((error: unknown) => {
    consulta = undefined;
    throw error;
  }),
};
