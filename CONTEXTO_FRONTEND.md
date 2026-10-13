# Contexto Completo do Frontend

## 1. Resumo executivo

Análise estática realizada em 01/10/2026. Raiz analisada: `C:/Users/caioe/Desktop/projects/controle-clientes/frontend`. Todos os caminhos deste documento são relativos a essa raiz, salvo indicação explícita. O backend Java não foi analisado: endpoints, respostas e efeitos descritos aqui são os contratos esperados pelo frontend, não uma confirmação da implementação da API.

O projeto é uma SPA React/TypeScript de gestão de clientes, empréstimos e parcelas. Possui dashboard, cadastro e exclusão de clientes, empréstimos por cliente, pagamento total/parcial, reversão de pagamento, alteração de parcela, observações, reprogramação de parcelas de um empréstimo, relatórios, simulação Price e importação/exportação Excel. Há oito telas e oito rotas de conteúdo. A aplicação tem um `ProfileProvider` global; a seleção de perfil ocorre efetivamente em Configurações. O nome e o ID do perfil ficam no contexto; somente o ID é persistido em `localStorage`, na chave `perfil_ativo_id`.

O transporte HTTP principal é um wrapper de `fetch`, em `src/services/apiClient.ts`. Não há Axios. A exportação Excel usa outro `fetch` diretamente na página de backup. As chamadas não ficam exclusivamente nos services: existem chamadas nos hooks, no contexto e nos modais.

**Constatações principais para uma próxima IA:**

- `Cliente` tem apenas `id`, `nome`, `nomeIndicador`, `enderecoRua`, `enderecoBairro`, `enderecoNumero`. O cadastro envia os cinco campos de dados. Não foi encontrada edição de cliente, nem endpoint de atualização de cliente no frontend.
- `Perfil` tem `id`, `nome`, `dataCriacao?`. Não há dados pessoais completos de credor, edição/exclusão de perfil ou credor exibido no novo empréstimo.
- O devedor do novo empréstimo é selecionado na página `/emprestimo`, passado ao modal por props e convertido em `clienteId` interno do formulário. Esse ID entra no caminho HTTP, não no JSON.
- O JSON do novo empréstimo tem exatamente `valorEmprestado`, `quantidadeParcelas`, `jurosCobrado`, `formaPagamento`, `frequenciaPagamento`, `tipoContrato`.
- Não existe conceito de fiador, avalista ou garantidor nos arquivos-fonte analisados; não existe `fiadorId`.
- Não há login, logout, token, roles ou guard de autenticação implementados. Perfil não equivale a autenticação.
- Há duplicações: dois `AlterarParcelaDialog`, APIs de observação em dois services, schema de busca repetido e sincronização de filtros de empréstimo com URL tanto na página quanto no hook.

**Cobertura e critérios de contagem:** 92 arquivos em `src/` lidos; aproximadamente 110 arquivos próprios de frontend/configuração/ativos inspecionados, incluindo metadados de `package-lock.json`, nomes de variáveis de ambiente e arquivos gerados identificados. `node_modules`, `.git` e `dist` não são código próprio analisado. Foram identificados 48 arquivos TSX de componentes fora das páginas (23 em `src/components`, 25 em subpastas de páginas), 8 páginas, 10 hooks em `src/hooks` mais 1 hook de ações junto à tabela de empréstimos, 8 arquivos em `src/services` (7 de domínio/cálculo + cliente HTTP), 44 expressões de chamada a `apiClient` mais 1 `fetch` de exportação = 45 locais de chamada HTTP com endpoint. O `fetch` interno de `request` é transporte e não uma chamada de domínio adicional. Há 29 combinações distintas de método/caminho parametrizado, incluindo funções sem consumidor encontrado. Repetições de chamadas por cliente/status geram várias requisições em execução e não aumentam essa contagem estática.

Este documento foi o único arquivo criado. A alteração pré-existente de `package-lock.json`, observada no início, não foi modificada por esta análise. Não foram executados build, lint, testes, instalação de dependências, importações ou chamadas ao backend. Assim, fluxos são descritos pela leitura do código, sem confirmação operacional.

## 2. Stack tecnológica

Fontes: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `components.json`, `tailwind.config.js`, `postcss.config.js`, `Dockerfile`, `nginx.conf`, `vite-env.d.ts`, `src/config/env.ts`.

| Categoria | Evidência e implementação |
|---|---|
| Framework | React e ReactDOM: manifest `^19.2.0`; lockfile resolve ambos para `19.2.4`. SPA, sem Next/Vue/Angular/SSR/RSC. |
| Linguagem | TypeScript/TSX; TypeScript `~5.9.3`, lock `5.9.3`; configs auxiliares JS. |
| Bundler | Vite `^7.3.1`, lock `7.3.1`; plugin `@vitejs/plugin-react` `^5.1.1`. |
| Package manager | npm evidenciado por `package-lock.json`, scripts e `npm ci` no Dockerfile. Não há yarn.lock ou pnpm-lock.yaml no inventário. Não há campo packageManager fixando versão do npm. |
| UI | Componentes locais no padrão shadcn/ui, estilo new-york, sobre Radix Dialog/Select/Popover/Checkbox/DropdownMenu/Label/Slot. `components.json` configura TSX, CSS variables, Lucide e aliases. |
| Formulários | react-hook-form `^7.71.2` (lock `7.71.2`) + `@hookform/resolvers` `^5.2.2`; demais formulários usam estado/manual. Sem Formik. |
| Validação | Zod `^4.3.6` (lock `4.3.6`), schemas externos e locais. Sem Yup. |
| HTTP | `fetch`, `RequestInit`, `FormData`, Blob e APIs DOM; wrapper `apiClient`. Sem dependência Axios. |
| Estado global | React Context API, `ProfileContext`; cache de dashboard em variável de módulo. Sem Redux/Zustand/MobX/React Query. |
| Rotas | react-router-dom `^7.13.0` (lock `7.13.0`), BrowserRouter, Routes, Route, Outlet, useNavigate, useSearchParams. |
| Tabelas | HTML e wrappers locais `src/components/ui/table.tsx`; sem biblioteca de data grid. |
| Gráfico | Recharts `^3.7.0` (lock `3.7.0`): BarChart em FinancialChart. |
| Datas | Date nativo, toISOString, toLocaleDateString/toLocaleString; helpers próprios. Sem date-fns/Moment. |
| Máscaras | Manipulação própria de dígitos + divisão por 100 + `formatCurrency`; sem biblioteca de máscara. |
| Ícones | lucide-react `^0.575.0` e react-icons `^5.5.0`; emoji de calendário em alguns diálogos. |
| CSS | Tailwind `^3.4.4` (lock `3.4.4`), PostCSS e Autoprefixer; tailwindcss-animate; cva/clsx/tailwind-merge. `@tailwindcss/vite ^4.2.0` está declarado mas não é usado no vite.config. styled-components `^6.3.9` está declarado (lock `6.3.9`), sem import encontrado em src. |
| Lint | ESLint 9, typescript-eslint, react-hooks, react-refresh; script `eslint .`, ignore de dist. |
| Formatter | Não encontrei config/dependência/script Prettier ou outro formatter. |
| Testes | Não encontrei testes, runner ou script de teste no código próprio inventariado. Não inferir inexistência de testes externos. |
| Build | `build`: `tsc -b && vite build`; variantes `build:edson/caio/ivani`: somente `vite build --mode ...`, sem tsc explícito. |
| Desenvolvimento | `dev`: vite; `dev:edson/caio/ivani`: vite com respectivos modes; `preview`: vite preview. Arquivos de env desses três modes não foram encontrados. |
| Container | build em node:20-alpine via npm ci/build; runtime nginx:alpine, porta 80. Compose externo `../docker-compose.yml` conecta frontend, backend e postgres. Nenhum valor de credencial é reproduzido aqui. |

`vite.config.ts`: alias `@` para `./src`; proxy de desenvolvimento somente para `/perfis`, destino local porta 8080; visualizer habilitado com `open: true`, relatório `dist/stats.html`, tamanhos gzip/brotli; limite de aviso de chunk 1000. O plugin `vite-bundle-analyzer` está declarado mas não importado nessa config. `auto` também está declarado entre devDependencies, sem uso identificado em código/config lidos.

`tsconfig.json` efetivo na raiz inclui `src` e `vite-env.d.ts`, strict, noEmit, JSX react-jsx, resolução bundler e alias. Não possui `references` a tsconfig.app/node. Os arquivos `tsconfig.app.json` e `tsconfig.node.json` existem com verificações noUnused e targets próprios, mas não são referenciados pela configuração raiz. `tsconfig.app.json` contém `ignoreDeprecations: "6.0"`; não foi validado por execução. `tsconfig.tsbuildinfo` é artefato gerado, não fonte de comportamento de domínio.

`nginx.conf`: fallback SPA `try_files $uri /index.html`; `/api/` faz proxy para backend:8080 com barra final, removendo o prefixo `/api/`; repassa Host e headers X-Forwarded. `src/config/env.ts` usa `VITE_API_URL` ou fallback `/api`. `.env.development` contém a variável `VITE_API_URL`; seu valor foi omitido. Não há `.env.example` encontrado. A tipagem em `vite-env.d.ts` declara VITE_API_URL opcional. Não há webpack config encontrada.

**Inferência de configuração:** com o fallback `/api` em desenvolvimento, o proxy de Vite somente `/perfis` não cobre `/api/...`. O comportamento real depende da configuração de ambiente. Não foi possível determinar com segurança pelo código analisado qual URL está sendo usada no ambiente implantado.

## 3. Arquitetura

Arquitetura em camadas parciais: páginas compõem componentes; hooks funcionam como modelos de tela, carregam dados, filtram e controlam ações; services encapsulam parte dos endpoints; schemas validam formulários; tipos representam respostas esperadas; helpers formatam datas/moeda. Não há repository frontend separado nem store central de entidades.

```text
main.tsx -> BrowserRouter -> ProfileProvider -> App/Routes
  -> Layout -> Sidebar + Outlet
     -> página -> hook/componente -> service ou apiClient direto
        -> apiClient.request -> buildHeaders -> fetch
     -> BackupPage.handleExport -> fetch próprio
```

O isolamento pretendido por perfil é expresso pelo header `X-Perfil-Id`. A API precisa interpretar esse header; o frontend sozinho não comprova isolamento ou autorização. Client IDs e empréstimo IDs vêm da UI/URL, sem verificação de autorização no navegador.

Há estado local de entidades por tela, sem invalidação global de mutations. A atualização habitual ocorre por callbacks `fetchClientes`, `fetchParcelas`, `refetch` e `refresh`. O dashboard tem um cache próprio de 60 segundos. Rotas não remontam o ProfileProvider.

## 4. Estrutura de pastas

```text
frontend/
├── index.html, package.json, package-lock.json
├── vite.config.ts, vite-env.d.ts, tsconfig*.json, tsconfig.tsbuildinfo
├── eslint.config.js, tailwind.config.js, postcss.config.js, components.json
├── Dockerfile, nginx.conf, .env.development, .gitignore, .gitattributes
├── public/vite.svg
└── src/
    ├── main.tsx, App.tsx, Layout.tsx, index.css
    ├── config/env.ts
    ├── contexts/ProfileContext.tsx
    ├── components/
    │   ├── AlterarParcelaDialog.tsx, ClienteAutoComplete.tsx
    │   ├── ModalCadastro.tsx, ModalRelatorio.tsx, ProfileSwitcher.tsx
    │   ├── SideBar.tsx, StatCard.tsx, StatSmallCard.tsx
    │   ├── actions/AlterarParcelaButton.tsx, PagarParcelaButton.tsx
    │   └── ui/ (13 arquivos de primitivas visuais)
    ├── hooks/ (10 arquivos de dados/formulário/modelos de tela)
    ├── lib/utils.ts
    ├── mappers/parcela.mapper.ts
    ├── schemas/clientes.schemas.ts, emprestimos.schemas.ts, parcelas.schema.ts
    ├── services/
    │   ├── apiClient.ts, clientes.service.ts, dashboard.service.ts
    │   ├── emprestimos.service.ts, relatorio.service.ts, simulacao.service.ts
    │   └── parcelas/parcelas.service.ts, parcela-observacao.service.ts
    ├── types/index.ts, parcela-observacao.ts
    ├── utils/date.ts, format.ts, normalize.ts, parcelasTable.ts
    └── pages/
        ├── BackupPage/index.tsx
        ├── Clients/index.tsx
        ├── Configuracoes/index.tsx
        ├── Simulation/index.tsx
        ├── Home/index.tsx + components/
        ├── Emprestimo/index.tsx + components/ + components/table/
        ├── Parcelas/index.tsx + components/ + components/table/ + components/dialogs/
        └── RelatorioParcelas/index.tsx + components/RelatorioParcelasTable.tsx
```

Responsabilidades: `config` resolve URL da API; `contexts` mantém perfis; `components` contém UI compartilhada e modais de domínio; `actions` contém botões sem lógica HTTP; `ui` contém wrappers Radix/HTML; `hooks` agrega estado/requests/filtros; `lib` junta classes CSS; `mappers` transforma respostas para tabelas de dashboard; `schemas` fornece Zod; `services` contém comunicação/cálculo; `types` fornece contratos; `utils` normaliza/formata; `pages` organiza telas e componentes específicos. Não existem pastas próprias `routes`, `store`, `repositories` ou `styles`: as rotas estão em App e estilos em index.css/Tailwind.

`public/vite.svg` é o ícone de Vite usado por index.html. `.gitignore` exclui node_modules/dist/logs e arquivos locais, entre outros; `.gitattributes` marca stats.html como gerado. Não encontrei AGENTS.md aplicável nos diretórios de projeto/pais inspecionados.

## 5. Inicialização da aplicação

`index.html` define div `#root`, viewport e script `/src/main.tsx`; título controle-clientes-front e idioma HTML `en`.

`src/main.tsx` importa CSS global e cria root por ReactDOM.createRoot. Ordem exata:

```text
React.StrictMode
 -> BrowserRouter
    -> ProfileProvider
       -> App
          -> Routes
             -> Route sem path com Layout
                -> Sidebar + Outlet com a página selecionada
```

`ProfileProvider` começa com perfis=[], perfilAtivo=null e loading=false. Seu effect de montagem chama `carregarPerfis`. As telas podem inicialmente renderizar sem perfil; hooks de domínio normalmente limpam/não carregam dados nesse caso. Não existe bloqueio global de render até perfis carregarem, ThemeProvider ou store provider adicional. StrictMode está presente; possíveis reexecuções de effects no desenvolvimento são uma inferência do uso desse recurso, não observação de requests em execução.

