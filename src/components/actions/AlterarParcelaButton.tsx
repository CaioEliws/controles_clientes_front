import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";

interface Props {
  onClick: () => void;
}

export function AlterarParcelaButton({ onClick }: Props) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
      onClick={onClick}
    >
      <CalendarClock className="w-4 h-4 mr-1" />
      Editar
    </Button>
  );
}