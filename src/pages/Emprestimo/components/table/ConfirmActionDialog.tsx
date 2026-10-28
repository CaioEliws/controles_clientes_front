import { useRef, useState, type ReactNode } from "react";
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
  destructive?: boolean;
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
  destructive = false,
  onOpenChange,
  onConfirm,
}: Props) {
  const cancelar = useRef<HTMLButtonElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  async function confirmar() {
    setErro(null);
    try { await onConfirm(); } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível concluir a operação."); }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent role="alertdialog" onOpenAutoFocus={event => { event.preventDefault(); cancelar.current?.focus(); }}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {erro && <p role="alert" className="px-5 py-3 text-sm text-red-600 sm:px-7">{erro}</p>}
        <DialogFooter>
          <Button
            ref={cancelar}
            type="button"
            variant="outline"
            onClick={() => { setErro(null); onOpenChange(false); }}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button type="button" variant={destructive ? "destructive" : "default"} onClick={confirmar} disabled={loading}>
            {loading ? "Processando..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}