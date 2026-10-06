import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileCode2,
  FileText,
  Lightbulb,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  TerminalSquare,
  X,
} from "lucide-react";
import { unzipSync } from "fflate";
import { useState } from "react";
import { toast } from "sonner";

type CodeOperation = "generate" | "review" | "tests" | "explain" | "security" | "project";

type CodeLabProps = {
  onAssist: (input: {
    operation: CodeOperation;
    language: string;
    task: string;
    code: string;
    fileName: string;
  }) => Promise<string>;
  onAnalyzeChunk: (input: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    chunkIndex: number;
    totalChunks: number;
    content: string;
    previousSummary: string;
    instruction: string;
  }) => Promise<string>;
  isLoading: boolean;
};

const defaultCode = `type Source = {
  title: string;
  url: string;
  trust: number;
};

export function rankSources(sources: Source[]) {
  return sources
    .filter(source => source.url.startsWith("https://"))
    .sort((a, b) => b.trust - a.trust);
}`;

const operations: { value: CodeOperation; label: string; helper: string }[] = [
  { value: "generate", label: "Gerar código", helper: "Cria uma implementação a partir do pedido." },
  { value: "review", label: "Revisar código", helper: "Encontra bugs, legibilidade e melhorias." },
  { value: "tests", label: "Criar testes", helper: "Propõe testes unitários e casos de borda." },
  { value: "explain", label: "Explicar código", helper: "Explica o trecho passo a passo." },
  { value: "security", label: "Auditar segurança", helper: "Procura segredos, XSS, injection e comandos perigosos." },
  { value: "project", label: "Montar projeto", helper: "Cria arquitetura, arquivos, testes e instruções reproduzíveis." },
];

function extractCode(content: string) {
  const fenced = content.match(/```(?:[a-zA-Z0-9_+#.-]+)?\n([\s\S]*?)```/);
  return fenced?.[1]?.trim() ?? content.trim();
}

