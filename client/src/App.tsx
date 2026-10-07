import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { CodeLab } from "@/components/CodeLab";
import { Streamdown } from "streamdown";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bookmark,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  Code2,
  Command,
  Copy,
  FileCode2,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  LogIn,
  Menu,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TerminalSquare,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Upload,
  UserRound,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast, Toaster } from "sonner";

 type ModuleId = "home" | "chat" | "pesquisa" | "arena" | "codigo" | "enem" | "projetos";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

type NavItem = {
  id: ModuleId;
  label: string;
  hint: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { id: "home", label: "Visão geral", hint: "Seu espaço de trabalho", icon: LayoutDashboard },
  { id: "chat", label: "Chat inteligente", hint: "Converse e construa", icon: Sparkles },
  { id: "pesquisa", label: "Pesquisa", hint: "Fontes e contexto", icon: Search },
  { id: "arena", label: "Arena", hint: "Compare respostas", icon: BarChart3 },
  { id: "codigo", label: "Código", hint: "Crie com segurança", icon: Code2 },
  { id: "enem", label: "ENEM", hint: "Estude com método", icon: GraduationCap },
  { id: "projetos", label: "Projetos", hint: "Organize seu progresso", icon: FolderKanban },
];

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Olá, eu sou a **Maklayn**. Posso explicar um conceito, revisar uma redação, transformar uma ideia em código ou organizar uma pesquisa.\n\nPara começar bem, me dê o contexto e o resultado que você quer alcançar.",
  },
];

const sourceCards = [
  {
    eyebrow: "DOCUMENTAÇÃO OFICIAL",
    title: "Diretrizes Curriculares Nacionais",
    institution: "Ministério da Educação",
    date: "Acesso em 05 out. 2026",
    url: "gov.br/mec",
    tag: "Educação",
    excerpt: "Referência institucional para políticas e práticas de educação básica no Brasil.",
  },
  {
    eyebrow: "FONTE PRIMÁRIA",
    title: "OpenAI — Model Spec",
    institution: "OpenAI",
    date: "Acesso em 05 out. 2026",
    url: "model-spec.openai.com",
    tag: "IA responsável",
    excerpt: "Princípios públicos para comportamento de modelos e interação segura com pessoas.",
  },
  {
    eyebrow: "ARTIGO ACADÊMICO",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    institution: "Lewis et al. · NeurIPS",
    date: "2020 · referência histórica",
    url: "arxiv.org/abs/2005.11401",
    tag: "Pesquisa",
    excerpt: "Trabalho seminal sobre geração aumentada por recuperação de documentos.",
  },
];

const studyTracks = [
  { name: "Redação", meta: "4 de 12 práticas", progress: 34, tone: "coral" },
  { name: "Matemática", meta: "8 de 20 práticas", progress: 40, tone: "cyan" },
  { name: "Ciências humanas", meta: "6 de 16 práticas", progress: 38, tone: "yellow" },
  { name: "Linguagens", meta: "3 de 14 práticas", progress: 22, tone: "purple" },
];

function moduleFromPath(pathname: string): ModuleId {
  const path = pathname.replace(/^\//, "") as ModuleId;
  return navItems.some(item => item.id === path) ? path : "home";
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup-compact" : ""}`}>
      <div className="brand-mark"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663931230187/GcAIvexVyCBicyuH.jpeg" alt="" /></div>
      {!compact && <div><div className="brand-name">maklayn</div><div className="brand-caption">think · build · verify</div></div>}
    </div>
  );
}

