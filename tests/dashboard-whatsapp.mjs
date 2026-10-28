// Browser checks use only intercepted fixtures, including payment/edit requests.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE_PATH || "playwright");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage(); page.setDefaultTimeout(10000);
const calls = [], errors = [];
page.on("pageerror", e => errors.push(e.message));
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
const clients = { 1: { id: 1, nome: "Marivaldo Santos Lima", telefoneWhatsapp: "11987654321" }, 2: { id: 2, nome: "Brenda Santos", telefoneWhatsapp: "21987654321" } };
const parcela = (numeroParcela, clienteId = 1, extra = {}) => ({ idEmprestimo: 10, numeroParcela, clienteId, nomeCliente: clients[clienteId].nome, telefoneWhatsapp: clients[clienteId].telefoneWhatsapp, valorParcela: 100, valorPago: 0, dataVencimento: "2026-10-08", status: "ATRASADO", ...extra });
const atrasadas = [parcela(1), parcela(2, 1, { dataVencimento: "2026-10-09", valorPago: 25 }), parcela(3, 2), parcela(4, 1, { nomeCliente: "Sem telefone", telefoneWhatsapp: null }), parcela(5, 1, { nomeCliente: "Quitada inconsistente", valorPago: 100 }), parcela(6, 1, { nomeCliente: "Telefone inválido", telefoneWhatsapp: "123" })];
let delayContact = false, releaseContact;
await context.route("**/api/**", async route => {
  const req = route.request(), url = new URL(req.url()), path = url.pathname.replace(/^\/api/, ""), perfil = req.headers()["x-perfil-id"];
  calls.push({ path, perfil, method: req.method(), body: req.postDataJSON() });
  const json = data => route.fulfill({ contentType: "application/json", body: JSON.stringify(data) });
  if (path === "/perfis") return json([{ id: 1, nome: "Perfil A" }, { id: 2, nome: "Perfil B" }]);
  if (path === "/parcelas/vencendo-hoje") return json(perfil === "1" ? [parcela(7, 1, { dataVencimento: today, status: "PENDENTE" }), parcela(8, 1, { nomeCliente: "Hoje quitada", dataVencimento: today, valorPago: 100 })] : []);
  if (path === "/parcelas") return json(perfil === "1" && url.searchParams.get("status") === "ATRASADO" ? atrasadas : []);
  if (path.startsWith("/clientes/")) {
    if (delayContact) await new Promise(resolve => { releaseContact = resolve; });
    return json(clients[path.split("/").at(-1)]);
  }
  if (req.method() !== "GET") return route.fulfill({ status: 204 });
  return json([]);
});
const cobrar = row => row.getByRole("button", { name: "Cobrar pelo WhatsApp", exact: true });
const row = name => page.locator("tbody tr").filter({ hasText: name });
const dialog = () => page.getByRole("dialog");
try {
  await page.goto(process.env.FRONTEND_TEST_URL || "http://127.0.0.1:5181");
  await cobrar(row("Marivaldo").first()).waitFor();
  const eligibility = await page.evaluate(async () => {
    const { parcelaCobravel } = await import("/src/utils/whatsapp.ts");
    const p = { valorParcela: "100.00", valorPago: "99.99", dataVencimento: "2026-10-28" };
    const now = new Date("2026-10-28T15:00:00Z");
    return [parcelaCobravel(p, now), parcelaCobravel(p, now, true), parcelaCobravel({ ...p, valorPago: "100.00" }, now, true), parcelaCobravel({ ...p, dataVencimento: "2026-10-29" }, now, true)];
  });
  assert.deepEqual(eligibility, [false, true, false, false]);
  assert.equal(calls.filter(c => c.path.startsWith("/clientes/")).length, 0, "No contact requests while listing rows");
  for (const name of ["Sem telefone", "Quitada inconsistente", "Telefone inválido", "Hoje quitada"]) {
    assert.equal(await cobrar(row(name)).count(), 0);
    assert.equal(await row(name).getByRole("button", { name: "Editar parcela", exact: true }).count(), 1);
    assert.equal(await row(name).getByRole("button", { name: "Pagar parcela", exact: true }).count(), 1);
  }
  const marivaldo = row("Marivaldo");
  assert.equal(await marivaldo.count(), 3);
  for (let i = 0; i < 3; i++) {
    await cobrar(marivaldo.nth(i)).click();
    const date = i === 0 ? today : i === 1 ? "2026-10-08" : "2026-10-09";
    const month = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][Number(date.slice(5, 7)) - 1];
    const expected = `Bom dia Marivaldo, a parcela venceu ${date.slice(8)} de ${month} e ainda nao foi pago.`;
    await dialog().getByText(expected, { exact: true }).waitFor();
    const link = new URL(await dialog().getByRole("link", { name: "Abrir WhatsApp" }).getAttribute("href"));
    assert.equal(link.pathname, "/5511987654321"); assert.equal(link.searchParams.get("text"), expected);
    await dialog().getByRole("button", { name: "Cancelar", exact: true }).click();
  }
  await cobrar(row("Brenda")).click();
  assert.match(await dialog().getByRole("link", { name: "Abrir WhatsApp" }).getAttribute("href"), /5521987654321/);
  await dialog().getByRole("button", { name: "Cancelar", exact: true }).click();
  await marivaldo.nth(2).getByRole("button", { name: "Editar parcela", exact: true }).click();
  await dialog().getByRole("heading", { name: "Alterar Parcela #2" }).waitFor();
  await dialog().getByRole("button", { name: "Salvar", exact: true }).click();
  await dialog().waitFor({ state: "hidden" });
  assert.equal(calls.find(c => c.path === "/parcelas/alterar").body.numeroParcela, 2);
  await marivaldo.nth(2).getByRole("button", { name: "Pagar parcela", exact: true }).click();
  assert.match(await dialog().locator("input").inputValue(), /75,00/);
  await dialog().getByRole("button", { name: "Confirmar Pagamento", exact: true }).click();
  await dialog().waitFor({ state: "hidden" });
  assert.equal(calls.find(c => c.path === "/parcelas/pagar").body.numeroParcela, 2);
  await mkdir("node_modules/.cache/dashboard-whatsapp", { recursive: true });
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const geometry = await page.locator("tbody tr").evaluateAll(rows => rows.map(r => {
      const buttons = [...r.querySelectorAll("button")].map(b => b.getBoundingClientRect());
      return { height: r.getBoundingClientRect().height, tops: buttons.map(b => b.top), displays: [...r.cells].map(c => getComputedStyle(c).display) };
    }));
    assert(geometry.every(g => g.height <= 60 && g.tops.every(t => Math.abs(t - g.tops[0]) < 2) && g.displays.every(d => d === "table-cell")), JSON.stringify(geometry));
    await page.screenshot({ path: `node_modules/.cache/dashboard-whatsapp/${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  delayContact = true; await cobrar(marivaldo.first()).click();
  await page.waitForFunction(() => document.querySelector('button[aria-label="Cobrar pelo WhatsApp"]:disabled'));
  await page.getByRole("button", { name: "Configurações", exact: true }).click();
  await page.getByLabel("Selecionar perfil", { exact: true }).selectOption("2");
  if (releaseContact) releaseContact();
  await page.getByRole("button", { name: "Dashboard", exact: true }).click();
  await page.getByText("Nenhuma parcela vencendo hoje.", { exact: true }).waitFor();
  assert.equal(await page.locator("tbody").getByText("Marivaldo Santos Lima").count(), 0);
  assert.equal(await dialog().count(), 0);
  assert(calls.filter(c => c.path.startsWith("/clientes/")).every(c => c.perfil === "1"));
  assert(calls.filter(c => c.path.startsWith("/parcelas") && c.method === "GET").some(c => c.perfil === "2"));
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log("PASS: hoje, atrasadas, parcial, quitada, sem/inválido telefone, datas, contatos, prévia/link, Editar/Pagar, tabelas horizontais 1440/768/390, Perfil e resposta antiga descartada; sem N+1 ou envio automático.");
} finally { await browser.close(); }
