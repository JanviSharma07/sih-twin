import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "https://sih-twin.onrender.com";

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { detail: text }; }
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
  return data;
}

const icons = {
  dashboard: "⌂", services: "▦", application: "＋", twin: "◈",
  queue: "☷", analytics: "▥", help: "?", menu: "☰"
};

function App() {
  const [mode, setMode] = useState("applicant");
  const [page, setPage] = useState("dashboard");
  const [twinId, setTwinId] = useState("APP-2026-000417");
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const nav = mode === "applicant"
    ? [
        ["dashboard", "Overview"],
        ["services", "Find a service"],
        ["application", "New application"],
        ["twin", "My digital twin"],
      ]
    : [
        ["dashboard", "Officer overview"],
        ["queue", "Work queue"],
        ["twin", "Application twin"],
        ["analytics", "Bottlenecks"],
      ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand" onClick={() => { setPage("dashboard"); setMode("applicant"); }}>
          <div className="brand-mark">N</div>
          <div><strong>Niyora</strong><span>Digital Twin</span></div>
        </div>

        <div className="mode-switch">
          <button className={mode === "applicant" ? "active" : ""} onClick={() => {setMode("applicant"); setPage("dashboard")}}>Applicant</button>
          <button className={mode === "officer" ? "active" : ""} onClick={() => {setMode("officer"); setPage("dashboard")}}>Officer</button>
        </div>

        <nav>
          {nav.map(([key, label]) => (
            <button key={key} className={page === key ? "nav active" : "nav"} onClick={() => setPage(key)}>
              <span>{icons[key] || "•"}</span>{label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="secure">✓ <span>Secure government workflow</span></div>
          <div className="profile"><div className="avatar">RD</div><div><b>{mode === "applicant" ? "Ravi Deshmukh" : "Officer console"}</b><small>{mode === "applicant" ? "Business applicant" : "Review officer"}</small></div></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-title"><span className="brand-mark small">N</span> Niyora</div>
          <div className="crumb">Maharashtra · Citizen Services</div>
          <div className="top-actions">
            <button className="icon-btn" title="Notifications">♢<i>2</i></button>
            <button className="user-chip"><span className="avatar sm">RD</span> Ravi Deshmukh</button>
          </div>
        </header>

        <div className="content">
          {page === "dashboard" && <Dashboard mode={mode} setPage={setPage} setTwinId={setTwinId} notify={notify} />}
          {page === "services" && <Services setPage={setPage} notify={notify} />}
          {page === "application" && <ApplicationForm setPage={setPage} setTwinId={setTwinId} notify={notify} />}
          {page === "twin" && <Twin twinId={twinId} setTwinId={setTwinId} mode={mode} notify={notify} />}
          {page === "queue" && <Queue setPage={setPage} setTwinId={setTwinId} notify={notify} />}
          {page === "analytics" && <Analytics />}
        </div>
      </main>

      {toast && <div className={`toast ${toast.type}`}>{toast.type === "success" ? "✓" : "!"} {toast.message}</div>}
    </div>
  );
}

function PageTitle({eyebrow, title, children}) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div>{children}</div>;
}

function Stat({label, value, sub, tone=""}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>◈</div><div><div className="stat-value">{value}</div><div className="stat-label">{label}</div>{sub && <div className="stat-sub">{sub}</div>}</div></div>;
}

function Dashboard({mode, setPage, setTwinId, notify}) {
  if (mode === "officer") return <OfficerDashboard setPage={setPage} setTwinId={setTwinId} />;
  return (
    <>
      <PageTitle eyebrow="CITIZEN APPLICATION DIGITAL TWIN" title="Good evening, Ravi">
        <button className="primary" onClick={() => setPage("application")}>+ Start application</button>
      </PageTitle>

      <div className="hero">
        <div>
          <div className="pill">● Digital Twin active</div>
          <h2>Your application, understood end-to-end.</h2>
          <p>Niyora checks services, eligibility, documents and workflow risk before delays become problems.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => setPage("twin")}>Open application twin</button>
            <button className="secondary light" onClick={() => setPage("services")}>Explore services</button>
          </div>
        </div>
        <div className="hero-orbit">
          <div className="orbit o1"></div><div className="orbit o2"></div><div className="orbit-core">N</div>
        </div>
      </div>

      <section className="section">
        <div className="section-head"><h3>Application snapshot</h3><button className="link" onClick={() => setPage("twin")}>View full twin →</button></div>
        <div className="stats four">
          <Stat label="Readiness" value="79%" sub="2 blocking issues" tone="blue" />
          <Stat label="Delay probability" value="78%" sub="High risk" tone="amber" />
          <Stat label="Rejection probability" value="21%" sub="Needs attention" tone="red" />
          <Stat label="Current stage" value="2 / 2" sub="Pollution Board" tone="green" />
        </div>
      </section>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><h3>What needs your attention</h3><span className="badge danger">2 blocking</span></div>
          <Issue level="blocking" title="Investment mismatch" text="Form says ₹24,00,000 but the CA certificate says ₹32,00,000." action="Correct / replace document" />
          <Issue level="blocking" title="Fire NOC missing" text="Fire NOC has not been uploaded." action="Upload document" />
        </div>
        <div className="panel">
          <div className="panel-head"><h3>Application timeline</h3><span className="muted">APP-2026-000417</span></div>
          <Timeline events={[
            ["14 Aug 2026 · 10:22", "Application submitted", "applicant", true],
            ["16 Aug 2026 · 09:05", "Labour Department approved", "officer", true],
            ["Now", "Pollution Board — in review", "system", false],
          ]} />
        </div>
      </div>
    </>
  );
}

function OfficerDashboard({setPage, setTwinId}) {
  return <>
    <PageTitle eyebrow="OFFICER CONSOLE" title="Review operations">
      <button className="secondary" onClick={() => setPage("analytics")}>View analytics</button>
    </PageTitle>
    <div className="stats four">
      <Stat label="Priority files" value="3" sub="Sorted by delay risk" tone="red" />
      <Stat label="SLA breaches" value="7" sub="Across active cases" tone="amber" />
      <Stat label="Avg. processing" value="4.2d" sub="Current average" tone="blue" />
      <Stat label="High-risk queue" value="2" sub="Needs intervention" tone="purple" />
    </div>
    <div className="panel mt">
      <div className="panel-head"><h3>Priority queue</h3><button className="link" onClick={() => setPage("queue")}>Open full queue →</button></div>
      <QueueTable compact setPage={setPage} setTwinId={setTwinId} />
    </div>
  </>;
}

function Services({setPage, notify}) {
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api(`/api/services${audience ? `?audience=${encodeURIComponent(audience)}` : ""}`)
      .then(setServices).catch(e => notify(e.message, "error")).finally(() => setLoading(false));
  }, [audience]);

  const filtered = useMemo(() => services.filter(s =>
    `${s.label} ${s.dept} ${s.service_code}`.toLowerCase().includes(query.toLowerCase())
  ), [services, query]);

  return <>
    <PageTitle eyebrow="SERVICE DISCOVERY" title="Find the right government service">
      <div className="search top-search"><span>⌕</span><input placeholder="Search services..." value={query} onChange={e=>setQuery(e.target.value)} /></div>
    </PageTitle>
    <div className="service-filters">
      <button className={!audience ? "filter active" : "filter"} onClick={()=>setAudience("")}>All</button>
      {["business_owner","student","citizen","farmer"].map(a => <button className={audience===a ? "filter active":"filter"} key={a} onClick={()=>setAudience(a)}>{a.replace("_"," ")}</button>)}
    </div>
    {loading ? <Loading/> : <div className="service-grid">
      {filtered.map(s => <ServiceCard key={s.service_code} service={s} onApply={() => setPage("application")} />)}
      {!filtered.length && <Empty text="No services match your search." />}
    </div>}
    <div className="smart-match">
      <div><span className="spark">✦</span><div><b>Not sure what you need?</b><p>Describe your requirement in plain language and Niyora will match it to services and checklists.</p></div></div>
      <MatchBox notify={notify}/>
    </div>
  </>;
}

