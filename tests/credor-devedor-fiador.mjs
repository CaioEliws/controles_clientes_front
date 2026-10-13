// Browser smoke test with an isolated API double; never writes to the Java database.
// Run with Vite serving this project and Playwright available in the environment.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE_PATH || "playwright");
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const context = await browser.newContext();
const page = await context.newPage();
const base = process.env.FRONTEND_TEST_URL || "http://127.0.0.1:5173";
const requests = [];
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
const empty = {
  nomeIndicador: null, nacionalidade: null, estadoCivil: null, profissao: null,
  cpf: null, rg: null, rgOrgaoExpedidor: null, enderecoRua: null, enderecoNumero: null,
  enderecoComplemento: null, enderecoBairro: null, enderecoCep: null, enderecoCidade: null, enderecoEstado: null,
};
let perfis = [{ id: 1, nome: "Credor Teste" }, { id: 2, nome: "Segundo Perfil" }];
const perfisDetalhados = new Map(perfis.map((perfil) => [perfil.id, { ...empty, ...perfil, nomeCompleto: null }]));
const clientes = new Map([
  [1, [{ ...empty, id: 1, nome: "Devedor Legado" }, { ...empty, id: 2, nome: "Fiador Teste" }]],
  [2, [{ ...empty, id: 3, nome: "Outro Devedor" }, { ...empty, id: 4, nome: "Outro Fiador" }]],
]);
const loans = new Map();
let errorCliente = false;
let errorEmprestimo = false;
let listaResumida = false;
let failClienteRefresh = false;
await context.route("**/api/**", async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  const path = url.pathname.replace(/^\/api/, "");
  const method = request.method();
  const perfilId = Number(request.headers()["x-perfil-id"]);
  const body = request.postDataJSON();
  requests.push({ path, method, perfilId, body });
  const json = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(data) });
  if (path === "/perfis" && method === "GET") return json(perfis);
  if (path === "/perfis" && method === "POST") {
    const perfil = { id: 3, nome: body.nome };
    perfis.push(perfil); perfisDetalhados.set(3, { ...empty, ...perfil, nomeCompleto: null }); clientes.set(3, []);
    return json(perfil, 201);
  }
  const perfilMatch = path.match(/^\/perfis\/(\d+)$/);
  if (perfilMatch) {
    assert.equal(Number(perfilMatch[1]), perfilId, "Detalhe de perfil precisa usar seu próprio header");
    if (method === "PUT") {
      perfisDetalhados.set(perfilId, { id: perfilId, ...body });
      perfis = perfis.map((perfil) => perfil.id === perfilId ? { id: perfilId, nome: body.nome } : perfil);
    }
    return json(perfisDetalhados.get(perfilId));
  }
  if (path === "/clientes" && method === "GET") {
    if (failClienteRefresh) {
      failClienteRefresh = false;
      return json({ error: "Falha temporária ao atualizar clientes" }, 500);
    }
    const lista = clientes.get(perfilId) || [];
    return json(listaResumida ? lista.map(({ id, nome }) => ({ id, nome })) : lista);
  }
  if (path === "/clientes" && method === "POST") {
    if (errorCliente) return json({ error: "CPF já cadastrado" }, 400);
    const lista = clientes.get(perfilId);
    lista.push({ id: lista.length + 10, ...body });
    return route.fulfill({ status: 201 });
  }
  const clientMatch = path.match(/^\/clientes\/(\d+)$/);
  if (clientMatch) {
    const lista = clientes.get(perfilId);
    const id = Number(clientMatch[1]);
    const index = lista.findIndex((cliente) => cliente.id === id);
    if (method === "PUT") lista[index] = { id, ...body };
    return json(lista[index]);
  }
  const loanMatch = path.match(/^\/clientes\/(\d+)\/emprestimos(?:\/detalhes)?$/);
  if (loanMatch) {
    const key = `${perfilId}-${loanMatch[1]}`;
    if (method === "POST") {
      if (errorEmprestimo) return json({ message: "Fiador não encontrado para o perfil informado." }, 400);
      await new Promise((resolve) => setTimeout(resolve, 200));
      const cliente = clientes.get(perfilId).find((item) => item.id === Number(loanMatch[1]));
      const fiador = clientes.get(perfilId).find((item) => item.id === body.fiadorId);
      loans.set(key, [{ id: 1, nomeCliente: cliente.nome, fiadorId: body.fiadorId, fiadorNome: fiador?.nome ?? null,
        dataEmprestimo: "2026-10-01", inicioPagamento: "2026-11-01", finalPagamento: "2026-12-01", status: "EM_ABERTO",
        ...body, valorTotalEmprestimo: 110, valorParcela: 55, valorRecebido: 0, valorAReceber: 110,
        parcelasPagas: 0, parcelasPendentes: 2, parcelasAtrasadas: 0 }]);
      return route.fulfill({ status: 201 });
    }
    return json(loans.get(key) || []);
  }
  if (path.startsWith("/parcelas")) return json([]);
  return json({ error: `Rota não prevista no teste: ${method} ${path}` }, 404);
});

