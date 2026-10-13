import { Button } from "@/components/ui/button";

export function PdfAssinadoButton({ disponivel, disabled, baixando, onClick }: {
  disponivel: boolean; disabled: boolean; baixando: boolean; onClick: () => void;
}) {
  return <Button type="button" variant="outline" disabled={disabled || !disponivel} onClick={onClick}
    title={disponivel ? "PDF com assinatura do credor e da testemunha. Devedor e fiador permanecem em branco." : "PDF com assinaturas indisponível para este contrato antigo."}>
    {baixando ? "Baixando PDF..." : "PDF com assinaturas"}
  </Button>;
}
