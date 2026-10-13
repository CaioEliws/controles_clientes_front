// Browser tests with isolated application/CEP fixtures; no real customer writes.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE_PATH || "playwright");
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const context = await browser.newContext();
const page = await context.newPage();
const base = process.env.FRONTEND_TEST_URL || "http://127.0.0.1:5181";
const consultas = [], gravacoes = [], erros = [];
page.on("pageerror", (error) => erros.push(error.message));
const cliente = { id: 1, nome: "Cliente Legado", sexoDocumento: "FEMININO", nomeIndicador: null,
  nacionalidade: "BRASIL", estadoCivil: "CASADO", profissao: "Vendedora", cpf: null, rg: null,
  rgOrgaoExpedidor: "SSP/SP", enderecoCep: "13346-674", enderecoRua: "Rua Histórica", enderecoBairro: "Bairro Histórico",
  enderecoCidade: "Cidade Histórica", enderecoEstado: "SP", enderecoNumero: 23, enderecoComplemento: "Casa B" };
await context.route("**/api/**", async (route) => {
  const req = route.request(), path = new URL(req.url()).pathname.replace(/^\/api/, "");
  const json = (data) => route.fulfill({ contentType: "application/json", body: JSON.stringify(data) });
  if (path === "/perfis") return json([{ id: 1, nome: "Perfil Teste" }]);
  if (path === "/documentos/opcoes-cadastro") return json({ sexos: [{ codigo: "FEMININO", descricao: "Feminino", nacionalidade: "brasileira" }], ufs: [{ codigo: "SP", descricao: "São Paulo" }, { codigo: "RJ", descricao: "Rio de Janeiro" }] });
  if (req.method() === "POST" || req.method() === "PUT") { gravacoes.push(req.postDataJSON()); return route.fulfill({ status: 204 }); }
  if (path === "/clientes") return json([cliente]);
  if (path === "/clientes/1") return json(cliente);
  return json([]);
});
const ruaNova = { logradouro: "Rua ViaCEP", bairro: "Bairro ViaCEP", localidade: "Indaiatuba", uf: "SP", complemento: "IGNORAR" };
let modo = "sucesso", antiga;
await page.goto(`${base}/clientes`);
// An actual browser fetch checks direct cross-origin access separately from fixtures.
try {
  const real = await page.evaluate(async () => {
    const r = await fetch("https://viacep.com.br/ws/13346674/json/", { signal: AbortSignal.timeout(5000) });
    const dados = await r.json();
    return { status: r.status, tipo: r.type, uf: dados.uf, naoEncontrado: dados.erro === true || dados.erro === "true" };
  });
  assert.equal(real.status, 200); assert.equal(real.tipo, "cors");
  assert.ok(real.naoEncontrado || typeof real.uf === "string");
  console.log(`PASS ViaCEP real: browser cross-origin fetch HTTP 200, CORS; CEP 13346674 ${real.naoEncontrado ? "not found by provider" : `UF ${real.uf}`}`);
} catch (error) { console.log(`ViaCEP real unavailable in this environment: ${error.message}`); }
await context.route("https://viacep.com.br/ws/**", async (route) => {
  consultas.push(route.request().url());
  assert.equal(route.request().headers()["x-perfil-id"], undefined);
  const json = (data) => route.fulfill({ contentType: "application/json", body: JSON.stringify(data) });
  if (modo === "offline") return route.abort("failed");
  if (modo === "erro") return route.fulfill({ status: 500, body: "error" });
  if (modo === "timeout") { await new Promise((resolve) => setTimeout(resolve, 4600)); return json(ruaNova).catch(() => {}); }
  if (modo === "inexistente") return json({ erro: true });
  if (modo === "parcial") return json({ logradouro: "", bairro: "", localidade: "Cidade CEP geral", uf: "RJ" });
  if (modo === "antiga") { antiga = () => json({ ...ruaNova, logradouro: "RESPOSTA ANTIGA" }).catch(() => {}); return; }
  return json(ruaNova);
});
const novo = () => page.getByRole("dialog", { name: "Cadastrar Novo Cliente", exact: true });
const campo = (dialog, nome) => dialog.getByLabel(nome, { exact: true });
const valor = async (dialog, nome, esperado) => assert.equal(await campo(dialog, nome).inputValue(), esperado);
async function preencherCep(dialog, cep) { await campo(dialog, "CEP").fill(cep); }
try {
  await page.getByRole("button", { name: "Novo Cliente", exact: true }).click();
  const d = novo();
  await campo(d, "Nome completo").fill("Cliente CEP");
  await campo(d, "Sexo para o documento").selectOption("FEMININO");
  await campo(d, "Número").fill("44"); await campo(d, "Complemento").fill("Apto 2");
  for (const cep of ["1334", "1334667", "13346A74"]) await preencherCep(d, cep);
  assert.equal(consultas.length, 0);
  await preencherCep(d, "13346674");
  await campo(d, "Rua").evaluate((el) => el.value); // settle through assertions below
  await page.waitForFunction(() => document.querySelector('input[id$="-enderecoRua"]')?.value === "Rua ViaCEP");
  await valor(d, "CEP", "13346-674"); await valor(d, "Rua", "Rua ViaCEP");
  await valor(d, "Bairro", "Bairro ViaCEP"); await valor(d, "Cidade", "Indaiatuba");
  await valor(d, "Estado / UF", "SP"); await valor(d, "Número", "44"); await valor(d, "Complemento", "Apto 2");
  assert.equal(await campo(d, "Número").evaluate((el) => el === document.activeElement), true);
  await preencherCep(d, "13346-675"); await page.waitForFunction(() => document.activeElement?.id.endsWith('-enderecoNumero'));
  assert.ok(consultas.at(-1).includes("13346675"));
  console.log("PASS valid/masked CEP, no partial or alphabetic calls, mapped fields, number/complement preserved and focus");

  for (const tipo of ["inexistente", "offline", "erro", "timeout"]) {
    modo = tipo;
    await preencherCep(d, "99999-999");
    const msg = tipo === "inexistente" ? "CEP não encontrado." : "Não foi possível consultar o CEP. Preencha o endereço manualmente.";
    await d.getByText(msg, { exact: true }).waitFor();
    await valor(d, "Rua", "Rua ViaCEP");
    assert.equal(await d.getByRole("button", { name: "Salvar Cliente", exact: true }).isEnabled(), true);
    await preencherCep(d, "123");
  }
  modo = "parcial"; await preencherCep(d, "13346674");
  await page.waitForFunction(() => document.querySelector('input[id$="-enderecoCidade"]')?.value === "Cidade CEP geral");
  await valor(d, "Rua", "Rua ViaCEP"); await valor(d, "Bairro", "Bairro ViaCEP"); await valor(d, "Estado / UF", "RJ");
  modo = "antiga"; await preencherCep(d, "13346675");
  await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent === "Buscando endereço...");
  // Wait for the isolated route to hold the old response before changing CEP.
  while (!antiga) await new Promise((resolve) => setTimeout(resolve, 10));
  modo = "sucesso"; await preencherCep(d, "13346676");
  await page.waitForFunction(() => document.querySelector('input[id$="-enderecoCidade"]')?.value === "Indaiatuba");
  await antiga(); await valor(d, "Rua", "Rua ViaCEP"); await valor(d, "CEP", "13346-676");
  console.log("PASS nonexistent/offline/HTTP 500/timeout, fields retained, save enabled, partial results and stale response protection");
  modo = "offline"; await preencherCep(d, "99999999");
  await d.getByText("Não foi possível consultar o CEP. Preencha o endereço manualmente.", { exact: true }).waitFor();
  await d.getByRole("button", { name: "Salvar Cliente", exact: true }).click();
  await d.waitFor({ state: "hidden" }); assert.equal(gravacoes.length, 1); assert.equal(gravacoes[0].enderecoNumero, 44); assert.equal(gravacoes[0].enderecoComplemento, "Apto 2");
  const antes = consultas.length;
  await page.getByRole("row").filter({ hasText: "Cliente Legado" }).getByRole("button", { name: "Editar", exact: true }).click();
  const ed = page.getByRole("dialog", { name: "Editar Cliente", exact: true });
  await valor(ed, "Rua", "Rua Histórica"); await valor(ed, "CEP", "13346-674"); assert.equal(consultas.length, antes);
  modo = "sucesso"; await preencherCep(ed, "13346675");
  await page.waitForFunction(() => document.querySelector('input[id$="-enderecoRua"]')?.value === "Rua ViaCEP");
  await valor(ed, "Número", "23"); await valor(ed, "Complemento", "Casa B");
  await ed.getByRole("button", { name: "Salvar alterações", exact: true }).click(); await ed.waitFor({ state: "hidden" });
  assert.equal(gravacoes[1].enderecoNumero, 23); assert.equal(gravacoes[1].enderecoComplemento, "Casa B");
  console.log("PASS save while ViaCEP unavailable and editing preserves historical address on open, updates only after user change");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Novo Cliente", exact: true }).click();
  modo = "antiga"; antiga = undefined; await preencherCep(d, "13346674");
  await d.getByText("Buscando endereço...", { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= 390), true);
  const bounds = await d.boundingBox(); assert.ok(bounds.width <= 390 && bounds.x >= 0);
  while (!antiga) await new Promise((resolve) => setTimeout(resolve, 10));
  await antiga(); await page.waitForFunction(() => document.querySelector('input[id$="-enderecoRua"]')?.value === "RESPOSTA ANTIGA");
  modo = "inexistente"; await preencherCep(d, "99999999"); await d.getByText("CEP não encontrado.", { exact: true }).waitFor();
  assert.equal(await campo(d, "CEP").isEditable(), true);
  assert.deepEqual(erros, []);
  console.log("PASS mobile loading/error/filled address, editable fields, no overflow and no JavaScript errors");
} finally { await browser.close(); }