async function cadastrar(completo = false) {
  await page.getByRole("button", { name: "Novo Cliente" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nome completo", { exact: true }).fill(completo ? "Cliente Completo" : "Cliente Simples");
  await dialog.getByLabel("Rua", { exact: true }).fill("Rua Teste");
  await dialog.getByLabel("Número", { exact: true }).fill("12");
  await dialog.getByLabel("Bairro", { exact: true }).fill("Centro");
  if (completo) {
    for (const [name, value] of Object.entries({ nomeIndicador: "Indicador", nacionalidade: "Brasileira", profissao: "Profissão teste", cpf: "001.234.567-89", rg: "001-X", rgOrgaoExpedidor: "SSP", enderecoComplemento: "Casa", enderecoCep: "00100-000", enderecoCidade: "Cidade", enderecoEstado: "SP" })) {
      await dialog.locator(`[name="${name}"]`).fill(value);
    }
    await dialog.locator('[name="estadoCivil"]').selectOption("UNIAO_ESTAVEL");
  }
  await dialog.getByRole("button", { name: "Salvar Cliente" }).click();
  return dialog;
}

try {
  await page.goto(`${base}/clientes`);
  await page.getByText("Devedor Legado", { exact: true }).waitFor();
  await cadastrar();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(requests.findLast((item) => item.method === "POST" && item.path === "/clientes").body.cpf, null);
  await cadastrar(true);
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  const criado = requests.findLast((item) => item.method === "POST" && item.path === "/clientes");
  assert.equal(criado.perfilId, 1); assert.equal(criado.body.cpf, "001.234.567-89"); assert.equal(criado.body.rg, "001-X"); assert.equal(criado.body.enderecoCep, "00100-000");
  assert.equal(criado.body.enderecoNumero, 12); assert.equal(Object.keys(criado.body).length, 15);
  console.log("PASS cadastro mínimo/completo, strings com zeros e payload de 15 campos");

  const row = page.getByRole("row").filter({ hasText: "Devedor Legado" });
  await row.getByRole("button", { name: "Editar", exact: true }).click();
  let dialog = page.getByRole("dialog");
  assert.equal(await dialog.locator('[name="cpf"]').inputValue(), "");
  await dialog.locator('[name="cpf"]').fill("000.123.456-78");
  await dialog.locator('[name="enderecoComplemento"]').fill("Apto 1");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();
  await dialog.waitFor({ state: "hidden" });
  await row.getByRole("button", { name: "Editar", exact: true }).click();
  dialog = page.getByRole("dialog");
  assert.equal(await dialog.locator('[name="cpf"]').inputValue(), "000.123.456-78");
  assert.equal(await dialog.locator('[name="enderecoNumero"]').inputValue(), "");
  assert.equal(requests.filter((item) => item.path === "/clientes/1" && item.method === "GET").length, 0);
  await dialog.locator('[name="cpf"]').fill("");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(requests.findLast((item) => item.path === "/clientes/1" && item.method === "PUT").body.cpf, null);
  console.log("PASS edição legada/null, PUT completo e reabertura sem GET redundante");

  listaResumida = true;
  await page.goto(`${base}/clientes`);
  await page.getByRole("row").filter({ hasText: "Devedor Legado" }).getByRole("button", { name: "Editar", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.locator('[name="enderecoComplemento"]').waitFor();
  assert.equal(await dialog.locator('[name="enderecoComplemento"]').inputValue(), "Apto 1");
  assert.ok(requests.some((item) => item.path === "/clientes/1" && item.method === "GET"));
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  listaResumida = false;
  console.log("PASS edição com consulta detalhada quando a listagem está resumida");

  errorCliente = true;
  await cadastrar(true);
  await page.getByRole("alert").filter({ hasText: "CPF já cadastrado" }).waitFor();
  await page.getByRole("dialog").getByRole("button", { name: "Cancelar", exact: true }).click();
  errorCliente = false;
  console.log("PASS mensagem de CPF duplicado retornada pela API");

  await page.goto(`${base}/configuracoes`);
  await page.locator('[name="nomeCompleto"]').waitFor();
  await page.getByRole("button", { name: "Salvar dados do credor" }).waitFor();
  await page.locator('[name="nomeCompleto"]').fill("Nome completo do credor");
  await page.locator('[name="nome"]').fill("Credor Atualizado");
  await page.locator('[name="cpf"]').fill("000.111.222-33");
  await page.getByRole("button", { name: "Salvar dados do credor" }).click();
  await page.getByText("Dados do credor salvos.").waitFor();
  assert.equal(await page.locator("select").first().locator('option:checked').textContent(), "Credor Atualizado");
  console.log("PASS GET/PUT perfil detalhado, lista e Context atualizados");

  async function abrirEmprestimo(id = 1) {
    await page.goto(`${base}/emprestimo?selectedCliente=${id}&sortOrder=asc`);
    await page.getByRole("button", { name: "Criar Empréstimo", exact: true }).click();
    const loanDialog = page.getByRole("dialog");
    await loanDialog.locator('[name="valorEmprestado"]').fill("100");
    await loanDialog.locator('[name="quantidadeParcelas"]').fill("2");
    await loanDialog.locator('[name="jurosCobrado"]').fill("10");
    await loanDialog.locator('[name="formaPagamento"]').selectOption("PIX");
    return loanDialog;
  }
  dialog = await abrirEmprestimo();
  await dialog.getByText("Credor Atualizado", { exact: true }).waitFor();
  assert.equal(await dialog.locator('[name="fiadorId"]').inputValue(), "");
  const beforeEmpty = requests.filter((item) => item.method === "POST" && item.path.endsWith("/emprestimos")).length;
  await dialog.getByRole("button", { name: "Criar empréstimo", exact: true }).click();
  await dialog.getByRole("alert").filter({ hasText: "Selecione um fiador." }).waitFor();
  assert.equal(requests.filter((item) => item.method === "POST" && item.path.endsWith("/emprestimos")).length, beforeEmpty);
  assert.equal(await dialog.locator('[name="fiadorId"] option').filter({ hasText: "Nenhum fiador" }).count(), 0);
  console.log("PASS fiador obrigatório: sem seleção não envia POST");
  await dialog.locator('[name="fiadorId"]').selectOption("2");

  const loanDialog = dialog;
  const novoFiador = loanDialog.getByRole("button", { name: "Cadastrar novo fiador", exact: true });
  await novoFiador.click();
  let cadastro = page.getByRole("dialog", { name: "Cadastrar Novo Cliente", exact: true });
  await cadastro.getByLabel("Nome completo", { exact: true }).fill("Fiador Cancelado");
  await page.keyboard.press("Escape");
  await cadastro.waitFor({ state: "hidden" });
  await page.getByRole("dialog", { name: "Novo Empréstimo", exact: true }).waitFor();
  assert.equal(await novoFiador.evaluate((element) => document.activeElement === element), true);
  assert.equal(await loanDialog.locator('[name="valorEmprestado"]').inputValue(), "100");
  await novoFiador.click();
  cadastro = page.getByRole("dialog", { name: "Cadastrar Novo Cliente", exact: true });
  await cadastro.getByRole("button", { name: "Cancelar", exact: true }).click();
  await cadastro.waitFor({ state: "hidden" });
  assert.equal(await loanDialog.locator('[name="quantidadeParcelas"]').inputValue(), "2");

  const beforeRefresh = requests.filter((item) => item.path === "/clientes" && item.method === "GET").length;
  await novoFiador.click();
  cadastro = page.getByRole("dialog", { name: "Cadastrar Novo Cliente", exact: true });
  await cadastro.getByLabel("Nome completo", { exact: true }).fill("Novo Fiador Cadastrado");
  await cadastro.getByLabel("Rua", { exact: true }).fill("Rua do Fiador");
  await cadastro.getByLabel("Número", { exact: true }).fill("15");
  await cadastro.getByLabel("Bairro", { exact: true }).fill("Centro");
  await cadastro.locator('[name="cpf"]').fill("001.234.567-80");
  await cadastro.getByRole("button", { name: "Salvar Cliente", exact: true }).click();
  await cadastro.waitFor({ state: "hidden" });
  await loanDialog.getByText("Cliente cadastrado. Selecione-o na lista de fiadores para continuar.", { exact: true }).waitFor();
  assert.equal(await loanDialog.locator('[name="fiadorId"]').inputValue(), "2");
  assert.equal(requests.filter((item) => item.method === "POST" && item.path.endsWith("/emprestimos")).length, beforeEmpty, "Salvar cliente no portal não deve enviar o formulário pai");
  assert.equal(requests.filter((item) => item.path === "/clientes" && item.method === "GET").length, beforeRefresh + 1);
  const fiadorCriado = requests.findLast((item) => item.path === "/clientes" && item.method === "POST");
  assert.equal(fiadorCriado.perfilId, 1); assert.equal(Object.keys(fiadorCriado.body).length, 15);
  for (const [name, value] of Object.entries({ valorEmprestado: "100", quantidadeParcelas: "2", jurosCobrado: "10", formaPagamento: "PIX", frequenciaPagamento: "MENSAL", tipoContrato: "FISICO" })) {
    assert.equal(await loanDialog.locator(`[name="${name}"]`).inputValue(), value);
  }
  await novoFiador.click();
  cadastro = page.getByRole("dialog", { name: "Cadastrar Novo Cliente", exact: true });
  await cadastro.getByLabel("Nome completo", { exact: true }).fill("Fiador com Retry");
  await cadastro.getByLabel("Rua", { exact: true }).fill("Rua Teste");
  await cadastro.getByLabel("Número", { exact: true }).fill("16");
  await cadastro.getByLabel("Bairro", { exact: true }).fill("Centro");
  failClienteRefresh = true;
  await cadastro.getByRole("button", { name: "Salvar Cliente", exact: true }).click();
  await cadastro.getByRole("alert").filter({ hasText: "Falha temporária" }).waitFor();
  const postsAfterRefreshFailure = requests.filter((item) => item.path === "/clientes" && item.method === "POST").length;
  await cadastro.getByRole("button", { name: "Atualizar lista", exact: true }).click();
  await cadastro.waitFor({ state: "hidden" });
  assert.equal(requests.filter((item) => item.path === "/clientes" && item.method === "POST").length, postsAfterRefreshFailure);
  console.log("PASS falha de atualização da lista pode ser repetida sem duplicar o cadastro");
  await loanDialog.locator('[name="fiadorId"]').selectOption({ label: "Novo Fiador Cadastrado" });
  const selectedNewId = Number(await loanDialog.locator('[name="fiadorId"]').inputValue());
  console.log("PASS cadastro padrão de cliente, recarga única, seleção manual e dados financeiros preservados; Escape/cancelar/foco dos modais");
  await dialog.getByRole("button", { name: "Criar empréstimo", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(requests.findLast((item) => item.method === "POST" && item.path.endsWith("/emprestimos")).body.fiadorId, selectedNewId);
  delete loans.get("1-1")[0].fiadorId;
  delete loans.get("1-1")[0].fiadorNome;
  await page.goto(`${base}/emprestimo?selectedCliente=1&sortOrder=asc`);
  await page.locator('table button').filter({ has: page.locator('svg.lucide-square-pen') }).first().click();
  await page.getByRole("dialog").getByText("Fiador: —", { exact: true }).waitFor();
  await page.getByRole("dialog").getByRole("button", { name: "Cancelar", exact: true }).click();
  console.log("PASS detalhe de empréstimo legado sem campos de fiador");
  dialog = await abrirEmprestimo();
  await dialog.locator('[name="fiadorId"]').selectOption("2");
  const beforeLoans = requests.filter((item) => item.method === "POST" && item.path.endsWith("/emprestimos")).length;
  await dialog.getByRole("button", { name: "Criar empréstimo", exact: true }).click();
  assert.equal(await dialog.getByRole("button", { name: "Criando..." }).isDisabled(), true);
  await dialog.waitFor({ state: "hidden" });
  const enviado = requests.findLast((item) => item.method === "POST" && item.path.endsWith("/emprestimos"));
  assert.equal(enviado.body.fiadorId, 2); assert.equal(enviado.perfilId, 1); assert.equal(Object.keys(enviado.body).length, 7);
  assert.equal(requests.filter((item) => item.method === "POST" && item.path.endsWith("/emprestimos")).length, beforeLoans + 1);
  await page.locator('table button').filter({ has: page.locator('svg.lucide-square-pen') }).first().click();
  await page.getByRole("dialog").getByText("Fiador: Fiador Teste", { exact: true }).waitFor();
  await page.getByRole("dialog").getByRole("button", { name: "Cancelar", exact: true }).click();
  console.log("PASS empréstimos com fiador existente/recém-criado, credor automático/header e bloqueio durante envio");

  dialog = await abrirEmprestimo();
  await dialog.locator('[name="fiadorId"]').selectOption("1");
  errorEmprestimo = true;
  await dialog.getByRole("button", { name: "Criar empréstimo", exact: true }).click();
  await dialog.getByRole("alert").filter({ hasText: "Fiador não encontrado" }).waitFor();
  assert.equal(await dialog.locator('[name="fiadorId"]').inputValue(), "1");
  errorEmprestimo = false;
  await dialog.getByRole("button", { name: "Criar empréstimo", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(requests.findLast((item) => item.method === "POST" && item.path.endsWith("/emprestimos")).body.fiadorId, 1);
  console.log("PASS fiador igual ao devedor permitido e erro de empréstimo inline");

  await page.goto(`${base}/configuracoes`);
  await page.locator("select").first().selectOption("2");
  await page.getByRole("button", { name: "Salvar dados do credor" }).waitFor();
  dialog = await abrirEmprestimo(3);
  await dialog.getByText("Segundo Perfil", { exact: true }).waitFor();
  assert.equal(await dialog.locator('[name="fiadorId"]').inputValue(), "");
  const options = await dialog.locator('[name="fiadorId"] option').allTextContents();
  assert.deepEqual(options, ["Selecione um fiador", "Outro Devedor", "Outro Fiador"]);
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  console.log("PASS troca de perfil: lista/credor atuais e fiador descartado");

  await page.setViewportSize({ width: 390, height: 844 });
  dialog = await abrirEmprestimo(3);
  await dialog.getByRole("button", { name: "Cadastrar novo fiador", exact: true }).click();
  cadastro = page.getByRole("dialog", { name: "Cadastrar Novo Cliente", exact: true });
  await cadastro.locator('[name="enderecoEstado"]').scrollIntoViewIfNeeded();
  const nestedBounds = await cadastro.boundingBox();
  assert.ok(nestedBounds.x >= 0 && nestedBounds.width <= 390 && nestedBounds.height <= 844);
  await page.keyboard.press("Tab");
  assert.equal(await cadastro.evaluate((element) => element.contains(document.activeElement)), true);
  await cadastro.getByRole("button", { name: "Cancelar", exact: true }).click();
  await cadastro.waitFor({ state: "hidden" });
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  console.log("PASS cadastro secundário mobile: overlay, foco contido, scroll e retorno");
  await page.goto(`${base}/clientes`);
  await page.getByRole("button", { name: "Novo Cliente" }).click();
  dialog = page.getByRole("dialog");
  const bounds = await dialog.boundingBox();
  assert.ok(bounds.x >= 0 && bounds.width <= 390 && bounds.height <= 844);
  assert.equal(await dialog.getByRole("button", { name: "Cancelar", exact: true }).isVisible(), true);
  await dialog.locator('[name="enderecoEstado"]').scrollIntoViewIfNeeded();
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  console.log("PASS modal 390x844: limites do viewport/scroll/cancelar");

  await page.goto(`${base}/configuracoes`);
  await page.getByPlaceholder("Ex: Perfil Caio, Financeiro, Testes...").fill("Perfil Simples");
  await page.getByRole("button", { name: "Criar perfil", exact: true }).click();
  await page.getByText("Perfil ativo: Perfil Simples.", { exact: false }).waitFor();
  assert.deepEqual(requests.findLast((item) => item.path === "/perfis" && item.method === "POST").body, { nome: "Perfil Simples" });
  assert.equal(await page.locator('[name="cpf"]').inputValue(), "");
  console.log("PASS criação simples de perfil preservada e dados opcionais nulos");
  assert.deepEqual(pageErrors, [], "Nenhum erro JavaScript no navegador");
  console.log("PASS sem erros JavaScript; todas as mutações usam apenas a API simulada");
} finally { await browser.close(); }
