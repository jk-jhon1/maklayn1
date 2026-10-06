# Entregas Maklayn

- [ ] Dashboard responsivo da Maklayn com nova conversa, pesquisa, programação, ENEM, projetos recentes e referências salvas.
- [ ] Chat inteligente com histórico local, título, Markdown, ações de explicar melhor, resumir, mostrar etapas, verificar fontes, transformar em plano de estudo e salvar como projeto.
- [ ] Arena de modelos com comparação lado a lado entre Modelo A e Modelo B, critérios de precisão, clareza, completude, segurança, fontes e adequação, além de avaliação humana com nota e comentário.
- [x] Estação de programação com editor visual, abas, árvore de arquivos, terminal simulado, suporte a TypeScript, JavaScript, Python, SQL, Go, Rust, Java e C++, além do copiloto backend para gerar, revisar, explicar, criar testes e auditar segurança sem executar código arbitrário.
- [ ] Modo Pesquisa com referências rastreáveis, links clicáveis, instituição/autor, data de acesso e aviso quando a fonte não foi acessada ou verificada.
- [ ] Centro ENEM com trilhas de Linguagens, Ciências Humanas, Ciências da Natureza, Matemática e Redação; questões de treino; gabarito comentado; feedback pedagógico; análise por competências; plano de estudos; nenhuma promessa de nota oficial.
- [ ] Projetos e referências com salvar, favoritar, marcar, copiar e excluir no protótipo, com confirmação para ações destrutivas.
- [ ] Login real via Manus OAuth, estado deslogado claro, logout e sessão preservada no starter; nenhum usuário fake.
- [ ] Integração de chat no backend usando o LLM gerenciado sem expor segredos; fallback de demonstração claramente indicado em caso de indisponibilidade.
- [ ] Interface com modo claro/escuro, navegação por teclado, estados de carregamento/erro/vazio/sucesso e meta WCAG 2.2 AA.
- [ ] Manifesto `manus-routes.json`, endpoint `/api/health`, `.env.example` e README com execução, configuração, segurança, limitações e próximos passos.
- [ ] Testes de tipos e build passando antes do checkpoint; nenhum código arbitrário executado no servidor principal.

- [x] Análise incremental de textos e código grandes, com resumo acumulado por parte e revisão simultânea por dois agentes.
- [x] Importação de ZIP no CodeLab, expansão por entrada e identificação explícita de binários sem tentar interpretá-los como texto.
- [x] Operação “Montar projeto” para gerar arquitetura, árvore de arquivos, implementação inicial, testes, configuração e instruções reproduzíveis a partir de um prompt.
- [ ] Adicionar parsers dedicados para PDF, DOCX, XLSX, imagens, áudio e formatos binários específicos.
- [ ] Conectar executor sandbox isolado para compilar e executar testes reais com limites de CPU, memória, tempo e rede.

- [x] Permitir escrever Markdown no editor, anexar documentos e ZIPs na sessão e exportar PDF ou `maklayn-project.zip` com código, README, análise e anexos.
- [ ] Persistir anexos em storage privado para reabrir o projeto em outro dispositivo.