export function CodeLab({ onAssist, onAnalyzeChunk, isLoading }: CodeLabProps) {
  const [code, setCode] = useState(defaultCode);
  const [activeTab, setActiveTab] = useState("rankSources.ts");
  const [language, setLanguage] = useState("TypeScript");
  const [operation, setOperation] = useState<CodeOperation>("review");
  const [task, setTask] = useState("Revise este código para produção e priorize clareza, desempenho e casos de borda.");
  const [result, setResult] = useState("");
  const [analysis, setAnalysis] = useState(false);
  const [fileStatus, setFileStatus] = useState("");
  const [fileProgress, setFileProgress] = useState(0);
  const [fileBusy, setFileBusy] = useState(false);
  const tabs = ["rankSources.ts", "sources.test.ts", "README.md"];
  const selectedOperation = operations.find(item => item.value === operation) ?? operations[0];

  const runAssist = async () => {
    if (!task.trim() || isLoading) return;
    try {
      const content = await onAssist({ operation, language, task, code, fileName: activeTab });
      setResult(content);
      if (operation === "generate" || operation === "tests") {
        const generated = extractCode(content);
        if (generated) setCode(generated);
      }
      if (operation === "security") setAnalysis(true);
      toast.success(`${selectedOperation.label} concluído`, { description: "A resposta foi gerada sem executar o código." });
    } catch {
      toast.error("Não foi possível concluir a assistência", { description: "Revise o pedido e tente novamente." });
    }
  };

  const analyzeFile = async (file: File) => {
    if (fileBusy) return;
    setFileBusy(true);
    setFileProgress(0);
    setFileStatus(`Preparando ${file.name}...`);
    try {
      const CHUNK_SIZE = 12000;
      const chunks: { name: string; content: string }[] = [];
      const decoder = new TextDecoder();
      const isZip = file.name.toLowerCase().endsWith(".zip") || file.type === "application/zip";
      if (isZip) {
        const entries = unzipSync(new Uint8Array(await file.arrayBuffer()));
        for (const [name, bytes] of Object.entries(entries)) {
          if (name.endsWith("/") || bytes.length === 0) continue;
          const lower = name.toLowerCase();
          const binary = /\.(png|jpe?g|gif|webp|ico|pdf|exe|dll|so|dylib|woff2?|ttf|mp3|mp4|mov|sqlite|db)$/i.test(lower);
          if (binary) {
            chunks.push({ name, content: `[entrada binária ignorada pelo parser de texto: ${bytes.length} bytes]` });
            continue;
          }
          const text = decoder.decode(bytes);
          for (let offset = 0; offset < text.length; offset += CHUNK_SIZE) chunks.push({ name, content: text.slice(offset, offset + CHUNK_SIZE) });
        }
      } else {
        for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) chunks.push({ name: file.name, content: await file.slice(offset, offset + CHUNK_SIZE).text() });
      }
      if (!chunks.length) throw new Error("Arquivo sem conteúdo analisável");
      let rollingSummary = "";
      for (let index = 0; index < chunks.length; index += 1) {
        const part = chunks[index];
        setFileStatus(`Dois agentes analisando ${part.name} · parte ${index + 1}/${chunks.length}`);
        rollingSummary = await onAnalyzeChunk({ fileName: part.name, mimeType: file.type, sizeBytes: file.size, chunkIndex: index, totalChunks: chunks.length, content: part.content, previousSummary: rollingSummary, instruction: task });
        setFileProgress(Math.round(((index + 1) / chunks.length) * 100));
      }
      setResult(`## Análise incremental: ${file.name}\n\n${rollingSummary}`);
      setFileStatus(`${chunks.length} partes analisadas com dois agentes.`);
      toast.success("Arquivo analisado", { description: "A análise foi feita por partes, sem colocar o arquivo inteiro em um único prompt." });
    } catch (error) {
      setFileStatus(error instanceof Error ? error.message : "Não foi possível analisar este arquivo.");
      toast.error("Falha na análise do arquivo");
    } finally {
      setFileBusy(false);
    }
  };

  return <div className="code-view">
    <div className="page-intro"><div><div className="eyebrow">ESTAÇÃO DE CÓDIGO</div><h1>Construa sem perder a segurança.</h1><p>Gere, revise, explique e teste código em várias linguagens. As respostas usam orçamento adaptativo e passam por uma segunda revisão antes da entrega.</p></div><div className="sandbox-badge"><TerminalSquare size={15} /> Sandbox isolado · fase 2</div></div>
    <div className="code-assist-bar"><div className="code-assist-title"><div className="round-icon coral"><Code2 size={17} /></div><div><strong>Copiloto da Maklayn <em className="dual-agent-badge">2 agentes ativos</em></strong><span>{selectedOperation.helper} · implementação + revisão independente</span></div></div><div className="code-controls"><label><span>Linguagem</span><select value={language} onChange={event => setLanguage(event.target.value)}><option>TypeScript</option><option>JavaScript</option><option>Python</option><option>SQL</option><option>Go</option><option>Rust</option><option>Java</option><option>C++</option></select></label><label><span>Ação</span><select value={operation} onChange={event => setOperation(event.target.value as CodeOperation)}>{operations.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><button className="primary-small" onClick={runAssist} disabled={isLoading || !task.trim()}>{isLoading ? <span className="spinner" /> : <Lightbulb size={15} />} {isLoading ? "Dois agentes trabalhando..." : "Pedir à Maklayn"}</button></div><textarea className="code-brief" value={task} onChange={event => setTask(event.target.value)} placeholder="Descreva o que você quer construir ou revisar..." rows={2} aria-label="Pedido para o copiloto de código" /><div className="file-ingest"><label className="file-picker"><span>Adicionar arquivo grande ou ZIP</span><input type="file" accept=".txt,.md,.json,.csv,.ts,.tsx,.js,.jsx,.py,.java,.go,.rs,.sql,.html,.css,.xml,.yaml,.yml,.zip,.pdf,.png,.jpg,.jpeg" onChange={event => { const file = event.target.files?.[0]; if (file) void analyzeFile(file); event.currentTarget.value = ""; }} /></label><span className="file-progress">{fileBusy ? `${fileProgress}% · ${fileStatus}` : fileStatus || "Textos e códigos são lidos em partes; ZIPs são expandidos por entrada."}</span></div></div>
    <div className="code-workspace"><aside className="file-tree"><div className="tree-heading"><span>ARQUIVOS</span><button className="icon-button" aria-label="Novo arquivo"><Plus size={15} /></button></div><div className="tree-project"><ChevronDown size={14} /> maklayn-lab</div><div className="tree-folder"><ChevronDown size={13} /> src</div>{tabs.map(tab => <button key={tab} className={`tree-file ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{tab.endsWith(".md") ? <FileText size={14} /> : <FileCode2 size={14} />} {tab}</button>)}<div className="tree-folder collapsed"><ChevronDown size={13} /> docs</div><div className="tree-status"><span className="status-pulse" /> Nenhum segredo detectado</div></aside><section className="editor-shell"><div className="editor-tabs">{tabs.map(tab => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}{tab === activeTab && <X size={12} />}</button>)}<button className="icon-button" aria-label="Nova aba"><Plus size={14} /></button></div><div className="editor-toolbar"><span>{language}</span><div><button className="tool-button" onClick={() => { navigator.clipboard?.writeText(code); toast.success("Código copiado"); }}><Copy size={14} /> Copiar</button><button className={`tool-button ${analysis ? "active" : ""}`} onClick={() => { setOperation("security"); setTask("Faça uma auditoria de segurança deste trecho, sem executar nada."); void runAssist(); }}><ShieldCheck size={14} /> Auditar</button><button className="tool-button" onClick={() => { setOperation("tests"); setTask("Crie testes unitários para este trecho, incluindo casos de borda."); void runAssist(); }}><Check size={14} /> Testar</button></div></div><div className="editor-area"><div className="line-numbers">{code.split("\n").map((_, index) => <span key={index}>{String(index + 1).padStart(2, "0")}</span>)}</div><textarea value={code} onChange={event => setCode(event.target.value)} spellCheck={false} aria-label="Editor de código" /></div><div className="terminal-panel"><div className="terminal-head"><span><TerminalSquare size={14} /> TERMINAL SIMULADO</span><span className="terminal-online"><i /> pronto</span></div><div className="terminal-output"><p><span className="terminal-prompt">$</span> maklayn check --security</p><p className="terminal-success"><Check size={13} /> 0 execuções reais · sandbox não conectado</p><p className="terminal-muted">A Maklayn analisa o texto; não executa comandos, instala dependências ou acessa sua rede nesta versão.</p></div></div></section><aside className="code-inspector"><div className="inspector-tabs"><button className="active">Copiloto <span>{result ? "1" : "0"}</span></button><button>Diferenças</button></div>{result ? <div className="assistant-result"><div className="assistant-result-head"><div className="inspector-icon success"><Check size={18} /></div><div><strong>Resposta da Maklayn</strong><span>{selectedOperation.label} · {language}</span></div></div><pre>{result}</pre><button className="text-button" onClick={() => { navigator.clipboard?.writeText(result); toast.success("Resposta copiada"); }}>Copiar resposta <Copy size={13} /></button></div> : <div className="inspector-card"><div className="inspector-icon"><Lightbulb size={18} /></div><div><strong>Peça uma ação</strong><p>Escolha uma operação, descreva o objetivo e a Maklayn devolverá uma resposta contextualizada para este arquivo.</p></div></div>}<div className="inspector-card"><div className="inspector-icon success"><ShieldCheck size={18} /></div><div><strong>Proteção ativa</strong><p>A estação não executa código arbitrário. Para produção, conecte um executor isolado com CPU, memória, tempo e rede limitados.</p></div></div><div className="inspector-card suggestion"><div className="inspector-icon"><MoreHorizontal size={18} /></div><div><strong>Limites testados</strong><p>Entradas longas, linguagens diferentes e pedidos de revisão usam o mesmo contrato validado no servidor.</p><button className="text-button" onClick={() => setTask("Explique este código para uma pessoa iniciante e aponte três melhorias práticas.")}>Usar exemplo <ArrowUpRight size={13} /></button></div></div></aside></div></div>;
}
