import { useState } from 'react';
import { Activity, ArrowRight, Bot, Box, Braces, CircleHelp, Command, Globe2, LayoutDashboard, Menu, Plus, Search, Sparkles, WandSparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';

type Project = { id: number; name: string; kind: string };
const initialProjects: Project[] = [
  { id: 1, name: 'Northstar Studio', kind: 'Portfolio website' },
  { id: 2, name: 'Orbit Commerce', kind: 'E-commerce experience' },
  { id: 3, name: 'Pulse Analytics', kind: 'SaaS dashboard' }
];

export default function App() {
  const [projects, setProjects] = useState(initialProjects);
  const [prompt, setPrompt] = useState('');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('Overview');
  const [notice, setNotice] = useState('');
  const [menu, setMenu] = useState(false);
  const [generating, setGenerating] = useState(false);
  async function createProject(text = prompt) {
    const brief = text.trim();
    if (!brief) { setNotice('Describe your project first.'); return; }
    setGenerating(true);
    setNotice('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: brief })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Project generation failed.');
      const project = { id: Date.now(), name: result.name || 'New project', kind: 'AI-generated website' };
      const saved = { ...project, summary: result.summary || '', files: result.files || [], createdAt: new Date().toISOString() };
      const existing = JSON.parse(localStorage.getItem('masterstudio-projects') || '[]');
      localStorage.setItem('masterstudio-projects', JSON.stringify([saved, ...existing].slice(0, 20)));
      setProjects(current => [project, ...current]);
      setPrompt('');
      setActive('Projects');
      setNotice('Generated ' + result.files.length + ' project file(s). They are saved in this browser for this device; database sync and code export are upcoming.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not generate this project. Please try again.');
    } finally {
      setGenerating(false);
    }
  }
  const visible = projects.filter(p => (p.name + ' ' + p.kind).toLowerCase().includes(search.toLowerCase()));
  const nav = [{ label: 'Overview', icon: LayoutDashboard }, { label: 'Projects', icon: Braces }, { label: 'Agent studio', icon: Bot }, { label: 'Components', icon: Box }];
  return <div className="shell">
    <aside className={menu ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><span className="brand-icon"><Command size={20}/></span><div><b>masterstudio<span>AI</span></b><small>CREATIVE ENGINEERING</small></div><button className="close-mobile" onClick={() => setMenu(false)}><X size={18}/></button></div>
      <div className="workspace"><span>M</span><div><b>My workspace</b><small>Free workspace</small></div></div>
      <label className="nav-caption">WORKSPACE</label>
      {nav.map(item => <button key={item.label} className={active === item.label ? 'nav-link selected' : 'nav-link'} onClick={() => {setActive(item.label);setMenu(false);}}><item.icon size={17}/>{item.label}{item.label === 'Agent studio' && <small>SOON</small>}</button>)}
      <label className="nav-caption tools-caption">YOUR TOOLS</label>
      <button className="nav-link" onClick={() => setNotice('Exports will be enabled after project files are generated.')}><Sparkles size={17}/>Exports</button>
      <button className="nav-link" onClick={() => setNotice('Settings and accounts are planned for a later milestone.')}><CircleHelp size={17}/>Help & settings</button>
      <div className="sidebar-bottom"><div className="credits"><div><span>Build credits</span><b>Not connected</b></div><div className="credit-bar"></div><p>Connect an AI provider to start generating.</p></div><div className="user-row"><span>U</span><div><b>Your profile</b><small>Local preview mode</small></div></div></div>
    </aside>
    {menu && <button className="scrim" onClick={() => setMenu(false)} aria-label="Close menu"/>}
    <main><header><button className="mobile-menu" onClick={() => setMenu(true)}><Menu size={20}/></button><div className="crumb">Workspace <span>/</span> <b>{active}</b></div><div className="header-right"><span className="live-dot"></span><small>UI preview</small><span className="avatar">U</span></div></header>
      <div className="content">
        <motion.div className="welcome" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}><div><div className="eyebrow"><i/> YOUR IDEAS, ENGINEERED</div><h1>Build beyond<br/> the <em>prompt.</em></h1><p>Your space to turn ambitious ideas into real digital products.</p></div><div className="version"><Activity size={14}/> BUILD WORKSPACE <span/> v0.1</div></motion.div>
        {notice && <div className="notice"><Sparkles size={16}/><span>{notice}</span><button onClick={() => setNotice('')}><X size={15}/></button></div>}
        {active === 'Overview' || active === 'Projects' ? <>
          <motion.section className="builder" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.08}}><div className="builder-top"><span><WandSparkles size={14}/> AI WEBSITE BUILDER</span><small><i/> WORKSPACE ONLINE</small></div><h2>What are we building today?</h2><p>Start with an idea. Shape it into a website, dashboard, or digital experience.</p><div className="prompt"><textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe your project... e.g. Build a premium real-estate marketplace with property search, agent profiles and an admin dashboard."/><div className="prompt-actions"><small><Sparkles size={13}/> Be specific. Great briefs make great products.</small><button disabled={generating} onClick={() => createProject()}>{generating ? "Generating…" : "✨ Start a project"} {!generating && <ArrowRight size={15}/>}</button></div></div><div className="quick-label">OR START WITH A DIRECTION</div><div className="quick-grid">{[{title:'A product landing page',desc:'A bold, conversion-focused launch site',icon:Globe2},{title:'A SaaS dashboard',desc:'A data-rich workspace with navigation',icon:LayoutDashboard},{title:'An online store',desc:'Product discovery and shopping flows',icon:Box}].map(q => <button className="quick-card" key={q.title} onClick={() => createProject('Build ' + q.title + ': ' + q.desc + '. Include responsive pages and polished interactions.')}><span><q.icon size={17}/></span><div><b>{q.title}</b><small>{q.desc}</small></div><ArrowRight size={15}/></button>)}</div></motion.section>
          <section className="projects"><div className="section-heading"><div><label>YOUR WORKSPACE</label><h2>Recent projects <sup>{String(projects.length).padStart(2,'0')}</sup></h2></div><div className="project-tools"><label className="search"><Search size={15}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects"/></label><button className="new-project" onClick={() => document.querySelector('textarea')?.focus()}><Plus size={15}/> New project</button></div></div><div className="project-grid">{visible.map((p,i) => <motion.article className="project-card" key={p.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*.05}}><div className={'project-art art-' + (i % 3)}><div className="mock-window"><div className="mock-dots">•••</div><div className="mock-lines"></div><div className="mock-image"></div><div className="mock-foot"></div></div><small>{p.kind.toUpperCase()}</small></div><div className="project-details"><div><b>{p.name}</b><small>Created in workspace</small></div><span className="draft">• DRAFT</span></div><div className="project-bottom"><span><Braces size={13}/> Web project</span><button onClick={() => setNotice('The project editor and live preview are next milestones; this is currently a starter project record.')}>Open workspace <ArrowRight size={13}/></button></div></motion.article>)}</div>{visible.length === 0 && <div className="empty">No projects found. Try a different search.</div>}</section>
        </> : <section className="coming"><Bot size={28}/><label>ON THE ROADMAP</label><h2>{active}</h2><p>This module is planned for a future milestone. We’re building the project foundation first so every feature can work end-to-end.</p><button onClick={() => setActive('Overview')}>Back to overview <ArrowRight size={15}/></button></section>}
        <footer><span><b>M.</b> MasterStudio AI <i>/</i> Build with intent.</span><span><i className="live-dot"></i> INITIAL SCAFFOLD <i>·</i> v0.1.0</span></footer>
      </div>
    </main>
  </div>;
}