## 6. Rotas

Todas as rotas estão em `src/App.tsx`. Layout comum `src/Layout.tsx`, Sidebar `src/components/SideBar.tsx`. Não há parâmetros dinâmicos de path, guard de login ou página 404/catch-all declarada. As APIs abaixo são disparadas por hooks/ações, não necessariamente todas ao abrir a rota.

| Rota | Componente/arquivo | Query params | Estado necessário e proteção local | APIs/ações principais |
|---|---|---|---|---|
| `/` | Home — `src/pages/Home/index.tsx` | Nenhum | perfilAtivo; sem perfil mostra instrução para Configurações | GET clientes, vencendo-hoje, parcelas por 4 status, detalhes de empréstimos por cliente; pagar/editar/observações |
| `/clientes` | Clientes — `src/pages/Clients/index.tsx` | Nenhum | useClientes exige perfil para carregamento/exclusão; cadastro não faz essa checagem explicitamente | GET /clientes, GET empréstimos por cliente, POST /clientes, DELETE /clientes/:id; relatório por cliente |
| `/parcelas` | Parcelas — `src/pages/Parcelas/index.tsx` | `cliente`, `emprestimoId` | useParcelas exige perfil; state de filtros/seleção/modais | GET /parcelas?status=..., pagar/parcial, alterar, desfazer, observações |
| `/emprestimo` | Emprestimo — `src/pages/Emprestimo/index.tsx` | `clientSearch`, `selectedCliente`, `selectedStatus`, `sortOrder` | perfil no hook; cliente selecionado habilita criar/actions; sem guard de rota | GET /clientes, GET detalhes de empréstimos; criar/refinanciar/quitar/reprogramar/excluir; relatório |
| `/simulacao` | SimulacaoEmprestimo — `src/pages/Simulation/index.tsx` | Nenhum | Estado local; não depende de perfil | Nenhuma API; cálculo Price local |
| `/relatorio-parcelas` | RelatorioParcelas — `src/pages/RelatorioParcelas/index.tsx` | Nenhum | perfil + cliente + empréstimo selecionado | GET clientes, GET detalhes por cliente, GET parcelas pelos quatro status |
| `/backup` | BackupPage — `src/pages/BackupPage/index.tsx` | Nenhum | Arquivo local selecionado para import; não valida perfil explicitamente | POST /import, GET /export |
| `/configuracoes` | Configuracoes — `src/pages/Configuracoes/index.tsx` | Nenhum | useProfile; loading/criando; rota declarada `configuracoes` sem barra sob pai sem path | GET /perfis no provider; POST /perfis ao criar; troca de contexto |

Sidebar usa `useNavigate` e destaca por igualdade exata de pathname. Layout define sete itens de menu; Configurações fica no botão inferior da Sidebar. Navegação adicional: ModalRelatorio -> `/parcelas?cliente=<nome codificado>`; clique/Enter/espaço na linha de empréstimo -> `/parcelas?cliente=<nome>&emprestimoId=<id>`. Não há rota exclusiva de detalhes de cliente ou de empréstimo.

**Sincronização de empréstimos com URL:** `useEmprestimoPage.ts` hidrata/query e escreve URL com replace; `pages/Emprestimo/index.tsx` também hidrata/query e escreve via `updateFiltersInUrl`. Hook usa desc como padrão e omite desc; página usa asc e omite asc. Há divergência objetiva de defaults/serialização. A busca digitada é validada no hook, mas a página grava o valor original na URL mesmo quando a validação rejeita. Não foi possível determinar com segurança pelo código analisado o resultado de todas as sequências de interação desse mecanismo duplicado.

## 7. Perfil ativo

Fonte central `src/contexts/ProfileContext.tsx`; tipo Perfil definido nesse arquivo. Seleção efetiva em `src/pages/Configuracoes/index.tsx`: select encontra perfil por Number(value); lista de botões também chama setPerfilAtivo(perfil). Tela mostra nome ativo, quantidade de perfis e status de carregamento, e permite criar perfil. `src/components/ProfileSwitcher.tsx` oferece implementação semelhante, mas não encontrei import/uso desse componente.

`carregarPerfis`:

1. loading=true e GET /perfis via apiClient.
2. Aceita array direto, `{perfis: [...]}` ou `{data: [...]}`; demais formatos viram [].
3. Atualiza perfis e lê `perfil_ativo_id` do localStorage.
4. Se ID salvo pertence à lista, restaura objeto com setPerfilAtivoState, sem regravar chave.
5. Sem correspondência, escolhe lista[0] via setPerfilAtivo; sem lista, setPerfilAtivo(null).
6. Erro: console.error, perfis=[] e setPerfilAtivo(null), removendo chave; finally loading=false.

`setPerfilAtivo`: atualiza objeto no state e grava String(perfil.id); null remove chave. Nome não é persistido isoladamente, mas está globalmente em perfilAtivo.nome após carregar. Não há perfilNome/perfilId com outras grafias, sessionStorage ou sincronização via evento storage.

`criarPerfil(nome)`: POST /perfis com `{nome}`; espera Perfil; acrescenta a perfis, ativa o novo e grava ID. Em falha loga e relança; UI alerta mensagem genérica; loading reseta. A validação de nome no Configuracoes/ProfileSwitcher é trim e não vazio; sem tamanho máximo/schema.

```text
Configuracoes select/botão ou criarPerfil
 -> ProfileProvider.setPerfilAtivo
    -> perfilAtivo no Context + localStorage[perfil_ativo_id]
 -> hook consumidor reexecuta effect/callback conforme dependência de perfilAtivo
 -> apiClient.buildHeaders lê localStorage em cada request
 -> X-Perfil-Id: ID salvo (se existir)
 -> fetch(API_URL + endpoint)
```

Consumidores diretos de useProfile: Home, Configuracoes, ProfileSwitcher, useClientes, useDashboard, useEmprestimo, useEmprestimosPage, useParcelas, useParcelasPage, useRelatorioParcelasPage e useAlterarParcela. Clients/Emprestimo/Parcelas/RelatorioParcelas dependem indiretamente. Backup usa storage na exportação e apiClient na importação, sem consumir contexto. ModalCadastro/ModalRelatorio/ações de empréstimo também dependem implicitamente do header.

**Riscos inferidos do código, sem comprovação de ocorrência:**

- Context e storage são fontes diferentes: request lê storage, não o objeto capturado no callback. Alteração por outra aba ou manual não atualiza Context.
- Não há AbortController/validação de ID do perfil antes de aplicar respostas em useClientes/useParcelas/useDashboard e buscas detalhadas. Uma resposta iniciada no perfil anterior pode atualizar state após troca. O flag alive protege o carregamento de clientes em hooks de empréstimos/relatório, não todas as buscas.
- Há guards de ausência de perfil, mas a limpeza de seleção/modais em useParcelasPage ocorre apenas quando perfilAtivo é null. Troca direta entre objetos não limpa todos os estados. Empréstimos/relatório também não resetam tudo em toda troca direta.
- Query params de cliente/empréstimo não são associados a perfil; podem continuar na URL após troca.
- Cache do dashboard guarda perfilId/TTL, mas outras telas não invalidam esse cache nas mutations.
- ModalCadastro, pagamento, desfazer, observações e hook de ações de empréstimo não têm todos um guard próprio de perfil. UI nem sempre bloqueia mutations sem perfil; header será omitido se chave faltar. Aceitação pela API é desconhecida.
- GET/POST /perfis também recebem o header antigo, se estiver salvo, porque buildHeaders não possui exceção por endpoint.

## 8. Estado global

`ProfileContextType`: `perfis: Perfil[]`, `perfilAtivo: Perfil|null`, `setPerfilAtivo`, `carregarPerfis`, `criarPerfil`, `loading:boolean`. Provider usa useState, useEffect e useMemo; useProfile usa useContext e lança erro se fora do provider. Sem reducer/actions formais ou persistência do array de perfis.

`src/hooks/useDashboard.ts`: `dashboardCache` é variável de módulo, única entrada com ts/perfilId/vencemHoje/atrasadas/todasParcelas/todosEmprestimos; TTL=60_000 ms. É cache em memória compartilhado entre montagens do hook, não Context nem storage. Efeito restaura cache se mesmo perfil e dentro do TTL. `refresh` invalida e recarrega. Sem invalidação por mutations de outras telas, sem timer de refresh automático.

Demais entidades/filtros/erros/loading/modais são locais. URL armazena parte dos filtros. Não há cache de API global, estado global de clientes/devedor, event bus ou gerenciamento de autenticação.

## 9. Camada de API

`src/config/env.ts` exporta env.API_URL. `src/services/apiClient.ts` captura API_URL e chave de perfil. `request<T>(endpoint, options={})` concatena URL literalmente, chama fetch com headers produzidos por buildHeaders, lê content-type e tenta JSON ou texto. Parsing JSON malsucedido vira null. Texto vazio vira null. Se !response.ok, cria Error com `error ?? message ?? "Erro na requisição"`, texto de erro não vazio ou mensagem padrão. Não retorna Response/status; não há classe de erro HTTP ou interceptor de sessão.

`apiClient.get<T>` envia GET; `post<TResponse,TBody>` e patch serializam JSON.stringify(body ?? {}) ou preservam FormData; delete envia DELETE. Todas aceitam RequestInit opcional; config é espalhada depois de method/body e pode sobrescrevê-los. Nenhum caller atual configura refresh token, retry, timeout ou AbortSignal. Não há método put. Generics são assertions de tipos; não há validação runtime de resposta.

Sem credentials explícito no wrapper, usa comportamento padrão de fetch. Exportação usa credentials include. Sem Authorization/bearer encontrado. O wrapper atende os services e chamadas diretas detalhadas na seção 37. Empréstimos refinanciar/quitar passam body omitido ao post, que envia `{}` efetivamente.

## 10. Header X-Perfil-Id

Função responsável principal: `buildHeaders` em `src/services/apiClient.ts`. Fonte `localStorage.getItem("perfil_ativo_id")`. Se string truthy, adiciona `headers["X-Perfil-Id"] = perfilId`; não valida número/pertencimento. Sem chave, omite header. É aplicado a todos os endpoints que passam por request, inclusive perfis e importação.

JSON: adiciona Content-Type application/json mesmo em GET/DELETE. FormData: não define Content-Type, permitindo boundary do navegador. Headers de config são copiados e então X-Perfil-Id salvo sobrescreve valor customizado com mesma grafia. A API pública aceita RequestInit.headers, mas o cast para Record e spread não normaliza Headers/tuplas; limitação potencial, não uso encontrado.

Exceção de transporte: `BackupPage.handleExport`, `src/pages/BackupPage/index.tsx`, monta Accept XLSX e X-Perfil-Id manualmente a partir da mesma chave, com credentials include, sem Content-Type JSON. Não há outra chamada de domínio por fetch encontrada. Não há interceptor Axios.

## 11. Tipos e interfaces

Contratos abaixo documentam frontend; campos obrigatórios no TypeScript não comprovam obrigatoriedade na API.

| Tipo / caminho | Campos | Consumidores |
|---|---|---|
| Cliente — `src/types/index.ts` | id:number; nome:string; nomeIndicador:string; enderecoRua:string; enderecoBairro:string; enderecoNumero:number | Clientes/useClientes, services de cliente, hooks de empréstimos/relatório/dashboard, ClienteAutoComplete |
| Perfil — `src/contexts/ProfileContext.tsx` | id:number; nome:string; dataCriacao?:string | provider, Configuracoes, ProfileSwitcher, hooks que leem perfil |
| Relatorio — `src/types/index.ts` | totalEmprestado,totalPago,totalAberto,parcelasAtrasadas,totalEmprestimos,totalParcelas,parcelasPagas,parcelasAVencer: todos number | buscarRelatorioCliente e ModalRelatorio |
| Emprestimo — `src/types/index.ts` | id,valorEmprestado,valorTotalEmprestimo,valorRecebido,valorAReceber: number | relatório, contagem em useClientes, clientesService.getEmprestimos |
| EmprestimoDetalhado — `src/types/index.ts` | id:number; nomeCliente,dataEmprestimo,formaPagamento:string; frequenciaPagamento:FrequenciaPagamento; tipoContrato:TipoContrato; valorEmprestado,valorTotalEmprestimo,valorParcela,valorRecebido,valorAReceber:number; inicioPagamento,finalPagamento:string; status:EmprestimoStatus|string; quantidadeParcelas,parcelasPagas,parcelasPendentes,parcelasAtrasadas:number | emprestimosService, useEmprestimosPage, tabelas/ações/dialog de empréstimo, dashboard, relatório de parcelas |
| ParcelaResponse — `src/types/index.ts` | idEmprestimo,numeroParcela:number; nomeCliente:string; valorParcela:number|string|null; valorPago?:number|string|null; dataVencimento:string|Date|null; status:StatusParcela | serviços/hooks/tabelas de parcelas e relatórios, mapper/dashboard |
| ParcelaObservacao — `src/types/parcela-observacao.ts` | id:number; observacao,dataCriacao,dataAtualizacao:string | dois services de observação e AlterarParcelaDialog compartilhado |
| CriarEmprestimoDTO — `src/services/emprestimos.service.ts` | valorEmprestado,quantidadeParcelas,jurosCobrado:number; formaPagamento:string; frequenciaPagamento:FrequenciaPagamento; tipoContrato:TipoContrato | useEmprestimo -> create |
| ReprogramarParcelasDTO — mesmo service | novaDataInicial:string; novoValorParcela:number | EditEmprestimoDialog e useEmprestimoStatusActions |
| CriarObservacaoPayload — `src/services/parcelas/parcela-observacao.service.ts` | idEmprestimo,numeroParcela:number; observacao:string | handleCriarObservacao |
| EditarObservacaoPayload — mesmo service | idObservacao:number; observacao:string | handleSalvarEdicao |
| ParcelaTable — `src/mappers/parcela.mapper.ts` | idEmprestimo,numeroParcela:number; cliente:string; valor,valorPago:number; status união de 4 status; dataVencimento:string | useDashboard, VencemHojeTable, AtrasadasTable |
| ParcelaSelecionada — `src/hooks/useParcelasPage.ts` | idEmprestimo,numeroParcela,valorParcela,valorPago,valorRestante:number; dataVencimento:string; status:StatusParcela | seleção e props dos dialogs em Parcelas |
| ClienteCreateForm — `src/schemas/clientes.schemas.ts` | inferido por schema: nome,nomeIndicador?,enderecoRua,enderecoBairro,enderecoNumero como strings | ModalCadastro |
| EmprestimoFormData — `src/hooks/useEmprestimo.ts` | clienteId,valorEmprestado,quantidadeParcelas,jurosCobrado,formaPagamento:string; frequenciaPagamento/tipoContrato como uniões | NovoEmprestimoDialog e onSubmit do hook |
| PagarParcelaForm — `src/schemas/parcelas.schema.ts` | valorPago,dataPagamento:string | sem consumidor encontrado; o diálogo atual usa FormData local somente valorPago |
| AlterarVencimentoForm — mesmo schema | dataVencimento:string | sem consumidor encontrado |
| SimulacaoInput — `src/services/simulacao.service.ts` | valor,juros,parcelas:number | useSimulacaoEmprestimo |
| ParcelaSimulada — mesmo service | numero,valorParcela,jurosParcela,saldoDevedor:number | tabela em Simulation |
| SimulacaoOutput — mesmo service | valorParcela,totalPago,totalJuros:number; listaParcelas:ParcelaSimulada[] | useSimulacaoEmprestimo e página |

