# Validações e mensagens de negócio — 24/10/2026

## Auditoria das telas e do contrato da API

| Fluxo revisado | Situação encontrada | Ajuste |
|---|---|---|
| Novo Cliente | Mensagem da API em texto; erro não associado ao input; botão inválido não permitia tentativa para focalizar erros | Alerta compartilhado, campos informados pela API destacados, foco, tentativa de envio com validação, dados mantidos |
| Editar Cliente | Validações locais existentes, mas `fields` se perdia no caminho | Erros por campo, foco, aviso de sucesso após confirmação, modal preservado na falha |
| Novo Empréstimo/fiador | Erros apenas no fim do formulário; quantidade fracionária era aceita no frontend | Mensagens junto aos campos, quantidade inteira positiva, associação ARIA, seleção preservada, alerta da operação |
| Documentos | `campos` estruturados viravam string; links levavam à lista genérica de clientes | Lista de pendências por pessoa, edição inline do cadastro correto, nova prévia sem perder Cliente/Empréstimo |
| Dados do contrato/histórico | Perda de estrutura em prévia/POST e mensagens distintas | Mesmo alerta e ações de correção; regularização existente também acessível quando fiador/devedor são a mesma pessoa |
| Excel | Apenas três motivos no texto do resumo | Todas as linhas retornadas em lista, linha/cliente quando disponível/motivo e contadores; arquivo mantido quando houver pendências |
| CSV | Detalhes por linha já existiam | Preservados e complementados com campos em conflito/ausentes, linguagem legível, distinção entre aviso e bloqueio |
| apiClient | Criava Error simples; descartava status, código e estrutura | ApiError compatível com Error e normalização central de respostas e falhas de rede |

O backend já possui `DadosContratoInvalidosException` com `codigo`/`campos`, `GlobalExceptionHandler` com `fields`, mensagens específicas de CPF inválido/duplicado e validações documentais agregadas. Não foi necessário alterá-lo. A qualificação documental obrigatória continua sendo decidida pela prévia/geração do backend; não foi reproduzida como uma nova lista obrigatória no frontend.

## Tratamento central e apresentação

- `src/services/apiError.ts`: conserva status, código, campos, pessoa e categoria. Reconhece `mensagem`, `message`, `error`, mapa `fields` (incluindo múltiplas mensagens por campo) e lista `campos`. Mensagens antigas de CPF/RG/CEP/nome e seleção são associadas a campos conhecidos quando identificáveis.
- `src/services/apiClient.ts`: usa a mesma normalização nas operações JSON e downloads; mantém timeout, header de Perfil, FormData e nomes de download existentes. Respostas `application/problem+json` também são decodificadas.
- Categorias: validação, negócio, conflito, recurso não encontrado, Perfil, comunicação e erro interno. HTTP 400/404/409/422/500 foram conferidos no teste. Perfil ausente/inválido recebe orientação para Configurações.
- Mensagens internas de SQL, exceções, stack traces e caminhos não são exibidas. Em 5xx, o corpo técnico não é usado como mensagem pública. Falha de comunicação orienta conferir conexão; timeout avisa conferir o resultado antes de repetir uma mutação.
- `ErroOperacao` é o único novo componente de alerta de operação, reutilizado nos fluxos revisados. Mostra título, pendências e orientação. Campos usam as mensagens próximas aos inputs, `aria-invalid`, `aria-describedby` e foco no primeiro erro. O alerta geral é limpo ao editar; o React Hook Form revalida o campo alterado.
- Bloqueios e conflitos de linhas CSV recebem destaque de erro; avisos não bloqueantes usam âmbar. Alertas não dependem exclusivamente da cor.

## Regras e estado preservados

As validações de CPF, estrutura de RG e CEP existentes foram reutilizadas. Campos cadastrais opcionais vazios permanecem opcionais na edição; consulta de legados não ganhou exigência de qualificação completa. A criação mantém os requisitos cadastrais previamente existentes. Não foi introduzido cálculo de dígito de RG.

Na criação de empréstimos, mensagens de valor positivo/parcelas inteiras foram explicitadas. Juros passam a seguir o limite efetivamente existente no backend: taxa não negativa, sem o antigo teto arbitrário de 100 exclusivo da UI. Nenhuma fórmula financeira foi alterada. A criação não recebe data inicial manual; não foi inventado um campo de data ou uma validação para ele.

