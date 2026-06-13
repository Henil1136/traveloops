import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C, FONT_SERIF, card, btnPrimary, inp, lbl } from "../constants/theme";
import { toast } from "../components/common/Toast";
import { authAPI, bookingsAPI } from "../services/api";
import { fmt } from "../utils/helpers";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [tab, setTab]    = useState("profile");
  const [form, setForm]  = useState({ name:user?.name||"", email:user?.email||"", currentPassword:"", newPassword:"" });
  const [saved, setSaved]= useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (tab !== "bookings") return;
    setBookingsLoading(true);
    bookingsAPI.mine()
      .then(data => setBookings(data))
      .catch(() => { setBookings([]); toast("❌ Failed to load bookings"); })
      .finally(() => setBookingsLoading(false));
  }, [tab]);

  const save = async () => {
    setLoading(true);
    try {
      await authAPI.update({ name:form.name, email:form.email });
      setSaved(true);
      toast("✅ Profile updated!");
      setTimeout(()=>setSaved(false),2500);
    } catch {
      toast("❌ Failed to update profile");
    } finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div style={{minHeight:"100vh",background:C.bg,paddingTop:64}}>
      <div style={{position:"relative",height:180,overflow:"hidden"}}>
        <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=85" alt="profile" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(10,25,45,.65)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",padding:"0 60px"}}>
          <h1 style={{fontSize:30,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF}}>👤 Profile & Settings</h1>
        </div>
      </div>
      <div style={{maxWidth:740,margin:"0 auto",padding:"36px 48px"}}>
        {/* Tab bar */}
        <div style={{display:"flex",gap:4,background:"#fff",borderRadius:12,padding:4,marginBottom:24,border:`1px solid ${C.border}`,width:"fit-content",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
          {[{id:"profile",label:"👤 Profile"},{id:"bookings",label:"🎫 My Bookings"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:tab===t.id?C.sky:"transparent",
              color:tab===t.id?"#fff":C.textSub,
              border:"none",borderRadius:9,padding:"10px 20px",
              fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Bookings tab */}
        {tab==="bookings" && (
          <div>
            <h2 style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:FONT_SERIF,marginBottom:16}}>My Bookings</h2>
            {bookingsLoading ? (
              <div style={{...card,padding:"48px",textAlign:"center",color:C.textMuted}}>Loading bookings…</div>
            ) : bookings.length === 0 ? (
              <div style={{...card,padding:"48px",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:12}}>🎫</div>
                <h3 style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>No bookings yet</h3>
                <p style={{fontSize:13,color:C.textMuted,marginBottom:20}}>Add hotels, restaurants or activities to your cart and book them together.</p>
                <button onClick={()=>navigate("/explore")} style={{...btnPrimary,padding:"10px 22px",borderRadius:10,fontSize:13}}>Explore Destinations →</button>
              </div>
            ) : bookings.map(b=>(
              <div key={b._id} style={{...card,padding:"20px 24px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:16,color:C.text,marginBottom:4}}>{b.tripName}</div>
                    <div style={{fontSize:12,color:C.textMuted}}>{new Date(b.createdAt).toLocaleDateString("en",{year:"numeric",month:"long",day:"numeric"})}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{
                      display:"inline-block",
                      background:b.status==="confirmed"?C.skyLight:b.status==="cancelled"?"#fee2e2":"#fef3c7",
                      color:b.status==="confirmed"?C.sky:b.status==="cancelled"?"#dc2626":"#92400e",
                      fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:8,marginBottom:4,
                    }}>{b.status.toUpperCase()}</div>
                    <div style={{fontSize:20,fontWeight:800,color:C.sky}}>{fmt(b.grandTotal)}</div>
                  </div>
                </div>
                <div style={{
                  background:C.skyLight,borderRadius:8,padding:"8px 14px",
                  fontSize:13,fontWeight:700,color:C.sky,letterSpacing:"0.05em",marginBottom:10,
                  display:"inline-block",
                }}>
                  Ref: {b.confirmationId}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {b.items.map((item,i)=>(
                    <span key={i} style={{background:C.bg,border:`1px solid ${C.borderLight}`,fontSize:11,padding:"3px 9px",borderRadius:7,color:C.textSub}}>
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile tab */}
        {tab==="profile" && <div>
        {/* Avatar card */}
        <div style={{...card,padding:"28px",marginBottom:20,textAlign:"center"}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${C.sky},${C.skyDeep})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:32,fontWeight:700,margin:"0 auto 14px"}}>{user?.name?.[0]?.toUpperCase()||"U"}</div>
          <h2 style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:FONT_SERIF}}>{user?.name}</h2>
          <p style={{color:C.textMuted,fontSize:14,marginTop:4}}>{user?.email}</p>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:16}}>
            <span style={{background:C.skyLight,color:C.sky,fontSize:12,fontWeight:600,padding:"4px 12px",borderRadius:10}}>Free Plan</span>
          </div>
        </div>

        {/* Edit form */}
        <div style={{...card,padding:"28px",marginBottom:20}}>
          <h3 style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:20}}>Edit Profile</h3>
          <div style={{marginBottom:16}}><label style={lbl}>Full Name</label><input style={inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div style={{marginBottom:24}}><label style={lbl}>Email Address</label><input style={inp} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          {saved&&<div style={{background:C.successLight,color:C.success,padding:"10px 14px",borderRadius:8,marginBottom:14,fontSize:13,fontWeight:600}}>✅ Changes saved!</div>}
          <button onClick={save} disabled={loading} style={{...btnPrimary,padding:"11px 26px",borderRadius:9,opacity:loading?.75:1}}>
            {loading?"Saving…":"Save Changes"}
          </button>
        </div>

        {/* Quick links */}
        <div style={{...card,padding:"20px 24px",marginBottom:20}}>
          <h3 style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Quick Navigation</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              {icon:"✈️",label:"My Trips",      target:"trips"},
              {icon:"🛒",label:"Cart",           target:"cart"},
              {icon:"🗺️",label:"Explore",        target:"explore"},
              {icon:"🏨",label:"Hotels",         target:"hotels"},
              {icon:"🍽️",label:"Restaurants",    target:"restaurants"},
              {icon:"📊",label:"Admin Panel",    target:"admin"},
            ].map(q=>(
              <button key={q.target} onClick={()=>navigate("/"+q.target)} style={{
                display:"flex",alignItems:"center",gap:10,
                background:C.bg,border:`1px solid ${C.border}`,
                borderRadius:10,padding:"11px 16px",cursor:"pointer",
                fontFamily:"inherit",fontSize:14,fontWeight:500,color:C.text,
                transition:"all .2s",
              }}
                onMouseEnter={e=>e.currentTarget.style.background=C.skyLight}
                onMouseLeave={e=>e.currentTarget.style.background=C.bg}>
                <span style={{fontSize:18}}>{q.icon}</span>{q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div style={{...card,padding:"20px 24px",border:`1px solid ${C.dangerLight}`}}>
          <h3 style={{fontSize:14,fontWeight:700,color:C.danger,marginBottom:12}}>Danger Zone</h3>
          <button onClick={handleLogout} style={{background:C.dangerLight,color:C.danger,border:`1.5px solid ${C.danger}`,borderRadius:9,padding:"10px 22px",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
            🚪 Sign Out
          </button>
        </div>
      </div>} {/* end profile tab */}
      </div>
    </div>
  );
}
