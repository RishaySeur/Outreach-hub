import { useState, useEffect, useCallback } from "react";

// ─── Brand ───────────────────────────────────────────────────────────────────
const G = "#C49B37";
const BG = "#0B0F17"; const SF = "#101520"; const CA = "#141C28"; const BO = "#1C2636";
const TX = "#EDE9E0"; const MU = "#6B7494"; const DI = "#28354A";

// ─── Data ────────────────────────────────────────────────────────────────────
const STAGES = [
  { key:"new",      label:"New Lead",    color:"#4A5568" },
  { key:"approved", label:"Approved",    color:"#3B82F6" },
  { key:"e1",       label:"Email 1",     color:"#8B5CF6" },
  { key:"e2",       label:"Email 2",     color:"#F59E0B" },
  { key:"e3",       label:"Email 3",     color:"#EF4444" },
  { key:"replied",  label:"Replied",     color:"#FBBF24" },
  { key:"converted",label:"Converted 🏆",color:"#C49B37" },
  { key:"cold",     label:"Gone Cold",   color:"#374151" },
];
const EMAP = { 0:"e1", 1:"e2", 2:"e3" };
const SEQ0 = [
  { label:"Email 1 — The Hook",     delay:0, subject:"Quick question about your listings, {{name}}", hint:"Spark curiosity, brief intro, one soft CTA. Max 100 words. Sound like a real person texting, not a brand." },
  { label:"Email 2 — The Follow-Up",delay:3, subject:"Re: your listings in {{area}}",               hint:"Reference no reply, add a quick piece of value, another soft CTA. Max 90 words." },
  { label:"Email 3 — The Breakup",  delay:7, subject:"Last one from me, {{name}}",                  hint:"Light humour, final nudge, leave door genuinely open. Max 75 words." },
];
const uid = () => Math.random().toString(36).substr(2,9);
const fmt  = d => d ? new Date(d).toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric"}) : "";

// ─── Storage (Claude sandbox OR localStorage) ─────────────────────────────
const Store = {
  async get(k) {
    if (typeof window!=="undefined" && window.storage)
      try { const r=await window.storage.get(k); if(r) return JSON.parse(r.value); } catch{}
    try { const r=localStorage.getItem(k); if(r) return JSON.parse(r); } catch{}
    return null;
  },
  async set(k,v) {
    const s=JSON.stringify(v);
    if (typeof window!=="undefined" && window.storage)
      try { await window.storage.set(k,s); return; } catch{}
    try { localStorage.setItem(k,s); } catch{}
  },
};
function useStore(key,def) {
  const [v,sv]=useState(def);
  const [rdy,setRdy]=useState(false);
  useEffect(()=>{ Store.get(key).then(x=>{ if(x!=null) sv(x); setRdy(true); }); },[]);
  const set=useCallback(x=>{ const n=typeof x==="function"?x(v):x; sv(n); Store.set(key,n); },[key,v]);
  return [v,set,rdy];
}
function useIsMobile() {
  const [m,sm]=useState(typeof window!=="undefined"&&window.innerWidth<768);
  useEffect(()=>{ const h=()=>sm(window.innerWidth<768); window.addEventListener("resize",h); return ()=>window.removeEventListener("resize",h); },[]);
  return m;
}

// ─── Shared UI ───────────────────────────────────────────────────────────────
const IS={width:"100%",background:"#090D14",border:`1px solid ${BO}`,color:TX,padding:"11px 13px",borderRadius:8,fontSize:14,outline:"none",fontFamily:"inherit"};

