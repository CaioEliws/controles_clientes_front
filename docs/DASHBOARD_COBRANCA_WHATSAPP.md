# Cobrança manual no Dashboard

As tabelas Vencem Hoje e Parcelas Atrasadas mantêm suas colunas e uma única linha horizontal por parcela. Ações: Cobrar, Editar, Pagar. Os botões têm 32 px de altura, não quebram linha e usam ícones com título e nome acessível abaixo de 1024 px. A tabela mantém rolagem horizontal local quando necessário. Não há avisos de telefone nas células.

## Reutilização e dados

- `CobrarWhatsappButton.tsx`: reutiliza consulta de contato sob demanda, prévia, cópia de mensagem e link manual. Acrescentada opção `incluirHoje`, falsa por padrão, preservando Gestão de Parcelas e Relatório.
- `utils/whatsapp.ts`: mesma normalização, validação, modelo de mensagem e link. A opção de hoje considera data em São Paulo e saldo positivo em centavos. Quitação integral impede cobrança mesmo com status inconsistente. Pagamento parcial permite cobrança enquanto houver saldo. Vencimentos futuros não permitem cobrança.
- `mappers/parcela.mapper.ts`: mantém a resposta original em `origem`, incluindo clienteId, telefone, data e valores originais. Os cálculos e valores de exibição existentes não foram modificados.
- O telefone já vem de `ParcelaResponseDTO`, nos endpoints existentes `/parcelas/vencendo-hoje` e `/parcelas?status=ATRASADO`. O backend existente verifica o Perfil das entidades antes de expor contato. Nenhuma mudança de backend foi necessária.
- Não há consultas de clientes ao renderizar as linhas. O GET individual ocorre somente ao clicar em Cobrar, conforme o componente existente, para confirmar o contato atual com X-Perfil-Id. A data da mensagem continua sendo o vencimento daquela parcela, nunca a data atual.
- `Home/index.tsx`: remonta o conteúdo ao trocar Perfil, limpando seleção, paginação e modais anteriores. `useDashboard.ts` descarta requisições substituídas ou concluídas após desmontagem, inclusive antes de escrever no cache. O cache já era separado por Perfil.

## Arquivos alterados nesta tarefa

1. `src/pages/Home/components/DashboardParcelaActions.tsx` (novo)
2. `src/pages/Home/components/VencemHojeTable.tsx`
3. `src/pages/Home/components/AtrasadasTable.tsx`
4. `src/pages/Home/index.tsx`
5. `src/hooks/useDashboard.ts`
6. `src/mappers/parcela.mapper.ts`
7. `src/components/CobrarWhatsappButton.tsx` (componente já existente no workspace)
8. `src/utils/whatsapp.ts` (utilitário já existente no workspace)
9. `tests/dashboard-whatsapp.mjs` (novo)
10. Este relatório.

## Validação

Teste de navegador com Edge e interceptação completa da API, sem dados de produção: telefone válido, ausente e inválido; vencimento hoje e futuro; atraso com e sem pagamento parcial; quitação com status inconsistente; múltiplas parcelas do mesmo cliente; telefones distintos; prévia e conteúdo exato do link; Editar com PATCH da parcela correta; Pagar com saldo restante e POST da parcela correta; resposta de contato pendente ao navegar/trocar Perfil; X-Perfil-Id; ausência de consultas por linha e erros JavaScript.

Layout validado em 1440, 768 e 390 px: células permanecem `table-cell`, botões na mesma linha e linhas com altura inferior a 60 px. Capturas locais em `node_modules/.cache/dashboard-whatsapp/`.

`npm run lint` e `npm run build` aprovados. O build mantém o aviso de bundle acima de 1000 kB. Nenhuma mensagem foi enviada pelo teste; o link foi apenas inspecionado. Nenhuma regra financeira, pagamento, importação, backup ou dado de produção foi alterado.
