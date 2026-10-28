// Padrão visual compartilhado por todos os dialogs.
export const dialogLayout = {
  overlay: "bg-slate-950/45 backdrop-blur-[2px]",
  dialog: "flex max-h-[90dvh] w-[calc(100%_-_1.5rem)] max-w-[800px] flex-col gap-0 overflow-hidden rounded-2xl sm:rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/15 [&>button]:right-4 [&>button]:top-4 [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-lg [&>button]:text-slate-500 [&>button]:hover:bg-slate-100",
  header: "shrink-0 border-b border-slate-100 px-5 py-5 pr-16 text-left sm:px-7 sm:py-6 sm:pr-16",
  title: "text-xl font-semibold tracking-tight text-slate-900",
  description: "mt-1 text-sm leading-6 text-slate-500",
  form: "flex min-h-0 flex-1 flex-col overflow-hidden",
  content: "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6 [scrollbar-gutter:stable]",
  error: "shrink-0 px-5 py-3 sm:px-7",
  footer: "shrink-0 flex-row justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7",
  cancel: "h-11 rounded-lg border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-100",
  submit: "h-11 rounded-lg bg-slate-950 px-5 text-white hover:bg-slate-800",
};
export const dialogFieldClassName = "h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 aria-invalid:border-red-400 aria-invalid:focus-visible:ring-red-100";

