# Plano de implementação — Maklayn

## Direção do produto

A Maklayn será uma central de aprendizagem e pesquisa com IA: um espaço para pensar, comparar, verificar e transformar ideias em progresso. O primeiro incremento entrega um produto navegável e demonstrável, com o chat como eixo principal e os outros módulos como estações de trabalho prontas para evoluir.

## Escopo do MVP

- Dashboard autenticado com navegação para Chat, Pesquisa, Arena, Código, ENEM e Projetos.
- Chat funcional com mensagens persistidas localmente no navegador para a experiência imediata e integração de backend pronta para LLM.
- Respostas mockadas com transparência visual quando o serviço de IA ainda não responder; nenhum link ou citação é inventado.
- Pesquisa com referências demonstrativas rastreáveis e aviso de que o conteúdo está em modo de demonstração.
- Arena com Modelo A e Modelo B, critérios de avaliação, notas e comentário.
- Estação de código com editor simulado, abas, árvore de arquivos, terminal não executável e alertas de segurança.
- Centro ENEM com trilhas, questões, feedback pedagógico, análise de redação e plano de estudo.
- Projetos recentes e referências salvas com interações de favoritos, tags, cópia e exclusão local.
- Tema claro/escuro, layout responsivo, navegação por teclado, estados vazio/carregando/erro/sucesso.
- Login real via Manus OAuth do starter; sessão e autorização no servidor permanecem preservadas.
- Endpoint tRPC de chat usando o LLM gerenciado da Manus, com fallback explícito para demonstração quando o serviço não estiver disponível.
- Health check, manifesto de rotas e documentação de configuração.

## Fase 2 documentada

- Email/senha próprio, Google OAuth independente e recuperação de conta externa.
- Banco completo de projetos, conversas, mensagens, referências, documentos, embeddings, planos e auditoria.
- RAG com storage privado, fila de indexação, busca semântica e importação real de PDF/DOCX.
- Execução de código em sandbox isolado com limites de CPU, memória, tempo e rede.
- Busca web configurada com APIs autorizadas, citações por afirmação e verificação automática de fontes.
- Exportação LGPD completa, exclusão de conta, retenção configurável e painel de consentimentos.
- Observabilidade, CI, backup/restauração operacional e publicação de produção.

## Arquitetura e estrutura

- `client/src/App.tsx`: shell da experiência, navegação por módulos e estado local do MVP.
- `client/src/index.css`: sistema visual original Maklayn, responsividade, acessibilidade e microinterações.
- `server/routers.ts`: procedimentos tRPC para chat, referências e recursos demonstrativos.
- `server/_core/llm.ts`: cliente oficial do LLM gerenciado, sem segredos no frontend.
- `drizzle/schema.ts`: usuários do starter preservados; entidades de domínio serão adicionadas incrementalmente quando a persistência de produção for ativada.
- `public/manus-routes.json`: catálogo de rotas do site para o runtime WebDev.
- `README.md`: instalação, configuração, segurança, limitações e próximos incrementos.

## Design system

- **Movimento:** editorial digital / neo-brutalismo suave, com superfícies creme, bordas marcadas e acentos elétricos.
- **Princípios:** clareza antes do ornamento; contraste entre precisão e calor; conteúdo em primeiro plano; progresso visível.
- **Paleta:** carvão profundo para foco, marfim para leitura, coral-laranja para ação e ciano para estados de verificação. O laranja é a cor proprietária da Maklayn.
- **Layout:** sidebar estreita e contextual + canvas amplo com painéis assimétricos e faixa de status; evita uma página de cards genéricos centralizados.
- **Assinaturas:** marca `M/` em bloco, linhas de calibração e chips de confiança/fonte.
- **Interação:** cada clique deve responder com estado local, feedback toast ou mudança de contexto; nada de botões decorativos.
- **Animação:** entrada curta por opacidade/translate, hover com deslocamento de 2px, pulsação somente em estados ativos; respeitar `prefers-reduced-motion`.
- **Tipografia:** Geist/Inter para UI e uma serif editorial do sistema para chamadas, com escala 12/14/16/20/28/48.
- **Essência:** “Uma bancada inteligente para estudar, pesquisar e construir com mais critério.” Personalidade: precisa, curiosa, encorajadora.
- **Voz:** direta e humana. Exemplos: “Dê contexto. A Maklayn organiza o próximo passo.” / “Fonte encontrada. Agora veja o que ela sustenta.”
- **Marca:** símbolo `M/` modular formado por duas barras inclinadas e um ponto de cursor.
- **Cor proprietária:** laranja coral `#F2643D`, usado como ação e sinal de avanço.

## Decisões técnicas

- Manter React + Vite + Express + tRPC + Drizzle do starter para reduzir risco e preservar autenticação real.
- Usar Manus OAuth como autenticação padrão do ambiente, conforme o contrato do WebDev.
- Usar o LLM gerenciado pela Manus via `invokeLLM` no backend; respostas no cliente nunca recebem credenciais.
- Não executar código enviado pelo usuário no backend principal; o terminal é explicitamente simulado no MVP.
- Não inventar fontes: referências demonstrativas são marcadas como exemplos e o modo de pesquisa informa a limitação.
- Usar `localStorage` somente para preferências e rascunhos do protótipo; qualquer dado sensível continua fora dos logs.
