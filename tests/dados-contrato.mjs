// Isolated browser verification: every API call is intercepted; no Java DB writes.
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
const parte = {
  nomeCompleto: "Pessoa Completa", nacionalidade: "Brasileira", estadoCivil: "UNIAO_ESTAVEL", profissao: "Professor",
  rg: "00123-X", rgOrgaoExpedidor: "SSP/SP", cpf: "000.000.000-01", enderecoRua: "Rua A", enderecoNumero: 10,
  enderecoComplemento: null, enderecoBairro: "Centro", enderecoCep: "00100-000", enderecoCidade: "Cidade A", enderecoEstado: "SP",
};
const clientes = new Map([
  [1, [{ id: 10, nome: "Devedor Atual" }, { id: 11, nome: "Fiador Existente" }]],
  [2, [{ id: 20, nome: "Segundo Devedor" }, { id: 21, nome: "Segundo Fiador" }]],
]);
const loans = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1, nomeCliente: "Devedor Atual", fiadorId: index >= 4 ? null : 11, fiadorNome: index >= 4 ? null : "Fiador Existente",
  dataEmprestimo: "2026-10-02", inicioPagamento: "2026-11-02", finalPagamento: "2026-12-02", status: "EM_ABERTO",
  formaPagamento: "PIX", frequenciaPagamento: "MENSAL", tipoContrato: "FISICO", valorEmprestado: 100, valorAReceber: 110,
  valorParcela: 55, valorRecebido: 0, valorTotalEmprestimo: 110, parcelasPagas: 0, parcelasPendentes: 2, parcelasAtrasadas: 0,
}));
const contratos = (id) => ({
  emprestimoId: id, credor: { ...parte, nomeCompleto: "Credor Completo" }, devedor: { ...parte, nomeCompleto: "Devedor Completo" },
  fiador: { ...parte, nomeCompleto: "Fiador Completo", profissao: null },
  emprestimo: { valorEmprestado: 100, taxaDeJuros: 10, valorParcela: 55, valorTotalEmprestimo: 110, quantidadeParcelas: 2,
    dataDoEmprestimo: "2026-10-02", inicioPagamento: "2026-11-02", finalPagamento: "2026-12-02",
    formaPagamento: "PIX", frequenciaPagamento: "MENSAL", tipoContrato: "FISICO", emprestimoStatus: "EM_ABERTO" },
  parcelas: [{ numeroParcela: 1, dataVencimento: "2026-11-02", valorParcela: 55 }, { numeroParcela: 2, dataVencimento: "2026-12-02", valorParcela: 55 }],
});
let failPatch = true;
let delayResolve;
let delayFirst = true;
const initialGate = new Promise((resolve) => { delayResolve = resolve; });
await context.route("**/api/**", async (route) => {
  const req = route.request();
  const path = new URL(req.url()).pathname.replace(/^\/api/, "");
  const method = req.method();
  const perfilId = Number(req.headers()["x-perfil-id"]);
  const body = req.postDataJSON();
  requests.push({ path, method, perfilId, body });
  const json = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(data) });
  if (path === "/perfis") return json([{ id: 1, nome: "Credor Atual" }, { id: 2, nome: "Segundo Perfil" }]);
  if (path === "/perfis/1" || path === "/perfis/2") return json({ id: perfilId, nome: perfilId === 1 ? "Credor Atual" : "Segundo Perfil" });
  if (path === "/clientes" && method === "GET") return json(clientes.get(perfilId));
  if (path === "/clientes" && method === "POST") {
    clientes.get(perfilId).push({ id: 12, ...body });
    return route.fulfill({ status: 201 });
  }
  if (path.endsWith("/contratos") && method === "GET") return json([]);
  const contrato = path.match(/^\/clientes\/(\d+)\/emprestimos\/(\d+)\/dados-contrato$/);
  if (contrato) {
    const id = Number(contrato[2]);
    if (delayFirst) { delayFirst = false; await initialGate; }
    if (id === 2) return json({ error: "Dados do credor incompletos: cpf, rg." }, 400);
    if (id === 3) return json({ message: "Dados do devedor incompletos: profissao." }, 400);
    if (id === 4 || (id === 8 && loans[7].fiadorId)) return json({ error: "Dados do fiador incompletos: enderecoCep." }, 400);
    if (id === 6) return json({ error: "Serviço temporariamente indisponível" }, 503);
    if (id >= 5 && !loans[id - 1].fiadorId) return json({ error: "O empréstimo não possui fiador cadastrado." }, 400);
    return json(contratos(id));
  }
  const patch = path.match(/^\/clientes\/(\d+)\/emprestimos\/(\d+)\/fiador$/);
  if (patch) {
    const id = Number(patch[2]);
    if (id === 7 && failPatch) return json({ error: "Fiador não encontrado para o perfil informado." }, 400);
    await new Promise((resolve) => setTimeout(resolve, 180));
    loans[id - 1].fiadorId = body.fiadorId;
    loans[id - 1].fiadorNome = clientes.get(perfilId).find((c) => c.id === body.fiadorId)?.nome;
    return route.fulfill({ status: 204 });
  }
  if (/^\/clientes\/\d+\/emprestimos(?:\/detalhes)?$/.test(path)) return json(loans);
  if (path.includes("/parcelas")) return json([]);
  return json({ error: `Unexpected API call: ${method} ${path}` }, 404);
});
const countGet = () => requests.filter((r) => r.path.endsWith("/dados-contrato")).length;
const countPatch = () => requests.filter((r) => r.method === "PATCH").length;
async function abrir(index) {
  await page.getByRole("button", { name: "Dados do contrato", exact: true }).nth(index).click();
  return page.getByRole("dialog", { name: "Dados do contrato", exact: true });
}
async function fechar(dialog) {
  await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
}
try {
  await page.goto(`${base}/emprestimo?selectedCliente=10&sortOrder=asc`);
  await page.getByRole("button", { name: "Dados do contrato", exact: true }).first().waitFor();
  assert.equal(countGet(), 0, "No contract prefetch for all rows");
  const initialUrl = page.url();
  const before = countGet();
  let dialog = await abrir(0);
  await dialog.getByText("Carregando dados do contrato...", { exact: true }).waitFor();
  assert.equal(countGet(), before + 1);
  assert.equal(page.url(), initialUrl);
  delayResolve();
  await dialog.getByRole("heading", { name: "Credor", exact: true }).waitFor();
  for (const name of ["Credor", "Devedor", "Fiador", "Empréstimo", "Parcelas"]) assert.equal(await dialog.getByRole("heading", { name, exact: true }).count(), 1);
  await dialog.getByText("000.000.000-01", { exact: true }).first().waitFor();
  assert.ok((await dialog.innerText()).includes("00123-X"));
  assert.ok((await dialog.innerText()).includes("00100-000"));
  assert.ok((await dialog.innerText()).includes("União estável"));
  assert.ok((await dialog.innerText()).includes("02/10/2026"));
  assert.ok((await dialog.innerText()).includes("10%"));
  assert.equal(await dialog.locator("tbody tr").count(), 2);
  assert.equal(await dialog.locator("table button").count(), 0);
  assert.equal(await dialog.getByText("—", { exact: true }).count(), 1);
  await fechar(dialog);
  assert.equal(page.url(), initialUrl);
  await page.getByRole("button", { name: "Dados do contrato", exact: true }).first().focus();
  await page.keyboard.press("Enter");
  dialog = page.getByRole("dialog", { name: "Dados do contrato", exact: true });
  await dialog.getByRole("heading", { name: "Credor", exact: true }).waitFor();
  assert.equal(countGet(), before + 2);
  assert.equal(page.url(), initialUrl);
  await fechar(dialog);
  console.log("PASS on-demand loading, single GET, close/reopen, real DTO names, all sections, formatting/null and read-only installments; row does not navigate");

  for (const [index, role, field, guidance] of [[1, "credor", "cpf, rg", "Configurações"], [2, "devedor", "profissao", "Clientes"], [3, "fiador", "enderecoCep", "Clientes"]]) {
    dialog = await abrir(index);
    await dialog.getByRole("alert").filter({ hasText: `Dados do ${role} incompletos: ${field}.` }).waitFor();
    assert.ok((await dialog.innerText()).includes(guidance));
    assert.equal(await dialog.getByRole("button", { name: "Regularizar fiador", exact: true }).count(), 0);
    await fechar(dialog);
  }
  dialog = await abrir(5);
  await dialog.getByRole("alert").filter({ hasText: "Serviço temporariamente indisponível" }).waitFor();
  const beforeRetry = countGet();
  await dialog.getByRole("button", { name: "Consultar novamente", exact: true }).click();
  await dialog.getByRole("alert").waitFor();
  assert.equal(countGet(), beforeRetry + 1);
  await fechar(dialog);
  console.log("PASS detailed errors for incomplete parties and API unavailable; retry");

  dialog = await abrir(4);
  await dialog.getByRole("button", { name: "Regularizar fiador", exact: true }).click();
  await dialog.getByRole("button", { name: "Salvar fiador", exact: true }).click();
  await dialog.getByRole("alert").filter({ hasText: "Selecione um fiador do perfil ativo." }).waitFor();
  const getBeforePatch = countGet();
  const patchBefore = countPatch();
  await dialog.getByLabel("Fiador *", { exact: true }).selectOption("11");
  await dialog.getByRole("button", { name: "Salvar fiador", exact: true }).click();
  assert.equal(await dialog.getByRole("button", { name: "Salvando fiador...", exact: true }).isDisabled(), true);
  await dialog.getByRole("heading", { name: "Credor", exact: true }).waitFor();
  assert.equal(countPatch(), patchBefore + 1); assert.equal(countGet(), getBeforePatch + 1);
  const sent = requests.findLast((r) => r.method === "PATCH");
  assert.equal(sent.path, "/clientes/10/emprestimos/5/fiador"); assert.equal(sent.perfilId, 1); assert.deepEqual(sent.body, { fiadorId: 11 });
  await fechar(dialog);
  console.log("PASS legacy existing fiador: required selection, exact PATCH/body/header, submit lock and GET after 204");

  dialog = await abrir(6);
  await dialog.getByRole("button", { name: "Regularizar fiador", exact: true }).click();
  await dialog.getByLabel("Fiador *", { exact: true }).selectOption("11");
  await dialog.getByRole("button", { name: "Salvar fiador", exact: true }).click();
  await dialog.getByRole("alert").filter({ hasText: "Fiador não encontrado para o perfil informado." }).waitFor();
  assert.equal(await dialog.getByLabel("Fiador *", { exact: true }).inputValue(), "11");
  failPatch = false;
  await dialog.getByRole("button", { name: "Cadastrar novo fiador", exact: true }).click();
  let cadastro = page.getByRole("dialog", { name: "Cadastrar Novo Cliente", exact: true });
  await page.keyboard.press("Escape");
  await cadastro.waitFor({ state: "hidden" });
  await dialog.getByRole("button", { name: "Cadastrar novo fiador", exact: true }).click();
  cadastro = page.getByRole("dialog", { name: "Cadastrar Novo Cliente", exact: true });
  await cadastro.getByLabel("Nome completo", { exact: true }).fill("Fiador Cadastrado");
  await cadastro.getByLabel("Rua", { exact: true }).fill("Rua Teste");
  await cadastro.getByLabel("Número", { exact: true }).fill("10");
  await cadastro.getByLabel("Bairro", { exact: true }).fill("Centro");
  const patchesBeforeCreate = countPatch();
  await cadastro.getByRole("button", { name: "Salvar Cliente", exact: true }).click();
  await cadastro.waitFor({ state: "hidden" });
  assert.equal(countPatch(), patchesBeforeCreate, "Client form must not submit regularization parent");
  assert.equal(await dialog.getByLabel("Fiador *", { exact: true }).inputValue(), "11");
  await dialog.getByLabel("Fiador *", { exact: true }).selectOption({ label: "Fiador Cadastrado" });
  await dialog.getByRole("button", { name: "Salvar fiador", exact: true }).click();
  await dialog.getByRole("heading", { name: "Credor", exact: true }).waitFor();
  assert.deepEqual(requests.findLast((r) => r.method === "PATCH").body, { fiadorId: 12 });
  await fechar(dialog);
  console.log("PASS PATCH error preserves selection; shared client registration/manual choice/GET -> PATCH -> GET; nested Escape and no bubbled submit");

  dialog = await abrir(7);
  await dialog.getByRole("button", { name: "Regularizar fiador", exact: true }).click();
  await dialog.getByLabel("Fiador *", { exact: true }).selectOption("11");
  await dialog.getByRole("button", { name: "Salvar fiador", exact: true }).click();
  await dialog.getByRole("alert").filter({ hasText: "Dados do fiador incompletos: enderecoCep." }).waitFor();
  await dialog.getByText("Fiador regularizado.", { exact: true }).waitFor();
  assert.equal(await dialog.getByRole("button", { name: "Salvar fiador", exact: true }).count(), 0);
  await fechar(dialog);
  console.log("PASS PATCH success followed by incomplete contract error is shown honestly");

  await page.setViewportSize({ width: 390, height: 844 });
  dialog = await abrir(0);
  await dialog.getByRole("heading", { name: "Parcelas", exact: true }).scrollIntoViewIfNeeded();
  const bounds = await dialog.boundingBox();
  assert.ok(bounds.x >= 0 && bounds.width <= 390 && bounds.height <= 844);
  await fechar(dialog);
  console.log("PASS mobile contract dialog: bounds, scroll and close");

  // Reset a fixture to a legacy state and verify the next profile uses fresh options/header.
  loans[4].fiadorId = null;
  await page.goto(`${base}/configuracoes`);
  await page.locator("select").first().selectOption("2");
  await page.goto(`${base}/emprestimo?selectedCliente=20&sortOrder=asc`);
  dialog = await abrir(4);
  await dialog.getByRole("button", { name: "Regularizar fiador", exact: true }).click();
  assert.equal(await dialog.getByLabel("Fiador *", { exact: true }).inputValue(), "");
  assert.deepEqual(await dialog.locator("#fiador-legado option").allTextContents(), ["Selecione um fiador", "Segundo Devedor", "Segundo Fiador"]);
  assert.equal(requests.findLast((r) => r.path.endsWith("/dados-contrato")).perfilId, 2);
  await fechar(dialog);
  await page.locator("tbody tr").first().locator("td").first().click();
  await page.waitForURL("**/parcelas**");
  console.log("PASS existing row click still navigates to installments; contract keyboard activation does not");
  assert.deepEqual(pageErrors, []);
  assert.equal(requests.some((r) => /quitar|refinanciar|reprogramar|pagar/.test(r.path)), false);
  console.log("PASS profile scope, fresh regularization state/header, no financial mutation or JS errors");
} finally { delayResolve(); await browser.close(); }
