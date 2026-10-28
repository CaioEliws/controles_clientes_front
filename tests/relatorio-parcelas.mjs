// Isolated UI/export verification. No writes to a real API or customer data.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, copyFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE_PATH || "playwright");
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"], acceptDownloads: true });
const page = await context.newPage();
page.setDefaultTimeout(15000);
const base = process.env.FRONTEND_TEST_URL || "http://127.0.0.1:5181";
const out = "node_modules/.cache/relatorio-qa";
await mkdir(out, { recursive: true });
const errors = [], calls = [];
page.on("pageerror", (e) => errors.push(e.message));
const loans = [3, 24, 120].map((q, i) => ({ id: i + 10, nomeCliente: "Brenda Áline B. dos Santos", dataEmprestimo: "2026-10-01",
  valorEmprestado: q * 400, valorTotalEmprestimo: q * 500, valorParcela: 500, quantidadeParcelas: q, status: "EM_ABERTO" }));
const rows = loans.flatMap((e) => Array.from({ length: e.quantidadeParcelas }, (_, i) => ({ idEmprestimo: e.id,
  numeroParcela: i + 1, nomeCliente: e.nomeCliente, valorParcela: 500, dataVencimento: "2026-11-05",
  status: ["PAGO", "PENDENTE", "ATRASADO", "PARCIAL"][i % 4] }))).reverse();