function MatchBox({notify}) {
  const [need,setNeed]=useState("");
  const [result,setResult]=useState(null);
  const submit=async()=>{
    if(!need.trim()) return;
    try { setResult(await api("/api/match-service",{method:"POST",body:JSON.stringify({need})})); }
    catch(e){notify(e.message,"error")}
  };
  return <div className="match-box"><input value={need} onChange={e=>setNeed(e.target.value)} placeholder="e.g. I want to start a manufacturing unit" /><button className="primary" onClick={submit}>Find services</button>{result && <div className="match-results">{result.matches?.length ? result.matches.map(m=><span key={m.service_code}>{m.label} <small>{m.score} match</small></span>) : "No direct match found."}</div>}</div>
}

function ServiceCard({service,onApply}) {
  return <div className="service-card">
    <div className="service-top"><span className="service-icon">{service.category==="industrial"?"⌂":service.category==="education"?"◇":service.category==="agriculture"?"♧":"◎"}</span><span className="badge neutral">{service.category}</span></div>
    <h3>{service.label}</h3><p>{service.dept}</p>
    <div className="service-meta"><span>◷ {service.sla_days} days SLA</span><span>▣ {service.required_docs?.length || 0} docs</span></div>
    <button className="secondary full" onClick={onApply}>Check eligibility →</button>
  </div>
}