function App() {
  const auth = useAuth();
  const [active, setActive] = useState<ModuleId>(() => moduleFromPath(window.location.pathname));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("maklayn-theme") === "dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [projects, setProjects] = useState([
    { id: 1, title: "Pesquisa sobre IA na educação", meta: "Pesquisa · atualizado há 2h", color: "coral", starred: true },
    { id: 2, title: "Redação ENEM — repertório", meta: "ENEM · atualizado ontem", color: "cyan", starred: false },
    { id: 3, title: "Landing page Maklayn", meta: "Código · atualizado em 02 out.", color: "yellow", starred: false },
  ]);
  const [savedSources, setSavedSources] = useState(sourceCards.slice(0, 2));
  const chatMutation = trpc.ai.chat.useMutation();
  const codeMutation = trpc.ai.codeAssist.useMutation();
  const fileChunkMutation = trpc.ai.analyzeFileChunk.useMutation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("maklayn-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const onPopState = () => setActive(moduleFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const currentItem = navItems.find(item => item.id === active) ?? navItems[0];
  const firstName = auth.user?.name?.split(" ")[0] ?? "visitante";

  const openModule = (id: ModuleId) => {
    setActive(id);
    const path = id === "home" ? "/" : `/${id}`;
    window.history.pushState({}, "", path);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sendMessage = async (value: string) => {
    const content = value.trim();
    if (!content || chatMutation.isPending) return;
    const userMessage: ChatMessage = { id: Date.now(), role: "user", content };
    setMessages(prev => [...prev, userMessage]);
    openModule("chat");
    try {
      const response = await chatMutation.mutateAsync({
        messages: [...messages, userMessage].map(message => ({ role: message.role, content: message.content })),
      });
      const answer = response.content || "Não consegui gerar uma resposta agora. Tente novamente em alguns instantes.";
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: answer }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: `**Modo demonstração**\n\nRecebi seu pedido: “${content}”. O serviço de IA ainda não respondeu nesta sessão, então não vou inventar uma resposta ou fonte. A Maklayn está pronta para conectar o provedor gerenciado quando ele estiver disponível.\n\nEnquanto isso, posso ajudar você a organizar o problema em etapas, criar um plano de estudo ou revisar o contexto que enviar.`,
        },
      ]);
      toast("Resposta demonstrativa criada", { description: "Nenhuma fonte foi inventada; a integração real continua preservada." });
    }
  };

  const createProject = () => {
    const next = { id: Date.now(), title: "Novo espaço de trabalho", meta: "Projeto · criado agora", color: "coral", starred: false };
    setProjects(prev => [next, ...prev]);
    toast.success("Projeto criado", { description: "Seu novo espaço está pronto para receber conversas e referências." });
    openModule("projetos");
  };

  return (
    <div className="maklayn-app">
      <Toaster position="bottom-right" richColors />
      <aside className={`app-sidebar ${sidebarOpen ? "is-open" : "is-collapsed"}`}>
        <div className="sidebar-topline">
          <Logo compact={!sidebarOpen} />
          <button className="icon-button sidebar-toggle" onClick={() => setSidebarOpen(prev => !prev)} aria-label={sidebarOpen ? "Recolher menu" : "Expandir menu"}>
            {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">M</div>
          {sidebarOpen && <><div className="workspace-copy"><strong>Meu espaço</strong><span>Plano explorador</span></div><ChevronDown size={14} className="muted-icon" /></>}
        </div>
        <nav className="main-nav" aria-label="Navegação principal">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.id === active;
            return <button key={item.id} className={`nav-item ${isActive ? "active" : ""}`} onClick={() => openModule(item.id)} aria-current={isActive ? "page" : undefined} title={!sidebarOpen ? item.label : undefined}>
              <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && item.id === "chat" && <span className="nav-dot" />}
            </button>;
          })}
        </nav>
        {sidebarOpen && <div className="sidebar-note"><div className="note-icon"><Zap size={14} /></div><div><strong>Modo laboratório</strong><p>Teste ideias sem perder o fio.</p></div></div>}
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => toast("Configurações em construção", { description: "As preferências de memória, idioma e privacidade entram no próximo incremento." })}><Settings2 size={18} /><span>{sidebarOpen && "Configurações"}</span></button>
          <div className={`profile-row ${!sidebarOpen ? "profile-row-collapsed" : ""}`}>
            <div className="profile-avatar">{auth.user?.name?.slice(0, 1).toUpperCase() ?? "V"}</div>
            {sidebarOpen && <div className="profile-copy"><strong>{auth.user?.name ?? "Visitante"}</strong><span>{auth.user?.email ?? "Explore sem cadastro"}</span></div>}
            {sidebarOpen && <MoreHorizontal size={17} className="muted-icon" />}
          </div>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <div className="mobile-brand"><button className="icon-button" onClick={() => setSidebarOpen(prev => !prev)} aria-label="Abrir menu"><Menu size={19} /></button><Logo compact /></div>
          <div className="breadcrumb"><span>Meu espaço</span><span className="breadcrumb-slash">/</span><strong>{currentItem.label}</strong></div>
          <div className="header-actions">
            <div className="status-pill"><span className="status-pulse" /> IA pronta</div>
            <button className="icon-button" aria-label="Alternar tema" onClick={() => setDarkMode(prev => !prev)}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button>
            {!auth.user ? <button className="login-button" onClick={() => startLogin()}><LogIn size={15} /> Entrar</button> : <div className="header-user">{auth.user.name?.slice(0, 1).toUpperCase()}</div>}
          </div>
        </header>
        <div className="app-content">
          {active === "home" && <HomeView firstName={firstName} onOpen={openModule} projects={projects} sources={savedSources} onCreateProject={createProject} />}
          {active === "chat" && <ChatView messages={messages} onSend={sendMessage} isLoading={chatMutation.isPending} onAction={sendMessage} />}
          {active === "pesquisa" && <ResearchView savedSources={savedSources} onSave={source => { setSavedSources(prev => prev.some(item => item.title === source.title) ? prev : [...prev, source]); toast.success("Fonte salva", { description: source.title }); }} />}
          {active === "arena" && <ArenaView />}
          {active === "codigo" && <CodeLab onAssist={input => codeMutation.mutateAsync(input).then(response => response.content)} onAnalyzeChunk={input => fileChunkMutation.mutateAsync(input).then(response => response.summary)} isLoading={codeMutation.isPending || fileChunkMutation.isPending} />}
          {active === "enem" && <EnemView onOpenChat={() => openModule("chat")} />}
          {active === "projetos" && <ProjectsView projects={projects} onCreate={createProject} onDelete={id => { setProjects(prev => prev.filter(project => project.id !== id)); toast.success("Projeto removido"); }} />}
        </div>
      </main>
    </div>
  );
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-intro"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function HomeView({ firstName, onOpen, projects, sources, onCreateProject }: { firstName: string; onOpen: (id: ModuleId) => void; projects: typeof App extends never ? never : { id: number; title: string; meta: string; color: string; starred: boolean }[]; sources: typeof sourceCards; onCreateProject: () => void }) {
  return <div className="home-view">
    <div className="home-hero"><div><div className="eyebrow">SEGUNDA-FEIRA · 05 OUT 2026</div><h1>Bom te ver, <em>{firstName}</em>.</h1><p>Qual é o próximo passo que merece sua atenção?</p></div><div className="hero-mark"><span>03</span><small>fios ativos</small></div></div>
    <div className="quick-actions">
      <button className="primary-action" onClick={() => onOpen("chat")}><span className="action-icon"><Plus size={19} /></span><span><strong>Nova conversa</strong><small>Comece do zero ou use um contexto</small></span><ArrowUpRight size={18} /></button>
      <button className="secondary-action" onClick={() => onOpen("pesquisa")}><Search size={18} /><span><strong>Pesquisar fontes</strong><small>Busque com rastreabilidade</small></span></button>
      <button className="secondary-action" onClick={() => onOpen("enem")}><Target size={18} /><span><strong>Continuar estudos</strong><small>12 min para sua próxima revisão</small></span></button>
    </div>
    <div className="section-heading"><div><span className="section-kicker">SEU PAINEL</span><h2>O que está em movimento</h2></div><button className="text-button" onClick={() => onOpen("projetos")}>Ver todos <ArrowUpRight size={14} /></button></div>
    <div className="dashboard-grid">
      <div className="focus-card"><div className="card-top"><div><span className="small-label">FOCO RECOMENDADO</span><h3>Retome sua redação</h3></div><div className="round-icon coral"><PenLine size={18} /></div></div><p>Você parou na proposta de intervenção. Feche o argumento em três movimentos e revise a coesão.</p><div className="focus-bottom"><div className="progress-track"><span style={{ width: "68%" }} /></div><span>68%</span><button onClick={() => onOpen("enem")} aria-label="Retomar redação"><ArrowUpRight size={17} /></button></div></div>
      <div className="metric-card"><div className="card-top"><span className="small-label">MINUTOS DE FOCO</span><div className="round-icon cyan"><BrainCircuit size={18} /></div></div><div className="metric-value">142<span>min</span></div><p><span className="positive">+24%</span> contra a semana passada</p><div className="mini-bars"><i style={{ height: "35%" }} /><i style={{ height: "57%" }} /><i style={{ height: "43%" }} /><i style={{ height: "76%" }} /><i style={{ height: "52%" }} /><i className="today" style={{ height: "92%" }} /><i style={{ height: "68%" }} /></div></div>
      <div className="recent-card"><div className="card-top"><span className="small-label">ATIVIDADE RECENTE</span><MoreHorizontal size={18} className="muted-icon" /></div><div className="activity-row"><div className="activity-icon coral"><Sparkles size={16} /></div><div><strong>Hipótese para pesquisa</strong><span>Chat inteligente · há 2h</span></div><ArrowUpRight size={16} className="muted-icon" /></div><div className="activity-row"><div className="activity-icon yellow"><BookOpen size={16} /></div><div><strong>Repertório sociocultural</strong><span>ENEM · ontem</span></div><ArrowUpRight size={16} className="muted-icon" /></div><div className="activity-row"><div className="activity-icon cyan"><Code2 size={16} /></div><div><strong>Componente de busca</strong><span>Código · 02 out.</span></div><ArrowUpRight size={16} className="muted-icon" /></div></div>
    </div>
    <div className="lower-grid"><div><div className="section-heading compact"><div><span className="section-kicker">PROJETOS</span><h2>Seus espaços recentes</h2></div><button className="square-button" onClick={onCreateProject} aria-label="Criar projeto"><Plus size={16} /></button></div><div className="project-list">{projects.slice(0, 3).map(project => <ProjectRow key={project.id} project={project} />)}</div></div><div><div className="section-heading compact"><div><span className="section-kicker">REFERÊNCIAS SALVAS</span><h2>Para voltar depois</h2></div><button className="text-button" onClick={() => onOpen("pesquisa")}>Abrir <ArrowUpRight size={14} /></button></div><div className="saved-list">{sources.map(source => <div className="saved-row" key={source.title}><div className="source-favicon">{source.institution.slice(0, 1)}</div><div><strong>{source.title}</strong><span>{source.institution}</span></div><Bookmark size={15} className="saved-icon" fill="currentColor" /></div>)}</div></div></div>
  </div>;
}

