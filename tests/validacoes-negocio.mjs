// Real UI + isolated API fixtures; never touches production customers or loans.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE_PATH || "playwright");
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const context = await browser.newContext(); const page = await context.newPage();
page.setDefaultTimeout(12000);
const base = process.env.FRONTEND_TEST_URL || "http://127.0.0.1:5181";
const errors = [], calls = [];
await mkdir("node_modules/.cache/validacoes-qa", { recursive: true });
page.on("pageerror", e => errors.push(e.message));
const pessoa = { sexoDocumento: "FEMININO", nomeIndicador: null, nacionalidade: "BRASIL", estadoCivil: "CASADO", profissao: "Vendedora",
  cpf: "52998224725", rg: "52779723X", rgOrgaoExpedidor: "SSP/SP", enderecoRua: "Rua Teste", enderecoNumero: 10,
  enderecoComplemento: "Casa B", enderecoBairro: "Centro", enderecoCidade: "Indaiatuba", enderecoEstado: "SP", enderecoCep: "13346674" };
let clientes = [{ ...pessoa, id: 1, nome: "Devedora Teste" }, { ...pessoa, id: 2, nome: "Fiadora Teste", cpf: "11144477735" }];
const loan = { id: 10, nomeCliente: clientes[0].nome, fiadorId: 2, fiadorNome: clientes[1].nome,
  dataEmprestimo: "2026-10-01", valorEmprestado: 1000, valorTotalEmprestimo: 1100, valorParcela: 550, quantidadeParcelas: 2,
  formaPagamento: "PIX", frequenciaPagamento: "MENSAL", tipoContrato: "FISICO", inicioPagamento: "2026-11-01", finalPagamento: "2026-12-01",
  status: "EM_ABERTO", parcelasPagas: 0, parcelasPendentes: 2, parcelasAtrasadas: 0, valorRecebido: 0, valorAReceber: 1100 };
let criarErro = "duplicado", editarErro = null, loanErro = null, documentoErro = false;
let historico = [];
const pendencias = () => [!clientes[0].rg && { pessoa: "DEVEDOR", campo: "rg", mensagem: "Campo obrigatório não informado." },
  !clientes[0].profissao && { pessoa: "DEVEDOR", campo: "profissao", mensagem: "Informe a profissão." },
  clientes[1].cpf === "12345678900" && { pessoa: "FIADOR", campo: "cpf", mensagem: "CPF inválido; confira os dígitos." }].filter(Boolean);
