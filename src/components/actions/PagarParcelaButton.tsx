import { Button } from "@/components/ui/button";

interface Props {
  onClick: () => void;
}

export function PagarParcelaButton({ onClick }: Props) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 border-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
      onClick={onClick}
    >
      Pagar
    </Button>
  );
}