let falha = false, segurar = false;
const pendentes = [];
await context.route("**/api/**", async (route) => {
  const req = route.request(), url = new URL(req.url()), path = url.pathname.replace(/^\/api/, "");
  calls.push({ path, method: req.method(), perfil: req.headers()["x-perfil-id"] });
  const json = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(data) });
  if (path === "/perfis") return json([{ id: 1, nome: "Perfil Teste" }]);
  if (path === "/clientes") return json([{ id: 1, nome: loans[0].nomeCliente }, { id: 2, nome: "Cliente sem empréstimo" }]);
  if (path === "/clientes/1/emprestimos/detalhes") return json(loans);
  if (path === "/clientes/2/emprestimos/detalhes") return json([]);
  if (path === "/parcelas") {
    if (segurar) await new Promise((resolve) => pendentes.push(resolve));
    if (falha) return json({ message: "Serviço indisponível" }, 503);
    return json(rows.filter((p) => p.status === url.searchParams.get("status")));
  }
  return json([]);
});
const tabela = () => page.getByRole("table", { name: "Parcelas do empréstimo", exact: true });
const salvar = () => page.getByRole("button", { name: "Salvar PNG", exact: true });
async function selecionar(id, quantidade) {
  await page.getByLabel("Empréstimo", { exact: true }).selectOption(String(id));
  await page.waitForFunction((q) => document.querySelectorAll('table tbody tr').length === q, quantidade);
  assert.equal(await tabela().count(), 1);
  const exportacao = page.getByTestId("parcelas-print");
  assert.equal(await exportacao.locator("table").count(), 1);
  assert.equal(await exportacao.locator("header, dl, p, button").count(), 0);
  assert.equal(await exportacao.locator("h4").textContent(), loans[0].nomeCliente);
  assert.equal(await exportacao.locator(":scope > *").count(), 2, "Export contains only client name and table wrapper");
  assert.equal(await exportacao.locator("tbody tr").count(), quantidade);
  assert.doesNotMatch(await exportacao.textContent(), /Em aberto|EM ABERTO|Acompanhamento|Relatório de acompanhamento|Valor emprestado|Total a pagar|Pagas|#1[012]/);
  assert.deepEqual(await exportacao.locator("thead th").allTextContents(), ["Nº parcela", "Vencimento", "Valor", "Situação"]);
  assert.deepEqual(await tabela().locator("tbody tr td:first-child").allTextContents(), Array.from({ length: quantidade }, (_, i) => String(i + 1)));
}
async function baixar(nome) {
  const evento = page.waitForEvent("download");
  await salvar().click();
  const download = await evento;
  assert.match(download.suggestedFilename(), /^parcelas-brenda-aline-b-dos-santos-emprestimo-\d+\.png$/);
  const data = await readFile(await download.path());
  assert.equal(data.toString("hex", 0, 8), "89504e470d0a1a0a");
  assert.equal(data.readUInt32BE(16), 1600);
  assert.ok(data.readUInt32BE(20) > 300);
  await copyFile(await download.path(), `${out}/${nome}.png`);
  return data.readUInt32BE(20);
}
try {
  await page.goto(`${base}/relatorio-parcelas`);
  assert.equal(await salvar().isDisabled(), true);
  await page.getByLabel("Cliente", { exact: true }).selectOption("1");
  await page.getByLabel("Empréstimo", { exact: true }).locator("option[value='10']").waitFor({ state: "attached" });
  await selecionar(10, 3);
  const pequeno = await baixar("poucas-parcelas");
  assert.ok(pequeno < 700, "Three-row export contains client name and table, without summary/footer");
  await page.getByRole("button", { name: "Copiar imagem", exact: true }).click();
  await page.getByText("Imagem copiada com sucesso.", { exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(async () => (await navigator.clipboard.read()).flatMap((item) => item.types)), ["image/png"]);
  console.log("PASS one ordered table, PNG with real bytes and friendly filename, real image clipboard");
  await selecionar(11, 24);
  assert.equal(await page.getByText(/Parcelas 1 a 10|Parcelas 11 a 20/).count(), 0);
  assert.equal(await tabela().getByText("Pago", { exact: true }).count(), 6);
  const medio = await baixar("24-parcelas"); assert.ok(medio > pequeno + 1500);
  await selecionar(12, 120);
  const grande = await baixar("120-parcelas"); assert.ok(grande > medio + 6000);
  await page.screenshot({ path: `${out}/pagina-desktop.png`, fullPage: false });
  console.log("PASS 3/24/120 installments, no grouping, paid/pending/late/partial statuses, complete-height PNG exports");
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
    write: async () => { throw new Error("Permission denied"); },
  } }));
  const negado = page.waitForEvent("download");
  await page.getByRole("button", { name: "Copiar imagem", exact: true }).click();
  await negado; await page.getByText("Não foi possível copiar neste navegador. O PNG foi baixado.", { exact: true }).waitFor();
  // Revoke copy support to exercise the user-facing download fallback.
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined }));
  const fallback = page.waitForEvent("download");
  await page.getByRole("button", { name: "Copiar imagem", exact: true }).click();
  await fallback; await page.getByText("Cópia de imagem indisponível neste navegador. O PNG foi baixado.", { exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await selecionar(11, 24); const mobile = await baixar("mobile-24-parcelas");
  assert.ok(Math.abs(mobile - medio) < 400);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= 390), true);
  await page.screenshot({ path: `${out}/pagina-mobile.png`, fullPage: false });
  console.log("PASS copy fallback, mobile horizontal table scrolling and full-width export independent of viewport");
  segurar = true;
  await page.getByLabel("Empréstimo", { exact: true }).selectOption("12");
  await page.getByText("Carregando parcelas...", { exact: true }).waitFor();
  assert.equal(await salvar().isDisabled(), true);
  segurar = false;
  await selecionar(10, 3);
  for (const resolve of pendentes.splice(0)) resolve();
  await page.waitForTimeout(100);
  assert.equal(await tabela().locator("tbody tr").count(), 3);
  falha = true;
  await page.getByLabel("Empréstimo", { exact: true }).selectOption("11");
  await page.getByRole("alert").filter({ hasText: "Não foi possível carregar as parcelas" }).waitFor();
  assert.equal(await salvar().isDisabled(), true); assert.equal(await tabela().count(), 0);
  await page.getByLabel("Cliente", { exact: true }).selectOption("2");
  await page.getByText("Este cliente não possui empréstimos disponíveis.", { exact: true }).waitFor();
  assert.equal(await salvar().isDisabled(), true);
  assert.deepEqual(errors, []);
  assert.equal(calls.some((c) => c.method !== "GET"), false);
  assert.ok(calls.filter((c) => c.path !== "/perfis").every((c) => c.perfil === "1"));
  console.log(`PASS loading/error/empty gates, stale responses ignored, correct Perfil, no mutations/JS errors; artifacts: ${out}`);
} finally { for (const resolve of pendentes) resolve(); await browser.close(); }