function ProjectRow({ project }: { project: { title: string; meta: string; color: string; starred: boolean } }) {
  return <div className="project-row"><div className={`project-color ${project.color}`} /><div className="project-row-copy"><strong>{project.title}</strong><span>{project.meta}</span></div>{project.starred && <Bookmark size={15} className="saved-icon" fill="currentColor" />}<MoreHorizontal size={17} className="muted-icon" /></div>;
}

function ChatView({ messages, onSend, isLoading, onAction }: { messages: ChatMessage[]; onSend: (value: string) => void; isLoading: boolean; onAction: (value: string) => void }) {
  const [input, setInput] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); if (input.trim()) { onSend(input); setInput(""); } };
  return <div className="chat-view"><PageIntro eyebrow="CHAT INTELIGENTE" title="Pense em voz alta." description="A Maklayn organiza o raciocínio, deixa as incertezas visíveis e ajuda você a chegar ao próximo passo." action={<div className="mode-selector"><Bot size={15} /> Modo equilibrado <ChevronDown size={14} /></div>} />
    <div className="chat-layout"><section className="chat-panel"><div className="chat-topbar"><div><span className="small-label">CONVERSA ATUAL</span><strong>Comece pelo contexto</strong></div><div className="chat-tools"><button className="icon-button" aria-label="Salvar conversa"><Bookmark size={16} /></button><button className="icon-button" aria-label="Mais opções"><MoreHorizontal size={17} /></button></div></div><div className="chat-messages">{messages.map(message => <div className={`chat-message ${message.role}`} key={message.id}>{message.role === "assistant" ? <div className="message-avatar"><span>M</span></div> : <div className="message-avatar user"><UserRound size={15} /></div>}<div className="message-body"><div className="message-meta"><strong>{message.role === "assistant" ? "Maklayn" : "Você"}</strong><span>{message.role === "assistant" ? "agora" : "enviado"}</span></div><div className="message-content">{message.role === "assistant" ? <Streamdown>{message.content}</Streamdown> : <p>{message.content}</p>}</div>{message.sources && <div className="source-chips">{message.sources.map(source => <span key={source}><ShieldCheck size={12} /> {source}</span>)}</div>}{message.role === "assistant" && <div className="message-actions"><button onClick={() => onAction("Explique a resposta anterior em mais detalhes.")}><Lightbulb size={13} /> Explicar melhor</button><button onClick={() => onAction("Resuma a resposta anterior em cinco linhas.")}><FileText size={13} /> Resumir</button><button onClick={() => toast.success("Resposta marcada para revisão")}><Bookmark size={13} /> Salvar</button></div>}</div></div>)}{isLoading && <div className="chat-message assistant"><div className="message-avatar"><span>M</span></div><div className="message-body"><div className="message-meta"><strong>Maklayn</strong><span>pensando</span></div><div className="thinking"><i /><i /><i /></div></div></div>}</div><div className="chat-suggestions"><span>Experimente</span><button onClick={() => onSend("Explique este tema usando uma analogia e depois mostre as etapas.")}>Explicar com analogia</button><button onClick={() => onSend("Monte um plano de estudo de 7 dias para o ENEM.")}>Plano de estudo</button><button onClick={() => onSend("Revise esta ideia e a transforme em um projeto executável.")}>Transformar em plano</button></div><form className="chat-composer" onSubmit={submit}><textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(event); } }} placeholder="Escreva uma pergunta, ideia ou trecho para analisar..." rows={2} aria-label="Mensagem para a Maklayn"/><div className="composer-footer"><div className="composer-hints"><span><Command size={12} /> Enter para enviar</span><span>Shift + Enter para nova linha</span></div><button className="send-button" type="submit" disabled={!input.trim() || isLoading}>{isLoading ? <span className="spinner" /> : <Send size={17} />} Enviar</button></div></form></section><aside className="chat-aside"><div className="aside-card accent-card"><div className="aside-card-heading"><span className="round-icon coral"><WandSparkles size={16} /></span><span>Como a Maklayn trabalha</span></div><p>Ela separa <strong>fato</strong>, <strong>inferência</strong> e <strong>incerteza</strong> para você saber o que merece confiança.</p><div className="legend-list"><span><i className="legend-dot fact" /> Fato verificável</span><span><i className="legend-dot inference" /> Inferência contextual</span><span><i className="legend-dot uncertainty" /> Algo a confirmar</span></div></div><div className="aside-card"><div className="aside-card-heading"><span className="round-icon cyan"><FolderKanban size={16} /></span><span>Contexto do espaço</span></div><div className="context-row"><span>Projeto</span><strong>Pesquisa em andamento</strong></div><div className="context-row"><span>Idioma</span><strong>Português (Brasil)</strong></div><div className="context-row"><span>Memória</span><strong className="green-text">Controlável</strong></div><button className="outline-button" onClick={() => toast("Memória controlável", { description: "Em breve você poderá ver, editar e apagar itens diretamente por aqui." })}>Gerenciar contexto <ArrowUpRight size={14} /></button></div></aside></div></div>;
}

