import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { Clientes } from "@/pages/Clients";
import { Parcelas } from "@/pages/Parcelas";
import { Emprestimo } from "@/pages/Emprestimo";
import { SimulacaoEmprestimo } from "@/pages/Simulation";
import { BackupPage } from "@/pages/BackupPage";
import { RelatorioParcelas } from "@/pages/RelatorioParcelas";
import { Configuracoes } from "./pages/Configuracoes";
const Documentos = lazy(() => import("./pages/Documentos").then((module) => ({ default: module.Documentos })));

function App() {
  return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/parcelas" element={<Parcelas />} />
          <Route path="/emprestimo" element={<Emprestimo />} />
          <Route path="/documentos" element={<Suspense fallback={<p role="status" className="p-6 text-sm text-slate-500">Carregando Documentos...</p>}><Documentos /></Suspense>} />
          <Route path="/simulacao" element={<SimulacaoEmprestimo />} />
          <Route path="/relatorio-parcelas" element={<RelatorioParcelas />} />
          <Route path="/backup" element={<BackupPage />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
  );
}

export default App;
