import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmText: string;
  cancelText?: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmText,
  cancelText = "Cancelar",
  loading,
  onOpenChange,
  onConfirm,
}: Props) {
  const [erro, setErro] = useState<string | null>(null);
  async function confirmar() {
    setErro(null);
    try { await onConfirm(); } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível concluir a operação."); }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => { setErro(null); onOpenChange(false); }}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button type="button" onClick={confirmar} disabled={loading}>
            {loading ? "Processando..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}