function ResearchView({ savedSources, onSave }: { savedSources: typeof sourceCards; onSave: (source: typeof sourceCards[number]) => void }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const results = useMemo(() => query ? sourceCards.filter(source => `${source.title} ${source.institution} ${source.tag}`.toLowerCase().includes(query.toLowerCase())) : sourceCards, [query]);
  return <div className="research-view"><PageIntro eyebrow="PESQUISA COM REFERÊNCIAS" title="Encontre o que sustenta a ideia." description="Pesquise por fontes autorizadas, guarde o contexto e veja claramente o que foi — ou não foi — verificado." action={<div className="verified-badge"><ShieldCheck size={15} /> Sem fontes inventadas</div>} /><div className="research-search"><Search size={20} /><input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter") setSearched(true); }} placeholder="O que você quer investigar?" aria-label="Pesquisar fontes"/><button onClick={() => setSearched(true)}>Pesquisar <ArrowUpRight size={15} /></button></div><div className="research-note"><CircleHelp size={15} /><span>{searched ? `Resultados demonstrativos para “${query || "sua pesquisa"}”.` : "Modo demonstração: conecte uma API autorizada para consultar fontes atuais."}</span><span className="note-date">Última atualização: 05 out. 2026</span></div><div className="research-layout"><section><div className="section-heading compact"><div><span className="section-kicker">RESULTADOS</span><h2>{results.length} referências para começar</h2></div><button className="filter-button"><Settings2 size={14} /> Filtros <ChevronDown size={14} /></button></div><div className="source-list">{results.map(source => <article className="source-card" key={source.title}><div className="source-card-top"><div className="source-kind">{source.eyebrow}</div><button className="bookmark-button" onClick={() => onSave(source)} aria-label={`Salvar ${source.title}`}><Bookmark size={17} fill={savedSources.some(item => item.title === source.title) ? "currentColor" : "none"} /></button></div><h3>{source.title}</h3><p>{source.excerpt}</p><div className="source-footer"><span className="source-institution"><span className="source-favicon">{source.institution.slice(0, 1)}</span>{source.institution}</span><span>{source.date}</span><a href={`https://${source.url}`} target="_blank" rel="noreferrer">Abrir fonte <ArrowUpRight size={13} /></a></div></article>)}</div></section><aside className="research-aside"><div className="aside-card"><span className="small-label">SEU MÉTODO</span><h3>Uma boa pesquisa deixa rastros.</h3><p>Para cada afirmação importante, registre o título, autor ou instituição, data, URL e data de acesso.</p><div className="method-step done"><span><Check size={13} /></span><div><strong>Fonte identificada</strong><small>Quem publicou?</small></div></div><div className="method-step active"><span>2</span><div><strong>Contexto lido</strong><small>O que ela realmente sustenta?</small></div></div><div className="method-step"><span>3</span><div><strong>Limite registrado</strong><small>O que ainda falta verificar?</small></div></div></div><div className="aside-card upload-card"><Upload size={19} /><strong>Traga seu próprio contexto</strong><p>Cole um link ou adicione um PDF, TXT, DOCX ou Markdown para analisar.</p><button className="outline-button" onClick={() => toast("Importação preparada", { description: "O upload privado entra no próximo incremento com storage e indexação." })}>Adicionar documento</button></div></aside></div></div>;
}