await context.route("https://viacep.com.br/**", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ localidade: "Indaiatuba", uf: "SP" }) }));
await context.route("**/api/**", async route => {
  const req = route.request(), url = new URL(req.url()), path = url.pathname.replace(/^\/api/, ""), method = req.method();
  calls.push({ path, method, body: req.postData(), perfil: req.headers()["x-perfil-id"] });
  const json = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(data) });
  if (path === "/perfis") return json([{ id: 1, nome: "Perfil da auditoria" }]);
  if (path === "/documentos/opcoes-cadastro") return json({ ufs: [{ codigo: "SP", descricao: "São Paulo" }], sexos: [{ codigo: "FEMININO", descricao: "Feminino", nacionalidade: "brasileira" }] });
  if (path === "/clientes") {
    if (method === "GET") return json(clientes);
    await new Promise(resolve => setTimeout(resolve, 180));
    if (criarErro === "duplicado") return json({ message: "Este CPF já está cadastrado para outro cliente neste perfil." }, 409);
    if (criarErro === "interno") return json({ message: "java.sql.SQLException at C:\\servidor\\segredo.sql" }, 500);
    if (criarErro === "rede") return route.abort("failed");
    clientes.push({ id: 3, ...req.postDataJSON() }); return route.fulfill({ status: 201 });
  }
  const cliente = path.match(/^\/clientes\/(\d+)$/);
  if (cliente) {
    const index = clientes.findIndex(c => c.id === Number(cliente[1]));
    if (method === "PUT") {
      if (editarErro) return json({ mensagem: "Corrija os campos.", fields: { rg: "RG inválido retornado pela API.", enderecoCep: "CEP inválido retornado pela API." } }, 422);
      clientes[index] = { id: Number(cliente[1]), ...req.postDataJSON() };
    }
    return json(clientes[index]);
  }
  if (path === "/clientes/1/emprestimos/detalhes" || path === "/clientes/1/emprestimos") {
    if (method === "POST") {
      await new Promise(resolve => setTimeout(resolve, 180));
      if (loanErro) return json({ mensagem: "O fiador selecionado não pertence ao Perfil ativo.", fields: { fiadorId: "Selecione um fiador do Perfil ativo." } }, 400);
      return route.fulfill({ status: 201 });
    }
    return json([loan]);
  }
  if (path.endsWith("/contratos/previa")) {
    if (documentoErro && pendencias().length) return json({ codigo: "DADOS_CONTRATO_INCOMPLETOS", mensagem: "Existem informações pendentes.", campos: pendencias() }, 400);
    const parte = c => ({ ...c, nomeCompleto: c.nome });
    return json({ validoParaGeracao: true, testemunha: { nome: "Ivani Elias Machado Vieira" }, dados: {
      emprestimoId: 10, credor: { ...parte(clientes[0]), nomeCompleto: "Edson Antonio Vieira" }, devedor: parte(clientes[0]), fiador: parte(clientes[1]),
      emprestimo: { ...loan, dataDoEmprestimo: loan.dataEmprestimo, emprestimoStatus: loan.status }, parcelas: [] } });
  }
  if (path.endsWith("/contratos")) {
    if (method === "POST") {
      await new Promise(resolve => setTimeout(resolve, 180));
      historico = [{ id: 7, emprestimoId: 10, dataGeracao: "2026-10-24T12:00:00Z", versaoTemplate: "v1", pdfDisponivel: true, nomeArquivo: "contrato.docx", hashDocumento: "fixture" }];
      return json(historico[0], 201);
    }
    return json(historico);
  }
  if (path === "/import") return json({ totalLinhas: 6, linhasImportadas: 1, linhasIgnoradas: 5, linhasDuplicadas: 0,
    erros: Array.from({ length: 5 }, (_, i) => ({ linha: i + 2, cliente: `Cliente linha ${i + 2}`, motivo: i === 4 ? "CPF inválido na última linha." : "Quantidade de parcelas inválida." })) });
  if (path === "/import/clientes/preview") return json({ previa: true, totalLinhas: 2, criados: 0, existentes: 0, atualizados: 0, ignorados: 0, conflitos: 1,
    erros: 1, detalhesTruncados: false, detalhes: [
      { linha: 2, nome: "Cliente Ambíguo", cpf: null, status: "BLOQUEADO", motivo: "Correspondência ambígua por nome.", camposConflitantes: ["cpf"], camposAusentes: [], classificacao: "BLOQUEADO", comAviso: true },
      { linha: 3, nome: "Cliente Inválido", cpf: null, status: "ERRO", motivo: "CPF inválido.", camposConflitantes: [], camposAusentes: ["rg"], classificacao: "INVALIDO", comAviso: false }
    ] });
  return json([]);
});
const count = (path, method) => calls.filter(c => c.path === path && c.method === method).length;
const campo = (d, nome) => d.getByLabel(nome, { exact: true });
try {
  await page.goto(`${base}/clientes`);
  const formatos = await page.evaluate(async () => {
    const { erroDaApi } = await import("/src/services/apiError.ts");
    return [400, 404, 409, 422, 500].map(status => {
      const erro = erroDaApi({ mensagem: status === 500 ? "C:\\segredo\\arquivo.sql" : "Mensagem de negócio" }, status, "Operação impedida.");
      return { status: erro.status, categoria: erro.categoria, message: erro.message };
    });
  });
  assert.deepEqual(formatos.map(e => e.categoria), ["negocio", "naoEncontrado", "conflito", "validacao", "interno"]);
  assert.equal(formatos[0].message, "Mensagem de negócio"); assert.doesNotMatch(formatos[4].message, /segredo|sql/);
  await page.getByRole("button", { name: "Novo Cliente", exact: true }).click();
  let d = page.getByRole("dialog", { name: "Cadastrar Novo Cliente", exact: true });
  for (const [nome, valor] of [["Nome completo", "Cliente Novo"], ["Rua", "Rua Manual"], ["Bairro", "Bairro Manual"], ["Número", "5"], ["CPF", "52998224725"]]) await campo(d, nome).fill(valor);
  await campo(d, "Sexo para o documento").selectOption("FEMININO");
  await d.getByRole("button", { name: "Salvar Cliente", exact: true }).dblclick();
  await d.getByRole("heading", { name: "CPF já cadastrado", exact: true }).waitFor();
  assert.equal(count("/clientes", "POST"), 1);
  assert.equal(await campo(d, "CPF").getAttribute("aria-invalid"), "true");
  await page.waitForFunction(() => document.activeElement?.getAttribute("name") === "cpf");
  await page.screenshot({ path: "node_modules/.cache/validacoes-qa/cpf-duplicado.png", fullPage: true });
  assert.equal(await campo(d, "Rua").inputValue(), "Rua Manual");
  criarErro = "interno"; await campo(d, "CPF").fill("12345678909"); await d.getByRole("button", { name: "Salvar Cliente", exact: true }).click();
  await d.getByRole("alert").filter({ hasText: "O serviço apresentou uma falha" }).waitFor();
  assert.doesNotMatch(await d.textContent(), /SQLException|segredo|servidor/);
  criarErro = "rede"; await d.getByRole("button", { name: "Salvar Cliente", exact: true }).click();
  await d.getByText(/Verifique sua conexão/).waitFor(); assert.equal(await campo(d, "Nome completo").inputValue(), "Cliente Novo");
  criarErro = null; await d.getByRole("button", { name: "Salvar Cliente", exact: true }).click(); await d.waitFor({ state: "hidden" });
  await page.getByText("Cliente cadastrado com sucesso.", { exact: true }).waitFor();
  console.log("PASS duplicate CPF, focus/field error, one POST on double click, safe 500, network failure preserves input and success after API");

  await page.getByRole("row").filter({ hasText: "Devedora Teste" }).getByRole("button", { name: "Editar", exact: true }).click();
  d = page.getByRole("dialog", { name: "Editar Cliente", exact: true });
  const antes = count("/clientes/1", "PUT");
  await campo(d, "CPF").fill("1234"); await d.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  assert.equal(count("/clientes/1", "PUT"), antes); assert.equal(await campo(d, "CPF").getAttribute("aria-invalid"), "true");
  assert.ok(await campo(d, "CPF").getAttribute("aria-describedby"));
  await campo(d, "CPF").fill("52998224725"); editarErro = true;
  await d.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await d.getByText("RG inválido retornado pela API.", { exact: true }).first().waitFor();
  assert.equal(await campo(d, "RG").getAttribute("aria-invalid"), "true"); assert.equal(await campo(d, "CEP").getAttribute("aria-invalid"), "true");
  await page.waitForFunction(() => document.activeElement?.getAttribute("name") === "rg");
  editarErro = null; await campo(d, "RG").fill("12345678"); await campo(d, "CEP").fill("13346-674");
  await d.getByRole("button", { name: "Salvar alterações", exact: true }).click(); await d.waitFor({ state: "hidden" });
  await page.getByText("Dados cadastrais atualizados.", { exact: true }).waitFor();
  console.log("PASS invalid CPF blocked in edit; backend fields/422 grouped and bound with aria, focus and correction");

  await page.goto(`${base}/emprestimo?selectedCliente=1`);
  await page.getByRole("button", { name: "Criar Empréstimo", exact: true }).click();
  d = page.getByRole("dialog", { name: "Novo Empréstimo", exact: true });
  await campo(d, "Valor emprestado").fill("0"); await campo(d, "Quantidade de parcelas").fill("1.5");
  await campo(d, "Juros (%)").fill("5"); await campo(d, "Forma de pagamento").selectOption("PIX");
  await d.getByRole("button", { name: "Criar empréstimo", exact: true }).click();
  assert.equal(count("/clientes/1/emprestimos", "POST"), 0);
  assert.equal(await d.getByRole("combobox", { name: "Fiador", exact: true }).getAttribute("aria-invalid"), "true");
  assert.equal(await campo(d, "Valor emprestado").getAttribute("aria-invalid"), "true");
  assert.equal(await campo(d, "Quantidade de parcelas").getAttribute("aria-invalid"), "true");
  await d.getByRole("combobox", { name: "Fiador", exact: true }).click();
  assert.equal(await page.getByRole("option", { name: "Devedora Teste", exact: true }).count(), 0);
  await page.getByRole("option", { name: "Fiadora Teste", exact: true }).click();
  await campo(d, "Valor emprestado").fill("1000"); await campo(d, "Quantidade de parcelas").fill("2");
  loanErro = true; await d.getByRole("button", { name: "Criar empréstimo", exact: true }).click();
  await d.getByText("Selecione um fiador do Perfil ativo.", { exact: true }).first().waitFor();
  assert.equal(await campo(d, "Valor emprestado").inputValue(), "1000");
  assert.equal(await d.getByRole("combobox", { name: "Fiador", exact: true }).textContent(), "Fiadora Teste");
  loanErro = null; await d.getByRole("button", { name: "Criar empréstimo", exact: true }).dblclick(); await d.waitFor({ state: "hidden" });
  assert.equal(count("/clientes/1/emprestimos", "POST"), 2);
  console.log("PASS missing guarantor/value/integer validation, own debtor excluded, API field error preserves loan/guarantor and double click lock");

  clientes[0].rg = ""; clientes[0].profissao = ""; clientes[1].cpf = "12345678900"; documentoErro = true;
  await page.goto(`${base}/documentos`);
  await page.getByRole("combobox", { name: "Cliente / Devedor", exact: true }).click();
  await page.getByRole("textbox", { name: "Buscar cliente por nome ou CPF", exact: true }).fill("Devedora");
  await page.getByRole("button", { name: /Devedora Teste/ }).click();
  await page.getByLabel("Empréstimo", { exact: true }).selectOption("10");
  await page.getByText("Encontramos 3 pendências:", { exact: true }).waitFor();
  await page.getByRole("heading", { name: "Dados pendentes para gerar o contrato", exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "node_modules/.cache/validacoes-qa/documentos-pendencias.png", fullPage: true });
  assert.equal(await page.getByRole("button", { name: "Gerar contrato + promissória", exact: true }).isDisabled(), true);
  await page.getByRole("button", { name: "Editar devedor", exact: true }).click();
  d = page.getByRole("dialog", { name: "Editar Cliente", exact: true });
  assert.equal(await campo(d, "Nome completo").inputValue(), "Devedora Teste");
  await campo(d, "RG").fill("52779723X"); await campo(d, "Profissão").fill("Vendedora");
  await d.getByRole("button", { name: "Salvar alterações", exact: true }).click(); await d.waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Editar fiador", exact: true }).click();
  d = page.getByRole("dialog", { name: "Editar Cliente", exact: true });
  assert.equal(await campo(d, "Nome completo").inputValue(), "Fiadora Teste");
  await campo(d, "CPF").fill("11144477735"); await d.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await page.getByText("Dados prontos para geração", { exact: true }).waitFor();
  assert.equal(await page.getByLabel("Empréstimo", { exact: true }).inputValue(), "10");
  await page.getByRole("button", { name: "Gerar contrato + promissória", exact: true }).click();
  await page.getByRole("dialog", { name: "Gerar documentos?", exact: true }).getByRole("button", { name: "Gerar documentos", exact: true }).dblclick();
  await page.getByText("Documentos gerados com sucesso.", { exact: true }).waitFor();
  assert.equal(count("/clientes/1/emprestimos/10/contratos", "POST"), 1);
  console.log("PASS missing debtor RG/profession and invalid guarantor CPF together, exact-person editing, preserved loan context, revalidation and generation lock");

  await page.goto(`${base}/backup`);
  await page.locator('input[accept=".xlsx"]').setInputFiles({ name: "backup.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: Buffer.from("fixture") });
  await page.getByRole("button", { name: "Importar clientes + empréstimos", exact: true }).dblclick();
  const revisao = page.getByRole("region", { name: "Pendências da importação Excel", exact: true });
  await revisao.getByText("CPF inválido na última linha.", { exact: true }).waitFor(); assert.equal(await revisao.locator("li").count(), 5);
  assert.equal(count("/import", "POST"), 1); await revisao.getByText("Linha 6 — Cliente linha 6", { exact: true }).waitFor();
  await page.getByLabel("Selecionar CSV", { exact: true }).setInputFiles({ name: "clientes.csv", mimeType: "text/csv", buffer: Buffer.from("nome;cpf\nfixture;") });
  await page.getByRole("button", { name: /Pré.visualizar/, exact: false }).click();
  await page.getByText("Correspondência ambígua por nome.", { exact: true }).waitFor();
  await page.getByText("CPF inválido.", { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  await mkdir("node_modules/.cache/validacoes-qa", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= 390), true);
  await page.screenshot({ path: "node_modules/.cache/validacoes-qa/importacao-mobile.png", fullPage: true });
  console.log("PASS Excel all row details/customer/reasons/counts, CSV ambiguity/conflict/invalid fields, mobile and no JS errors");
} finally { await browser.close(); }