Outros tipos locais: ProfileContextType/props children; MenuItem/SidebarProps (`SideBar.tsx`); CardVariant/CardProps (`StatSmallCard.tsx`); ModalRelatorio Props/CardItem; Period/Stats (`useDashboard.ts`); PeriodType (`DashboardHeader.tsx`); Point/Size (`FinancialChart.tsx`); StatusFilter (`useEmprestimoPage.ts`); RelatorioEmprestimoOption (`useRelatorioParcelasPage.ts`); UseParcelasFiltradasParams; ActionType/Props (`useEmprestimosActions.ts`); FormData locais dos dialogs. Props de componentes específicos estão nas seções 23/35. Primitivas UI usam React HTMLAttributes/ComponentProps/ElementRef, VariantProps de cva e props Radix, sem DTO de domínio adicional.

Normalização: `mapParcelaToTable` converte valores inválidos/null para 0, nome ausente para "Cliente", data para ISO.slice(0,10) ou "". Helpers em normalize/format/parcelasTable também removem pontos como separadores de milhar e trocam vírgula por ponto. **Risco inferido:** string numérica em notação decimal com ponto pode ser reinterpretada como milhar. `Date`/UTC/local variam entre helpers, podendo deslocar datas dependendo da entrada/fuso. Não foi validado contra respostas reais.

## 12. Clientes

Tela `Clientes`, `src/pages/Clients/index.tsx`: usa useClientes, useState(search) e useMemo(filtrados). Busca por substring case-insensitive de nome ou nomeIndicador. Tabela exibe Nome, Indicador, Ações; não mostra endereço. Cards: quantidade de clientes e quantidade total de empréstimos. Sem paginação, ordenação explícita ou detalhe cadastral. Loading mostra skeletons nos cards e oito linhas.

`src/hooks/useClients.ts`, função exportada `useClientes`:

- State: clientes=[], loading=true, totalEmprestimos=0.
- `fetchClientes`: com perfil, GET /clientes direto por apiClient, depois Promise.all de GET /clientes/:id/emprestimos para contar arrays. Falha individual de empréstimo vira []; falha geral loga e limpa. Sem perfil limpa e não requisita.
- `deletarCliente(id)`: exige perfil; window.confirm("Deseja realmente deletar?"); DELETE /clientes/:id direto por apiClient; aguarda fetchClientes. Não há catch nessa mutation nem no onClick da página.
- Effect chama fetchClientes quando callback muda (inclui perfil).

Fluxos: página -> ModalCadastro -> apiClient POST /clientes; página -> botão Deletar -> useClientes.deletarCliente -> confirm -> apiClient DELETE; página -> ModalRelatorio -> buscarRelatorioCliente -> empréstimos/parcelas -> cards -> navegação a parcelas.

Seleção de cliente para empréstimos/relatório não é mantida pela página Clientes: ocorre nos hooks das respectivas telas. Indicador é texto `nomeIndicador`, não select de entidade/ID e não fiador. Endereço só aparece no cadastro/tipo; não foi encontrada tela que o exibe ou atualiza.

## 13. Cadastro de Cliente

Arquivo/componente `src/components/ModalCadastro.tsx`, `ModalCadastro({onSuccess})`; abre por DialogTrigger "Novo Cliente" na página Clientes. State próprio open; formulário RHF + zodResolver(clienteCreateSchema), mode onChange; defaults vazios.

| Campo real | UI | Validação em `src/schemas/clientes.schemas.ts` | Conversão/payload |
|---|---|---|---|
| nome | Nome Completo | string trim min3 max80 | string validada |
| nomeIndicador | Quem indicou? | string trim max80, opcional ou vazia | trim não vazio ou null |
| enderecoRua | Rua | trim min1 max120 | string validada |
| enderecoNumero | Nº/inputMode numeric | string min1, Number finito >0; sem exigência explícita de inteiro | Number(data.enderecoNumero) |
| enderecoBairro | Bairro | trim min1 max80 | string validada |

Formato exato do JSON (valores abaixo são descritivos, não dados reais):

```ts
{
  nome: data.nome,
  nomeIndicador: data.nomeIndicador?.trim() ? data.nomeIndicador.trim() : null,
  enderecoRua: data.enderecoRua,
  enderecoBairro: data.enderecoBairro,
  enderecoNumero: Number(data.enderecoNumero)
}
```

`onSubmit` chama `apiClient.post<void, typeof payload>("/clientes", payload)`. Header vem de buildHeaders. Não envia perfilId no corpo. Não usa clientesService, que não tem create. Resposta não é consumida (tipada void); não se pode afirmar que API retorna vazio. Sucesso: reset -> setOpen(false) -> onSuccess() (`fetchClientes`); callback não é aguardado. Falha: alert(error.message ou mensagem padrão), console.error. Botão disabled isSubmitting || !isValid, texto Salvando. Erros por campo exibidos. Fechar modal sem sucesso não reseta explicitamente dados.

Não há CPF/RG, data de nascimento, telefone, e-mail, estado civil, profissão, cidade/UF/CEP/complemento, documentos ou fiador no formulário atual.

## 14. Edição de Cliente

**Não foi encontrada implementação de edição de cliente**, incluindo nome, indicador, endereço ou dados completos. `src/pages/Clients/index.tsx` oferece cadastrar, relatório e deletar. `src/services/clientes.service.ts` tem somente getAll/getById/getEmprestimos/delete; não há update/patch/put de cliente. ModalCadastro sempre faz POST /clientes e não recebe cliente/id de edição.

Portanto, componente, método, endpoint e payload de edição de cliente: **Não foi possível determinar com segurança pelo código analisado.** O frontend não declara esse contrato. `EditEmprestimoDialog` edita reprogramação de parcelas de empréstimo e `AlterarParcelaDialog` altera parcela; nenhum edita Cliente. Para futura edição completa, ver seção 39.

## 15. Empréstimos

Página `Emprestimo`, `src/pages/Emprestimo/index.tsx`: usa useEmprestimosPage, useSearchParams e useEffect, componentes ClienteAutoComplete, NovoEmprestimoDialog, ModalRelatorio, EmprestimosTable e primitivas UI. Sem state useState próprio; filtros ficam no hook/URL.

`src/hooks/useEmprestimoPage.ts` exporta **useEmprestimosPage** (plural): state emprestimos/clientes/selectedCliente; loading; sortOrder desc; selectedStatus ALL; clientSearch/error; refs debounce/hydrated/syncingFromUrl. Carrega clientes via clientesService.getAll; handleSelectCliente limpa empréstimos e chama fetchEmprestimos(id). fetchEmprestimos -> emprestimosService.getByCliente -> GET /clientes/:id/emprestimos/detalhes. Falhas de listagem viram [] sem erro visual.

Cliente pode ser escolhido por select, sugestão ou auto-select após 250ms: nome normalizado exato; ou substring com pelo menos quatro caracteres e resultado único. Sugestões limitadas a oito, pela ordem do array original; lista de select filtrada e ordenada locale pt-BR sensitivity base. Busca segura Zod máx60 + letras Unicode/números/espaços e . ' ( ) -. Status: ALL/EM_ABERTO/REFINANCIADO/QUITADO. Ordena primeiro prioridade status (aberto/refinanciado/quitado/outros=999), depois data asc/desc. Também filtra emprestimos.nomeCliente pelo texto de busca. Não lista todos os empréstimos sem cliente selecionado.

`EmprestimosTable` usa `useEmprestimoStatusActions`, localizado em `src/pages/Emprestimo/components/table/useEmprestimosActions.ts`. State do hook: isOpen, target, actionType; loadingRefinance/Quit/Delete/Edit; canAct=Boolean(selectedClienteId). openRefinance/openQuit/openDelete/openEdit selecionam alvo; close limpa; confirm despacha refinanciar/quitar/deletar; handleEdit despacha reprogramação. Todas as mutations usam try/finally, sem catch/alert local; falha propaga e loading reseta. Callback onRefetch não é aguardado; refetch da página dispara busca com void.

| Fluxo | Componente -> função -> service | Endpoint/body |
|---|---|---|
| Criar | NovoEmprestimoDialog -> useEmprestimo.onSubmit -> create | POST /clientes/:clienteId/emprestimos; seis campos da seção 16 |
| Listar detalhes | Emprestimo -> useEmprestimosPage.fetchEmprestimos -> getByCliente | GET /clientes/:clienteId/emprestimos/detalhes |
| Ver parcelas | EmprestimosTableRow clique/teclado -> openParcelas | navega /parcelas?cliente=...&emprestimoId=...; carga via useParcelas |
| Excluir | lixeira ou EditEmprestimoDialog -> openDelete -> ConfirmActionDialog -> handleDelete -> delete | DELETE /clientes/:clienteId/emprestimos/:emprestimoId |
| Refinanciar | badge aberto/dropdown ou dialog de edição -> openRefinance -> confirmar -> refinanciar | POST .../:emprestimoId/refinanciar; body efetivo {} |
| Quitar | badge aberto/dropdown ou edição -> openQuit -> confirmar -> quitar | POST .../:emprestimoId/quitar; body efetivo {} |
| Reprogramar | botão SquarePen -> openEdit -> EditEmprestimoDialog -> handleEdit -> reprogramarParcelas | PATCH .../:emprestimoId/parcelas/reprogramar; {novaDataInicial,novoValorParcela} |

Badge para EM_ABERTO abre menu quando canAct e não loading; demais status só badge. Editar/lixeira da linha dependem de actionsDisabled, sem mesmo guard canAct no próprio botão; handlers exigem selectedClienteId. Clicar área de ações usa data-stop-row-click para não navegar; handler de teclado da linha trata Enter/espaço, e o status cell impede propagação própria.

Os textos de confirmação dizem que quitar/refinanciar marcam parcelas restantes como pagas e alteram status; isso é intenção exibida, não cálculo/executado pelo frontend. Não há criação de novo contrato de refinanciamento com valor/juros nessa UI. `EditEmprestimoDialog` reprograma parcelas, não altera o principal, juros, devedor, credor, forma de pagamento ou contrato.

## 16. Novo Empréstimo

Arquivo `src/pages/Emprestimo/components/NovoEmprestimoDialog.tsx`; props disabled?, selectedClienteId:number|null, selectedClienteName?:string|null, onCreated?, triggerClassName?. Usa useEmprestimo e useState(open). Página passa vm.selectedCliente/selectedClienteName; trigger desabilitado se não há selectedCliente.

Ao abrir, effect preenche form.clienteId com String(selectedClienteId), shouldValidate/shouldDirty; aplica default MENSAL/FISICO se vazios. Cliente é texto de exibição, sem select dentro do modal. Não vem de rota dinâmica; query selectedCliente hidrata seleção na página. O ID do cliente é campo interno do RHF, não input visível para editar.

`src/hooks/useEmprestimo.ts`: RHF/Zod onChange, defaults vazios para clienteId/valor/quantidade/juros/forma; frequência MENSAL e contrato FISICO.

| Campo interno | UI/validação |
|---|---|
| clienteId | string não vazia; vem de prop/effect. Não valida Number finito/inteiro no schema. |
| valorEmprestado | input decimal/string trim obrigatória, parseCurrency >0. |
| quantidadeParcelas | input numeric/string trim obrigatória, Number finito >0; não exige inteiro. |
| jurosCobrado | input decimal/string trim obrigatória, troca vírgula por ponto; Number finito entre 0 e 100. |
| formaPagamento | select PIX/DINHEIRO; schema só string não vazia, DTO string. |
| frequenciaPagamento | enum DIARIO/SEMANAL/QUINZENAL/MENSAL; exibido Diário/Semanal/Quinzenal/Mensal. |
| tipoContrato | enum FISICO/DIGITAL; exibido Físico/Digital. |

JSON exato montado em useEmprestimo.onSubmit:

```ts
const payload: CriarEmprestimoDTO = {
  valorEmprestado: parseCurrency(data.valorEmprestado),
  quantidadeParcelas: Number(data.quantidadeParcelas),
  jurosCobrado: Number(data.jurosCobrado.replace(",", ".")),
  formaPagamento: data.formaPagamento,
  frequenciaPagamento: data.frequenciaPagamento,
  tipoContrato: data.tipoContrato
};
await emprestimosService.create(Number(data.clienteId), payload);
// POST /clientes/{clienteId}/emprestimos
```

Sem clienteId, perfilId, credorId, fiadorId, dataEmprestimo ou data inicial no corpo. Datas mostradas depois são esperadas na resposta de detalhes. Header perfil é criado em apiClient, não no hook/modal. Hook exige perfilAtivo antes de enviar.

Sucesso: hook aguarda create e reseta defaults; modal chama onCreated?.() (`vm.refetch`), fecha. Não navega. Resposta tipada void/ignorada. Não há catch com mensagem de erro no hook/modal. Form valida, mas JSX não exibe formState.errors e botão de envio só depende de selectedClienteId, sem disable por isSubmitting/isValid ou texto de progresso. Isso é fato de implementação, não confirmação de submits duplicados.

**Credor disponível:** useEmprestimo já chama useProfile e dispõe do objeto perfilAtivo (id/nome), mas retorna apenas métodos de form + onSubmit, não o perfil. Modal não recebe perfil e não lê useProfile/localStorage; por isso não exibe credor. Objeto global pode ser lido por esse componente no futuro. Hoje só id/nome/dataCriacao? estão tipados; dados completos do credor não estão modelados.

## 17. Parcelas

Página `src/pages/Parcelas/index.tsx`: vm=useParcelasPage; state searchError; useSearchParams/useEffect aplica `cliente` à busca e page=1. Durante loading mostra ParcelasSkeleton; depois Header/Stats/Table/Pagination. Dialogs persistem fora desse ramo condicional, renderizados se selected.