function ArenaView() {
  const [scores, setScores] = useState({ precision: 4, clarity: 5, completeness: 4, safety: 5 });
  const [comment, setComment] = useState("");
  const [voted, setVoted] = useState(false);
  const scoreLabels = [{ key: "precision", label: "Precisão" }, { key: "clarity", label: "Clareza" }, { key: "completeness", label: "Completude" }, { key: "safety", label: "Segurança" }] as const;
  return <div className="arena-view"><PageIntro eyebrow="ARENA DE MODELOS" title="Compare antes de escolher." description="Veja duas abordagens para o mesmo pedido. Avalie o que importa e forme seu próprio critério." action={<div className="blind-badge"><span /> Comparação cega ativa</div>} /><div className="arena-prompt"><div className="prompt-label"><Command size={15} /> PEDIDO AVALIADO</div><p>“Explique por que a recuperação de informação ajuda uma IA a responder com mais contexto, usando uma analogia simples.”</p><button className="icon-button" aria-label="Editar pedido"><PenLine size={15} /></button></div><div className="model-grid"><ModelCard label="MODELO A" tone="coral" text="Imagine uma pessoa estudando para uma prova. Em vez de responder apenas com o que lembra, ela abre seus cadernos e confere as páginas relevantes.\n\nA recuperação de informação faz algo parecido: encontra trechos úteis em uma base de conhecimento e entrega esse contexto ao modelo antes da resposta. Assim, a resposta pode ficar mais específica, atualizada e verificável — sem eliminar a necessidade de revisar a fonte." /><ModelCard label="MODELO B" tone="cyan" text="RAG é como dar uma biblioteca para uma calculadora. O sistema busca documentos e injeta os resultados no prompt, então o modelo tem mais dados para gerar texto.\n\nEle serve para aumentar a precisão e diminuir alucinações, mas só funciona bem se os documentos forem bons. Uma busca ruim ainda pode levar a uma conclusão ruim." /></div><div className="arena-evaluation"><div><div className="section-heading compact"><div><span className="section-kicker">SUA AVALIAÇÃO</span><h2>O que você prioriza?</h2></div>{voted && <span className="success-label"><Check size={14} /> Avaliação salva</span>}</div><div className="criteria-grid">{scoreLabels.map(item => <div className="criterion" key={item.key}><div><span>{item.label}</span><strong>{scores[item.key]}/5</strong></div><div className="score-buttons">{[1, 2, 3, 4, 5].map(score => <button key={score} className={scores[item.key] >= score ? "selected" : ""} onClick={() => setScores(prev => ({ ...prev, [item.key]: score }))} aria-label={`${item.label}: ${score}`}>{score}</button>)}</div></div>)}</div></div><div className="evaluation-comment"><label htmlFor="arena-comment">Comentário opcional</label><textarea id="arena-comment" value={comment} onChange={event => setComment(event.target.value)} placeholder="O que fez uma resposta funcionar melhor?" rows={4} /><div className="evaluation-footer"><span>{comment.length}/500</span><button className="send-button" onClick={() => { setVoted(true); toast.success("Avaliação registrada"); }}>Enviar avaliação <ArrowUpRight size={15} /></button></div></div></div></div>;
}

