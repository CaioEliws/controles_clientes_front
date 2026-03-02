import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Cliente } from "@/types";

type Props = {
  value: string;
  error?: string | null;
  suggestions: Cliente[];
  disabled?: boolean;

  onChange: (value: string) => void;
  onSelect: (cliente: Cliente) => void;
};

export function ClienteAutoComplete({
  value,
  error,
  suggestions,
  disabled,
  onChange,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const showList = useMemo(() => {
    if (disabled) return false;
    if (error) return false;
    if (!value.trim()) return false;
    return open && suggestions.length > 0;
  }, [disabled, error, value, open, suggestions.length]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={rootRef} className="relative space-y-1 w-full sm:w-[320px]">
      <Search className="absolute left-3 top-5 -translate-y-1/2 w-4 h-4 text-slate-400" />

      <Input
        placeholder="Buscar cliente..."
        value={value}
        disabled={disabled}
        className={`pl-10 bg-white ${error ? "border-red-500" : ""}`}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      {showList && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border bg-white shadow-lg overflow-hidden">
          <div className="max-h-64 overflow-auto py-1">
            {suggestions.map((c) => (
              <button
                key={c.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex flex-col"
                onClick={() => {
                  onSelect(c);
                  setOpen(false);
                }}
              >
                <span className="font-medium text-slate-900">{c.nome}</span>
                {c.nomeIndicador ? (
                  <span className="text-xs text-slate-500">
                    Indicador: {c.nomeIndicador}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}