`src/hooks/useParcelas.ts`: state parcelas/loading/status ALL. fetchParcelas exige perfil. Em ALL chama quatro GET /parcelas?status=PENDENTE/PARCIAL/PAGO/ATRASADO em Promise.all e concatena sem deduplicação; status específico usa um GET. Erro console/clearState. `pagarParcela` faz POST total e reload, mas não encontrei consumidor dessa função retornada: fluxo atual de pagamento usa parcelasService nos dialogs.

`src/hooks/useParcelasPage.ts`: base filtrada por idEmprestimo da query; uniqueClients derivados do nome; filtros search/selectedClients/selectedStatuses/selectedMonth/sortOrder; paginação 10; state selected e 3 flags dos dialogs. mapParcelaToSelecionada calcula valorRestante=max(0,valorParcela-valorPago), normaliza números/data. openPagar/openAlterarParcela/openDesfazerPagamento selecionam parcela e abrem flag. handleDesfazerPagamentoSuccess fecha desfazer, aguarda fetchParcelas e abre alteração; selected não é recalculado com a resposta após desfazer.

`useParcelasFiltradas`: busca substring de nome case-insensitive; clientes selecionados por igualdade de nome, status por união; mês 0..11 sem filtro de ano. PAGO sempre depois dos demais, depois ordenação de vencimento asc/desc. Contadores usam lista filtrada: atrasadas por status; vencendo semana entre agora e agora+7 dias, sem excluir pagas/status. Não chama getMesAtual para filtro por mês.

TableRow exibe ações: PAGO -> Editar e Desfazer pagamento; outros -> Editar e Pagar. Editar é permitido para todos os status na UI. Não há ação própria de reprogramação múltipla aqui; está no empréstimo.

Endpoints de vencendo-hoje e mes-atual existem em services; vencendo-hoje é usado pelo dashboard; mes-atual não tem consumidor encontrado. Há getByEmprestimo no service de parcelas e getParcelas no de empréstimo, sem consumidores encontrados; página/relatório filtram as listas por status em memória.

## 18. Pagamentos

`src/pages/Parcelas/components/dialogs/PagarParcelaDialog.tsx` é compartilhado por Parcelas, VencemHojeTable e AtrasadasTable. Props: open/onOpenChange, idEmprestimo, numeroParcela, valorParcela, valorPago?=0, status? (recebido mas não usado na decisão), onSuccess?. Não consulta API ao abrir.

Saldo=max(valorParcela-valorPago,0); aviso de pagamento parcial prévio quando valorPago>0 e saldo>0. RHF/Zod local valida somente valorPago:string trim obrigatório, parseCurrency>0 e <=saldo+0.01. Não há dataPagamento no formulário atual. useWatch observa valor, resolver useMemo depende do saldo; abrir/reset usa formatCurrency(saldo). Máscara retira não dígitos e divide por 100; focus seleciona texto via requestAnimationFrame.

`pagamentoTotal = abs(valorDigitado-saldoRestante)<0.01`. onSubmit:

- Total -> parcelasService.pagar -> POST /parcelas/pagar `{idEmprestimo,numeroParcela}`. O valor não vai no body.
- Parcial -> parcelasService.pagarParcial -> POST /parcelas/pagar-parcial `{idEmprestimo,numeroParcela,valorPago:parseCurrency(...)}`.
- Aguarda onSuccess (fetchParcelas ou dashboard.refresh), fecha. Falha alert(err.message/mensagem genérica); isSubmitting controla Processando e disable junto a isValid.

**Desfazer:** `src/pages/Parcelas/components/dialogs/DesfazerPagamentoDialog.tsx` aberto apenas na linha PAGO da página Parcelas. State isSubmitting. handleConfirm -> apiClient.post /parcelas/desfazer-pagamento `{idEmprestimo,numeroParcela}` -> fecha -> chama onSuccess (não aguarda). No vm, callback recarrega e abre modal de alteração. catch alerta/loga; finally reseta. onOpenChange bloqueia alteração enquanto submit. Sem campo de valor/data.

Não há data de pagamento enviada, histórico de pagamentos individual ou método de pagamento da parcela configurável nessa UI. A relação entre valorPago da API e soma/último pagamento deve ser confirmada com backend; o frontend assume valorPago como já pago ao calcular saldo.

## 19. Observações

Implementação efetiva em `src/components/AlterarParcelaDialog.tsx`, não na cópia dentro de pages. Esse dialog atende Parcelas e as duas tabelas de Home. Form principal RHF/Zod: novaData obrigatória e novoValor obrigatório, parseCurrency>0. Hook useAlterarParcela exige perfil -> parcelasService.alterarParcela -> PATCH /parcelas/alterar `{idEmprestimo,numeroParcela,novaData,novoValor}`. Callback aguardado, fecha. Erro da alteração: hook console.error e relança; dialog catch vazio, sem mensagem visual.

Observações são seção separada do form principal, com useState: observacoes, loadingObservacoes, novaObservacao, salvandoObservacao, editandoId, textoEdicao, acaoObservacaoId. Ao abrir, reset do form e carregarObservacoes. Lista mostra observacao com whitespace-pre-wrap, dataCriacao e dataAtualizacao em pt-BR. Não é coluna das tabelas.

| Ação/função do componente | Service/endpoint | Payload/sucesso |
|---|---|---|
| carregarObservacoes | parcelaObservacaoService.listar -> GET /parcelas/observacoes?idEmprestimo=...&numeroParcela=... | espera ParcelaObservacao[]; erro vira [] |
| handleCriarObservacao | criar -> POST /parcelas/observacoes | {idEmprestimo,numeroParcela,observacao:novaObservacao.trim()}; limpa texto, recarrega observações, aguarda onSuccess |
| Editar (botão) | Sem API | editandoId=obs.id; textoEdicao=obs.observacao |
| handleSalvarEdicao | editar -> PATCH /parcelas/observacoes | {idObservacao,observacao:textoEdicao.trim()}; encerra edição, recarrega, onSuccess |
| handleExcluirObservacao | excluir -> DELETE /parcelas/observacoes/:idObservacao | sem body; encerra edição do item se necessário, recarrega, onSuccess |

Criar/editar exigem trim não vazio; não há schema/tamanho máximo para observações. Botões têm loading/disabled por ação/item; exclusão não tem confirmação. catchs das mutations estão vazios com comentário "trate com toast se quiser"; não há toast implementado. Criação/edição/exclusão de observação não fecha o modal. API equivalente também existe em parcelasService mas não foi encontrada chamada dessas funções duplicadas.

## 20. Relatórios

**Resumo financeiro por cliente:** ModalRelatorio em `src/components/ModalRelatorio.tsx`, aberto em Clients e Emprestimo. Props clienteId,nomeCliente,className?. States loading,relatorio,open. handleBuscar não busca se já tem relatorio; abrir busca, fechar limpa. `buscarRelatorioCliente`, `src/services/relatorio.service.ts`, GET /clientes/:id/emprestimos e Promise.all GET /clientes/:id/emprestimos/:empId/parcelas; arrays concatenados. Não há endpoint /relatorios.

Cálculos: totalEmprestado soma valorTotalEmprestimo (não só principal); totalPago soma valorRecebido; totalAberto soma valorAReceber; quantidades de empréstimos/parcelas; parcelasPagas por PAGO; atrasadas por ATRASADO; a vencer apenas PENDENTE com safeDate>=new Date() (horário atual, não início do dia). Campos ausentes nos totais usam ??0, sem normalização monetária nesse service. Cards exibem Total Contratado/Recebido/Saldo Devedor/Total Empréstimos/Total Parcelas/Pagas/A Vencer/Em Atraso. Erro apenas console, não mensagem visual. Ver detalhes fecha e navega por nome de cliente a Parcelas. Não exporta relatório.

**Relatório de parcelas:** `src/pages/RelatorioParcelas/index.tsx` -> useRelatorioParcelasPage -> RelatorioParcelasTable. UI busca/select cliente, select empréstimo, limpar filtros, indicação de cliente/contrato. Hooks usam clientesService.getAll e emprestimosService.getByCliente; empréstimos ordenados data desc e label `${formatCurrency(valorEmprestado)} - ${status}`. Selecionar cliente limpa empréstimo/listas; selecionar empréstimo consulta quatro status via apiClient em Promise.all, concatena, filtra idEmprestimo e ordena pagas por último/vencimento asc. States clientes,emprestimosRaw,parcelas,selectedCliente,selectedEmprestimoId,loadingClientes/Emprestimos/Parcelas,clientSearch/error e ref debounce. Busca/auto-select segue regras da tela empréstimos. Falhas limpam arrays; só busca de parcelas loga. loadingClientes é retornado, mas não exibido diretamente pela página.

`RelatorioParcelasTable` reordena tudo por numeroParcela asc, sobrepondo a ordem anterior. Divide em blocos de dez via chunkArray; todos os blocos renderizam, sem paginação interativa. Quando >1 bloco, grid uma coluna e duas em xl; bloco interno `ParcelasTableBlock` exibe Nº Parcela, Data, Valor, Situação. Sem valorPago, saldo, totais, botões de ação, exportação, impressão ou compartilhamento programático. Texto menciona compartilhar, mas o código apenas apresenta tabela.

**Dashboard financeiro:** ver Home/useDashboard/FinancialChart nas seções 30/35. O gráfico chamado Recebimentos usa soma de valorParcela de todos os status por mês de vencimento, não soma de pagamentos por data de pagamento. Esse descompasso entre rótulo e cálculo é observado, sem corrigir ou inferir regra de negócio pretendida.

## 21. Importação

`src/pages/BackupPage/index.tsx`, BackupPage.handleImport; não existe service separado de backup. States file:File|null, loading, exporting, message:string|null, error:boolean. Input file accept=.xlsx; onChange pega primeiro arquivo. Não valida extensão/MIME/tamanho em JavaScript; accept restringe escolha no navegador, não valida conteúdo.

Sem file -> mensagem "Selecione um arquivo Excel antes de importar." e error=true. Com file -> FormData.append("file", file) -> apiClient.post("/import", formData). Content-Type fica a cargo do navegador; X-Perfil-Id vem do wrapper se storage tiver ID. Loading define Importando/disable; sem percentual/progresso ou cancelamento. Resposta ignorada; sucesso informa conclusão, error=false e file=null. Input DOM não é resetado explicitamente. Falha console + mensagem genérica; finally loading=false. Sem invalidação de dados/cache de outras telas nem consulta de resultado detalhado/linhas importadas. Estrutura da planilha e efeitos sobre dados existentes: Não foi possível determinar com segurança pelo código analisado.

## 22. Exportação

BackupPage.handleExport lê env.API_URL e perfil_ativo_id, faz GET /export por fetch próprio com credentials include; Accept XLSX; header perfil condicional. Se !ok, lê texto e lança Error com status e primeiros 200 caracteres. Confere content-type contendo MIME de XLSX; diferente gera Error. Em sucesso resp.blob -> URL.createObjectURL -> anchor temporário -> download `backup-${new Date().toISOString().slice(0,10)}.xlsx` -> click/remove/revokeObjectURL. Nome usa data UTC do navegador.

exporting controla Exportando/disable; message/error informam sucesso ou erro genérico sobre backend retornando XLSX; detalhe fica no console. Não usa Content-Disposition nem nome de arquivo do backend. Não há exportação em services de relatórios. Importação e exportação têm flags independentes: cada botão só bloqueia sua própria operação. Não há progresso percentual. Conteúdo exato do arquivo e escopo das entidades/perfil na exportação precisam ser confirmados na API.

## 23. Modais

| Nome/caminho | Onde abre / props | Campos / HTTP / depois de sucesso |
|---|---|---|
| ModalCadastro — `src/components/ModalCadastro.tsx` | Clients; onSuccess | cinco campos Cliente; POST /clientes; reset/fecha/recarrega clientes |
| ModalRelatorio — `src/components/ModalRelatorio.tsx` | Clients e Emprestimo; clienteId,nomeCliente,className? | sem campos editáveis; GET empréstimos e parcelas; cards; Ver detalhes navega parcelas |
| NovoEmprestimoDialog — `src/pages/Emprestimo/components/NovoEmprestimoDialog.tsx` | Emprestimo; disabled?,selectedClienteId,selectedClienteName?,onCreated?,triggerClassName? | cliente exibido + seis campos; POST empréstimo via hook; reset/refetch/fecha |
| EditEmprestimoDialog — `src/pages/Emprestimo/components/EditEmprestimoDialog.tsx` | EmprestimosTable ação EDITAR; open,onOpenChange,emprestimo,onSubmit,loading?,callbacks onQuit/onRefinance/onDelete e flags?,actionsDisabled? | novaDataInicial,novoValorParcela; PATCH reprogramar via callback; refetch/fecha; botões abrem confirmação de outras ações |
| ConfirmActionDialog — `src/pages/Emprestimo/components/table/ConfirmActionDialog.tsx` | EmprestimosTable ação refi/quitar/deletar; open,title,description:ReactNode,confirmText,cancelText?,loading?,onOpenChange,onConfirm | sem campos; POST refi/quitar ou DELETE via callback; refetch/fecha |
| PagarParcelaDialog — `src/pages/Parcelas/components/dialogs/PagarParcelaDialog.tsx` | Parcelas/Home; open,onOpenChange,idEmprestimo,numeroParcela,valorParcela,valorPago?,status?,onSuccess? | valorPago; POST total/parcial; aguarda reload/fecha |
| DesfazerPagamentoDialog — `src/pages/Parcelas/components/dialogs/DesfazerPagamentoDialog.tsx` | Parcelas linha paga; open,onOpenChange,idEmprestimo,numeroParcela,onSuccess | confirmação sem campos; POST desfazer; fecha/reload/abre alteração |
| AlterarParcelaDialog efetivo — `src/components/AlterarParcelaDialog.tsx` | Parcelas/VencemHojeTable/AtrasadasTable; open,onOpenChange,idEmprestimo,numeroParcela,dataAtual,valorAtual,onSuccess? | novaData,novoValor e seção observações; PATCH alterar + CRUD observações; alteração fecha; observações mantêm aberto |
| AlterarParcelaDialog alternativo — `src/pages/Parcelas/components/dialogs/AlterarParcelaDialog.tsx` | sem consumidor encontrado; mesmas props do efetivo | novaData/novoValor, sem observações; PATCH alterar via useAlterarParcela; callback/fecha |
| AlterarDataParcelaDialog — `src/pages/Parcelas/components/dialogs/AlterarDataParcelaDialog.tsx` | sem consumidor encontrado; mesmas props de identidade/data/valor | somente novaData; PATCH alterar preservando valorAtual; callback/fecha |