`aplicarErrosFormulario` associa somente campos da forma atual e agenda foco depois do envio. Dados, fiador, valores e datas não são apagados em falha. Cliente/Empréstimo/Documento mantêm lock por ref; os formulários também mantêm estado explícito enquanto há requisição em andamento, evitando liberar a tela prematuramente em submissões repetidas. O fluxo já existente de Cliente criado cuja atualização da lista falha continua sem emitir um segundo POST.

`CorrecaoDadosContrato` abre `EditarClienteDialog` dentro do contexto atual. Para o devedor consulta seu ID; para o fiador relê o vínculo do empréstimo na API antes de abrir o Cliente correspondente. Depois de salvar, reconsulta a prévia. Sucesso de Cliente, edição, empréstimo e contrato só aparece após confirmação da API. Templates, parcelas, juros, pagamentos, snapshots e documentos históricos não foram modificados.

## Testes executados

Infraestrutura existente: scripts `.mjs`, Playwright e Microsoft Edge headless, Vite temporário, API simulada. Nenhuma gravação em banco real.

`tests/validacoes-negocio.mjs` aprovado:

1. CPF duplicado em criação: 409, alerta específico, campo/foco, correção e preservação de dados.
2. CPF inválido na edição bloqueia PUT; erro associado via ARIA.
3. Backend retorna vários `fields`/422: todos aparecem, são associados aos inputs e corrigidos.
4. Empréstimo sem fiador/valor zero/quantidade fracionária não é enviado; fiador igual ao devedor não aparece entre as opções.
5. Erro de fiador/Perfil retornado pela API preserva os valores e o fiador selecionado.
6. Contrato com RG/profissão do devedor ausentes e CPF inválido do fiador mostra três pendências simultâneas.
7. Editar devedor/fiador abre os IDs corretos; salvar revalida e mantém empréstimo #10 selecionado; geração confirmada no histórico.
8. Falha de comunicação mantém o formulário; 500 com SQL/caminho interno não expõe o texto técnico.
9. Duplo clique em cadastro de Cliente, empréstimo e geração de documentos resulta em somente um POST de cada tentativa.
10. Excel mostra cinco linhas de erro, inclusive a última e seu Cliente quando fornecido; CSV mostra ambiguidade, conflito e CPF inválido.
11. Normalização dos status HTTP e compatibilidade com `mensagem` antiga conferidas.
12. Mobile 390x844 sem overflow e sem erros JavaScript.

Regressões `tests/cep.mjs` e `tests/relatorio-parcelas.mjs`: aprovadas. Confirmação de formulário manual, falhas de ViaCEP, edição de legado, respostas antigas, PNG/clipboard e isolamento de Perfil. Evidências visuais locais em `node_modules/.cache/validacoes-qa/`.

`npm run lint`: aprovado, sem erros/warnings. `npm run build`: aprovado; permanece o aviso de bundle principal acima de 1000 kB. `git diff --check`: sem erros. Nenhuma dependência adicionada nesta tarefa. Não foram executados testes Maven porque o backend foi apenas inspecionado.

## Pendências identificadas

- A criação pela API aceita diretamente fiador igual ao devedor; o frontend já excluía essa opção e a validação documental do backend a rejeita. Essa divergência exige decisão da auditoria de negócio; não foi adicionada uma nova proibição no backend nesta tarefa.
- O DTO atual de erro de importação Excel fornece linha/motivo, sem nome do Cliente. A UI exibe o nome se o contrato o disponibilizar; não inventa essa informação.
- Respostas antigas com somente texto não permitem identificar sempre cada pessoa/campo com segurança; a mensagem permanece disponível, sem atribuições especulativas. Status e campos das respostas estruturadas são preservados.
- Testes de UI usam fixtures alinhadas ao contrato lido, não homologação com dados reais. Não substituem os testes de regras de negócio do backend.

## Arquivos desta alteração

Novos: `apiError.ts`, `ErroOperacao.tsx`, `errosFormulario.ts`, `CorrecaoDadosContrato.tsx`, `tests/validacoes-negocio.mjs` e este relatório.

Atualizados: `apiClient.ts`, `ClienteFormFields.tsx`, `ModalCadastro.tsx`, `EditarClienteDialog.tsx`, `useEmprestimo.ts`, `Clients/index.tsx`, `NovoEmprestimoDialog.tsx`, `FiadorSelector.tsx`, `Documentos/useConsulta.ts`, `DocumentosEmprestimo.tsx`, `DadosContratoDialog.tsx`, `ContratosGerados.tsx`, `BackupPage/index.tsx` e `ImportacaoClientesCsvCard.tsx`. Alterações preexistentes em outros arquivos, incluindo auditoria cadastral/backend e relatório de parcelas, foram preservadas.
