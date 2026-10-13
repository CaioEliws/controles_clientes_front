import { apiClient } from "./apiClient";
import type { DadosContrato } from "@/types";

export interface ContratoGeradoMetadados {
  id: number;
  emprestimoId: number;
  versaoTemplate: string;
  dataGeracao: string;
  nomeArquivo: string;
  hashDocumento: string;
  pdfDisponivel: boolean;
  pdfAssinadoDisponivel: boolean;
}

export interface ContratoPrevia {
  validoParaGeracao: boolean;
  dados: DadosContrato;
  testemunha: { nome: string; cpf: string; rg: string };
}

const rota = (clienteId: number, emprestimoId: number) =>
  `/clientes/${clienteId}/emprestimos/${emprestimoId}`;

export const contratoService = {
  getPrevia: (clienteId: number, emprestimoId: number) =>
    apiClient.get<ContratoPrevia>(`${rota(clienteId, emprestimoId)}/contratos/previa`),
  getDadosContrato: (clienteId: number, emprestimoId: number) =>
    apiClient.get<DadosContrato>(`${rota(clienteId, emprestimoId)}/dados-contrato`),
  gerar: (clienteId: number, emprestimoId: number) =>
    apiClient.post<ContratoGeradoMetadados>(`${rota(clienteId, emprestimoId)}/contratos`, undefined,
      { body: undefined }),
  listar: (clienteId: number, emprestimoId: number) =>
    apiClient.get<ContratoGeradoMetadados[]>(`${rota(clienteId, emprestimoId)}/contratos`),
  excluir: (clienteId: number, emprestimoId: number, contratoId: number) =>
    apiClient.delete<void>(`${rota(clienteId, emprestimoId)}/contratos/${contratoId}`),
  baixarPdfAssinado: (clienteId: number, emprestimoId: number, contratoId: number) =>
    apiClient.getBlob(`${rota(clienteId, emprestimoId)}/contratos/${contratoId}/download-pdf-assinado`, `contrato-${contratoId}-assinado.pdf`),
  baixarPdf: (clienteId: number, emprestimoId: number, contratoId: number) =>
    apiClient.getBlob(`${rota(clienteId, emprestimoId)}/contratos/${contratoId}/download-pdf`, `contrato-${contratoId}.pdf`),
  baixar: (clienteId: number, emprestimoId: number, contratoId: number) =>
    apiClient.getBlob(`${rota(clienteId, emprestimoId)}/contratos/${contratoId}/download`, `contrato-${contratoId}.docx`),
};