function ApplicationForm({setPage,setTwinId,notify}) {
  const [services,setServices]=useState([]);
  const [form,setForm]=useState({name:"Ravi Deshmukh",email:"ravi@example.com",unit_type:"food_processing",district:"Pune",workers:"12",service_code:"FACTORY_REG"});
  const [step,setStep]=useState(1);
  const [elig,setElig]=useState(null);
  const [busy,setBusy]=useState(false);

  useEffect(()=>{api("/api/services").then(setServices).catch(e=>notify(e.message,"error"))},[]);

  const selected=services.find(s=>s.service_code===form.service_code);
  const check=async()=>{
    setBusy(true);
    try {
      const answers={workers:Number(form.workers)};
      if(form.service_code==="POST_MATRIC_SCHOLARSHIP"){answers.annual_income=Number(form.annual_income||0); answers.is_enrolled=form.is_enrolled==="true";}
      if(form.service_code==="DOMICILE_CERT") answers.years_in_state=Number(form.years_in_state||0);
      if(form.service_code==="FARM_SUBSIDY") answers.land_hectares=Number(form.land_hectares||0);
      setElig(await api("/api/eligibility",{method:"POST",body:JSON.stringify({service_code:form.service_code,answers})}));
      setStep(3);
    } catch(e){notify(e.message,"error")} finally{setBusy(false)}
  };
  const create=async()=>{
    setBusy(true);
    try {
      const r=await api("/api/applications",{method:"POST",body:JSON.stringify({applicant_email:form.email,service_code:form.service_code})});
      setTwinId(r.twin_id); notify(`Application ${r.twin_id} created`); setPage("twin");
    } catch(e){notify(e.message,"error")} finally{setBusy(false)}
  };
  return <>
    <PageTitle eyebrow="NEW APPLICATION" title="Start a government service application">
      <span className="draft">● Draft saved locally</span>
    </PageTitle>
    <div className="steps">{["Applicant details","Choose service","Eligibility","Create application"].map((x,i)=><div className={step>=i+1?"step done":"step"} key={x}><span>{i+1}</span>{x}</div>)}</div>

    {step===1 && <div className="form-panel"><FormRow label="Full name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></FormRow><FormRow label="Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></FormRow><FormRow label="District"><input value={form.district} onChange={e=>setForm({...form,district:e.target.value})}/></FormRow><FormRow label="Unit type"><input value={form.unit_type} onChange={e=>setForm({...form,unit_type:e.target.value})}/></FormRow><div className="form-actions"><button className="primary" onClick={()=>setStep(2)}>Continue →</button></div></div>}
    {step===2 && <div className="form-panel"><FormRow label="Service"><select value={form.service_code} onChange={e=>setForm({...form,service_code:e.target.value})}>{services.map(s=><option key={s.service_code} value={s.service_code}>{s.label}</option>)}</select></FormRow><FormRow label="Workers / key value"><input type="number" value={form.workers} onChange={e=>setForm({...form,workers:e.target.value})}/></FormRow>{selected?.rules?.map(r=><div className="rule-hint" key={r.id}>✓ Eligibility rule: {r.message}</div>)}<div className="selected-service"><b>{selected?.label}</b><span>{selected?.dept} · {selected?.sla_days} day SLA</span><small>Required documents: {selected?.required_docs?.map(d=>d.label).join(", ")}</small></div><div className="form-actions"><button className="secondary" onClick={()=>setStep(1)}>← Back</button><button className="primary" onClick={check} disabled={busy}>{busy?"Checking...":"Check eligibility →"}</button></div></div>}
    {step===3 && <div className="form-panel"><div className={`eligibility ${elig?.status}`}><div className="big-status">{elig?.status==="pass"?"✓":elig?.status==="fail"?"!":"◌"}</div><div><h2>{elig?.status==="pass"?"Eligible to apply":elig?.status==="fail"?"Eligibility not met":"Proof required"}</h2><p>{elig?.message || (elig?.missing?.length ? "Some eligibility information is still required." : "Review the result below.")}</p></div></div>{elig?.failed?.map(r=><div className="rule-row fail" key={r.id}>✕ {r.message}</div>)}{elig?.missing?.map(r=><div className="rule-row warn" key={r.id}>! {r.message}</div>)}<div className="form-actions"><button className="secondary" onClick={()=>setStep(2)}>← Edit</button><button className="primary" onClick={()=>setStep(4)}>Continue →</button></div></div>}
    {step===4 && <div className="form-panel"><div className="create-review"><div><span className="eyebrow">READY TO CREATE</span><h2>{selected?.label}</h2><p>{form.name} · {form.email} · {form.district}</p></div><div className="review-icon">◈</div></div><div className="check-list"><div>✓ Eligibility checked</div><div>✓ Service checklist generated</div><div>✓ Digital Twin will be created</div><div>✓ Application ID will be assigned</div></div><div className="form-actions"><button className="secondary" onClick={()=>setStep(3)}>← Back</button><button className="primary" onClick={create} disabled={busy}>{busy?"Creating...":"Create application"}</button></div></div>}
  </>;
}

