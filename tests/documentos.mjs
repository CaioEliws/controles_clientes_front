// Integration of browser UI with an isolated API double; no real database writes.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE_PATH || "playwright");
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();
const base = process.env.FRONTEND_TEST_URL || "http://127.0.0.1:5173";
const calls = [];
const jsErrors = [];
page.on("pageerror", (error) => jsErrors.push(error.message));
const pessoa = { nomeCompleto: "Devedor Completo", nacionalidade: "Brasileira", estadoCivil: "CASADO", profissao: "Professor", cpf: "001.234.567-89", rg: "001-X", rgOrgaoExpedidor: "SSP", enderecoRua: "Rua A", enderecoNumero: 10, enderecoComplemento: null, enderecoBairro: "Centro", enderecoCep: "00100-000", enderecoCidade: "Cidade", enderecoEstado: "SP" };
const lista = [{ id: 1, nome: "Samuel M. Teixeira Moreira", cpf: "001.234.567-89", enderecoCidade: "Cidade", enderecoEstado: "SP" }, { id: 2, nome: "João Ferreira", cpf: "011.111.111-11" }, { id: 3, nome: "Cliente Sem Empréstimo", cpf: null }];
const loans = [{ id: 3607, dataEmprestimo: "2026-10-05", valorEmprestado: 100, quantidadeParcelas: 2 }, { id: 11, dataEmprestimo: "2026-09-02", valorEmprestado: 200, quantidadeParcelas: 3 }];
const snapshot = (id) => ({ emprestimoId: id, credor: { ...pessoa, nomeCompleto: "Edson Antonio Vieira" }, devedor: { ...pessoa, nomeCompleto: "Samuel M. Teixeira Moreira" }, fiador: { ...pessoa, nomeCompleto: "Vanessa V. Martins Carvalho" }, emprestimo: { valorEmprestado: 100, taxaDeJuros: 10, valorParcela: 55, valorTotalEmprestimo: 110, quantidadeParcelas: 2, dataDoEmprestimo: "2026-10-05", inicioPagamento: "2026-11-05", finalPagamento: "2026-12-05", formaPagamento: "PIX", frequenciaPagamento: "MENSAL", tipoContrato: "FISICO", emprestimoStatus: "EM_ABERTO" }, parcelas: [] });
const history = new Map([["1-3607", [{ id: 12, emprestimoId: 3607, versaoTemplate: "v1", dataGeracao: "2026-10-02T17:15:00Z", nomeArquivo: "contrato12.docx", hashDocumento: "test", pdfDisponivel: false }, { id: 15, emprestimoId: 3607, versaoTemplate: "v1", dataGeracao: "2026-10-05T14:32:00Z", nomeArquivo: "contrato15.docx", hashDocumento: "test", pdfDisponivel: true }]]]);
let erroClientes = false, erroLoans = false, erroGerar = false, erroDownload = false, erroHistory = false;
let cadastroMudou = false, semNomePdf = false;
let erroPrevia = null, previaValida = true;
let delayDados = false, resolveDados;
await context.route("**/api/**", async (route) => {
  const req = route.request();
  const path = new URL(req.url()).pathname.replace(/^\/api/, "");
  const method = req.method();
  const perfilId = Number(req.headers()["x-perfil-id"]);
  calls.push({ path, method, perfilId, body: req.postData() });
  const json = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(data) });
  if (path === "/perfis") return json([{ id: 1, nome: "Perfil Atual" }, { id: 2, nome: "Outro Perfil" }]);
  if (/^\/perfis\/\d+$/.test(path)) return json({ id: perfilId, nome: "Perfil" });
  if (path === "/clientes") return erroClientes ? json({ message: "Clientes indisponíveis" }, 503) : json(perfilId === 1 ? lista : [{ id: 4, nome: "Cliente Outro Perfil", cpf: "222.222.222-22" }]);
  const details = path.match(/^\/clientes\/(\d+)\/emprestimos\/detalhes$/);
  if (details) return erroLoans ? json({ message: "Empréstimos indisponíveis" }, 503) : json(Number(details[1]) === 3 ? [] : loans);
  const dados = path.match(/^\/clientes\/(\d+)\/emprestimos\/(\d+)\/contratos\/previa$/);
  if (dados) {
    if (delayDados) await new Promise((resolve) => { resolveDados = resolve; });
    if (erroPrevia) return json({ message: erroPrevia }, 400);
    return Number(dados[2]) === 11 ? json({ message: "Dados do fiador incompletos: cpf, rg." }, 400) : json({ validoParaGeracao: previaValida, dados: snapshot(Number(dados[2])), testemunha: { nome: "Ivani Elias Machado Vieira", cpf: "215.637.868-18", rg: "30.623.886-X" } });
  }
  const contratos = path.match(/^\/clientes\/(\d+)\/emprestimos\/(\d+)\/contratos$/);
  if (contratos) {
    const key = `${contratos[1]}-${contratos[2]}`;
    if (method === "POST") {
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (erroGerar) return json({ message: "Conversão PDF indisponível" }, 500);
      if (cadastroMudou) return json({ message: "Dados do fiador incompletos: cpf." }, 400);
      const item = { id: 18, emprestimoId: Number(contratos[2]), versaoTemplate: "v1", dataGeracao: "2026-10-05T15:00:00Z", nomeArquivo: "contrato18.docx", hashDocumento: "test", pdfDisponivel: true };
      history.set(key, [item, ...(history.get(key) ?? [])]);
      return json(item, 201);
    }
    return erroHistory ? json({ message: "Histórico indisponível" }, 503) : json(history.get(key) ?? []);
  }
  const baixar = path.match(/\/contratos\/(\d+)\/(download-pdf|download)$/);
  if (baixar) {
    if (erroDownload) return json({ message: "Download indisponível" }, 503);
    const pdf = baixar[2] === "download-pdf";
    return route.fulfill({ status: 200, headers: pdf ? { "Content-Type": "application/pdf", ...(semNomePdf ? {} : { "Content-Disposition": "attachment; filename*=UTF-8''contrato%20final%20%C3%A7.pdf" }) } : { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": 'attachment; filename="contrato.docx"' }, body: pdf ? "%PDF-1.4\nmock-pdf" : "PK-mock-docx" });
  }
  return json({ message: `Unexpected API: ${path}` }, 404);
});
const posts = () => calls.filter((call) => call.method === "POST").length;
async function selectCliente(nome, busca = nome) {
  await page.getByRole("combobox", { name: "Cliente / Devedor", exact: true }).click();
  await page.getByRole("textbox", { name: "Buscar cliente por nome ou CPF", exact: true }).fill(busca);
  await page.getByRole("button", { name: new RegExp(nome) }).click();
}
async function selectLoan(id = "3607") { await page.getByLabel("Empréstimo", { exact: true }).selectOption(id); }
const gerarBtn = () => page.getByRole("button", { name: "Gerar contrato + promissória", exact: true });
try {
  await page.goto(`${base}/documentos`);
  await page.getByRole("heading", { name: "Documentos", exact: true }).waitFor();
  await page.getByText("Selecione um cliente para começar.").waitFor();
  assert.equal(await gerarBtn().isDisabled(), true);
  assert.equal(calls.some((call) => call.path.includes("/emprestimos")), false);
  assert.equal(await page.locator("aside").getByRole("button", { name: "Documentos", exact: true }).count(), 1);
  await selectCliente("Samuel M. Teixeira Moreira", "00123456789");
  await page.getByLabel("Empréstimo", { exact: true }).locator("option[value='3607']").waitFor({ state: "attached" });
  assert.equal((await page.locator("#documentos-emprestimo option").allTextContents())[1].startsWith("#3607"), true);
  assert.equal(await gerarBtn().isDisabled(), true);
  delayDados = true;
  await selectLoan();
  await page.getByRole("status", { name: "Carregando dados contratuais", exact: true }).waitFor();
  assert.equal(await gerarBtn().isDisabled(), true);
  delayDados = false; resolveDados();
  await page.getByText("Dados prontos para geração", { exact: true }).waitFor();
  await page.getByRole("heading", { name: "Devedor", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Fiador", exact: true }).waitFor();
  await page.getByText("Vanessa V. Martins Carvalho", { exact: true }).waitFor();
  await page.getByText("Edson Antonio Vieira", { exact: true }).waitFor();
  assert.equal(await page.getByText("Credor de Teste").count(), 0);
  assert.equal(await gerarBtn().isEnabled(), true);
  const historico = page.getByRole("region", { name: "Documentos gerados", exact: true });
  await historico.getByText("Contrato #15", { exact: true }).waitFor();
  assert.equal((await historico.locator("li").allTextContents())[0].includes("#15"), true);
  assert.equal(await historico.locator("li").filter({ hasText: "Contrato #12" }).getByRole("button", { name: "Baixar PDF", exact: true }).isDisabled(), true);
  console.log("PASS route/menu, CPF search, selected client, ordered loans/history, loading, preview, fixed model people and generation gates");

  await gerarBtn().click();
  let modal = page.getByRole("dialog", { name: "Gerar documentos?", exact: true });
  await modal.getByRole("button", { name: "Cancelar", exact: true }).click();
  assert.equal(posts(), 0);
  await gerarBtn().click();
  const beforeHistory = calls.filter((call) => call.path.endsWith("/contratos") && call.method === "GET").length;
  await modal.getByRole("button", { name: "Gerar documentos", exact: true }).click();
  assert.equal(await modal.getByRole("button", { name: "Gerando documentos...", exact: true }).isDisabled(), true);
  await page.getByText("Documentos gerados com sucesso.", { exact: true }).waitFor();
  await historico.getByText("Contrato #18", { exact: true }).waitFor();
  assert.equal(posts(), 1);
  assert.equal(calls.filter((call) => call.path.endsWith("/contratos") && call.method === "GET").length, beforeHistory + 1);
  assert.equal(calls.find((call) => call.method === "POST").path, "/clientes/1/emprestimos/3607/contratos");
  assert.equal(calls.find((call) => call.method === "POST").body, null);
  assert.equal(calls.find((call) => call.method === "POST").perfilId, 1);
  const newest = historico.locator("li").filter({ hasText: "Contrato #18" });
  for (const [button, filename, content] of [["Baixar PDF", "contrato final ç.pdf", "%PDF-1.4\nmock-pdf"], ["Baixar Word", "contrato.docx", "PK-mock-docx"]]) {
    const event = page.waitForEvent("download");
    await newest.getByRole("button", { name: button, exact: true }).click();
    const download = await event;
    assert.equal(download.suggestedFilename(), filename);
    assert.equal((await readFile(await download.path())).toString(), content);
  }
  console.log("PASS confirmation cancellation, single POST without body, refreshed history, Blob PDF/Word with exact bytes and Content-Disposition filenames");
  semNomePdf = true;
  const fallbackEvent = page.waitForEvent("download");
  await newest.getByRole("button", { name: "Baixar PDF", exact: true }).click();
  assert.equal((await fallbackEvent).suggestedFilename(), "contrato-18.pdf");
  semNomePdf = false;

  erroDownload = true;
  await newest.getByRole("button", { name: "Baixar PDF", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Download indisponível" }).waitFor();
  erroDownload = false;
  erroGerar = true;
  await gerarBtn().click();
  await modal.getByRole("button", { name: "Gerar documentos", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Conversão PDF indisponível" }).waitFor();
  erroGerar = false;
  cadastroMudou = true;
  await gerarBtn().click();
  await modal.getByRole("button", { name: "Gerar documentos", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Dados do fiador incompletos: cpf." }).waitFor();
  assert.equal(await gerarBtn().isDisabled(), true);
  cadastroMudou = false;
  await page.getByRole("button", { name: "Revalidar dados contratuais", exact: true }).click();
  await page.getByText("Dados prontos para geração", { exact: true }).waitFor();
  await selectLoan("11");
  await page.getByRole("heading", { name: "Cadastro incompleto", exact: true }).waitFor();
  assert.equal(await page.getByRole("link", { name: "Editar cliente ou fiador", exact: true }).count(), 1);
  await page.getByRole("alert").filter({ hasText: "cpf, rg" }).waitFor();
  assert.equal(await gerarBtn().isDisabled(), true);
  assert.equal(await page.getByText("Documentos gerados com sucesso.", { exact: true }).count(), 0);
  assert.equal(await page.getByText("Contrato #18", { exact: true }).count(), 0);
  await selectCliente("João Ferreira", "joao");
  assert.equal(await page.getByLabel("Empréstimo", { exact: true }).inputValue(), "");
  assert.equal(await page.getByText("Vanessa V. Martins Carvalho", { exact: true }).count(), 0);
  await selectCliente("Cliente Sem Empréstimo", "Sem");
  await page.getByText("Este cliente não possui empréstimos cadastrados.").waitFor();
  assert.equal(await gerarBtn().count(), 0);
  console.log("PASS generation/download errors, incomplete fields/gate, loan/client switching clears preview/history, no-loan state and accented name search");

  erroLoans = true;
  await selectCliente("Samuel M. Teixeira Moreira", "Samuel");
  await page.getByRole("alert").filter({ hasText: "Empréstimos indisponíveis" }).waitFor();
  erroLoans = false;
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await selectLoan();
  await page.getByText("Dados prontos para geração").waitFor();
  erroHistory = true;
  await selectLoan("11");
  await page.getByRole("alert").filter({ hasText: "Histórico indisponível" }).waitFor();
  erroHistory = false;
  await page.getByRole("button", { name: "Atualizar histórico", exact: true }).click();
  await page.getByText("Nenhum documento gerado para este empréstimo.").waitFor();
  await selectLoan();
  await page.getByText("Dados prontos para geração", { exact: true }).waitFor();
  console.log("PASS PDF filename fallback, POST validation recheck and separate history error/retry");
  for (const [mensagem, editar] of [["Dados do devedor incompletos: cpf.", true], ["O empréstimo não possui fiador.", true], ["Dados das parcelas ausentes ou inconsistentes para o contrato.", false], ["Dados do credor incompletos: cpf.", false]]) {
    erroPrevia = mensagem;
    await selectLoan("11");
    await page.getByRole("alert").filter({ hasText: mensagem }).waitFor();
    assert.equal(await gerarBtn().isDisabled(), true);
    assert.equal(await page.getByRole("link", { name: "Editar cliente ou fiador", exact: true }).count(), editar ? 1 : 0);
    erroPrevia = null;
    await selectLoan();
    await page.getByText("Dados prontos para geração", { exact: true }).waitFor();
  }
  previaValida = false;
  await selectLoan("11");
  await page.getByRole("heading", { name: "Cadastro incompleto", exact: true }).waitFor();
  await selectLoan();
  await page.getByRole("heading", { name: "Devedor", exact: true }).waitFor();
  assert.equal(await gerarBtn().isDisabled(), true);
  previaValida = true;
  await selectLoan("11");
  await page.getByRole("heading", { name: "Cadastro incompleto", exact: true }).waitFor();
  await selectLoan();
  await page.getByText("Dados prontos para geração", { exact: true }).waitFor();
  console.log("PASS Samuel #3607 with Vanessa and incomplete profile; explicit validity gate; debtor/guarantor links only for relevant errors");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator("aside").isVisible(), false);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= 390), true);
  await gerarBtn().click();
  const bounds = await modal.boundingBox();
  assert.ok(bounds.x >= 0 && bounds.width <= 390);
  await modal.getByRole("button", { name: "Cancelar", exact: true }).click();
  console.log("PASS loans error/retry and mobile layout/menu/confirmation");

  await page.goto(`${base}/configuracoes`);
  await page.locator("select").first().selectOption("2");
  await page.goto(`${base}/documentos`);
  await selectCliente("Cliente Outro Perfil", "222");
  assert.equal(await page.getByText("Contrato #18", { exact: true }).count(), 0);
  assert.equal(calls.findLast((call) => call.path === "/clientes").perfilId, 2);
  erroClientes = true;
  await page.reload();
  await page.getByRole("alert").filter({ hasText: "Clientes indisponíveis" }).waitFor();
  erroClientes = false;
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await page.getByRole("combobox", { name: "Cliente / Devedor", exact: true }).waitFor();
  assert.deepEqual(jsErrors, []);
  assert.equal(calls.some((call) => call.path.endsWith("/dados-contrato")), false);
  assert.equal(calls.some((call) => /fiador$|quitar|refinanciar|reprogramar|pagar/.test(call.path)), false);
  console.log("PASS profile isolation/reset/header, clients error/retry and no JS errors or financial mutations");
} finally { resolveDados?.(); await browser.close(); }
