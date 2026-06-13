import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }  from "../context/AuthContext";
import { tripsAPI } from "../services/api";
import { C, FONT_SERIF, card, btnPrimary } from "../constants/theme";
import { fmt, fmtD } from "../utils/helpers";
import { toast } from "../components/common/Toast";

export default function AdminPage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    tripsAPI.list().then(d=>setTrips(Array.isArray(d)?d:[])).catch(()=>{ setTrips([]); toast("❌ Failed to load trips"); }).finally(()=>setLoading(false));
  },[]);

  const totalBudget  = trips.reduce((a,t)=>a+(t.budget||0),0);
  const totalCities  = trips.reduce((a,t)=>a+(t.stops?.length||0),0);
  const totalActivities = trips.reduce((a,t)=>a+(t.stops?.reduce((b,s)=>b+(s.activities?.length||0),0)||0),0);

  const stats = [
    {label:"Total Trips",       value:trips.length,    icon:"✈️",color:C.sky,     delta:"+12%"},
    {label:"Destinations",      value:totalCities,     icon:"📍",color:"#7b5ea7", delta:"+8%"},
    {label:"Activities Planned",value:totalActivities, icon:"🎯",color:"#e07b39", delta:"+21%"},
    {label:"Total Budget",      value:fmt(totalBudget),icon:"💰",color:"#2e9e6b", delta:"+5%"},
  ];

  return(
    <div style={{minHeight:"100vh",background:C.bg,paddingTop:64}}>
      <div style={{position:"relative",height:160,overflow:"hidden"}}>
        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=85" alt="admin" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(10,25,45,.65)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 60px"}}>
          <div>
            <h1 style={{fontSize:30,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF}}>📊 Admin Dashboard</h1>
            <p style={{color:"rgba(255,255,255,.75)",fontSize:13,marginTop:5}}>Welcome, {user?.name} · Platform overview</p>
          </div>
          <button onClick={()=>navigate("/trips")} style={{...btnPrimary,borderRadius:9}}>+ New Trip</button>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 48px"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18,marginBottom:32}}>
          {stats.map(s=>(
            <div key={s.label} style={{...card,padding:"22px",borderTop:`3px solid ${s.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <span style={{fontSize:24}}>{s.icon}</span>
                <span style={{background:`${s.color}18`,color:s.color,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:8}}>{s.delta}</span>
              </div>
              <div style={{fontSize:26,fontWeight:800,color:s.color,marginBottom:4}}>{s.value}</div>
              <div style={{fontSize:12,color:C.textMuted}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Trips table */}
        <div style={{...card,padding:"24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h3 style={{fontSize:17,fontWeight:700,color:C.text,fontFamily:FONT_SERIF}}>All Trips</h3>
            <span style={{fontSize:13,color:C.textMuted}}>{trips.length} total</span>
          </div>
          {loading&&<p style={{color:C.textMuted,fontSize:13}}>Loading…</p>}
          {!loading&&trips.length===0&&<p style={{color:C.textMuted,fontSize:13}}>No trips yet.</p>}
          {trips.map((trip,i)=>(
            <div key={trip.id} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 0",borderBottom:i<trips.length-1?`1px solid ${C.borderLight}`:"none"}}>
              <div style={{width:48,height:48,borderRadius:10,overflow:"hidden",flexShrink:0}}>
                {(trip.coverUrl||trip.stops?.[0]?.city?.img)
                  ? <img src={trip.coverUrl||trip.stops[0].city.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <div style={{width:"100%",height:"100%",background:C.skyLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>✈️</div>}
              </div>
              <div style={{flex:2}}>
                <div style={{fontWeight:600,fontSize:14,color:C.text}}>{trip.name}</div>
                <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>{fmtD(trip.startDate)} – {fmtD(trip.endDate)}</div>
              </div>
              <div style={{flex:1,fontSize:13,color:C.textSub,display:"flex",gap:6,flexWrap:"wrap"}}>
                {trip.stops?.slice(0,3).map((s,i)=>(
                  <span key={i} style={{background:C.skyLight,color:C.sky,fontSize:11,fontWeight:600,padding:"2px 7px",borderRadius:8}}>{s.city?.name||s.cityName}</span>
                ))}
              </div>
              <div style={{flex:1,fontSize:13,color:C.textSub}}>{trip.stops?.length||0} cities · {trip.stops?.reduce((a,s)=>a+(s.activities?.length||0),0)||0} activities</div>
              <div style={{fontWeight:800,fontSize:15,color:C.sky,minWidth:70,textAlign:"right"}}>{fmt(trip.budget)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