function Twin({twinId,setTwinId,mode,notify}) {
  const [id,setId]=useState(twinId);
  const [twin,setTwin]=useState(null);
  const [loading,setLoading]=useState(true);
  const load=()=>{setLoading(true);api(`/api/twin/${encodeURIComponent(id)}`).then(setTwin).catch(e=>notify(e.message,"error")).finally(()=>setLoading(false))};
  useEffect(load,[]);
  return <>
    <PageTitle eyebrow="DIGITAL TWIN" title="Application intelligence">
      <div className="id-search"><input value={id} onChange={e=>setId(e.target.value)} /><button className="secondary" onClick={load}>Load</button></div>
    </PageTitle>
    {loading ? <Loading/> : twin ? <>
      <div className="twin-head"><div><span className="badge blue">● {twin.eligibility_status.replace("_"," ")}</span><h2>{twin.applicant.name}</h2><p>{twin.service_code} · {twin.applicant.district} · {twin.applicant.workers} workers</p></div><div className="readiness"><div className="ring" style={{"--p":`${twin.readiness.percent}%`}}><b>{twin.readiness.percent}%</b></div><span>Readiness</span></div></div>
      <div className="stats four"><Stat label="Blocking issues" value={twin.readiness.blocking} sub="Must fix" tone="red"/><Stat label="Warnings" value={twin.readiness.warnings} sub="Review" tone="amber"/><Stat label="Delay probability" value={`${Math.round(twin.risk.delay_probability*100)}%`} sub={twin.risk.top_reason} tone="purple"/><Stat label="Rejection probability" value={`${Math.round(twin.risk.rejection_probability*100)}%`} sub="Current model" tone="blue"/></div>
      <div className="grid-2">
        <div className="panel"><div className="panel-head"><h3>Document readiness</h3><span className="muted">{twin.required_docs.filter(d=>d.uploaded).length}/{twin.required_docs.length} uploaded</span></div>{twin.required_docs.map(d=><div className="doc-row" key={d.doc_type}><span className={d.uploaded?"doc-check uploaded":"doc-check"}>{d.uploaded?"✓":"!"}</span><div><b>{d.label}</b><small>{d.uploaded?"Uploaded":"Required"}</small></div>{!d.uploaded && <button className="mini">Upload</button>}</div>)}</div>
        <div className="panel"><div className="panel-head"><h3>Issues & fixes</h3></div>{twin.issues.length?twin.issues.map(i=><Issue key={i.code} level={i.level} title={i.code.replaceAll("_"," ")} text={i.message} action={i.fix}/>):<Empty text="No issues detected."/>}</div>
      </div>
      <div className="grid-2">
        <div className="panel"><div className="panel-head"><h3>Workflow stages</h3></div>{twin.stages.map(s=><Stage key={s.dept} stage={s}/>)}</div>
        <div className="panel"><div className="panel-head"><h3>Timeline</h3></div><Timeline events={twin.timeline.map(e=>[new Date(e.at).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}),e.event,e.by,true])}/></div>
      </div>
      {mode==="officer" && <Decision twinId={twin.twin_id} notify={notify}/>}
    </> : <Empty text="No twin found."/>}
  </>;
}