`src/components/ui/dialog.tsx` fornece Root/Trigger/Portal/Overlay/Close/Content/Header/Footer/Title/Description sobre Radix. Controlado por open/onOpenChange quando passado. Overlay z50, conteúdo centralizado, botão Close, animações; não realiza HTTP. Não existe modal de editar Cliente/Fiador/credor completo.

## 24. Formulários

| Formulário / arquivo | Mecanismo / campos / validação |
|---|---|
| Cliente / ModalCadastro + clientes.schemas | RHF/Zod onChange; cinco campos e regras seção 13; errors visíveis/isValid/isSubmitting |
| Empréstimo / useEmprestimo + NovoEmprestimoDialog | RHF/Zod onChange; clienteId interno + seis campos seção 16; errors não renderizados no modal |
| Pagar / PagarParcelaDialog | RHF/Zod local + useWatch/useMemo; apenas valorPago >0 e teto saldo+0.01; máscara em centavos; total por tolerância <0.01 |
| Alterar parcela / components/AlterarParcelaDialog | RHF/Zod, modo padrão; novaData string não vazia; novoValor parseCurrency>0; errors visíveis; reset ao abrir; máscara centavos |
| Cópia alterar / pages/Parcelas/.../AlterarParcelaDialog | RHF/Zod com mesmas regras, sem observações; sem referência encontrada |
| Alterar data / AlterarDataParcelaDialog | RHF/Zod novaData não vazia; mantém valor; sem referência encontrada |
| Reprogramar / EditEmprestimoDialog | useState para novaDataInicial/novoValorParcela, effect preenche início/valor atuais; manual: não vazio e !loading; sem schema/teto/positivo explícito; máscara centavos |
| Observações / dialog compartilhado | useState; novaObservacao/textoEdicao; trim não vazio; sem validação de tamanho; salva separado do form de parcela |
| Perfil / Configuracoes e ProfileSwitcher | useState novoPerfil/criando; trim não vazio; sem RHF/schema |
| Simulação / Simulation/useSimulacao | useState strings valor/juros/parcelas -> Number no useMemo; service retorna null se qualquer número falsy; sem schema/min/max/inteiro explícito |
| Upload / BackupPage | useState file; somente presença no submit; accept .xlsx no input |
| Buscas empréstimos/relatório/parcelas | Zod safeParse, máx60 e regex de caracteres; Clientes busca livre sem schema |

Schemas em `src/schemas/parcelas.schema.ts` que não refletem form atual: pagarParcelaBaseSchema tem valorPago e dataPagamento YYYY-MM-DD; createPagarParcelaSchema adiciona teto pelo valorParcela; alterarVencimentoSchema valida dataVencimento YYYY-MM-DD. Não encontrei consumidores desses três schemas/tipos; a página usa somente parcelasSearchSchema. Não documentar dataPagamento como campo real do pagamento atual.

Date inputs usam picker nativo; em diálogo compartilhado/reprogramação há chamada opcional showPicker, enquanto cópia de AlterarParcelaDialog chama showPicker diretamente. Novas datas são exigidas por presença, sem validação semântica explícita de futuro ou sequência no frontend.

Simulação: `calcularSimulacao` usa i=juros/100, potência=(1+i)^parcelas, parcela=(valor*i)/(1-1/potência), juros por saldo, amortização=parcela-juros, saldo final exibido no mínimo 0. Resultado inclui totalPago/totalJuros/lista. Taxa zero retorna null pelo guard; código não impede negativos/quantidade fracionária explicitamente. Não confirmar equivalência com cálculo do empréstimo real do backend.

## 25. Enums

São unions TS/constantes/Zod; não há `enum` TypeScript de domínio encontrado.

| Conceito / arquivo | Valores / uso / exibição |
|---|---|
| FrequenciaPagamento — `src/types/index.ts` e duplicado em `src/services/emprestimos.service.ts` | DIARIO,SEMANAL,QUINZENAL,MENSAL; DTO/resposta/Zod useEmprestimo; select e formatter da linha exibem Diário/Semanal/Quinzenal/Mensal |
| TipoContrato — mesmos dois arquivos | FISICO,DIGITAL; novo empréstimo/DTO/tabela; Físico/Digital |
| FormaPagamento — NovoEmprestimoDialog | opções PIX,DINHEIRO; tipo/schema aceitam string não vazia; tabela exibe valor recebido literalmente; sem union formal FormaPagamento |
| StatusParcela — `src/types/index.ts` | PENDENTE,ATRASADO,PAGO,PARCIAL; GET status/filtros/badges/pagamento; badges exibem valores crus |
| EmprestimoStatus — `src/types/index.ts` | EM_ABERTO,QUITADO; EmprestimoDetalhado também permite qualquer string |
| StatusFilter — useEmprestimoPage | ALL,EM_ABERTO,REFINANCIADO,QUITADO; prioridade 0/1/2; filtro Todos/Em aberto/Refinanciado/Quitado |
| EmprestimoStatusBadge | EM_ABERTO -> ABERTO; REFINANCIADO -> REFIN.; QUITADO literal; demais literal; variant default/secondary/outline |
| ActionType — useEmprestimosActions | REFINANCIAR,QUITAR,DELETAR,EDITAR; controla dialog/dispatch |
| MESES — useParcelasFiltradas | Janeiro a Dezembro; índices 0..11; ALL = Todos os meses |
| Period/PeriodType — useDashboard/DashboardHeader | "3","6","12","all"; últimos meses/todo período |
| yearFilter — FinancialChart | number ou ALL; todos os anos ou ano selecionado |
| CardVariant — StatSmallCard | success,danger,neutral; cores de cards de relatório |
| Button/Badge variants — UI | button default/destructive/outline/secondary/ghost/link; sizes default/sm/lg/icon; badge default/secondary/destructive/outline; estilização via cva |

EstadoCivil não existe nos tipos/schema/UI analisados. Fiador/avalista/garantidor também não existe. Rótulos de frequência descrevem geração de datas na UI; geração real não ocorre no frontend.

## 26. Services

Todos os endpoints usam apiClient salvo exportação. Payload/resposta/consumidores completos estão na seção 37. Inventário exaustivo de funções de domínio:

| Arquivo | Funções | Uso encontrado |
|---|---|---|
| `src/services/clientes.service.ts` | getAll(),getById(clienteId),getEmprestimos(clienteId),delete(clienteId) | getAll em dashboard/empréstimos/relatório. Demais sem consumidor; useClientes repete GET/DELETE direto. |
| `src/services/dashboard.service.ts` | getTotalEmprestado(),getVencendoHoje(),getParcelasPorStatus(status:string),getEmprestimosPorCliente(clienteId) | Nenhum consumidor encontrado para esse objeto; useDashboard usa outros services e agrega localmente. |
| `src/services/emprestimos.service.ts` | getByCliente(clienteId),getParcelas(clienteId,emprestimoId),create(clienteId,data),refinanciar(clienteId,emprestimoId),quitar(...),reprogramarParcelas(...,data),delete(...) | Todos exceto getParcelas têm consumidores; detalhes em dashboard/duas telas, create no hook form, actions na tabela. |
| `src/services/parcelas/parcelas.service.ts` | getVencendoHoje(),getPorStatus(status),getMesAtual(),getByEmprestimo(idEmprestimo),pagar(idEmprestimo,numeroParcela),pagarParcial(...,valorPago),alterarParcela(...,novaData,novoValor),listarObservacoes(...),criarObservacao(...,observacao),editarObservacao(idObservacao,observacao),excluirObservacao(idObservacao) | Hoje/status no dashboard; pagar/parcial no dialog; alterar no hook; mês/por empréstimo e quatro funções de observações sem consumidor encontrado. |
| `src/services/parcelas/parcela-observacao.service.ts` | listar(idEmprestimo,numeroParcela),criar(payload),editar(payload),excluir(idObservacao) | Todas no dialog compartilhado de alteração. |
| `src/services/relatorio.service.ts` | buscarRelatorioCliente(clienteId); helper privado safeDate | ModalRelatorio; agrega resposta de 2 tipos de GET. |
| `src/services/simulacao.service.ts` | calcularSimulacao(input) | useSimulacaoEmprestimo; sem HTTP. |
| `src/services/apiClient.ts` | API pública get/post/patch/delete; funções internas request/buildHeaders | Infraestrutura compartilhada; exportação não passa por ela. |

32 expressões de chamada HTTP estão nos seis arquivos de services que contêm endpoints (clientes/dashboard/emprestimos/parcelas/observações/relatório). Infraestrutura apiClient é o oitavo arquivo contando simulacao. Erros de services de domínio não são capturados nesses wrappers; propagam de request, exceto agregação de relatório que também propaga Promise.all.

## 27. LocalStorage/SessionStorage

Única chave encontrada: **perfil_ativo_id**.

| Operação | Arquivo/função | Comportamento |
|---|---|---|
| Grava | ProfileContext.setPerfilAtivo | String(perfil.id) |
| Lê para restaurar | ProfileContext.carregarPerfis | Number(id salvo), procura em lista recebida |
| Remove | ProfileContext.setPerfilAtivo(null) | removeItem; chamado sem perfis/erro de carga ou seleção vazia |
| Lê para request | apiClient.buildHeaders | string salva -> X-Perfil-Id |
| Lê para exportar | BackupPage.handleExport | string salva -> X-Perfil-Id manual |

Não encontrei sessionStorage, token, persistência de nome/perfis/clientes ou storage listener. Cookies não são manipulados pelo código; credentials include na exportação apenas permite envio conforme navegador/origem, sem estabelecer autenticação implementada.

## 28. Tratamento de erros

Global de transporte: request transforma HTTP !ok em Error, perde status estruturado e não faz retry/redirect. Erro de rede propaga naturalmente. Sem ErrorBoundary/toast provider/gerenciador global de erros ou auth interceptor encontrado.

| Origem | Tratamento local |
|---|---|
| Perfil carregar | console + perfis vazio/ativo null; sem mensagem de falha específica na tela |
| Perfil criar | provider console/rethrow; Configuracoes/ProfileSwitcher alert genérico |
| Clientes listar/contar | console/clearState; GET empréstimo individual falho vira [] |
| Clientes excluir | sem catch no hook/página |
| Cadastro | alert do Error + console; mantém form aberto em erro |
| Dashboard | console e limpa todos os arrays; empréstimos por cliente com catch -> [] |
| Empréstimos/relatório listar clientes/detalhes | catch limpa listas; sem mensagem HTTP visível |
| Criar/refi/quitar/excluir/reprogramar empréstimo | sem catch visual; mutations de ações têm finally loading |
| Parcelas listar | console + lista vazia |
| Pagar | alert com erro ou mensagem padrão |
| Desfazer | alert + console |
| Alterar parcela | hook console/rethrow; modal catch vazio |
| Observações carregar | catch [] (indistinguível de sem observações) |
| Observações mutations | catch vazio/comentário de possível toast, sem toast real |
| ModalRelatorio | console, loading false, sem relatorio |
| Relatório buscar parcelas | console + [] |
| Backup | console + mensagem inline genérica; export lança detalhe técnico no erro logado |
| Busca/form Zod | mensagens de validação próximas ao campo, exceto errors de novo empréstimo não renderizados |

Não há canal central de sucesso/falha; cada componente decide. Lista vazia pode representar erro além de ausência de dados.

## 29. Loading e feedback

- ProfileProvider loading; Configuracoes exibe status/nome, select disabled; criar usa criando/loading/trim para bloquear e texto Criando. Lista de botões de perfis não recebe disabled por loading.
- Clients skeleton de cards/8 linhas; cadastro Salvando/isSubmitting e isValid; exclusão confirm do navegador, sem loading próprio.
- Home StatsCards/FinancialChart e tabelas exibem skeletons; mensagem sem perfil; chart exibe Nenhum dado/aguarda dimensão.
- EmprestimosTable loading textual e estado vazio; ações bloqueadas durante qualquer loading do hook; ConfirmActionDialog Processando; EditEmprestimoDialog Salvando/refinanciando/quitando/excluindo. NovoEmprestimoDialog sem indicador de submit.
- Parcelas substitui conteúdo por ParcelasSkeleton; tabela tem fallback loading próprio; pagamento Processando e disabled; desfazer Desfazendo; alteração Salvando por hook; observações Carregando/Adicionando/Salvando e disabled por texto/ação.
- Relatório de parcelas estados de loading de empréstimos/parcelas, empty state; ModalRelatorio Carregando.
- Backup Importando/Exportando, mensagens inline verde/vermelho com ícones. Sem barra de progresso.
- Confirmações: window.confirm para excluir Cliente; ConfirmActionDialog para refi/quitar/excluir empréstimo; DesfazerPagamentoDialog para reversão. Observação exclui diretamente.

Não encontrei biblioteca/uso de toast ou spinner de domínio; loading é majoritariamente skeleton/texto. Em cadastro/novo empréstimo/edição de parcela não há mensagem de sucesso explícita: fecha/recarrega. Não há notificação global.

## 30. Tabelas

| Tela/componente/caminho | Colunas | Fonte/ordenação/filtros/paginação/ações |
|---|---|---|
| Clientes — `src/pages/Clients/index.tsx` | Nome,Indicador,Ações | clientes de useClientes; busca nome/indicador; ordem API; sem paginação; Relatório/Deletar |
| VencemHojeTable — `src/pages/Home/components/VencemHojeTable.tsx` | Cliente,Valor,Vencimento,Ações | getVencendoHoje -> mapper; ordem API; sem filtro local/paginação efetiva em Home; renderiza todas, footer default página1/1; Editar/Pagar |
| AtrasadasTable — `src/pages/Home/components/AtrasadasTable.tsx` | Cliente,Dias,Valor,Status,Ações | status ATRASADO -> mapper; calcula dias por diferença de datas zeradas no dia e floor; ordem API; paginação local20 com next/prev; Editar/Pagar |
| EmprestimosTable/Header/Row — `src/pages/Emprestimo/components/EmprestimosTable.tsx` e `table/*.tsx` | Data,Forma,Frequência,Contrato,Emprestado,A receber,Parcela,Recebido,Total,Início,Final,Status (ações na célula Status) | detalhes do cliente; filtros nome/status; prioridade status/data; sem paginação; linha navega parcelas, badge menu refi/quitar, editar/lixeira |
| ParcelasTable/Header/Row — `src/pages/Parcelas/components/table/*.tsx` | Cliente,Parcela,Valor total,Vl. pago,Vencimento,Status,Ações | quatro listas por status -> filtro; nome,clientes,status,mês,emprestimoId; pagas ao fim/data; paginação10; Editar/Pagar ou Desfazer |
| RelatorioParcelasTable/ParcelasTableBlock — `src/pages/RelatorioParcelas/components/RelatorioParcelasTable.tsx` | Nº Parcela,Data,Valor,Situação | status+id selecionado; componente reordena numero asc; blocos de10 todos visíveis; sem ações/paginação interativa |
| Simulation — `src/pages/Simulation/index.tsx` | #,Parcela,Juros,Saldo | calcularSimulacao; ordem geração1..n; sem filtro/paginação; contêiner vertical max-h64; sem ação |

