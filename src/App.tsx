import { Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { Clientes } from "@/pages/Clients";
import { Parcelas } from "@/pages/Parcelas";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/parcelas" element={<Parcelas />} />
      </Route>
    </Routes>
  );
}

export default App;