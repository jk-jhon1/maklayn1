# Maklayn — IA educacional e de pesquisa

A Maklayn é uma bancada digital para estudar, pesquisar e construir com mais critério. Este repositório contém o MVP funcional em React + Vite + Express + tRPC + Drizzle, preparado para usar o Manus OAuth e o LLM gerenciado da plataforma.

## O que está pronto

O produto inclui dashboard responsivo, chat inteligente com integração backend/fallback transparente, modo Pesquisa com referências demonstrativas rastreáveis, Arena de comparação entre modelos, estação de Código com editor e terminal explicitamente simulado, Centro ENEM com trilhas e laboratório de redação, Projetos locais e referências salvas. Também há modo claro/escuro, navegação responsiva, feedbacks de estado, manifesto de rotas e health check.

Quando o LLM não estiver disponível na sessão, o chat entra em modo demonstração e deixa isso explícito. Ele não fabrica citações, links ou respostas apresentadas como verificadas.

## Rodando localmente no ambiente WebDev

```bash
pnpm dev
```

O servidor usa `PORT` (padrão 3000), serve o frontend e mantém `/api/health` para readiness. Os comandos de verificação são:

```bash
pnpm check
pnpm test
pnpm build
```

A configuração gerenciada fornece as variáveis do Manus no runtime. Não coloque credenciais em arquivos do frontend ou em logs.

## Autenticação

O projeto preserva o fluxo Manus OAuth do starter, incluindo o cookie `webdev_app_session`, a validação de sessão e o login real no Preview. O botão **Entrar** abre o fluxo OAuth somente quando acionado pelo usuário. A aplicação não cria um usuário fictício e não usa uma senha simulada.

## LLM

O procedimento `ai.chat` chama `invokeLLM` no servidor com o contexto Maklayn. O frontend envia somente mensagens e recebe o texto da resposta. Se o serviço falhar, o cliente apresenta uma resposta demonstrativa explícita. Limites, retry e credenciais permanecem no contrato oficial do runtime.

## Segurança e limites do MVP

O editor de código não executa código arbitrário: o terminal é apenas visual e informa que a sandbox isolada será adicionada na fase 2. A pesquisa usa referências demonstrativas e informa que uma API autorizada deve ser configurada para resultados atuais. O armazenamento do MVP usa o navegador apenas para tema e interações de protótipo; o schema de usuários do starter e o isolamento OAuth continuam disponíveis para a próxima camada persistente.

Não estão incluídos ainda email/senha próprio, Google OAuth independente, RAG com embeddings, importação de documentos, storage privado, busca web ao vivo, execução sandboxed, exportação LGPD completa ou backup operacional. Esses itens estão registrados no `plan.md` como fase 2 e não devem ser apresentados como prontos.

## Estrutura rápida

- `client/src/App.tsx`: shell e telas do MVP.
- `client/src/index.css`: identidade visual e responsividade.
- `server/routers.ts`: autenticação e procedimento `ai.chat`.
- `server/_core/llm.ts`: cliente LLM gerenciado do starter.
- `client/public/manus-routes.json`: rotas do WebDev.
- `plan.md`: decisões de arquitetura, produto e design.
- `TODO.md`: entregas e critérios do incremento.

## Próximos incrementos recomendados

1. Adicionar tabelas de projetos, conversas, mensagens, fontes e planos com migrações aditivas e autorização por usuário.
2. Conectar storage privado e indexação assíncrona para PDF, TXT, DOCX e Markdown.
3. Configurar APIs autorizadas de pesquisa e registrar referências por afirmação.
4. Substituir o terminal simulado por executor isolado com limites e bloqueio de rede.
5. Fechar painel de privacidade, consentimentos, exportação e exclusão conforme LGPD.