EmprestimosTable define TABLE_COLS=13 para mensagens, mas header/row têm 12 células (ações integradas no status). É divergência observada de colspan, não alteração proposta. Table UI é HTML simples com wrapper overflow-auto, não data grid com sort/pagination embutidos.

VencemHojeTable declara props page/totalPages/totalItems/onPrev/onNext, mas Home não passa paginação e componente não corta array nem renderiza botões de paginação. AtrasadasTable limita currentPage aos registros disponíveis; Home guarda pageAtrasadas localmente.

## 31. Filtros e buscas

| Área | Backend | Frontend |
|---|---|---|
| Perfil | Todas requests com header condicional | seleciona objeto do Context; lista de perfis sem busca |
| Clientes | GET /clientes + empréstimos por cliente para contagem | nome/indicador includes lower; sem debounce/schema |
| Empréstimos | GET detalhes de um cliente | busca nome, auto-select/sugestões, status, prioridade/date sort; URL persistida |
| Parcelas | GET por status; ALL gera quatro GET | nome, conjunto de nomes, conjunto de status, mês sem ano, emprestimoId da query, data sort/pagas ao fim; paginação10 |
| Relatório parcelas | GET detalhes cliente e quatro GET por status | seleção de cliente/empréstimo, filtra id; ordenação final número; sem busca dentro da tabela |
| Dashboard | vencendo-hoje e status são filtros API | período 3/6/12/all para stats/gráfico; ano ALL/específico no chart; tabelas hoje/atrasadas não recebem filtro de período |

Filtro temporal do dashboard é limite inferior hoje menos N meses, por dataEmprestimo para totais de empréstimos e dataVencimento para parcelas; não há limite superior, então datas futuras podem entrar. TotalAtraso soma valorParcela ATRASADO, sem subtrair valorPago. As tabelas hoje/atrasadas vêm das listas originais, sem aplicar period. FinancialChart agrupa anos quando ALL ou meses de ano selecionado; anos vêm dos dados.

`ParcelasTableHeader` associa botão "Mais antigos" a desc e "Mais recentes" a asc, enquanto useParcelasFiltradas implementa desc=dateB-dateA e asc=dateA-dateB. Os rótulos estão invertidos em relação ao cálculo. Busca por nome em relatório -> parcelas pode abranger homônimos/substrings; only emprestimoId faz filtro de identificador. Sem parâmetro de clienteId na rota de parcelas.

## 32. Estilização

`src/index.css`: @tailwind base/components/utilities; @layer base com tokens HSL em :root e .dark; --radius e cores de chart; body Arial/Helvetica/sans-serif. Não há CSS modules/styled-components em uso ou biblioteca Material UI/Bootstrap/Chakra. Classes utilitárias estão nos TSX. Radix wrappers e cva fornecem variants; `src/lib/utils.ts` exporta cn=twMerge(clsx(inputs)).

`tailwind.config.js`: darkMode class, content index/src, borderRadius baseado em --radius, cores HSL dos tokens, tailwindcss-animate. `postcss.config.js`: Tailwind/Autoprefixer. `components.json`: shadcn new-york, base neutral, CSS variables, TSX, aliases. Cores slate/white/blue/emerald/amber/red são usadas diretamente em páginas/componentes além dos tokens. .dark está definido, mas não há mecanismo de alternância de tema encontrado. Sem avaliação estética/visual em execução.

## 33. Responsividade

Evidência apenas em classes/config, sem teste visual:

- `Layout`: flex com Sidebar w64 shrink0 sticky h100vh sempre visível; main flex1 min-w0 h-screen overflow-y-auto/overflow-x-hidden. Não há menu móvel/hambúrguer/breakpoint que esconda sidebar.
- Empréstimos/RelatorioParcelas: padding p4/sm:p6/lg:p8; filtros grid1/md2/xl colunas customizadas; ações empilhadas até xl. ClienteAutoComplete w-full/sm:w320px.
- Tabela empréstimos: overflow-x-auto, min-width1180/xl1240, hint de arraste escondido em xl; texto/células variam sm. Parcelas: overflow-x-auto e min980.
- Clients: cards grid1/sm2, mas cabeçalho flex horizontal, padding p10 e input w64. Parcelas: cards grid1/sm3, header horizontal/input w72/p8. Não há adaptação específica completa desses cabeçalhos.
- Home cards md2/xl4; gráfico usa ResizeObserver e resize para calcular width/height de contêiner h96, não ResponsiveContainer; tabelas têm wrapper overflow-auto da primitive.
- Configuracoes: p6/md8, summary md3, corpo xl duas colunas; simulação grid1/md3; backup max-w-xl com px4.
- Diálogos: largura full/max-w e ajustes sm; footer flex-col-reverse/sm:flex-row; alteração compartilhada e reprogramação max-h90vh/overflow-y-auto; formulário empréstimo grid1/sm2; relatório cards sm2 e tabelas xl2 blocos.

Não há breakpoints personalizados em tailwind.config; comportamento mobile/tablet resulta de sm/md/lg/xl. **Inferência:** sidebar fixa em largura reduz espaço em telas pequenas; não afirmar usabilidade sem renderização. Não foi possível determinar com segurança pelo código analisado compatibilidade real em cada dispositivo/navegador.

## 34. Código potencialmente não utilizado

Após busca de imports/símbolos em todo src, **não encontrei referências externas** para:

- `src/components/ProfileSwitcher.tsx`: implementação duplicada de seleção/criação; Configuracoes contém UI própria.
- `src/pages/Parcelas/components/dialogs/AlterarParcelaDialog.tsx`: versão sem observações; imports reais usam `@/components/AlterarParcelaDialog`.
- `src/pages/Parcelas/components/dialogs/AlterarDataParcelaDialog.tsx`.
- Objeto `dashboardService`, todas suas quatro funções; dashboard usa clientes/emprestimos/parcelas services.
- `clientesService.getById`, getEmprestimos e delete; hook de clientes faz parte dessas requests diretamente.
- `emprestimosService.getParcelas`.
- `parcelasService.getMesAtual`, getByEmprestimo e listar/criar/editar/excluirObservacao; UI usa service específico de observações.
- `useParcelas.pagarParcela` retornado (função existe; dialogs usam service), status/setStatus retornados não consumidos pelo useParcelasPage.
- `src/schemas/emprestimos.schemas.ts` export clienteSearchSchema; os hooks declaram schema local duplicado.
- Schemas/tipos de pagar/data em parcelas.schema.ts além de parcelasSearchSchema.
- styled-components e @tailwindcss/vite/vite-bundle-analyzer declarados sem uso nas fontes/config; auto declarado sem script de uso encontrado.

Isso indica ausência de consumidores no conjunto analisado; não prova impossibilidade de uso externo ou geração. Precisa de confirmação antes de remover qualquer arquivo/função. Não encontrei hook inteiro em src/hooks sem referência. Não encontrei TODO/FIXME literal relevante; comentários "trate com toast se quiser" em observações, "erro já tratado no hook" em alteração (hook somente loga/rethrow) e import/input de busca comentados em DashboardHeader são pendências/indícios. Há eslint-disable específicos para watch/RHF e tooltip any. Sem evidência suficiente para chamar definitivamente esses fluxos de mortos.

## 35. Dependências entre componentes

```text
App -> Layout -> Sidebar (navigate/location/cn) + Outlet
Home -> useProfile/useDashboard
  -> DashboardHeader -> Select
  -> StatsCards -> Card/Skeleton
  -> FinancialChart -> Recharts/Card/Skeleton
  -> VencemHojeTable/AtrasadasTable
     -> AlterarParcelaButton/PagarParcelaButton
     -> AlterarParcelaDialog compartilhado -> useAlterarParcela -> parcelasService
        -> parcelaObservacaoService
     -> PagarParcelaDialog -> parcelasService
Clientes -> useClientes -> apiClient
  -> ModalCadastro -> clienteCreateSchema -> apiClient
  -> ModalRelatorio -> buscarRelatorioCliente -> apiClient
  -> StatCard/Table/Input/Card/Button/Skeleton
Emprestimo -> useEmprestimosPage -> clientesService/emprestimosService
  -> ClienteAutoComplete
  -> NovoEmprestimoDialog -> useEmprestimo -> emprestimosService.create
  -> ModalRelatorio
  -> EmprestimosTable -> useEmprestimoStatusActions -> emprestimosService
     -> EmprestimosTableHeader/EmprestimosTableRow
        -> EmprestimoStatusCell -> EmprestimoStatusBadge/DropdownMenu
     -> ConfirmActionDialog/EditEmprestimoDialog
Parcelas -> useParcelasPage -> useParcelas/apiClient + useParcelasFiltradas
  -> ParcelasHeader/Stats/Skeleton/Pagination
  -> ParcelasTable -> ParcelasTableHeader/Row -> botões
  -> PagarParcelaDialog/DesfazerPagamentoDialog/AlterarParcelaDialog compartilhado
RelatorioParcelas -> useRelatorioParcelasPage -> clientesService/emprestimosService/apiClient
  -> ClienteAutoComplete -> Input
  -> RelatorioParcelasTable -> ParcelasTableBlock -> Table/Badge
Simulation -> useSimulacaoEmprestimo -> calcularSimulacao
BackupPage -> apiClient(import) + fetch(export)
Configuracoes -> useProfile -> ProfileProvider -> apiClient
```

Inventário de componentes não modais (modais/props completos na seção 23):

| Componente / caminho | Responsabilidade / props / estado / hooks / eventos / filhos / API |
|---|---|
| Layout — `src/Layout.tsx` | sem props/state; menu definido local; Sidebar/Outlet; sem API |
| Sidebar — `src/components/SideBar.tsx` | props userName,menuItems[{label,path,icon?}]; useNavigate/useLocation; clique navega; sem state/API; ícones/settings |
| ProfileSwitcher — `src/components/ProfileSwitcher.tsx` | sem props; useProfile + novoPerfil/criando; select/criar; inputs/botão nativos; POST via Context; sem consumidor |
| ClienteAutoComplete — `src/components/ClienteAutoComplete.tsx` | props value,error?,suggestions:Cliente[],disabled?,onChange,onSelect; open/ref, useMemo/useEffect; mousedown fora fecha, change/focus abre, click seleciona; Input/sugestões nome/indicador; sem API |
| StatCard — `src/components/StatCard.tsx` | props label,value; Card com número/texto; sem state/hooks/API |
| StatSmallCard — `src/components/StatSmallCard.tsx` | label,value,icon,variant,className?; Card com cores; sem state/hooks/API |
| PagarParcelaButton/AlterarParcelaButton — `src/components/actions/*.tsx` | onClick; Button, segundo CalendarClock; delegam evento; sem state/hooks/API |
| DashboardHeader — `src/pages/Home/components/DashboardHeader.tsx` | period,setPeriod; Select de período; evento onValueChange; sem state/API |
| StatsCards — `src/pages/Home/components/StatsCards.tsx` | totalEmprestado/Recebido/Aberto/Atraso,loading?; cards/skeletons moeda; sem state/API |
| FinancialChart — `src/pages/Home/components/FinancialChart.tsx` | data:Point[],loading?; states yearFilter/container/size; useCallback/effect/memo; resize/observer, filtro de ano; BarChart/Tooltip/Card/Skeleton; sem API; CustomTooltip helper componente local |
| VencemHojeTable — `src/pages/Home/components/VencemHojeTable.tsx` | parcelas:ParcelaTable[],onRefresh,loading?,page?,totalPages?,totalItems?,onPrev?,onNext?; selected/pagarOpen/alterarOpen; useState; botões/dialogs; requests via filhos |
| AtrasadasTable — `src/pages/Home/components/AtrasadasTable.tsx` | parcelas,page,onPrev,onNext,onRefresh,loading?; selected/alterarOpen/pagarOpen; useState; dias de atraso/paginação20; botões/dialogs; requests via filhos |
| EmprestimosTable — `src/pages/Emprestimo/components/EmprestimosTable.tsx` | loading?,emprestimos,selectedClienteName?,selectedClienteId?,onOpenParcelas,onRefetch?; hook de actions; tabela/header/row/confirm/edit; requests via hook; trocas de dialog por setTimeout0 |
| EmprestimosTableHeader — `src/pages/Emprestimo/components/table/EmprestimosTableHeader.tsx` | sem props/state/API; colunas |
| EmprestimosTableRow — `src/pages/Emprestimo/components/table/EmprestimosTableRow.tsx` | emprestimo,canAct,actionsDisabled?,onOpenParcelas,onRefinance,onQuit,onDelete,onEdit; sem state/hooks/API; clique/teclado/ações; StatusCell/Button |
| EmprestimoStatusCell — `src/pages/Emprestimo/components/table/EmprestimoStatusCell.tsx` | emprestimo,canAct,disabled?,onRefinance,onQuit; sem state/hooks/API; dropdown só EM_ABERTO; Badge/Button/DropdownMenu |
| EmprestimoStatusBadge — `src/pages/Emprestimo/components/EmprestimoStatusBadge.tsx` | status:string; label/variant; sem state/API |
| ParcelasHeader — `src/pages/Parcelas/components/ParcelasHeader.tsx` | search,searchError?,onSearchChange,hasFilters,onClearFilters; Input/Button; sem state/API |
| ParcelasStats — `src/pages/Parcelas/components/ParcelasStats.tsx` | total,atrasadas,vencendoSemana; StatCard; sem state/API |
| ParcelasSkeleton — `src/pages/Parcelas/components/ParcelasSkeleton.tsx` | sem props/state; skeleton header/cards/8 linhas/footer; sem API |
| ParcelasPagination — `src/pages/Parcelas/components/ParcelasPagination.tsx` | page,totalPages,totalItems,onPrev,onNext; Button/CardFooter, bloqueio nos limites; sem state/API |
| ParcelasTable — `src/pages/Parcelas/components/table/ParcelasTable.tsx` | loading,parcelas,uniqueClients,selectedClients,selectedStatuses,selectedMonth,toggleClient,toggleStatus,setSelectedMonth,setSortOrder,onPagar,onAlterarParcela,onDesfazerPagamento; sem state; Header/Row; sem API direta |
| ParcelasTableHeader — `src/pages/Parcelas/components/table/ParcelasTableHeader.tsx` | props de filtros/lista e callbacks acima; Popover/Checkbox/select; sem state/API; dispara toggles/sort/mês |
| ParcelasTableRow — `src/pages/Parcelas/components/table/ParcelasTableRow.tsx` | parcela,onPagar,onAlterarParcela,onDesfazerPagamento; sem state/API; Badge/botões; ações por status |
| RelatorioParcelasTable — `src/pages/RelatorioParcelas/components/RelatorioParcelasTable.tsx` | loading?,parcelas,selectedClienteName?,selectedEmprestimoLabel?; sem state/hooks/API; sort/chunks/Card/ParcelasTableBlock |
| ParcelasTableBlock — mesmo arquivo | componente interno props parcelas,label?; Table/Badge; sem state/API |

