import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }  from "../context/AuthContext";
import { useApp }   from "../context/AppContext";
import { tripsAPI, PACKING_DEFAULTS, ACTIVITIES_LIST, CURATED_CITIES } from "../services/api";
import { C, FONT_SERIF, card, btnPrimary, btnOutline, inp, lbl } from "../constants/theme";
import { fmt, fmtD, days } from "../utils/helpers";
import { toast } from "../components/common/Toast";

// ── Create Trip Modal ─────────────────────────────────────────
function CreateTripModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name:"", startDate:"", endDate:"", budget:"", description:"", coverUrl:"" });
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);
  const suggestedCovers = [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    "https://images.unsplash.com/photo-1549693578-d683be217e58?w=600&q=80",
  ];
  const submit = async () => {
    if(!form.name||!form.startDate||!form.endDate){setErr("Name and dates are required");return;}
    if(new Date(form.endDate)<new Date(form.startDate)){setErr("End date must be after start date");return;}
    setLoading(true);
    try{
      const trip={id:Date.now(),...form,budget:parseFloat(form.budget)||0,stops:[],notes:[],checklist:[...PACKING_DEFAULTS.map(p=>({...p,id:`p_${Date.now()}_${p.id}`}))]};
      const created = await tripsAPI.create(trip);
      onCreated(created);
      toast(`✅ "${created.name}" created!`);
    }catch(e){
      setErr(e.message || "Failed to create trip. The backend may be offline.");
    }finally{setLoading(false);}
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{...card,padding:"32px",width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 28px 70px rgba(0,0,0,.22)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:FONT_SERIF}}>Plan New Trip ✈️</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.textMuted}}>×</button>
        </div>
        <div style={{marginBottom:16}}><label style={lbl}>Trip Name *</label><input style={inp} placeholder="e.g. Europe Summer Adventure" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
          <div><label style={lbl}>Start Date *</label><input style={inp} type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></div>
          <div><label style={lbl}>End Date *</label><input style={inp} type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/></div>
        </div>
        <div style={{marginBottom:16}}><label style={lbl}>Budget (USD)</label><input style={inp} type="number" placeholder="3000" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/></div>
        <div style={{marginBottom:16}}><label style={lbl}>Description</label><textarea style={{...inp,height:72,resize:"vertical"}} placeholder="What's this trip about?" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
        <div style={{marginBottom:20}}>
          <label style={lbl}>Cover Photo</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {suggestedCovers.map((url,i)=>(
              <div key={i} onClick={()=>setForm(f=>({...f,coverUrl:url}))} style={{height:70,borderRadius:10,overflow:"hidden",cursor:"pointer",border:`3px solid ${form.coverUrl===url?C.sky:"transparent"}`,transition:"all .2s"}}>
                <img src={url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
            ))}
          </div>
        </div>
        {err&&<div style={{background:C.dangerLight,color:C.danger,padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:16}}>{err}</div>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={submit} disabled={loading} style={{...btnPrimary,flex:1,padding:"13px",fontSize:14,borderRadius:10,opacity:loading?.75:1}}>{loading?"Creating…":"Create Trip →"}</button>
          <button onClick={onClose} style={{background:"#fff",color:C.textSub,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"13px 20px",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Trip Card ─────────────────────────────────────────────────
function TripCard({ trip, onEdit, onDelete, onView, onBudget, onPacking }) {
  const now    = new Date();
  const isPast = new Date(trip.endDate) < now;
  const cover  = trip.coverUrl || trip.stops?.[0]?.city?.img || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80";
  const d      = trip.startDate&&trip.endDate ? days(trip.startDate,trip.endDate) : 0;
  return(
    <div style={{...card,display:"flex",overflow:"hidden",transition:"box-shadow .2s"}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.12)"}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
      <div style={{width:190,flexShrink:0,position:"relative"}}>
        <img src={cover} alt={trip.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        {isPast&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.38)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{color:"#fff",fontWeight:700,fontSize:12,background:"rgba(0,0,0,.5)",padding:"4px 10px",borderRadius:8}}>Completed</span>
        </div>}
      </div>
      <div style={{flex:1,padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
            <h3 style={{fontSize:17,fontWeight:700,color:C.text}}>{trip.name}</h3>
            <span style={{background:isPast?"#e0e7ef":C.skyLight,color:isPast?"#5a7080":C.sky,fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:10}}>{isPast?"Past":"Upcoming"}</span>
          </div>
          <p style={{fontSize:13,color:C.textMuted,marginBottom:10}}>{fmtD(trip.startDate)} – {fmtD(trip.endDate)}{d>0?` · ${d} days`:""}</p>
          {trip.description&&<p style={{fontSize:12,color:C.textSub,marginBottom:10,lineHeight:1.5,maxWidth:500}}>{trip.description}</p>}
          {trip.stops?.length>0&&(
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {trip.stops.map((s,i)=>(
                <span key={i} style={{background:C.skyLight,color:C.skyDark,fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:10}}>
                  {s.city?.name||s.cityName}
                </span>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>onEdit(trip)} style={{...btnPrimary,padding:"7px 16px",fontSize:12,borderRadius:8}}>✏️ Build Itinerary</button>
            <button onClick={()=>onView(trip)} style={{background:"#fff",color:C.sky,border:`1.5px solid ${C.sky}`,borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>👁 View</button>
            <button onClick={()=>onBudget(trip)} style={{background:"#fff7ed",color:C.warning,border:`1.5px solid #f5a623`,borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>💰 Budget</button>
            <button onClick={()=>onPacking(trip)} style={{background:C.skyLight,color:C.sky,border:`1.5px solid ${C.sky}`,borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🧳 Packing</button>
            <button onClick={()=>onDelete(trip.id)} style={{background:C.dangerLight,color:C.danger,border:`1.5px solid ${C.danger}`,borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🗑 Delete</button>
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0,marginLeft:16}}>
          <div style={{fontSize:22,fontWeight:800,color:C.sky}}>{fmt(trip.budget)}</div>
          <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>budget</div>
          <div style={{fontSize:13,color:C.textSub,marginTop:6,fontWeight:600}}>{trip.stops?.length||0} cities</div>
        </div>
      </div>
    </div>
  );
}

// ── Itinerary Builder ─────────────────────────────────────────
function ItineraryBuilder({ trip, onUpdate, onBack, onSubView }) {
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showActPicker, setShowActPicker]   = useState(null);
  const [citySearch, setCitySearch]         = useState("");
  const [actSearch, setActSearch]           = useState("");
  const [actType, setActType]               = useState("all");

  const addStop = (city) => {
    onUpdate({...trip,stops:[...(trip.stops||[]),{id:Date.now(),city,cityName:city.name,days:3,activities:[]}]});
    setShowCityPicker(false);
  };
  const removeStop = (id) => onUpdate({...trip,stops:trip.stops.filter(s=>s.id!==id)});
  const moveStop = (idx,dir) => {
    const s=[...trip.stops]; const t=idx+dir;
    if(t<0||t>=s.length)return;
    [s[idx],s[t]]=[s[t],s[idx]];
    onUpdate({...trip,stops:s});
  };
  const setDays = (id,d) => onUpdate({...trip,stops:trip.stops.map(s=>s.id===id?{...s,days:parseInt(d)||1}:s)});
  const addAct  = (stopId,act) => onUpdate({...trip,stops:trip.stops.map(s=>s.id===stopId?{...s,activities:[...(s.activities||[]),{...act,uid:Date.now()}]}:s)});
  const rmAct   = (stopId,uid) => onUpdate({...trip,stops:trip.stops.map(s=>s.id===stopId?{...s,activities:s.activities.filter(a=>a.uid!==uid)}:s)});

  const filteredCities = CURATED_CITIES.filter(c=>c.name.toLowerCase().includes(citySearch.toLowerCase())||c.country.toLowerCase().includes(citySearch.toLowerCase()));
  const filteredActs   = ACTIVITIES_LIST.filter(a=>(actType==="all"||a.type===actType)&&a.name.toLowerCase().includes(actSearch.toLowerCase()));
  const actTypes       = ["all","sightseeing","food","culture","adventure","leisure"];

  return(
    <div style={{minHeight:"100vh",background:C.bg,paddingTop:64}}>
      <div style={{position:"relative",height:180,overflow:"hidden"}}>
        <img src={trip.coverUrl||"https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=85"} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(10,25,45,.65)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 60px"}}>
          <div>
            <button onClick={onBack} style={{color:"rgba(255,255,255,.75)",background:"none",border:"none",cursor:"pointer",fontSize:14,marginBottom:8,fontFamily:"inherit"}}>← My Trips</button>
            <h1 style={{fontSize:28,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF}}>{trip.name}</h1>
            <p style={{color:"rgba(255,255,255,.72)",fontSize:13,marginTop:4}}>{fmtD(trip.startDate)} – {fmtD(trip.endDate)} · {fmt(trip.budget)} budget</p>
          </div>
          <div style={{display:"flex",gap:10}}>
            {[{s:"budget",l:"💰 Budget"},{s:"packing",l:"🧳 Packing"},{s:"notes",l:"📓 Notes"}].map(b=>(
              <button key={b.s} onClick={()=>onSubView(b.s)} style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"1.5px solid rgba(255,255,255,.4)",borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{b.l}</button>
            ))}
            <button onClick={()=>setShowCityPicker(true)} style={{...btnPrimary,borderRadius:9}}>+ Add City</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 48px"}}>
        {(!trip.stops||trip.stops.length===0)?(
          <div style={{...card,padding:"60px 40px",textAlign:"center"}}>
            <div style={{fontSize:56,marginBottom:16}}>📍</div>
            <h3 style={{fontSize:20,color:C.text,fontFamily:FONT_SERIF,marginBottom:8}}>Add your first destination</h3>
            <p style={{color:C.textMuted,marginBottom:20,fontSize:14}}>Search and add cities to build your itinerary</p>
            <button onClick={()=>setShowCityPicker(true)} style={{...btnPrimary,padding:"12px 28px",fontSize:14,borderRadius:10}}>+ Add City</button>
          </div>
        ):(
          <div style={{display:"grid",gap:16}}>
            {trip.stops.map((stop,idx)=>(
              <div key={stop.id} style={{...card,padding:"22px 26px",borderLeft:`4px solid ${C.sky}`}}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14}}>
                  {stop.city?.img&&<img src={stop.city.img} alt="" style={{width:72,height:72,borderRadius:10,objectFit:"cover",flexShrink:0}}/>}
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                      <span style={{background:C.sky,color:"#fff",borderRadius:"50%",width:26,height:26,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700}}>{idx+1}</span>
                      <h3 style={{fontSize:18,fontWeight:700,color:C.text}}>{stop.city?.name||stop.cityName}</h3>
                      <span style={{fontSize:13,color:C.textMuted}}>{stop.city?.country}</span>
                    </div>
                    <div style={{fontSize:12,color:C.textMuted}}>~${stop.city?.costIndex||0}/day estimated</div>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      <button onClick={()=>moveStop(idx,-1)} disabled={idx===0} style={{background:C.sky,color:"#fff",border:"none",borderRadius:4,padding:"3px 9px",cursor:"pointer",opacity:idx===0?.35:1,fontSize:11,fontFamily:"inherit"}}>▲</button>
                      <button onClick={()=>moveStop(idx,1)} disabled={idx===trip.stops.length-1} style={{background:C.sky,color:"#fff",border:"none",borderRadius:4,padding:"3px 9px",cursor:"pointer",opacity:idx===trip.stops.length-1?.35:1,fontSize:11,fontFamily:"inherit"}}>▼</button>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,color:C.textSub,fontWeight:600}}>Days:</span>
                      <input type="number" min="1" max="30" value={stop.days} onChange={e=>setDays(stop.id,e.target.value)} style={{...inp,width:64,padding:"6px 8px",textAlign:"center"}}/>
                    </div>
                    <button onClick={()=>removeStop(stop.id)} style={{background:C.dangerLight,color:C.danger,border:`1.5px solid ${C.danger}`,borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>
                  </div>
                </div>
                {(stop.activities||[]).length>0&&(
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                    {stop.activities.map(act=>(
                      <div key={act.uid} style={{display:"flex",alignItems:"center",gap:6,background:C.skyLight,borderRadius:20,padding:"5px 12px 5px 10px",fontSize:13}}>
                        <span>{act.icon}</span>
                        <span style={{fontWeight:500}}>{act.name}</span>
                        <span style={{color:C.sky,fontWeight:700}}>${act.cost}</span>
                        <span onClick={()=>rmAct(stop.id,act.uid)} style={{cursor:"pointer",color:C.textMuted,fontSize:16,marginLeft:2}}>×</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,color:C.textMuted}}>
                    {(stop.activities||[]).length} activities · <strong style={{color:C.sky}}>{fmt((stop.activities||[]).reduce((a,ac)=>a+ac.cost,0))}</strong> total
                  </span>
                  <button onClick={()=>setShowActPicker(stop.id)} style={{...btnPrimary,padding:"7px 16px",fontSize:12,borderRadius:8}}>+ Add Activities</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* City Picker Modal */}
      {showCityPicker&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{...card,padding:"24px",width:"100%",maxWidth:560,maxHeight:"80vh",overflow:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.22)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:700,color:C.text}}>Choose a City 📍</h2>
              <button onClick={()=>setShowCityPicker(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.textMuted}}>×</button>
            </div>
            <input style={{...inp,marginBottom:14}} placeholder="Search cities…" value={citySearch} onChange={e=>setCitySearch(e.target.value)} autoFocus/>
            <div style={{display:"grid",gap:10}}>
              {filteredCities.filter(c=>!trip.stops?.find(s=>s.city?.id===c.id)).map(city=>(
                <div key={city.id} onClick={()=>addStop(city)} style={{display:"flex",gap:12,alignItems:"center",padding:"12px 14px",border:`1px solid ${C.border}`,borderRadius:12,cursor:"pointer",transition:"all .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.skyLight}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <img src={city.img} alt="" style={{width:50,height:50,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:C.text}}>{city.name}</div>
                    <div style={{fontSize:12,color:C.textMuted}}>{city.country} · ~${city.costIndex}/day</div>
                  </div>
                  <span style={{background:C.skyLight,color:C.sky,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:10}}>Add</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Picker Modal */}
      {showActPicker&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{...card,padding:"24px",width:"100%",maxWidth:560,maxHeight:"80vh",overflow:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.22)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:700,color:C.text}}>Add Activities 🎯</h2>
              <button onClick={()=>setShowActPicker(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.textMuted}}>×</button>
            </div>
            <input style={{...inp,marginBottom:12}} placeholder="Search activities…" value={actSearch} onChange={e=>setActSearch(e.target.value)}/>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {actTypes.map(t=>(
                <button key={t} onClick={()=>setActType(t)} style={{background:actType===t?C.sky:C.bg,color:actType===t?"#fff":C.textSub,border:`1px solid ${actType===t?C.sky:C.border}`,borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>{t}</button>
              ))}
            </div>
            <div style={{display:"grid",gap:10}}>
              {filteredActs.map(act=>{
                const stopActs = trip.stops?.find(s=>s.id===showActPicker)?.activities||[];
                const added    = stopActs.some(a=>a.id===act.id);
                return(
                  <div key={act.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",border:`1px solid ${C.border}`,borderRadius:10}}>
                    <span style={{fontSize:22}}>{act.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13,color:C.text}}>{act.name}</div>
                      <div style={{fontSize:11,color:C.textMuted,textTransform:"capitalize"}}>{act.type} · {act.duration}h</div>
                    </div>
                    <span style={{fontSize:14,fontWeight:800,color:C.sky}}>{act.cost===0?"Free":`$${act.cost}`}</span>
                    <button onClick={()=>{if(!added)addAct(showActPicker,act);}} disabled={added} style={{...btnPrimary,padding:"6px 14px",fontSize:12,borderRadius:8,opacity:added?.55:1,cursor:added?"not-allowed":"pointer"}}>{added?"Added":"+ Add"}</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Budget View ───────────────────────────────────────────────
function BudgetView({ trip, onBack }) {
  const stops      = trip.stops||[];
  const totalBudget= trip.budget||0;
  const actCost    = stops.reduce((a,s)=>a+(s.activities||[]).reduce((b,ac)=>b+ac.cost,0),0);
  const transport  = stops.length>1?(stops.length-1)*250:0;
  const stay       = stops.reduce((a,s)=>a+(s.days||0)*80,0);
  const meals      = stops.reduce((a,s)=>a+(s.days||0)*40,0);
  const total      = actCost+transport+stay+meals;
  const over       = total>totalBudget;
  const cats       = [
    {l:"Activities",v:actCost,  c:C.sky,     i:"🎯"},
    {l:"Transport", v:transport,c:"#e07b39",  i:"✈️"},
    {l:"Stay",      v:stay,     c:"#7b5ea7",  i:"🏨"},
    {l:"Meals",     v:meals,    c:"#2e9e6b",  i:"🍽️"},
  ];
  return(
    <div style={{minHeight:"100vh",background:C.bg,paddingTop:64}}>
      <div style={{position:"relative",height:160,overflow:"hidden"}}>
        <img src={trip.coverUrl||"https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=85"} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(10,25,45,.65)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",padding:"0 60px"}}>
          <div>
            <button onClick={onBack} style={{color:"rgba(255,255,255,.75)",background:"none",border:"none",cursor:"pointer",fontSize:14,marginBottom:8,fontFamily:"inherit"}}>← Back to Trip</button>
            <h1 style={{fontSize:26,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF}}>Budget & Cost Breakdown 💰</h1>
          </div>
        </div>
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:"32px 48px"}}>
        <div style={{...card,padding:"28px 32px",background:over?C.dangerLight:C.skyLight,border:`1px solid ${over?"#f5c6c6":C.border}`,marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,color:over?C.danger:C.skyDark,fontWeight:600,marginBottom:4}}>Estimated Total</div>
              <div style={{fontSize:44,fontWeight:800,color:over?C.danger:C.sky}}>{fmt(total)}</div>
              <div style={{fontSize:13,color:C.textSub,marginTop:4}}>of {fmt(totalBudget)} budget</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:13,color:C.textSub,marginBottom:4}}>Remaining</div>
              <div style={{fontSize:32,fontWeight:800,color:over?C.danger:"#2e9e6b"}}>{over?"-":"+"}{fmt(Math.abs(totalBudget-total))}</div>
              {over&&<span style={{background:C.dangerLight,color:C.danger,fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:10}}>⚠️ Over Budget</span>}
            </div>
          </div>
          <div style={{marginTop:16,background:"rgba(255,255,255,.5)",borderRadius:8,height:12,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(100,(total/(totalBudget||1))*100)}%`,background:over?C.danger:C.sky,borderRadius:8,transition:"width .6s"}}/>
          </div>
          <div style={{fontSize:12,color:C.textSub,marginTop:6}}>{Math.round((total/(totalBudget||1))*100)}% of budget used</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
          {cats.map(cat=>(
            <div key={cat.l} style={{...card,padding:"18px 16px",textAlign:"center",borderTop:`3px solid ${cat.c}`}}>
              <span style={{fontSize:24}}>{cat.i}</span>
              <div style={{fontSize:20,fontWeight:800,color:cat.c,margin:"8px 0 4px"}}>{fmt(cat.v)}</div>
              <div style={{fontSize:12,color:C.textMuted}}>{cat.l}</div>
              <div style={{marginTop:10,background:C.bg,borderRadius:6,height:6}}>
                <div style={{height:"100%",width:total?`${Math.round(cat.v/total*100)}%`:"0%",background:cat.c,borderRadius:6}}/>
              </div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:4}}>{total?Math.round(cat.v/total*100):0}%</div>
            </div>
          ))}
        </div>
        {stops.map(stop=>{
          const ac=(stop.activities||[]).reduce((a,ac)=>a+ac.cost,0);
          const st=(stop.days||0)*80;const ml=(stop.days||0)*40;const tot=ac+st+ml;
          return(
            <div key={stop.id} style={{...card,padding:"16px 20px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {stop.city?.img&&<img src={stop.city.img} alt="" style={{width:40,height:40,borderRadius:8,objectFit:"cover"}}/>}
                  <span style={{fontWeight:700,fontSize:15,color:C.text}}>{stop.city?.name||stop.cityName}</span>
                </div>
                <span style={{fontWeight:800,fontSize:16,color:C.sky}}>{fmt(tot)}</span>
              </div>
              <div style={{background:C.bg,borderRadius:6,height:8,marginBottom:8}}>
                <div style={{height:"100%",width:totalBudget?`${Math.min(100,Math.round(tot/totalBudget*100))}%`:"0%",background:C.sky,borderRadius:6}}/>
              </div>
              <div style={{display:"flex",gap:16,fontSize:12,color:C.textMuted}}>
                <span>Activities: {fmt(ac)}</span><span>Stay: {fmt(st)}</span><span>Meals: {fmt(ml)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Packing View ──────────────────────────────────────────────
function PackingView({ trip, onUpdate, onBack }) {
  const checklist  = trip.checklist||[];
  const [newItem, setNewItem] = useState("");
  const [newCat,  setNewCat]  = useState("clothing");
  const cats = ["documents","clothing","electronics","toiletries","misc"];
  const catEmoji = {documents:"📄",clothing:"👕",electronics:"💻",toiletries:"🧴",misc:"📦"};
  const toggle = id => onUpdate({...trip,checklist:checklist.map(i=>i.id===id?{...i,packed:!i.packed}:i)});
  const add    = () => {if(!newItem.trim())return;onUpdate({...trip,checklist:[...checklist,{id:`c_${Date.now()}`,item:newItem.trim(),cat:newCat,packed:false}]});setNewItem("");};
  const remove = id => onUpdate({...trip,checklist:checklist.filter(i=>i.id!==id)});
  const packed = checklist.filter(i=>i.packed).length;
  return(
    <div style={{minHeight:"100vh",background:C.bg,paddingTop:64}}>
      <div style={{position:"relative",height:160,overflow:"hidden"}}>
        <img src="https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=1600&q=85" alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(10,25,45,.65)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 60px"}}>
          <div>
            <button onClick={onBack} style={{color:"rgba(255,255,255,.75)",background:"none",border:"none",cursor:"pointer",fontSize:14,marginBottom:8,fontFamily:"inherit"}}>← Back to Trip</button>
            <h1 style={{fontSize:26,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF}}>🧳 Packing Checklist</h1>
          </div>
          <button onClick={()=>onUpdate({...trip,checklist:PACKING_DEFAULTS.map(p=>({...p}))})} style={{background:"rgba(255,255,255,.18)",color:"#fff",border:"1px solid rgba(255,255,255,.4)",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Reset All</button>
        </div>
      </div>
      <div style={{maxWidth:700,margin:"0 auto",padding:"32px 48px"}}>
        <div style={{...card,padding:"18px 22px",background:C.skyLight,marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontWeight:600,color:C.skyDark,fontSize:14}}>Packing Progress</span>
            <span style={{fontWeight:700,color:C.sky,fontSize:14}}>{packed}/{checklist.length} packed</span>
          </div>
          <div style={{background:"rgba(255,255,255,.6)",borderRadius:8,height:12}}>
            <div style={{height:"100%",width:checklist.length?`${(packed/checklist.length)*100}%`:"0%",background:C.sky,borderRadius:8,transition:"width .3s"}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:24}}>
          <input style={{...inp,flex:1}} placeholder="Add new item…" value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}/>
          <select style={{...inp,width:130}} value={newCat} onChange={e=>setNewCat(e.target.value)}>
            {cats.map(c=><option key={c} value={c}>{catEmoji[c]} {c}</option>)}
          </select>
          <button onClick={add} style={{...btnPrimary,padding:"0 20px",borderRadius:10,whiteSpace:"nowrap"}}>Add</button>
        </div>
        {cats.map(cat=>{
          const items=checklist.filter(i=>i.cat===cat);
          if(!items.length)return null;
          return(
            <div key={cat} style={{marginBottom:22}}>
              <h3 style={{fontSize:12,fontWeight:700,color:C.textSub,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>{catEmoji[cat]} {cat} ({items.filter(i=>i.packed).length}/{items.length})</h3>
              <div style={{display:"grid",gap:8}}>
                {items.map(item=>(
                  <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:item.packed?C.skyLight:"#fff",border:`1px solid ${item.packed?C.sky:C.border}`,borderRadius:10,transition:"all .2s"}}>
                    <input type="checkbox" checked={item.packed} onChange={()=>toggle(item.id)} style={{width:18,height:18,cursor:"pointer",accentColor:C.sky}}/>
                    <span style={{flex:1,fontSize:14,fontWeight:500,textDecoration:item.packed?"line-through":"none",color:item.packed?C.textMuted:C.text}}>{item.item}</span>
                    <button onClick={()=>remove(item.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.textMuted,fontSize:18,padding:0}}>×</button>
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

// ── Notes View ────────────────────────────────────────────────
function NotesView({ trip, onUpdate, onBack }) {
  const notes    = trip.notes||[];
  const [text,   setText]   = useState("");
  const [stopId, setStopId] = useState("general");
  const add = () => {if(!text.trim())return;onUpdate({...trip,notes:[{id:Date.now(),text:text.trim(),stopId,ts:new Date().toISOString()},...notes]});setText("");};
  const del = id => onUpdate({...trip,notes:notes.filter(n=>n.id!==id)});
  return(
    <div style={{minHeight:"100vh",background:C.bg,paddingTop:64}}>
      <div style={{position:"relative",height:160,overflow:"hidden"}}>
        <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=85" alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(10,25,45,.65)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",padding:"0 60px"}}>
          <div>
            <button onClick={onBack} style={{color:"rgba(255,255,255,.75)",background:"none",border:"none",cursor:"pointer",fontSize:14,marginBottom:8,fontFamily:"inherit"}}>← Back to Trip</button>
            <h1 style={{fontSize:26,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF}}>📓 Trip Notes & Journal</h1>
          </div>
        </div>
      </div>
      <div style={{maxWidth:700,margin:"0 auto",padding:"32px 48px"}}>
        <div style={{...card,padding:"24px",marginBottom:24}}>
          <div style={{marginBottom:12}}>
            <label style={lbl}>Note for</label>
            <select style={{...inp,marginBottom:12}} value={stopId} onChange={e=>setStopId(e.target.value)}>
              <option value="general">📌 General</option>
              {(trip.stops||[]).map(s=><option key={s.id} value={s.id}>{s.city?.name||s.cityName}</option>)}
            </select>
          </div>
          <textarea style={{...inp,height:110,resize:"vertical",marginBottom:12}} placeholder="Write your note, reminder, or journal entry…" value={text} onChange={e=>setText(e.target.value)}/>
          <button onClick={add} style={{...btnPrimary,padding:"10px 24px",borderRadius:9}}>Save Note</button>
        </div>
        {notes.length===0&&<div style={{textAlign:"center",color:C.textMuted,padding:"32px",fontSize:14}}>No notes yet. Write your first one above!</div>}
        <div style={{display:"grid",gap:12}}>
          {notes.map(note=>{
            const stop=(trip.stops||[]).find(s=>s.id===note.stopId);
            return(
              <div key={note.id} style={{...card,padding:"16px 20px",borderLeft:`4px solid #e07b39`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{background:"#fff7ed",color:C.warning,fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:10}}>{stop?stop.city?.name:"📌 General"}</span>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:12,color:C.textMuted}}>{fmtD(note.ts)}</span>
                    <button onClick={()=>del(note.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.danger,fontSize:16}}>×</button>
                  </div>
                </div>
                <p style={{color:C.text,fontSize:14,lineHeight:1.65}}>{note.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main TripsPage ────────────────────────────────────────────
export default function TripsPage() {
  const { user }             = useAuth();
  const navigate = useNavigate();
  const { activeTrip, setActiveTrip } = useApp();
  const [trips, setTrips]    = useState([]);
  const [subView, setSubView]= useState(null); // "builder"|"budget"|"packing"|"notes"
  const [filter, setFilter]  = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading]= useState(true);

  useEffect(()=>{
    if(!user){setLoading(false);return;}
    tripsAPI.list().then(d=>setTrips(Array.isArray(d)?d:[])).catch(()=>{ setTrips([]); toast("❌ Failed to load trips"); }).finally(()=>setLoading(false));
  },[user]);

  const updateTrip = async (t) => {
    setTrips(prev=>prev.map(x=>x.id===t.id?t:x));
    setActiveTrip(t);
    try {
      await tripsAPI.update(t.id, t);
    } catch (e) {
      toast("Failed to save changes to server — changes are local only", "warning");
    }
  };
  const deleteTrip = async (id) => {
    if(!window.confirm("Delete this trip?"))return;
    setTrips(prev=>prev.filter(t=>t.id!==id));
    if(activeTrip?.id===id){setActiveTrip(null);setSubView(null);}
    try {
      await tripsAPI.delete(id);
      toast("Trip deleted");
    } catch (e) {
      // Revert on failure
      const trips = await tripsAPI.list().catch(()=>[]);
      setTrips(Array.isArray(trips) ? trips : []);
      toast("Failed to delete trip on server", "error");
    }
  };
  const handleCreated = (trip) => {
    setTrips(prev=>[...prev,trip]);
    setActiveTrip(trip);
    setSubView("builder");
    setShowCreate(false);
  };

  if(!user) return(
    <div style={{minHeight:"100vh",background:C.bg,paddingTop:64,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{...card,padding:"60px 48px",textAlign:"center",maxWidth:480}}>
        <div style={{fontSize:56,marginBottom:16}}>✈️</div>
        <h2 style={{fontSize:24,fontWeight:700,color:C.text,fontFamily:FONT_SERIF,marginBottom:10}}>Sign in to see your trips</h2>
        <p style={{color:C.textMuted,fontSize:14,marginBottom:24,lineHeight:1.7}}>Create an account to plan trips, build itineraries, track your budget and manage your packing list.</p>
        <button onClick={()=>navigate("/login")} style={{...btnPrimary,padding:"12px 28px",fontSize:15,borderRadius:10}}>Sign In / Sign Up</button>
      </div>
    </div>
  );

  // Sub-views
  if(subView==="builder"&&activeTrip) return <ItineraryBuilder trip={activeTrip} onUpdate={updateTrip} onBack={()=>setSubView(null)} onSubView={(s)=>setSubView(s)}/>;
  if(subView==="budget" &&activeTrip) return <BudgetView trip={activeTrip} onBack={()=>setSubView(null)}/>;
  if(subView==="packing"&&activeTrip) return <PackingView trip={activeTrip} onUpdate={updateTrip} onBack={()=>setSubView(null)}/>;
  if(subView==="notes"  &&activeTrip) return <NotesView   trip={activeTrip} onUpdate={updateTrip} onBack={()=>setSubView(null)}/>;

  const now      = new Date();
  const filtered = trips.filter(t=>filter==="upcoming"?new Date(t.endDate)>=now:filter==="past"?new Date(t.endDate)<now:true);

  return(
    <div style={{minHeight:"100vh",background:C.bg,paddingTop:64}}>
      <div style={{position:"relative",height:210,overflow:"hidden"}}>
        <img src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1600&q=85" alt="trips" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(10,25,45,.62)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 60px"}}>
          <div>
            <h1 style={{fontSize:36,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF}}>My Trips</h1>
            <p style={{color:"rgba(255,255,255,.75)",fontSize:14,marginTop:6}}>{trips.length} trip{trips.length!==1?"s":""} · {trips.reduce((a,t)=>a+(t.stops?.length||0),0)} destinations planned</p>
          </div>
          <button onClick={()=>setShowCreate(true)} style={{...btnPrimary,padding:"13px 28px",fontSize:15,borderRadius:10}}>+ Plan New Trip</button>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 48px"}}>
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {["all","upcoming","past"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?C.sky:"#fff",color:filter===f?"#fff":C.textSub,border:`1.5px solid ${filter===f?C.sky:C.border}`,borderRadius:20,padding:"7px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",textTransform:"capitalize"}}>{f}</button>
          ))}
        </div>

        {loading&&<div style={{textAlign:"center",padding:"60px",color:C.textMuted}}>Loading trips…</div>}

        {!loading&&filtered.length===0&&(
          <div style={{...card,padding:"60px 40px",textAlign:"center"}}>
            <div style={{fontSize:56,marginBottom:16}}>✈️</div>
            <h3 style={{fontSize:20,color:C.text,fontFamily:FONT_SERIF,marginBottom:8}}>No trips yet</h3>
            <p style={{color:C.textMuted,marginBottom:24,fontSize:14,lineHeight:1.7}}>Start planning your next adventure — add hotels, restaurants and experiences to your trip cart!</p>
            <button onClick={()=>setShowCreate(true)} style={{...btnPrimary,padding:"12px 28px",fontSize:14,borderRadius:10}}>Plan a Trip</button>
          </div>
        )}

        <div style={{display:"grid",gap:16}}>
          {filtered.map(trip=>(
            <TripCard
              key={trip.id} trip={trip}
              onEdit={(t)=>{setActiveTrip(t);setSubView("builder");}}
              onView={(t)=>{setActiveTrip(t);setSubView("builder");}}
              onBudget={(t)=>{setActiveTrip(t);setSubView("budget");}}
              onPacking={(t)=>{setActiveTrip(t);setSubView("packing");}}
              onDelete={deleteTrip}
            />
          ))}
        </div>
      </div>

      {showCreate&&<CreateTripModal onClose={()=>setShowCreate(false)} onCreated={handleCreated}/>}
    </div>
  );
}
