import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
}

export function ParcelasPagination({
  page,
  totalPages,
  totalItems,
  onPrev,
  onNext,
}: Props) {
  return (
    <CardFooter className="flex justify-between items-center px-8 py-4 bg-slate-50/50 border-t border-slate-100">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        Página {page} de {totalPages || 1} — {totalItems} resultados
      </span>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1}
          onClick={onPrev}
        >
          Anterior
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={page === totalPages}
          onClick={onNext}
        >
          Próxima
        </Button>
      </div>
    </CardFooter>
  );
}