function Decision({twinId,notify}) {
  const [reason,setReason]=useState("");
  const [busy,setBusy]=useState(false);
  const send=async(action)=>{setBusy(true);try{await api(`/api/applications/${twinId}/decision`,{method:"POST",body:JSON.stringify({action,reason})});notify(`Decision recorded: ${action}`)}catch(e){notify(e.message,"error")}finally{setBusy(false)}};
  return <div className="panel decision"><div><h3>Officer decision</h3><p>Record an approval, rejection or query against this application.</p></div><textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason / note..." /><div className="decision-actions"><button disabled={busy} className="approve" onClick={()=>send("approve")}>✓ Approve</button><button disabled={busy} className="query" onClick={()=>send("query")}>? Query</button><button disabled={busy} className="reject" onClick={()=>send("reject")}>× Reject</button></div></div>
}

function Queue({setPage,setTwinId,notify}) {
  const [items,setItems]=useState(null);
  useEffect(()=>{api("/api/queue").then(setItems).catch(e=>notify(e.message,"error"))},[]);
  return <><PageTitle eyebrow="OFFICER WORK QUEUE" title="Cases that need attention"><span className="badge blue">Sorted by delay risk</span></PageTitle><div className="panel"><QueueTable items={items} setPage={setPage} setTwinId={setTwinId}/></div></>;
}

