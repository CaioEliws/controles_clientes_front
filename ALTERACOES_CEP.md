# Autopreenchimento de endereço por CEP

Implementado em `ClienteFormFields`, compartilhado por cadastro e edição de Cliente e pelo cadastro de fiador. A configuração de Perfil não consulta CEP. Backend e regras cadastrais/contratuais permanecem inalterados.

`cep.service.ts` consulta ViaCEP diretamente por HTTPS, sem headers da aplicação ou X-Perfil-Id. Remove espaços e hífens e exige exatamente oito dígitos; caracteres alfabéticos e CEPs parciais não geram requisição. CEPs completos são exibidos com máscara 00000-000, permanecendo strings no payload normal de Cliente.

`useBuscaCep` dispara exclusivamente por alteração do usuário, não por watch, abertura do modal ou reset de dados. Usa AbortController, timeout de quatro segundos, identificação da consulta atual e conferência do CEP atual antes de aplicar a resposta. A desmontagem cancela a busca. A resposta antiga não pode substituir o novo endereço.

São preenchidos somente valores não vazios de logradouro/rua, bairro, localidade/cidade e uf/Estado. Número e complemento nunca são alterados. Campos vazios da resposta preservam o valor atual. O foco vai para Número quando o usuário ainda está no CEP; não é retirado de outro campo enquanto ele preenche manualmente.

Carregamento: “Buscando endereço...”. CEP inexistente: “CEP não encontrado.”. Falha/timeout: “Não foi possível consultar o CEP. Preencha o endereço manualmente.”. Nenhuma dessas situações bloqueia salvar nem apaga o endereço.

## Verificação

- `npm run lint`: aprovado.
- `npm run build`: aprovado; Vite emite aviso de bundle principal acima de 1000 kB.
- `tests/cep.mjs`: aprovado no Edge headless, com API de clientes simulada, sem gravar no banco real. Cobre CEP numérico e mascarado, ausência de chamadas com CEP parcial/alfabético, mapeamento de UF, preservação de número/complemento, foco, CEP inexistente, offline, HTTP 500, timeout, resposta parcial, corrida de respostas, salvamento após falha externa, edição sem reconsulta ao abrir e layout mobile 390x844.
- Verificação externa separada no mesmo navegador: GET real de `13346674` retornou HTTP 200 com resposta CORS acessível e `erro: true`. Não houve falha de CORS; nenhum proxy foi criado. O preenchimento desse CEP no teste usa fixture válida, e não afirma que ViaCEP encontre esse CEP real atualmente.
- Regressão adicional `tests/credor-devedor-fiador.mjs`: interrompida por timeout no primeiro salvamento. A fixture antiga não preenche o campo obrigatório `sexoDocumento` nem fornece `/documentos/opcoes-cadastro`; essa exigência já existe no formulário anterior à alteração de CEP. O novo teste de CEP fornece essas opções e preenche o sexo, confirmando cadastro e edição com as regras atuais. O script antigo não foi modificado nesta tarefa.
- `git diff --check`: sem erros.

Para executar os testes, iniciar Vite com VITE_API_URL=/api, usar FRONTEND_TEST_URL para sua URL local e PLAYWRIGHT_PACKAGE_PATH quando Playwright estiver instalado fora do projeto. Não foram adicionadas dependências.