function ModelCard({ label, tone, text }: { label: string; tone: string; text: string }) {
  return <article className={`model-card ${tone}`}><div className="model-card-head"><span className="model-label"><i /> {label}</span><button className="icon-button" aria-label="Mais opções"><MoreHorizontal size={17} /></button></div><div className="model-response"><p>{text}</p></div><div className="model-card-foot"><span><ShieldCheck size={13} /> Sem citações nesta resposta</span><button className="text-button">Copiar <Copy size={13} /></button></div></article>;
}

function EnemView({ onOpenChat }: { onOpenChat: () => void }) {
  const [essay, setEssay] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  return <div className="enem-view"><PageIntro eyebrow="CENTRO ENEM" title="Estude com direção, não no escuro." description="Pratique, receba feedback pedagógico e transforme cada revisão em uma próxima ação — sem prometer nota oficial." action={<div className="enem-streak"><span>07</span><small>dias de ritmo</small></div>} /><div className="enem-top-grid"><div className="enem-progress-card"><div className="card-top"><div><span className="small-label">SEU CICLO ATUAL</span><h3>Construção de repertório</h3></div><div className="round-icon yellow"><GraduationCap size={18} /></div></div><p>Você está no dia 7 de 14. Faltam duas revisões para fechar o ciclo.</p><div className="cycle-track"><span style={{ width: "50%" }} /></div><div className="cycle-meta"><span>7 concluídos</span><span>14 no plano</span></div><button className="primary-small" onClick={onOpenChat}>Continuar com a Maklayn <ArrowUpRight size={14} /></button></div><div className="enem-question-card"><span className="small-label">QUESTÃO RÁPIDA · LINGUAGENS</span><h3>Qual habilidade você quer praticar agora?</h3><div className="choice-grid"><button onClick={() => toast.success("Trilha selecionada", { description: "Interpretação de texto adicionada ao seu ciclo." })}><BookOpen size={17} /> Interpretação</button><button onClick={() => toast.success("Trilha selecionada", { description: "Coesão e coerência adicionadas ao seu ciclo." })}><PenLine size={17} /> Redação</button><button onClick={() => toast.success("Trilha selecionada", { description: "Leitura de gráfico adicionada ao seu ciclo." })}><BarChart3 size={17} /> Gráficos</button><button onClick={() => toast.success("Trilha selecionada", { description: "Argumentação adicionada ao seu ciclo." })}><MessageSquareIcon /> Argumentação</button></div></div></div><div className="section-heading compact"><div><span className="section-kicker">SUAS TRILHAS</span><h2>Progresso que dá para enxergar</h2></div><button className="text-button">Editar plano <Settings2 size={14} /></button></div><div className="track-grid">{studyTracks.map(track => <div className="track-card" key={track.name}><div className="track-card-head"><div className={`round-icon ${track.tone}`}><BookOpen size={16} /></div><MoreHorizontal size={16} className="muted-icon" /></div><strong>{track.name}</strong><span>{track.meta}</span><div className="progress-track"><span className={track.tone} style={{ width: `${track.progress}%` }} /></div></div>)}</div><div className="essay-panel"><div className="essay-heading"><div><span className="section-kicker">LABORATÓRIO DE REDAÇÃO</span><h2>Treine uma competência por vez.</h2><p>Cole um parágrafo ou sua redação. A análise é uma faixa educacional, nunca uma nota oficial.</p></div><div className="essay-competencies"><span>C1</span><span>C2</span><span>C3</span><span>C4</span><span>C5</span></div></div><textarea value={essay} onChange={event => setEssay(event.target.value)} placeholder="Cole aqui seu texto para receber uma leitura pedagógica..." rows={5} /><div className="essay-footer"><span>{essay.length} caracteres · limite recomendado: 3.000</span><button className="send-button" disabled={!essay.trim()} onClick={() => { setAnalyzed(true); toast.success("Leitura pedagógica concluída"); }}>Analisar redação <WandSparkles size={15} /></button></div>{analyzed && <div className="essay-result"><div className="result-score"><strong>Faixa indicativa</strong><span>760–840</span><small>estimativa educacional</small></div><div><strong>Próxima melhoria</strong><p>Fortaleça a relação entre a causa apresentada e a proposta de intervenção. O repertório aparece, mas ainda pode ser conectado à tese com uma frase de transição.</p></div><div className="result-check"><Check size={16} /><span>Critérios analisados: tese, coesão e intervenção.</span></div></div>}</div></div>;
}