function QueueTable({items,setPage,setTwinId,compact=false}) {
  const data=items || [
    {twin_id:"APP-2026-000417",applicant_name:"Ravi Deshmukh",service_code:"FACTORY_REG",stage:"pollution_board",days_used:4,sla_days:15,delay_probability:.78,blocking_issues:2},
    {twin_id:"APP-2026-000392",applicant_name:"Sunita Kale",service_code:"POLLUTION_CTE",stage:"officer_review",days_used:13,sla_days:15,delay_probability:.91,blocking_issues:0},
    {twin_id:"APP-2026-000455",applicant_name:"Imran Shaikh",service_code:"FACTORY_REG",stage:"document_check",days_used:2,sla_days:15,delay_probability:.18,blocking_issues:0}
  ];
  return <div className="table-wrap"><table><thead><tr><th>Applicant</th><th>Service</th><th>Stage</th><th>SLA</th><th>Risk</th><th>Issues</th><th></th></tr></thead><tbody>{data.slice(0,compact?3:20).map(x=><tr key={x.twin_id}><td><b>{x.applicant_name}</b><small>{x.twin_id}</small></td><td>{x.service_code}</td><td>{x.stage.replaceAll("_"," ")}</td><td>{x.days_used}/{x.sla_days}d</td><td><span className={`risk ${x.delay_probability>.7?"high":x.delay_probability>.4?"medium":"low"}`}>{Math.round(x.delay_probability*100)}%</span></td><td>{x.blocking_issues ? <span className="badge danger">{x.blocking_issues} blocking</span>:"—"}</td><td><button className="mini" onClick={()=>{setTwinId(x.twin_id);setPage("twin")}}>Review</button></td></tr>)}</tbody></table></div>
}

function Analytics() {
  const [data,setData]=useState(null);
  const [err,setErr]=useState("");
  useEffect(()=>{api("/api/analytics/bottlenecks").then(setData).catch(e=>setErr(e.message))},[]);
  if(err) return <Empty text={err}/>;
  if(!data) return <Loading/>;
  const max=Math.max(...data.by_stage.map(x=>x.average_days),1);
  return <><PageTitle eyebrow="OPERATIONS ANALYTICS" title="Where applications slow down"><span className="badge amber">Live backend data</span></PageTitle><div className="stats three"><Stat label="Average processing" value={`${data.average_days||data.average_days}d`} sub="Across current files" tone="blue"/><Stat label="SLA breaches" value={data.sla_breaches} sub="Need intervention" tone="red"/><Stat label="Tracked stages" value={data.by_stage.length} sub="Workflow stages" tone="purple"/></div><div className="grid-2"><div className="panel"><div className="panel-head"><h3>Average days by stage</h3></div>{data.by_stage.map(x=><div className="bar-row" key={x.stage}><div><b>{x.stage.replaceAll("_"," ")}</b><small>{x.files} files</small></div><div className="bar"><span style={{width:`${(x.average_days/max)*100}%`}}></span></div><strong>{x.average_days}d</strong></div>)}</div><div className="panel"><div className="panel-head"><h3>Document rejection risk</h3></div>{data.by_document.map(x=><div className="risk-doc" key={x.doc_type}><div><b>{x.doc_type.replaceAll("_"," ")}</b><small>Rejection rate</small></div><strong>{Math.round(x.rejection_rate*100)}%</strong><div className="progress"><span style={{width:`${x.rejection_rate*100}%`}}></span></div></div>)}</div></div></>;
}

function Issue({level,title,text,action}) { return <div className={`issue ${level}`}><div className="issue-icon">{level==="blocking"?"!":"!"}</div><div className="issue-body"><b>{title}</b><p>{text}</p><small>→ {action}</small></div></div> }
function Timeline({events}) { return <div className="timeline">{events.map((e,i)=><div className="time-item" key={i}><div className={e[3]?"time-dot done":"time-dot"}></div><div><small>{e[0]}</small><b>{e[1]}</b><span>{e[2]}</span></div></div>)}</div> }
function Stage({stage}) { const pct=Math.min(100,Math.round((stage.days_used/stage.sla_days)*100)); return <div className="stage"><div className="stage-top"><b>{stage.dept.replaceAll("_"," ")}</b><span className={`status ${stage.status}`}>{stage.status.replace("_"," ")}</span></div><div className="progress"><span style={{width:`${pct}%`}}></span></div><small>{stage.days_used} of {stage.sla_days} days used {stage.officer_id ? `· ${stage.officer_id}`:""}</small></div> }
function FormRow({label,children}) { return <label className="form-row"><span>{label}</span>{children}</label> }
function Loading(){return <div className="loading"><div className="spinner"></div>Loading data…</div>}
function Empty({text}){return <div className="empty">{text}</div>}

createRoot(document.getElementById("root")).render(<App />);