Primitivas em `src/components/ui`: badge/button usam cva; button usa Slot/asChild e forwardRef; card exporta Card/Header/Footer/Title/Description/Content; checkbox Radix com Check; dialog Radix com Portal/Overlay/Close; dropdown-menu exporta Root/Trigger/Content/Item/CheckboxItem/RadioItem/Label/Separator/Shortcut/Group/Portal/Sub/SubContent/SubTrigger/RadioGroup; input HTML forwardRef; label Radix/cva; popover Root/Trigger/Content/Anchor com Portal; select Radix com Trigger/Content/Value/Group/Label/Item/Separator/ScrollUp/Down; skeleton div animate-pulse; table HTML forwardRefs Header/Body/Footer/Head/Row/Cell/Caption; textarea HTML forwardRef. Props/eventos são herdados de React/Radix e classes; não possuem estado de domínio ou APIs. As primitivas Radix podem controlar estado de abertura/seleção internamente; código local não cria store para isso.

## 36. Fluxos end-to-end

1. **Selecionar perfil:** Sidebar Configurações -> Configuracoes select ou botão de perfil -> setPerfilAtivo -> Context/storage -> efeitos dos consumidores carregam dados -> requests enviam ID salvo. Criar perfil: input trim -> criarPerfil POST /perfis -> adiciona/ativa -> mesma cadeia. Sem navegação automática após escolher.
2. **Criar cliente:** Clients Novo Cliente -> ModalCadastro -> cinco inputs/RHF/Zod -> onSubmit monta JSON -> apiClient.post /clientes -> buildHeaders -> sucesso reset/fecha/onSuccess(fetchClientes) -> lista e contagem de empréstimos recarregadas.
3. **Editar cliente:** não existe fluxo localizado. Não foi possível determinar com segurança pelo código analisado endpoint/payload.
4. **Excluir cliente:** Clients Deletar -> useClientes.deletarCliente(id) guard de perfil -> window.confirm -> DELETE /clientes/:id -> fetchClientes. Cancelar não envia request; falha sem catch visual.
5. **Criar empréstimo:** Emprestimo carrega clientes -> select/sugestão/auto-select/URL -> vm.selectedCliente -> NovoEmprestimoDialog props -> effect setValue clienteId -> RHF/Zod -> useEmprestimo.onSubmit guard perfil -> seis campos -> emprestimosService.create -> POST /clientes/:id/emprestimos + header -> reset -> onCreated/refetch detalhes -> fecha.
6. **Pagar total:** tabela seleciona parcela -> PagarParcelaDialog calcula saldo e valor default -> RHF valida -> diferença<0.01 -> service.pagar POST com identidade -> callback aguardado (reload ou dashboard.refresh) -> fecha.
7. **Pagar parcial:** mesmo dialog; valor positivo menor/diferente do saldo -> pagarParcial POST inclui valorPago -> reload/fecha. ValorPago prévio da resposta é usado para reduzir saldo exibido.
8. **Desfazer pagamento:** Parcelas linha PAGO -> openDesfazerPagamento -> dialog confirma -> POST /parcelas/desfazer-pagamento -> fecha -> vm.handleDesfazerPagamentoSuccess reload -> abre AlterarParcelaDialog com selected atual para ajustar data/valor.
9. **Alterar parcela:** Editar em Home/Parcelas -> dialog compartilhado -> novaData/novoValor, schema -> useAlterarParcela guard perfil -> PATCH /parcelas/alterar -> reload/refresh aguardado -> fecha. Observações são ações separadas.
10. **Reprogramar:** linha empréstimo SquarePen -> actions.openEdit target -> EditEmprestimoDialog preenche início/valor -> manual valida presença -> payload novaDataInicial/novoValorParcela -> actions.handleEdit -> PATCH /clientes/:c/emprestimos/:e/parcelas/reprogramar -> onRefetch -> close.
11. **Quitar:** dropdown de status EM_ABERTO ou edição -> openQuit -> ConfirmActionDialog -> confirm/handleQuit -> POST .../quitar body{} -> refetch/fecha. Não há seleção de parcelas ou valor para quitação na UI.
12. **Refinanciar:** dropdown ou edição -> openRefinance -> ConfirmActionDialog -> POST .../refinanciar body{} -> refetch/fecha. Front não monta outro empréstimo nesse fluxo.
13. **Excluir empréstimo:** lixeira/edição -> openDelete -> confirmação -> DELETE caminho com cliente e empréstimo -> refetch/fecha.
14. **Adicionar observação:** abrir edição parcela -> listar observações -> textarea trim não vazio -> service.criar POST -> limpa texto/relista/reload pai, modal continua. Editar: state local -> PATCH com idObservacao/texto -> encerra/relista. Excluir: DELETE id -> relista, sem confirmação.
15. **Resumo de cliente:** Relatório em Clients/Emprestimo -> abrir/handleBuscar -> GET empréstimos -> GET parcelas por empréstimo em paralelo -> agregação -> cards -> Ver detalhes navega /parcelas?cliente=nome. Fechar limpa relatório.
16. **Relatório parcelas:** rota -> clientes -> escolher cliente -> detalhes de empréstimos -> escolher empréstimo -> quatro GET status -> filtro id -> table reordena número -> blocos10. Não gera arquivo.
17. **Importar:** Backup input xlsx -> handleImport -> presença arquivo -> FormData file -> POST /import com header -> mensagem + file=null. Sem reload de outras telas.
18. **Exportar:** Backup exportar -> fetch /export com Accept/header/credentials -> checa ok e MIME -> blob/objectURL/anchor -> baixa XLSX -> revoga URL -> mensagem.
19. **Simular:** inputs valor/juros/parcelas -> setters do hook -> useMemo/calcularSimulacao -> cards/tabela, sem HTTP/persistência.

## 37. Mapa frontend -> API

Mapa completo das 29 combinações distintas de método/caminho. Identificadores `:clienteId/:emprestimoId/:idEmprestimo/:numeroParcela/:idObservacao` representam interpolação real, não literais enviados. Todos os caminhos são acrescentados a env.API_URL. Headers padrão H = Content-Type application/json + X-Perfil-Id se salvo; F = multipart com boundary pelo navegador + X-Perfil-Id se salvo; E = Accept XLSX + X-Perfil-Id se salvo + credentials include. Erro padrão R = request lança Error, tratamento por caller na seção 28. Respostas descrevem tipos/uso esperado, não contrato confirmado do servidor.

| HTTP / endpoint | Arquivo e função frontend | Tela/consumidor | Parâmetros / body | Resposta esperada / headers / erro |
|---|---|---|---|---|
| GET /perfis | `src/contexts/ProfileContext.tsx` carregarPerfis | bootstrap/ProfileProvider, Configuracoes | sem body | Perfil[] ou {perfis?:Perfil[],data?:Perfil[]}; H/R + log/clear |
| POST /perfis | mesmo arquivo criarPerfil | Configuracoes; ProfileSwitcher sem uso encontrado | {nome:string} | Perfil; H/R + rethrow/alert UI |
| GET /clientes | `src/services/clientes.service.ts` getAll; `src/hooks/useClients.ts` fetchClientes | Home/useDashboard; Emprestimo/useEmprestimosPage; RelatorioParcelas/useRelatorioParcelasPage; Clients | sem body | Cliente[]; H/R; limpeza conforme hook |
| GET /clientes/:clienteId | clientes.service getById | sem consumidor encontrado | clienteId no path | Cliente; H/R |
| POST /clientes | `src/components/ModalCadastro.tsx` onSubmit | Clients | {nome,nomeIndicador:string|null,enderecoRua,enderecoBairro,enderecoNumero:number} | void/ignorada; H/R; alert/log |
| DELETE /clientes/:clienteId | clientes.service delete; useClients.deletarCliente direto | Clients usa hook, service sem consumidor | clienteId no path; sem body | void/ignorada; H/R; sem catch mutation |
| GET /clientes/:clienteId/emprestimos | clientes.service getEmprestimos; useClients.fetchClientes; `src/services/relatorio.service.ts` buscarRelatorioCliente | contagem Clients; ModalRelatorio; service cliente sem consumidor | clienteId no path | Emprestimo[]; H/R; contagem falha individual[]/modal log |
| GET /clientes/:clienteId/emprestimos/detalhes | `src/services/emprestimos.service.ts` getByCliente; `src/services/dashboard.service.ts` getEmprestimosPorCliente | Home, Emprestimo, RelatorioParcelas; dashboardService sem consumidor | clienteId no path | EmprestimoDetalhado[]; H/R |
| GET /clientes/:clienteId/emprestimos/:emprestimoId/parcelas | emprestimos.service getParcelas; relatorio.service.buscarRelatorioCliente | ModalRelatorio pelo service relatório; getParcelas sem consumidor | dois IDs no path | ParcelaResponse[]; H/R |
| POST /clientes/:clienteId/emprestimos | emprestimos.service create | NovoEmprestimoDialog/useEmprestimo | clienteId no path; CriarEmprestimoDTO com seis campos | void/ignorada; H/R; sem catch visual |
| POST /clientes/:clienteId/emprestimos/:emprestimoId/refinanciar | emprestimos.service refinanciar | useEmprestimoStatusActions/confirm | IDs no path; body efetivo {} | void/ignorada; H/R; finally loading |
| POST /clientes/:clienteId/emprestimos/:emprestimoId/quitar | emprestimos.service quitar | mesmo hook/confirm | IDs no path; body efetivo {} | void/ignorada; H/R |
| PATCH /clientes/:clienteId/emprestimos/:emprestimoId/parcelas/reprogramar | emprestimos.service reprogramarParcelas | EditEmprestimoDialog -> actions.handleEdit | {novaDataInicial:string,novoValorParcela:number} | void/ignorada; H/R |
| DELETE /clientes/:clienteId/emprestimos/:emprestimoId | emprestimos.service delete | actions.handleDelete/confirm | IDs no path; sem body | void/ignorada; H/R |
| GET /dashboard/total-emprestado | dashboard.service getTotalEmprestado | sem consumidor encontrado | sem body | number; H/R |
| GET /parcelas/vencendo-hoje | dashboard.service getVencendoHoje; `src/services/parcelas/parcelas.service.ts` getVencendoHoje | useDashboard usa parcelasService; dashboardService sem uso | sem body | ParcelaResponse[]; H/R |
| GET /parcelas?status=:status | dashboard.service getParcelasPorStatus; parcelas.service getPorStatus; `src/hooks/useParcelas.ts` fetchParcelas (dois locais de chamada); `src/hooks/useRelatorioParcelasPage.ts` fetchParcelasByEmprestimo | Home via service parcelas; Parcelas; RelatorioParcelas | status string/StatusParcela query; ALL resolvido em quatro valores, não enviado como ALL | ParcelaResponse[]; H/R |
| GET /parcelas/mes-atual | parcelas.service getMesAtual | sem consumidor encontrado | sem body | ParcelaResponse[]; H/R |
| GET /parcelas/emprestimo/:idEmprestimo | parcelas.service getByEmprestimo | sem consumidor encontrado | idEmprestimo path | ParcelaResponse[]; H/R |
| POST /parcelas/pagar | parcelas.service pagar; useParcelas.pagarParcela (sem consumidor da função) | PagarParcelaDialog em Home/Parcelas | {idEmprestimo:number,numeroParcela:number} | void/ignorada; H/R; alert no dialog |
| POST /parcelas/pagar-parcial | parcelas.service pagarParcial | PagarParcelaDialog | {idEmprestimo,numeroParcela,valorPago:number} | void/ignorada; H/R; alert |
| POST /parcelas/desfazer-pagamento | `src/pages/Parcelas/components/dialogs/DesfazerPagamentoDialog.tsx` handleConfirm | Parcelas | {idEmprestimo,numeroParcela} | resposta ignorada; H/R; alert/log |
| PATCH /parcelas/alterar | parcelas.service alterarParcela | useAlterarParcela -> dialog compartilhado; dois dialogs alternativos sem uso | {idEmprestimo,numeroParcela,novaData:string,novoValor:number} | void/ignorada; H/R; hook log/rethrow/dialog catch vazio |
| GET /parcelas/observacoes?idEmprestimo=:id&numeroParcela=:numero | parcelas.service listarObservacoes; `src/services/parcelas/parcela-observacao.service.ts` listar | AlterarParcelaDialog compartilhado usa service específico | dois números query; sem body | ParcelaObservacao[]; H/R; [] no catch |
| POST /parcelas/observacoes | parcelas.service criarObservacao; parcela-observacao.service criar | compartilhado handleCriarObservacao; duplicata sem consumidor | {idEmprestimo,numeroParcela,observacao:string} | void/ignorada; H/R; catch vazio |
| PATCH /parcelas/observacoes | parcelas.service editarObservacao; parcela-observacao.service editar | compartilhado handleSalvarEdicao; duplicata sem uso | {idObservacao:number,observacao:string} | void/ignorada; H/R; catch vazio |
| DELETE /parcelas/observacoes/:idObservacao | parcelas.service excluirObservacao; parcela-observacao.service excluir | compartilhado handleExcluirObservacao; duplicata sem uso | ID path; sem body | void/ignorada; H/R; catch vazio |
| POST /import | `src/pages/BackupPage/index.tsx` handleImport -> apiClient | BackupPage | FormData key file:File | ignorada; F/R; console/mensagem genérica |
| GET /export | BackupPage.handleExport -> fetch direto | BackupPage | sem body | Blob XLSX com MIME checado; E; erro local de status/MIME, console/mensagem |