function MessageSquareIcon() { return <span className="custom-message-icon">Aa</span>; }

function ProjectsView({ projects, onCreate, onDelete }: { projects: { id: number; title: string; meta: string; color: string; starred: boolean }[]; onCreate: () => void; onDelete: (id: number) => void }) {
  const [filter, setFilter] = useState("Todos");
  const filtered = filter === "Todos" ? projects : projects.filter(project => project.meta.toLowerCase().includes(filter.toLowerCase()));
  return <div className="projects-view"><PageIntro eyebrow="SEUS PROJETOS" title="Tudo que merece continuidade." description="Converse, pesquise, escreva e codifique sem espalhar seu contexto por lugares diferentes." action={<button className="primary-small" onClick={onCreate}><Plus size={15} /> Novo projeto</button>} /><div className="project-toolbar"><div className="segmented-control">{["Todos", "Pesquisa", "ENEM", "Código"].map(item => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><button className="filter-button"><Search size={15} /> Buscar projetos</button></div><div className="project-cards">{filtered.map(project => <article className="project-card" key={project.id}><div className={`project-card-accent ${project.color}`} /><div className="project-card-head"><div className={`project-symbol ${project.color}`}><FolderKanban size={20} /></div><div className="project-card-actions"><button className="icon-button" aria-label="Favoritar projeto" onClick={() => toast.success("Projeto marcado como favorito")}><Bookmark size={16} fill={project.starred ? "currentColor" : "none"} /></button><button className="icon-button" aria-label="Excluir projeto" onClick={() => onDelete(project.id)}><Trash2 size={16} /></button></div></div><h3>{project.title}</h3><p>{project.meta}</p><div className="project-card-footer"><span><FileText size={13} /> 4 itens</span><button className="text-button">Abrir <ArrowUpRight size={13} /></button></div></article>)}<button className="new-project-card" onClick={onCreate}><span><Plus size={20} /></span><strong>Começar novo projeto</strong><small>Um espaço para uma ideia ganhar forma.</small></button></div><div className="privacy-banner"><ShieldCheck size={18} /><div><strong>Seu contexto é seu.</strong><p>A Maklayn não usa suas conversas privadas para treinamento sem um consentimento explícito e revogável.</p></div><button className="text-button" onClick={() => toast("Privacidade", { description: "As opções de consentimento detalhadas entram no painel de configurações." })}>Entender <ArrowUpRight size={13} /></button></div></div>;
}

export default App;