function Btn({children,onClick,disabled,v="g",s={}}) {
  const vs={
    g:{background:G,color:BG},
    ghost:{background:"transparent",border:`1px solid ${BO}`,color:MU},
    soft:{background:G+"1A",border:`1px solid ${G}44`,color:G},
    red:{background:"#3B1515",border:"1px solid #7F2020",color:"#F87171"},
  };
  return <button onClick={disabled?undefined:onClick} style={{border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",padding:"10px 18px",opacity:disabled?0.4:1,fontFamily:"inherit",transition:"opacity .15s",...vs[v],...s}}>{children}</button>;
}
function Lbl({children}) { return <div style={{fontSize:11,letterSpacing:1.2,textTransform:"uppercase",color:DI,marginBottom:6}}>{children}</div>; }
function Pill({status}) {
  const s=STAGES.find(x=>x.key===status)||STAGES[0];
  return <span style={{background:s.color+"22",color:s.color,border:`1px solid ${s.color}44`,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{s.label}</span>;
}
function Av({name,size=36}) {
  return <div style={{width:size,height:size,borderRadius:8,background:G+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:size*.43,color:G,flexShrink:0}}>{(name||"?")[0].toUpperCase()}</div>;
}
function Toast({msg,type}) {
  return <div style={{position:"fixed",bottom:84,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:type==="error"?"#3B1515":"#152015",border:`1px solid ${type==="error"?"#EF4444":"#22C55E"}`,color:type==="error"?"#FCA5A5":"#86EFAC",padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:500,boxShadow:"0 4px 24px rgba(0,0,0,.6)",whiteSpace:"nowrap"}}>{msg}</div>;
}
function SH({children,sub,style={}}) {
  return <div style={{marginBottom:20,...style}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:TX}}>{children}</div>{sub&&<div style={{fontSize:13,color:MU,marginTop:4}}>{sub}</div>}</div>;
}
function Empty({text}) { return <div style={{textAlign:"center",color:DI,padding:"44px 0",fontSize:13}}>{text}</div>; }
function Card({children,style={}}) { return <div style={{background:CA,border:`1px solid ${BO}`,borderRadius:10,...style}}>{children}</div>; }
function Warn({children}) {
  return <div style={{background:"#2A1A08",border:"1px solid #8A5A20",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#F59E0B"}}>{children}</div>;
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const mob = useIsMobile();
  const [leads,  setLeads,  leadsRdy] = useStore("ttm_leads",  []);
  const [seqs,   setSeqs]             = useStore("ttm_seqs",   SEQ0);
  const [drafts, setDrafts]           = useStore("ttm_drafts", []);
  const [waLogs, setWaLogs]           = useStore("ttm_wa",     []);
  const [apiKey, setApiKey]           = useStore("ttm_key",    "");
  const [tab,    setTab]              = useState("home");
  const [more,   setMore]             = useState(false);
  const [toast,  setToast]            = useState(null);
  const [addOpen,setAddOpen]          = useState(false);
  const [studioLead, setStudioLead]   = useState(null);

  const notify = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };
  const goTab  = k => { setTab(k); setMore(false); };
  const openAI = l => { setStudioLead(l); goTab("ai"); };

  // Lead ops
  const addLead   = l => { setLeads(p=>[...p,{...l,id:uid(),status:"new",addedAt:new Date().toISOString()}]); setAddOpen(false); notify("Lead added ✓"); };
  const updStatus = (id,st) => setLeads(p=>p.map(l=>l.id===id?{...l,status:st,updatedAt:new Date().toISOString()}:l));
  const delLead   = id => { setLeads(p=>p.filter(l=>l.id!==id)); setDrafts(p=>p.filter(d=>d.leadId!==id)); notify("Lead removed"); };

  // Draft ops
  const approveDraft = d => { setDrafts(p=>[...p.filter(x=>!(x.leadId===d.leadId&&x.emailIndex===d.emailIndex)),{...d,id:uid(),status:"approved",approvedAt:new Date().toISOString()}]); notify("Draft approved ✓"); };
  const markSent     = id => { const d=drafts.find(x=>x.id===id); if(!d)return; setDrafts(p=>p.map(x=>x.id===id?{...x,status:"sent",sentAt:new Date().toISOString()}:x)); updStatus(d.leadId,EMAP[d.emailIndex]||"e1"); notify("Marked as sent ✓"); };
  const delDraft     = id => { setDrafts(p=>p.filter(d=>d.id!==id)); notify("Draft deleted"); };

  // WA op
  const logWa = log => { setWaLogs(p=>[...p,{...log,id:uid(),at:new Date().toISOString()}]); notify("Logged ✓"); };

  const stats = {
    total:    leads.length,
    approved: leads.filter(l=>l.status==="approved").length,
    inSeq:    leads.filter(l=>["e1","e2","e3"].includes(l.status)).length,
    replied:  leads.filter(l=>l.status==="replied").length,
    conv:     leads.filter(l=>l.status==="converted").length,
    ready:    drafts.filter(d=>d.status==="approved").length,
  };

  const BNAV = [
    {key:"home",  icon:"⌂", label:"Home"},
    {key:"leads", icon:"◉", label:"Leads"},
    {key:"ai",    icon:"✦", label:"AI",   gold:true},
    {key:"drafts",icon:"▤", label:"Drafts",badge:stats.ready},
    {key:"more",  icon:"⋯", label:"More"},
  ];
  const MORE = [
    {key:"pipeline",label:"Pipeline"},
    {key:"whatsapp",label:"WhatsApp Tracker"},
    {key:"sequences",label:"Sequences"},
    {key:"settings", label:"Settings"},
  ];

  const screens = {
    home:      <Home stats={stats} leads={leads} onStatus={updStatus} onAI={openAI} mob={mob}/>,
    leads:     <Leads leads={leads} onAdd={()=>setAddOpen(true)} onStatus={updStatus} onDel={delLead} onAI={openAI} mob={mob}/>,
    pipeline:  <Pipeline leads={leads} onStatus={updStatus} mob={mob}/>,
    ai:        <AIStudio leads={leads} seqs={seqs} prefill={studioLead} drafts={drafts} apiKey={apiKey} onApprove={approveDraft} notify={notify} mob={mob}/>,
    drafts:    <Drafts drafts={drafts} leads={leads} seqs={seqs} onSent={markSent} onDel={delDraft} mob={mob}/>,
    whatsapp:  <WhatsApp leads={leads} logs={waLogs} onLog={logWa} mob={mob}/>,
    sequences: <Sequences seqs={seqs} onSave={s=>{setSeqs(s);notify("Saved ✓");}}/>,
    settings:  <Settings apiKey={apiKey} onSave={k=>{setApiKey(k);notify("API key saved ✓");}}/>,
  };

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:BG,minHeight:"100vh",color:TX,paddingBottom:mob?80:0}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1C2636;border-radius:2px}select option{background:#141C28}input::placeholder,textarea::placeholder{color:#28354A}`}</style>

      {toast && <Toast {...toast}/>}

      {/* Header */}
      <header style={{borderBottom:`1px solid ${BO}`,padding:mob?"12px 16px":"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",background:SF,position:"sticky",top:0,zIndex:100}}>
        <div>
          <div style={{fontSize:9,letterSpacing:3.5,color:G,textTransform:"uppercase",marginBottom:2}}>Twenty Two Media</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:mob?17:20,fontWeight:600,letterSpacing:.5}}>Outreach Hub</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {stats.ready>0&&<div onClick={()=>goTab("drafts")} style={{background:G+"1A",border:`1px solid ${G}44`,color:G,padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer"}}>{stats.ready} ready</div>}
          {!mob&&<span style={{fontSize:12,color:DI}}>{new Date().toLocaleDateString("en-ZA",{weekday:"short",day:"numeric",month:"short"})}</span>}
        </div>
      </header>

      {/* Desktop nav */}
      {!mob&&(
        <nav style={{display:"flex",borderBottom:`1px solid ${BO}`,background:SF,padding:"0 28px",overflowX:"auto"}}>
          {[{k:"home",l:"Dashboard"},{k:"leads",l:`Leads (${leads.length})`},{k:"pipeline",l:"Pipeline"},{k:"ai",l:"✦ AI Studio"},{k:"drafts",l:`Drafts${stats.ready>0?` (${stats.ready})`:""}`},{k:"whatsapp",l:"WhatsApp"},{k:"sequences",l:"Sequences"},{k:"settings",l:"Settings"}].map(t=>(
            <button key={t.k} onClick={()=>goTab(t.k)} style={{background:"none",border:"none",color:tab===t.k?G:MU,padding:"13px 16px",fontSize:13,fontWeight:tab===t.k?600:400,cursor:"pointer",borderBottom:`2px solid ${tab===t.k?G:"transparent"}`,letterSpacing:.3,transition:"all .15s",whiteSpace:"nowrap"}}>{t.l}</button>
          ))}
        </nav>
      )}

      {/* Screen */}
      <main style={{padding:mob?"20px 16px":"28px",maxWidth:1100,margin:"0 auto"}}>
        {!leadsRdy ? <div style={{textAlign:"center",color:MU,padding:60,fontSize:14}}>Loading...</div> : (screens[tab]||screens.home)}
      </main>

      {/* Mobile bottom nav */}
      {mob&&(
        <nav style={{position:"fixed",bottom:0,left:0,right:0,background:SF,borderTop:`1px solid ${BO}`,display:"flex",zIndex:200,paddingBottom:"env(safe-area-inset-bottom)"}}>
          {BNAV.map(n=>{
            const active=n.key==="more"?more:tab===n.key;
            return (
              <button key={n.key} onClick={()=>n.key==="more"?setMore(p=>!p):(goTab(n.key))} style={{flex:1,background:"none",border:"none",color:active?G:MU,padding:"10px 4px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",position:"relative"}}>
                {(n.badge>0)&&<div style={{position:"absolute",top:6,right:"calc(50% - 16px)",background:G,color:BG,fontSize:9,fontWeight:700,width:14,height:14,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{n.badge}</div>}
                <span style={{fontSize:n.gold?19:16,lineHeight:1,fontWeight:active?700:400}}>{n.icon}</span>
                <span style={{fontSize:10,fontWeight:active?600:400,letterSpacing:.3}}>{n.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* More sheet */}
      {more&&(
        <>
          <div onClick={()=>setMore(false)} style={{position:"fixed",inset:0,zIndex:180}}/>
          <div style={{position:"fixed",bottom:64,left:0,right:0,background:CA,border:`1px solid ${BO}`,borderBottom:"none",borderRadius:"16px 16px 0 0",padding:"8px 0 20px",zIndex:190}}>
            <div style={{width:40,height:4,background:BO,borderRadius:2,margin:"8px auto 16px"}}/>
            {MORE.map(m=>(
              <button key={m.key} onClick={()=>goTab(m.key)} style={{width:"100%",background:tab===m.key?G+"15":"none",border:"none",color:tab===m.key?G:TX,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,fontSize:15,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>{m.label}</button>
            ))}
          </div>
        </>
      )}

      {addOpen&&<AddModal onAdd={addLead} onClose={()=>setAddOpen(false)} mob={mob}/>}
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function Home({stats,leads,onStatus,onAI,mob}) {
  const recent=[...leads].sort((a,b)=>new Date(b.addedAt)-new Date(a.addedAt)).slice(0,5);
  const cvr = stats.total>0 ? Math.round((stats.conv/stats.total)*100) : 0;
  return (
    <div>
      <SH>Dashboard</SH>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(5,1fr)",gap:12,marginBottom:24}}>
        {[{l:"Leads",v:stats.total,c:G},{l:"Approved",v:stats.approved,c:"#3B82F6"},{l:"In Sequence",v:stats.inSeq,c:"#8B5CF6"},{l:"Replied",v:stats.replied,c:"#FBBF24"},{l:"Converted",v:stats.conv,c:"#22C55E"}].map(s=>(
          <Card key={s.l} style={{padding:"16px 16px"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:600,color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:11,color:MU,marginTop:5,letterSpacing:.3}}>{s.l}</div>
          </Card>
        ))}
      </div>
      {stats.total>0&&(
        <Card style={{padding:"14px 16px",marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:MU}}>Conversion rate</span><span style={{fontSize:13,fontWeight:600,color:G}}>{cvr}%</span></div>
          <div style={{background:BO,borderRadius:4,height:5,overflow:"hidden"}}><div style={{height:"100%",background:G,width:`${cvr}%`,borderRadius:4,transition:"width .6s"}}/></div>
        </Card>
      )}
      {/* Follow-up reminders */}
      {(()=>{
        const due=leads.filter(l=>["e1","e2"].includes(l.status));
        if(!due.length) return null;
        return (
          <div style={{background:"#1A1A0A",border:`1px solid ${G}44`,borderRadius:10,padding:"14px 16px",marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:G,marginBottom:10}}>⏰ In sequence ({due.length} active)</div>
            {due.map(l=>(
              <div key={l.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:`1px solid ${BO}`,fontSize:13}}>
                <span>{l.name}</span>
                <span style={{fontSize:11,background:l.status==="e1"?"#8B5CF622":"#F59E0B22",color:l.status==="e1"?"#8B5CF6":"#F59E0B",border:`1px solid ${l.status==="e1"?"#8B5CF644":"#F59E0B44"}`,padding:"2px 9px",borderRadius:10}}>{STAGES.find(s=>s.key===l.status)?.label} sent</span>
              </div>
            ))}
          </div>
        );
      })()}

      {recent.length===0 ? <Empty text="No leads yet. Go to Leads to add your first target agent."/> : (
        <>
          <SH sub="Most recently added">Recent Leads</SH>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {recent.map(l=><LeadRow key={l.id} lead={l} onStatus={onStatus} onAI={onAI} compact/>)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Leads ────────────────────────────────────────────────────────────────────
function Leads({leads,onAdd,onStatus,onDel,onAI}) {
  const [filter,setFilter]=useState("all");
  const [q,setQ]=useState("");
  const vis=leads.filter(l=>{
    if(filter!=="all"&&l.status!==filter) return false;
    if(q&&!`${l.name} ${l.agency} ${l.area}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <SH style={{marginBottom:0}}>Leads</SH>
        <Btn onClick={onAdd} s={{padding:"9px 16px"}}>+ Add Lead</Btn>
      </div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, agency, area..." style={{...IS,marginBottom:14}}/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
        {["all","new","approved","replied","converted"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?G+"1A":"transparent",border:`1px solid ${filter===f?G+"44":BO}`,color:filter===f?G:MU,padding:"5px 12px",borderRadius:20,fontSize:12,cursor:"pointer",fontWeight:filter===f?600:400}}>
            {f==="all"?`All (${leads.length})`:STAGES.find(s=>s.key===f)?.label||f}
          </button>
        ))}
      </div>
      {vis.length===0?<Empty text="No leads found."/>:(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {vis.map(l=><LeadRow key={l.id} lead={l} onStatus={onStatus} onDel={onDel} onAI={onAI}/>)}
        </div>
      )}
    </div>
  );
}

function LeadRow({lead,onStatus,onDel,onAI,compact}) {
  const [exp,setExp]=useState(false);
  return (
    <Card>
      <div onClick={()=>!compact&&setExp(p=>!p)} style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:12,cursor:compact?"default":"pointer"}}>
        <Av name={lead.name}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lead.name}</div>
          <div style={{fontSize:12,color:MU}}>{lead.agency}{lead.area?` · ${lead.area}`:""}</div>
        </div>
        <Pill status={lead.status}/>
        {!compact&&<span style={{color:DI,fontSize:12,marginLeft:4}}>{exp?"▲":"▼"}</span>}
      </div>
      {!compact&&exp&&(
        <div style={{padding:"0 14px 16px",borderTop:`1px solid ${BO}`}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,margin:"12px 0 14px",fontSize:12,color:MU}}>
            {lead.email&&<div>✉ {lead.email}</div>}
            {lead.phone&&<div>📱 {lead.phone}</div>}
            {lead.instagram&&<div>📸 {lead.instagram}</div>}
            {lead.area&&<div>📍 {lead.area}</div>}
          </div>
          {lead.notes&&<div style={{fontSize:12,color:MU,marginBottom:14,lineHeight:1.6,background:"#0A0E17",borderRadius:7,padding:"8px 10px"}}>{lead.notes}</div>}
          <Lbl>Update Status</Lbl>
          <select value={lead.status} onChange={e=>onStatus(lead.id,e.target.value)} style={{...IS,marginBottom:12}}>
            {STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {onAI&&<Btn onClick={()=>onAI(lead)} s={{padding:"8px 14px",fontSize:12}}>✦ Draft Email</Btn>}
            {onDel&&<Btn onClick={()=>onDel(lead.id)} v="red" s={{padding:"8px 14px",fontSize:12}}>Remove</Btn>}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────
function Pipeline({leads,onStatus,mob}) {
  return (
    <div>
      <SH sub="See every lead across all stages">Pipeline</SH>
      <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:16}}>
        {STAGES.filter(s=>s.key!=="cold").map(stage=>{
          const sl=leads.filter(l=>l.status===stage.key);
          return (
            <div key={stage.key} style={{minWidth:mob?170:195,flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10,padding:"8px 10px",borderRadius:8,background:stage.color+"18"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:stage.color,flexShrink:0}}/>
                <span style={{fontSize:12,fontWeight:700,color:stage.color,flex:1}}>{stage.label}</span>
                <span style={{fontSize:11,color:DI}}>{sl.length}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {sl.length===0&&<div style={{background:CA,border:`1px dashed ${BO}`,borderRadius:8,padding:16,textAlign:"center",color:DI,fontSize:12}}>—</div>}
                {sl.map(l=>(
                  <div key={l.id} style={{background:CA,border:`1px solid ${BO}`,borderRadius:8,padding:"10px 12px"}}>
                    <div style={{fontWeight:600,fontSize:13,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</div>
                    <div style={{fontSize:11,color:MU,marginBottom:8}}>{l.agency}</div>
                    <select value={l.status} onChange={e=>onStatus(l.id,e.target.value)} style={{...IS,fontSize:11,padding:"5px 7px"}}>
                      {STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AI Studio ────────────────────────────────────────────────────────────────
function AIStudio({leads,seqs,prefill,drafts,apiKey,onApprove,notify,mob}) {
  const [lid,setLid]=useState(prefill?.id||"");
  const [ei,setEi]=useState(0);
  const [loading,setLoading]=useState(false);
  const [draft,setDraft]=useState(null);
  const isDeployed=typeof window.storage==="undefined";
  const lead=leads.find(l=>l.id===lid)||null;
  const existing=lead?drafts.find(d=>d.leadId===lead.id&&d.emailIndex===ei):null;

  const gen=async()=>{
    if(!lead)return;
    if(isDeployed&&!apiKey){notify("Add your API key in Settings first.","error");return;}
    setLoading(true);setDraft(null);
    const seq=seqs[ei];
    try {
      const headers={"Content-Type":"application/json"};
      if(isDeployed){headers["x-api-key"]=apiKey;headers["anthropic-version"]="2023-06-01";}
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers,
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1000,
          system:`You write cold outreach emails for Rishay, founder of Twenty Two Media — a real estate videography agency in KZN, South Africa.\n\nVOICE: Confident, warm, direct. Punchy short sentences. Sound like a real person. NOT corporate, NOT an AI, NOT salesy.\n\nABOUT TWENTY TWO MEDIA: Cinematic property reels, listing videos, drone footage, agent personal brand content. Packages from R4,500.\n\nThis is Email ${ei+1} of 3 — ${seq.label}\nInstruction: ${seq.hint}\n\nSign off: Rishay | Twenty Two Media | +27 78 179 6634\n\nRespond ONLY with valid JSON, no markdown:\n{"subject": "...", "body": "..."}`,
          messages:[{role:"user",content:`Lead:\nName: ${lead.name}\nAgency: ${lead.agency||"Unknown"}\nArea: ${lead.area||"KZN"}\nNotes: ${lead.notes||"None"}\n\nEmail ${ei+1}: ${seq.label}. Subject template: "${seq.subject}"`}]
        })
      });
      const data=await res.json();
      if(data.error)throw new Error(data.error.message);
      const txt=data.content?.[0]?.text||"";
      const p=JSON.parse(txt.replace(/```json|```/g,"").trim());
      setDraft({...p,leadId:lead.id,leadName:lead.name,emailIndex:ei,status:"pending",generatedAt:new Date().toISOString()});
    } catch(e){notify("Failed: "+e.message,"error");}
    setLoading(false);
  };

  const approve=()=>{if(!draft)return;onApprove(draft);setDraft(null);notify("Approved ✓");};

  return (
    <div>
      <SH sub="Generate personalised emails — nothing sends without your approval">AI Studio</SH>
      {isDeployed&&!apiKey&&<Warn>⚠ Add your Anthropic API key in Settings to enable AI generation.</Warn>}

      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1.35fr",gap:24}}>
        <div>
          <Lbl>Lead</Lbl>
          <select value={lid} onChange={e=>{setLid(e.target.value);setDraft(null);}} style={{...IS,display:"block",marginBottom:20}}>
            <option value="">Choose a lead...</option>
            {leads.filter(l=>l.status!=="cold").map(l=><option key={l.id} value={l.id}>{l.name} — {l.agency} ({l.area})</option>)}
          </select>
          <Lbl>Sequence Step</Lbl>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22}}>
            {seqs.map((seq,i)=>{
              const has=lead&&drafts.some(d=>d.leadId===lead.id&&d.emailIndex===i&&d.status==="approved");
              return (
                <div key={i} onClick={()=>{setEi(i);setDraft(null);}} style={{padding:"12px 14px",borderRadius:8,cursor:"pointer",border:`1px solid ${ei===i?G:BO}`,background:ei===i?G+"12":CA,transition:"all .15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:12,fontWeight:700,color:ei===i?G:MU}}>{seq.label}</div>
                    {has&&<span style={{fontSize:10,background:"#22C55E22",color:"#22C55E",border:"1px solid #22C55E44",padding:"2px 8px",borderRadius:10}}>approved</span>}
                  </div>
                  <div style={{fontSize:11,color:DI,marginTop:2}}>Day {seq.delay} · {seq.subject.replace("{{name}}",lead?.name||"Name").replace("{{area}}",lead?.area||"Area")}</div>
                </div>
              );
            })}
          </div>
          <Btn onClick={gen} disabled={!lid||loading} s={{width:"100%",padding:12}}>{loading?"Writing email...":"✦ Generate Email"}</Btn>
        </div>

        <div>
          <Lbl>Draft</Lbl>
          {loading&&<Card style={{padding:40,textAlign:"center"}}><div style={{color:G,fontSize:13,marginBottom:6}}>Crafting your email...</div><div style={{fontSize:12,color:DI}}>Writing a personalised message in your voice</div></Card>}
          {!loading&&!draft&&<Card style={{padding:40,textAlign:"center",border:`1px dashed ${BO}`}}><div style={{color:DI,fontSize:13}}>{existing?"↑ Draft exists for this slot — generate to replace":"Draft will appear here"}</div></Card>}
          {!loading&&draft&&(
            <Card style={{padding:18,border:`1px solid ${G}`}}>
              <Lbl>Subject</Lbl>
              <input value={draft.subject} onChange={e=>setDraft(p=>({...p,subject:e.target.value}))} style={{...IS,marginBottom:14}}/>
              <Lbl>Body</Lbl>
              <textarea value={draft.body} onChange={e=>setDraft(p=>({...p,body:e.target.value}))} rows={mob?8:11} style={{...IS,resize:"vertical",lineHeight:1.75}}/>
              <div style={{display:"flex",gap:8,marginTop:14}}>
                <Btn onClick={approve} s={{flex:1}}>✓ Approve Draft</Btn>
                <Btn onClick={gen} v="ghost" s={{flex:1}}>Regenerate</Btn>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Drafts ───────────────────────────────────────────────────────────────────
function Drafts({drafts,leads,seqs,onSent,onDel}) {
  const ready=drafts.filter(d=>d.status==="approved");
  const sent=[...drafts.filter(d=>d.status==="sent")].reverse();

  const copy=d=>navigator.clipboard?.writeText(`Subject: ${d.subject}\n\n${d.body}`);

  const openGmail=d=>{
    const lead=leads.find(l=>l.id===d.leadId);
    const to=lead?.email||"";
    const url=`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`;
    window.open(url,"_blank");
  };

  const openGmailScheduled=d=>{
    // Opens Gmail compose — user can use Gmail's built-in Schedule Send
    const lead=leads.find(l=>l.id===d.leadId);
    const to=lead?.email||"";
    const url=`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`;
    window.open(url,"_blank");
  };

  // Follow-up due: find sent Email 1/2 where the next email is due but no draft exists yet
  const followUpsDue=leads.filter(l=>{
    if(!["e1","e2"].includes(l.status)) return false;
    const sentDraft=drafts.find(d=>d.leadId===l.id&&d.status==="sent"&&EMAP[d.emailIndex]===l.status);
    if(!sentDraft?.sentAt) return false;
    const nextDelay=seqs[l.status==="e1"?1:2]?.delay||3;
    const dueDate=new Date(sentDraft.sentAt);
    dueDate.setDate(dueDate.getDate()+nextDelay);
    return new Date()>=dueDate;
  });

  return (
    <div>
      {/* Follow-ups due */}
      {followUpsDue.length>0&&(
        <>
          <div style={{background:"#2A1F08",border:"1px solid #8A6A20",borderRadius:10,padding:"12px 16px",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"#F59E0B",marginBottom:8}}>⏰ Follow-ups due ({followUpsDue.length})</div>
            {followUpsDue.map(l=>{
              const nextIdx=l.status==="e1"?1:2;
              return (
                <div key={l.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:"1px solid #3A2A10",fontSize:13}}>
                  <span style={{color:TX}}>{l.name} — {seqs[nextIdx]?.label}</span>
                  <span style={{fontSize:11,color:"#F59E0B",background:"#F59E0B22",border:"1px solid #F59E0B44",padding:"2px 8px",borderRadius:10}}>Due now</span>
                </div>
              );
            })}
            <div style={{fontSize:12,color:MU,marginTop:8}}>Go to AI Studio → select lead → generate the next email in the sequence.</div>
          </div>
        </>
      )}

      <SH sub={ready.length>0?`${ready.length} email${ready.length!==1?"s":""} ready to send`:"All caught up"}>Approved Drafts</SH>
      {ready.length===0&&<Empty text="No approved drafts yet. Go to AI Studio to generate and approve emails."/>}
      {ready.map(d=>{
        const lead=leads.find(l=>l.id===d.leadId);
        const seq=seqs[d.emailIndex];
        const hasEmail=!!(lead?.email);
        const nextSeq=seqs[d.emailIndex+1];
        return (
          <Card key={d.id} style={{padding:18,marginBottom:14,border:"1px solid #22C55E44"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8}}>
              <div>
                <div style={{fontWeight:600,fontSize:14,marginBottom:3}}>{d.leadName}</div>
                <div style={{fontSize:12,color:MU}}>{seq?.label} · {lead?.agency}</div>
              </div>
              <span style={{background:"#22C55E22",color:"#22C55E",border:"1px solid #22C55E44",padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>Ready</span>
            </div>

            <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Subject: {d.subject}</div>
            <div style={{background:"#090D14",border:`1px solid ${BO}`,borderRadius:8,padding:"12px 14px",fontSize:13,color:MU,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:12}}>{d.body}</div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:12,color:DI}}>To: {lead?.email||"⚠ no email saved"} · {lead?.area}</div>
              {nextSeq&&<div style={{fontSize:11,color:DI}}>Follow-up in {nextSeq.delay-(seq?.delay||0)} days</div>}
            </div>

            {/* Primary action — Open in Gmail */}
            {hasEmail ? (
              <button onClick={()=>openGmail(d)} style={{width:"100%",background:G,border:"none",color:BG,padding:"11px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10,letterSpacing:.3}}>
                ↗ Open in Gmail — ready to send
              </button>
            ) : (
              <div style={{background:"#2A1A0A",border:"1px solid #8A5A20",borderRadius:8,padding:"10px 12px",fontSize:12,color:"#F59E0B",marginBottom:10}}>
                No email address saved for this lead — add it in the Leads tab first.
              </div>
            )}

            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Btn onClick={()=>onSent(d.id)} v="soft" s={{fontSize:12,padding:"8px 14px",flex:1}}>✓ Mark as Sent</Btn>
              <Btn onClick={()=>copy(d)} v="ghost" s={{fontSize:12,padding:"8px 14px"}}>Copy</Btn>
              <Btn onClick={()=>onDel(d.id)} v="red" s={{fontSize:12,padding:"8px 14px"}}>Delete</Btn>
            </div>

            <div style={{fontSize:11,color:DI,marginTop:10,lineHeight:1.6}}>
              💡 After opening Gmail: use <strong style={{color:MU}}>Schedule Send</strong> (arrow next to Send button) to schedule follow-ups automatically.
            </div>
          </Card>
        );
      })}

      {sent.length>0&&(
        <>
          <SH sub={`${sent.length} sent`} style={{marginTop:32}}>Sent History</SH>
          {sent.map(d=>{
            const seq=seqs[d.emailIndex];
            const nextSeq=seqs[d.emailIndex+1];
            const dueDate=nextSeq&&d.sentAt ? (() => { const dt=new Date(d.sentAt); dt.setDate(dt.getDate()+nextSeq.delay); return dt; })() : null;
            const isDue=dueDate&&new Date()>=dueDate;
            return (
              <Card key={d.id} style={{padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                <Av name={d.leadName} size={30}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{d.leadName}</div>
                  <div style={{fontSize:12,color:MU}}>{seq?.label}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:DI,marginBottom:3}}>{fmt(d.sentAt)}</div>
                  {dueDate&&<div style={{fontSize:11,color:isDue?"#F59E0B":DI}}>{isDue?"⏰ Follow-up due":fmt(dueDate.toISOString())+" follow-up"}</div>}
                </div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─── WhatsApp Tracker ─────────────────────────────────────────────────────────
function WhatsApp({leads,logs,onLog}) {
  const [lid,setLid]=useState("");
  const [msg,setMsg]=useState("");
  const [dir,setDir]=useState("out");
  const [fu,setFu]=useState("");
  const submit=()=>{
    if(!lid||!msg)return;
    onLog({leadId:lid,leadName:leads.find(l=>l.id===lid)?.name||"",message:msg,direction:dir,followUp:fu});
    setMsg("");setFu("");
  };
  const leadLogs=[...logs.filter(l=>l.leadId===lid)].reverse();
  return (
    <div>
      <SH sub="Log every WhatsApp touchpoint and set follow-up reminders">WhatsApp Tracker</SH>
      <Card style={{padding:18,marginBottom:24}}>
        <Lbl>Lead</Lbl>
        <select value={lid} onChange={e=>setLid(e.target.value)} style={{...IS,display:"block",marginBottom:14}}>
          <option value="">Select lead...</option>
          {leads.map(l=><option key={l.id} value={l.id}>{l.name} — {l.agency}</option>)}
        </select>
        <Lbl>Direction</Lbl>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[{k:"out",l:"Sent by me"},{k:"in",l:"Received"}].map(d=>(
            <button key={d.k} onClick={()=>setDir(d.k)} style={{flex:1,background:dir===d.k?G+"1A":"transparent",border:`1px solid ${dir===d.k?G+"44":BO}`,color:dir===d.k?G:MU,padding:9,borderRadius:8,fontSize:13,cursor:"pointer"}}>{d.l}</button>
          ))}
        </div>
        <Lbl>Message Summary</Lbl>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} placeholder="e.g. Sent intro message with pricing link, they left on read..." style={{...IS,resize:"vertical",marginBottom:14}}/>
        <Lbl>Follow-up Date (optional)</Lbl>
        <input type="date" value={fu} onChange={e=>setFu(e.target.value)} style={{...IS,marginBottom:16}}/>
        <Btn onClick={submit} disabled={!lid||!msg} s={{width:"100%"}}>Log Message</Btn>
      </Card>
      {lid&&leadLogs.length>0&&(
        <>
          <SH sub="History for selected lead">Activity</SH>
          {leadLogs.map(l=>(
            <Card key={l.id} style={{padding:"12px 14px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{background:l.direction==="out"?G+"22":"#3B82F622",color:l.direction==="out"?G:"#3B82F6",border:`1px solid ${l.direction==="out"?G+"44":"#3B82F644"}`,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{l.direction==="out"?"Sent":"Received"}</span>
                <span style={{fontSize:11,color:DI}}>{fmt(l.at)}</span>
              </div>
              <div style={{fontSize:13,color:TX,lineHeight:1.6,marginBottom:l.followUp?6:0}}>{l.message}</div>
              {l.followUp&&<div style={{fontSize:12,color:"#F59E0B",marginTop:4}}>⏰ Follow up: {fmt(l.followUp)}</div>}
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Sequences ────────────────────────────────────────────────────────────────
function Sequences({seqs,onSave}) {
  const [local,setLocal]=useState(seqs);
  const up=(i,k,v)=>setLocal(p=>p.map((s,idx)=>idx===i?{...s,[k]:v}:s));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <SH style={{marginBottom:0}}>Email Sequences</SH>
        <Btn onClick={()=>onSave(local)}>Save Changes</Btn>
      </div>
      <div style={{fontSize:13,color:MU,marginBottom:22}}>Use {`{{name}}`} and {`{{area}}`} as placeholders — AI replaces them with real lead data.</div>
      {local.map((seq,i)=>(
        <Card key={i} style={{padding:18,marginBottom:14}}>
          <div style={{display:"inline-block",background:G+"1A",border:`1px solid ${G}44`,color:G,padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,marginBottom:14}}>{seq.label}</div>
          <Lbl>Subject Template</Lbl>
          <input value={seq.subject} onChange={e=>up(i,"subject",e.target.value)} style={{...IS,marginBottom:14}}/>
          <Lbl>AI Writing Instruction</Lbl>
          <textarea value={seq.hint} onChange={e=>up(i,"hint",e.target.value)} rows={2} style={{...IS,resize:"vertical"}}/>
        </Card>
      ))}
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function Settings({apiKey,onSave}) {
  const [k,setK]=useState(apiKey);
  const [show,setShow]=useState(false);
  return (
    <div>
      <SH sub="Configure your Anthropic API key for AI email generation">Settings</SH>
      <Card style={{padding:20,marginBottom:14}}>
        <Lbl>Anthropic API Key</Lbl>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input type={show?"text":"password"} value={k} onChange={e=>setK(e.target.value)} placeholder="sk-ant-..." style={{...IS,flex:1,fontFamily:"monospace",fontSize:13}}/>
          <Btn onClick={()=>setShow(p=>!p)} v="ghost" s={{padding:"10px 14px",flexShrink:0,fontSize:12}}>{show?"Hide":"Show"}</Btn>
        </div>
        <div style={{fontSize:12,color:DI,marginBottom:16,lineHeight:1.7}}>
          Get your key at <span style={{color:G}}>console.anthropic.com → API Keys</span>. Stored locally on your device only — never sent anywhere except Anthropic.
        </div>
        <Btn onClick={()=>onSave(k)} s={{width:"100%"}}>Save API Key</Btn>
      </Card>
      <Card style={{padding:"14px 16px",border:"1px solid #22C55E33"}}>
        <div style={{fontSize:13,fontWeight:600,color:"#22C55E",marginBottom:6}}>Note for the deployed version</div>
        <div style={{fontSize:13,color:MU,lineHeight:1.7}}>The key is stored in your browser's localStorage — only accessible on your own device. For extra security you can set up a Cloudflare Worker proxy (instructions in the deployment guide).</div>
      </Card>
    </div>
  );
}

// ─── Add Lead Modal ────────────────────────────────────────────────────────────
function AddModal({onAdd,onClose,mob}) {
  const [f,setF]=useState({name:"",agency:"",email:"",phone:"",area:"",instagram:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const FIELDS=[{k:"name",l:"Full Name *",p:"e.g. Sarah Naidoo"},{k:"agency",l:"Agency",p:"e.g. Seeff Properties"},{k:"email",l:"Email Address",p:"sarah@seeff.co.za"},{k:"phone",l:"Phone / WhatsApp",p:"+27 82 000 0000"},{k:"area",l:"Area",p:"e.g. Umhlanga, Ballito"},{k:"instagram",l:"Instagram",p:"@sarahnaidoo"}];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:300,display:"flex",alignItems:mob?"flex-end":"center",justifyContent:"center"}}>
      <div style={{background:CA,border:`1px solid ${BO}`,borderRadius:mob?"16px 16px 0 0":"14px",padding:24,width:"100%",maxWidth:mob?"100%":460,maxHeight:"90vh",overflowY:"auto"}}>
        {mob&&<div style={{width:40,height:4,background:BO,borderRadius:2,margin:"0 auto 20px"}}/>}
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:600,marginBottom:20}}>Add New Lead</div>
        {FIELDS.map(({k,l,p})=>(
          <div key={k} style={{marginBottom:13}}>
            <Lbl>{l}</Lbl>
            <input value={f[k]} onChange={e=>set(k,e.target.value)} placeholder={p} style={IS}/>
          </div>
        ))}
        <div style={{marginBottom:20}}>
          <Lbl>Notes</Lbl>
          <textarea value={f.notes} onChange={e=>set("notes",e.target.value)} rows={3} placeholder="e.g. Active on Instagram, posts luxury listings, Ballito specialist" style={{...IS,resize:"vertical"}}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn onClick={()=>f.name&&onAdd(f)} s={{flex:1}}>Add Lead</Btn>
          <Btn onClick={onClose} v="ghost" s={{flex:1}}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}