Não existem chamadas frontend para PUT/PATCH Cliente, atualização de Perfil, /relatorios, fiadorId, login/logout ou APIs externas. 44 chamadas apiClient resultam de 32 expressões em services + 2 no Context + 3 em useClients + 3 em useParcelas + 1 no hook relatório + 1 em ModalCadastro + 1 em DesfazerPagamentoDialog + 1 em BackupPage. Exportação soma o 45º local. GETs parametrizados por mapas podem disparar N requisições. A contagem não inclui imports ou o fetch interno de apiClient.

## 38. Arquivos importantes

| Grupo | Ler primeiro (caminho completo relativo) |
|---|---|
| Essenciais | `package.json`, `package-lock.json`, `src/main.tsx`, `src/App.tsx`, `src/Layout.tsx`, `src/config/env.ts`, `src/services/apiClient.ts` |
| Rotas | `src/App.tsx`, `src/Layout.tsx`, `src/components/SideBar.tsx`, `src/hooks/useEmprestimoPage.ts`, `src/pages/Emprestimo/index.tsx`, `src/hooks/useParcelasPage.ts` |
| Perfil/estado global | `src/contexts/ProfileContext.tsx`, `src/pages/Configuracoes/index.tsx`; `src/components/ProfileSwitcher.tsx` como implementação sem consumidor; cache em `src/hooks/useDashboard.ts` |
| Clientes | `src/pages/Clients/index.tsx`, `src/hooks/useClients.ts`, `src/components/ModalCadastro.tsx`, `src/schemas/clientes.schemas.ts`, `src/services/clientes.service.ts`, `src/components/ClienteAutoComplete.tsx` |
| Empréstimos | `src/pages/Emprestimo/index.tsx`, `src/hooks/useEmprestimoPage.ts`, `src/hooks/useEmprestimo.ts`, `src/pages/Emprestimo/components/NovoEmprestimoDialog.tsx`, `src/pages/Emprestimo/components/EmprestimosTable.tsx`, `src/pages/Emprestimo/components/EditEmprestimoDialog.tsx`, `src/pages/Emprestimo/components/table/useEmprestimosActions.ts`, `src/services/emprestimos.service.ts` |
| Parcelas | `src/pages/Parcelas/index.tsx`, `src/hooks/useParcelas.ts`, `src/hooks/useParcelasPage.ts`, `src/hooks/useParcelasFiltradas.ts`, `src/components/AlterarParcelaDialog.tsx`, `src/hooks/useAlterarParcela.ts`, `src/pages/Parcelas/components/dialogs/PagarParcelaDialog.tsx`, `src/pages/Parcelas/components/dialogs/DesfazerPagamentoDialog.tsx`, `src/pages/Parcelas/components/table/ParcelasTableRow.tsx` |
| Relatórios/dashboard | `src/components/ModalRelatorio.tsx`, `src/services/relatorio.service.ts`, `src/pages/RelatorioParcelas/index.tsx`, `src/hooks/useRelatorioParcelasPage.ts`, `src/pages/RelatorioParcelas/components/RelatorioParcelasTable.tsx`, `src/pages/Home/index.tsx`, `src/hooks/useDashboard.ts`, `src/pages/Home/components/FinancialChart.tsx` |
| API/services | `src/services/apiClient.ts`, `src/services/clientes.service.ts`, `src/services/emprestimos.service.ts`, `src/services/parcelas/parcelas.service.ts`, `src/services/parcelas/parcela-observacao.service.ts`, `src/services/relatorio.service.ts`, `src/pages/BackupPage/index.tsx`; `src/services/dashboard.service.ts` sem uso encontrado |
| Tipos | `src/types/index.ts`, `src/types/parcela-observacao.ts`, `src/contexts/ProfileContext.tsx`, `src/services/emprestimos.service.ts`, `src/services/parcelas/parcela-observacao.service.ts`, `src/mappers/parcela.mapper.ts` |
| Simulação | `src/pages/Simulation/index.tsx`, `src/hooks/useSimulacao.ts`, `src/services/simulacao.service.ts` |
| Estilos/config | `src/index.css`, `tailwind.config.js`, `postcss.config.js`, `components.json`, `src/lib/utils.ts`, `src/components/ui/*.tsx`, `vite.config.ts`, `Dockerfile`, `nginx.conf` |

## 39. Impacto futuro: dados completos de Cliente

Mapeamento de impacto, **sem implementação e sem inventar campos/endpoint da nova API**. O contrato Java precisa definir nomes, obrigatoriedade, nulabilidade, enums e formato dos dados pessoais.

| Item / arquivo | Componente/função / motivo |
|---|---|
| Cliente completo — `src/types/index.ts` | interface Cliente precisa representar novos campos/resposta e possível nulabilidade (nomeIndicador é string hoje, cadastro já envia null). |
| Cadastro — `src/schemas/clientes.schemas.ts` | clienteCreateSchema/ClienteCreateForm para campos e regras do novo DTO. |
| Cadastro — `src/components/ModalCadastro.tsx` | defaults, inputs, mensagens e payload onSubmit; criação está aqui diretamente, não em clientesService. |
| Leitura/listagem — `src/hooks/useClients.ts` | fetchClientes/deletarCliente; acomodar formato de resposta, recarga e eventual ação de edição. Não presumir necessidade de alterar se array/contrato básico permanecer. |
| Interface de listagem/edição — `src/pages/Clients/index.tsx` | hoje só nome/indicador/relatório/excluir; futuro ponto para editar/exibir dados. Componente de edição ainda não existe. |
| API — `src/services/clientes.service.ts` | atualmente não há create/update; provável ponto para contrato de atualização/cadastro centralizado, se desenho futuro adotar service. Método/endpoint precisam vir da API. |
| Seleção — `src/components/ClienteAutoComplete.tsx` | props Cliente[]/exibição nome/indicador; ajustar somente se novos dados usados para identificar/desambiguar. |
| Consumidores — `src/hooks/useEmprestimoPage.ts`, `src/hooks/useRelatorioParcelasPage.ts`, `src/hooks/useDashboard.ts` | assumem Cliente.id/nome e GET array; revisar compatibilidade ao expandir/responder novo DTO, sem mudança obrigatória se mantidos. |

**Edição completa:** não há arquivo existente que já edite Cliente. Pontos de integração: Clients adiciona ação; tipos/schema definem dados; cliente service estabelece chamada; useClients fornece atualização/reload. A criação de um componente/modal ou reutilização do existente deve ser decidida em tarefa futura, não feita nesta análise. Nenhum PATCH/PUT de Cliente foi deduzido da API.

## 40. Impacto futuro: Perfil como Credor

| Objetivo / arquivo | Componente/função / motivo |
|---|---|
| Perfil com dados completos — `src/contexts/ProfileContext.tsx` | Perfil, ProfileContextType, carregarPerfis/criarPerfil: hoje só id/nome/dataCriacao?, criação só nome. Novo contrato deve incluir campos reais de credor. |
| Formulário de perfil — `src/pages/Configuracoes/index.tsx` | novoPerfil/handleCriarPerfil/inputs: ampliar dados e edição se API suportar. Não há edição atual. |
| Implementação alternativa — `src/components/ProfileSwitcher.tsx` | mesmo contrato de criarPerfil(nome); revisar se passar a ser consumido ou assinatura global mudar. |
| Mostrar Credor — `src/pages/Emprestimo/components/NovoEmprestimoDialog.tsx` | inserir exibição do perfil ativo via useProfile ou props; atualmente só mostra cliente e campos do empréstimo. |
| Estado/form — `src/hooks/useEmprestimo.ts` | perfilAtivo já disponível internamente; se optar por retorná-lo ao modal, modificar retorno. Header já usa ID; não assumir necessidade de enviar credorId no body. |
| Página — `src/pages/Emprestimo/index.tsx` | modificar apenas se escolha for passar perfil por props; hoje passa clienteId/nome. |
| Compatibilidade transporte — `src/services/apiClient.ts` | já envia ID por storage; revisar somente se nova API exigir outra regra. Nome/dados pessoais não precisam entrar no header atual. |

O nome/ID do perfil estão globalmente disponíveis hoje, mas não expostos pelo hook de formulário. Seleção do credor deve continuar coerente com ID no header; relação exata Credor/Perfil da nova API precisa ser confirmada no contexto Java. Dados cadastrais completos e atualização de perfil: Não foi possível determinar com segurança pelo código analisado.

## 41. Impacto futuro: Fiador no Empréstimo

Não há fiador/avalista/garantidor implementado. Os arquivos centrais para **select opcional e envio de fiadorId**, condicionados ao contrato futuro:

| Arquivo | Componente/função / motivo |
|---|---|
| `src/pages/Emprestimo/components/NovoEmprestimoDialog.tsx` | UI do novo empréstimo: select opcional, lista elegível, valor e eventos; não há campo atual. |
| `src/hooks/useEmprestimo.ts` | schema EmprestimoFormData, defaultValues/reset e onSubmit: modelar opcionalidade, converter ID/ausência e montar body. |
| `src/services/emprestimos.service.ts` | CriarEmprestimoDTO/create: tipo do fiadorId e transporte do JSON conforme API. |
| `src/pages/Emprestimo/index.tsx` | ponto provável para fornecer opções ao modal e props; hoje vm.clientes já existe, mas modal recebe só devedor selecionado. |
| `src/hooks/useEmprestimoPage.ts` | já carrega clientes do perfil; revisar fonte/elegibilidade/reset do fiador ao mudar perfil/devedor se lista reaproveitada. |
| `src/types/index.ts` | Cliente/EmprestimoDetalhado: ampliar apenas se API retornar dados/relação de fiador ou tipo de pessoa completo. Não há campo atual. |
| `src/services/clientes.service.ts` | getAll pode fornecer opções se fiador for um Cliente; endpoint específico só se contrato futuro definir. Não inventar GET /fiadores. |

Opcionalidade (omitir campo versus null), relação do fiador com Cliente, permissão de mesmo devedor/fiador, perfil elegível e exibição posterior: **Não foi possível determinar com segurança pelo código analisado.** Isso depende da nova API/regra futura. Primitivas `src/components/ui/select.tsx` e selects nativos já existem; não há necessidade demonstrada de alterar a primitive para adicionar campo de domínio. `apiClient` já envia body genérico e header perfil, então não requer alteração só para um novo campo JSON, salvo mudança de contrato.

## 42. Pontos não determinados

Para cada ponto abaixo: **Não foi possível determinar com segurança pelo código analisado.**

- Contrato real/validação/autorização do backend, status HTTP efetivos e efeitos de cada mutation (incluindo refinanciamento/reprogramação/quitação/undo).
- URL/ambiente efetivamente implantado e comportamento de CORS/proxy/cookies em produção.
- Resposta real de mutations tipadas void; se API retorna entidades ou corpo vazio.
- Especificação do Excel importado/exportado, entidades/colunas, merge/substituição, limites e escopo por perfil.
- Campos e endpoints de Cliente completo/edição, Perfil credor completo e Fiador futuro.
- Semântica de valorPago da API, timezone/formato real das datas/string de moeda e política de arredondamento.
- Comportamento em execução das sincronizações duplicadas de URL e possíveis races na troca de perfil.
- Compatibilidade visual/mobile/picker nativo e acessibilidade efetiva; análise não executou navegador.
- Sucesso de build/lint/testes: não foram executados para manter tarefa de análise sem gerar/modificar artefatos existentes.
- Uso externo de arquivos sem referência no src; não foram declarados definitivamente mortos.

**Segunda passagem concluída:** busca textual em todo src por axios/fetch/createContext/useContext/useState/useEffect/useMemo/useCallback/localStorage/sessionStorage/X-Perfil-Id; caminhos clientes/emprestimos/parcelas/perfis/relatorios/import/export; símbolos Cliente/Perfil/Emprestimo/Parcela/Modal/Form/Select. Conferidas referências de services, componentes alternativos e schemas. Resultados incorporados: fetch próprio de exportação; duas formas de service observação; pagamentos atuais sem dataPagamento apesar do schema antigo; ausência de edição Cliente/Fiador/auth; GETs sem consumidor; duplicação de URL; cache/perfil; cálculo real do gráfico. Inventário de src coberto integralmente; package-lock examinado para versões/resoluções, não como código de domínio. Nenhuma evidência de axios/sessionStorage/outro contexto de domínio encontrada.

## 43. Índice rápido para outra IA

| Precisa entender/alterar futuramente | Entrada no código | Seção |
|---|---|---|
| Bootstrap/rotas | main.tsx/App.tsx/Layout.tsx | 5–6 |
| Perfil/nome/ID/storage | contexts/ProfileContext.tsx e pages/Configuracoes/index.tsx | 7–8,27 |
| Header/erros/URL da API | services/apiClient.ts e config/env.ts | 9–10,28 |
| Campos/payload de Cliente | components/ModalCadastro.tsx e schemas/clientes.schemas.ts | 11–14 |
| Edição Cliente | não existe; integração em pages/Clients e services/clientes | 14,39 |
| Cliente escolhido no empréstimo | hooks/useEmprestimoPage.ts -> page -> props do modal | 15–16 |
| JSON do empréstimo | hooks/useEmprestimo.ts + services/emprestimos.service.ts | 16,37 |
| Credor ativo disponível | perfilAtivo dentro de useEmprestimo; não exibido no modal | 16,40 |
| Fiador futuro | NovoEmprestimoDialog/useEmprestimo/CriarEmprestimoDTO | 41 |
| Actions empréstimo | table/useEmprestimosActions.ts + EditEmprestimoDialog | 15,36–37 |
| Pagamento/undo | PagarParcelaDialog/DesfazerPagamentoDialog | 18 |
| Alteração/observações | components/AlterarParcelaDialog.tsx (versão efetiva) | 19 |
| Filtros/paginação | useParcelasPage/useParcelasFiltradas/useEmprestimoPage | 17,30–31 |
| Relatórios e cálculo real | relatorio.service/useRelatorioParcelasPage/useDashboard | 20 |
| Excel | pages/BackupPage/index.tsx | 21–22 |
| Inventário componentes/props | componentes específicos/primitivas UI | 23,35 |
| Mapa completo HTTP | todos os services + chamadas diretas | 26,37 |
| Riscos/limites | Perfil/URL/cache/formatações e pontos não determinados | 6–7,11,20,31,42 |

Ordem recomendada de leitura para adaptação à API Java: `src/types/index.ts` -> `src/contexts/ProfileContext.tsx` -> `src/services/apiClient.ts` -> `src/components/ModalCadastro.tsx`/schema -> `src/pages/Emprestimo/components/NovoEmprestimoDialog.tsx` -> `src/hooks/useEmprestimo.ts` -> `src/services/emprestimos.service.ts` -> hooks de páginas e mapa HTTP desta seção 37. Confrontar os contratos reais da API antes de planejar mudanças.
