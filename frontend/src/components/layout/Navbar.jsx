import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useApp }  from "../../context/AppContext";
import { C, FONT_SERIF } from "../../constants/theme";

const NAV_LINKS_AUTH = [
  { path:"/",           label:"Home" },
  { path:"/explore",    label:"Explore" },
  { path:"/trips",      label:"My Trips" },
  { path:"/hotels",     label:"Hotels" },
  { path:"/restaurants",label:"Restaurants" },
  { path:"/transport",  label:"✈ Transport" },
];

const NAV_LINKS_GUEST = [
  { path:"/",           label:"Home" },
  { path:"/explore",    label:"Explore" },
  { path:"/hotels",     label:"Hotels" },
  { path:"/restaurants",label:"Restaurants" },
  { path:"/transport",  label:"✈ Transport" },
];

export default function Navbar() {
  const { user, logout }  = useAuth();
  const { count }         = useCart();
  const { scrolled }      = useApp();
  const navigate          = useNavigate();
  const { pathname }      = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const onHero  = pathname === "/" && !scrolled;
  const solid   = !onHero;
  const tc      = solid ? C.text : "#fff";
  const logoClr = solid ? C.sky  : "#fff";

  const navLinks = user ? NAV_LINKS_AUTH : NAV_LINKS_GUEST;

  const isActive = (p) => pathname === p || (p !== "/" && pathname.startsWith(p));

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:200,
      background: solid ? "rgba(255,255,255,.97)" : "transparent",
      backdropFilter: solid ? "blur(14px)" : "none",
      borderBottom: solid ? `1px solid ${C.border}` : "none",
      padding:"0 48px", height:64,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      transition:"all .3s",
    }}>
      {/* Logo */}
      <div onClick={()=>navigate("/")} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
        <div style={{width:34,height:34,borderRadius:10,
          background:solid?C.sky:"rgba(255,255,255,.2)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:17, border:solid?"none":"1.5px solid rgba(255,255,255,.4)"}}>✈️</div>
        <span style={{fontWeight:700,fontSize:20,color:logoClr,letterSpacing:"-0.03em",fontFamily:FONT_SERIF}}>
          Traveloops
        </span>
      </div>

      {/* Nav links */}
      <div style={{display:"flex",alignItems:"center",gap:2}}>
        {navLinks.map(n => (
          <button key={n.path} onClick={()=>navigate(n.path)} style={{
            background: isActive(n.path) ? (solid?C.skyLight:"rgba(255,255,255,.18)") : "transparent",
            color: isActive(n.path) ? (solid?C.sky:"#fff") : (solid?C.textSub:"rgba(255,255,255,.85)"),
            border:"none", borderRadius:8, padding:"8px 14px",
            fontWeight:500, fontSize:14, cursor:"pointer", fontFamily:"inherit",
            transition:"all .2s",
          }}>{n.label}</button>
        ))}
      </div>

      {/* Right actions */}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {/* Cart */}
        <div onClick={()=>navigate("/cart")} style={{position:"relative",cursor:"pointer",
          width:38,height:38,borderRadius:10,
          background:solid?"rgba(26,155,181,.08)":"rgba(255,255,255,.15)",
          display:"flex",alignItems:"center",justifyContent:"center",
          border:solid?`1px solid ${C.border}`:"1px solid rgba(255,255,255,.3)",
        }}>
          <span style={{fontSize:17}}>🛒</span>
          {count > 0 && (
            <div style={{position:"absolute",top:-4,right:-4,
              width:18,height:18,borderRadius:"50%",
              background:C.sky,color:"#fff",
              fontSize:10,fontWeight:700,
              display:"flex",alignItems:"center",justifyContent:"center",
              border:"2px solid #fff",
            }}>{count}</div>
          )}
        </div>

        {user ? (
          <div style={{position:"relative"}}>
            <div onClick={()=>setMenuOpen(!menuOpen)} style={{
              width:38,height:38,borderRadius:"50%",
              background:`linear-gradient(135deg,${C.sky},#0d7a94)`,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",
              border:"2px solid rgba(255,255,255,.4)",
            }}>{user.name?.[0]?.toUpperCase()||"U"}</div>
            {menuOpen && (
              <div style={{position:"absolute",right:0,top:46,
                background:C.surface,border:`1px solid ${C.border}`,
                borderRadius:14,padding:6,minWidth:190,zIndex:300,
                boxShadow:"0 12px 40px rgba(0,0,0,.12)"}}>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,marginBottom:4}}>
                  <div style={{fontWeight:700,fontSize:14,color:C.text}}>{user.name}</div>
                  <div style={{fontSize:12,color:C.textMuted}}>{user.email}</div>
                </div>
                {[{path:"/profile",label:"👤 Profile"},{path:"/trips",label:"🧳 Packing"},{path:"/admin",label:"📊 Admin"}].map(m=>(
                  <div key={m.path} onClick={()=>{navigate(m.path);setMenuOpen(false);}}
                    style={{padding:"9px 14px",cursor:"pointer",borderRadius:8,color:C.text,fontSize:13,fontWeight:500}}>
                    {m.label}
                  </div>
                ))}
                <div style={{borderTop:`1px solid ${C.border}`,margin:"4px 0"}}/>
                <div onClick={()=>{logout();navigate("/");setMenuOpen(false);}}
                  style={{padding:"9px 14px",cursor:"pointer",borderRadius:8,color:C.danger,fontSize:13,fontWeight:600}}>
                  🚪 Sign Out
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>navigate("/login")} style={{
              background:"transparent",color:tc,
              border:`1.5px solid ${solid?C.border:"rgba(255,255,255,.6)"}`,
              borderRadius:9,padding:"8px 18px",fontSize:13,fontWeight:600,
              cursor:"pointer",fontFamily:"inherit",transition:"all .2s",
            }}>Sign In</button>
            <button onClick={()=>navigate("/login")} style={{
              background:solid?C.sky:"rgba(255,255,255,.2)",
              color:solid?"#fff":"#fff",
              border:solid?"none":"1.5px solid rgba(255,255,255,.5)",
              borderRadius:9,padding:"8px 18px",fontSize:13,fontWeight:700,
              cursor:"pointer",fontFamily:"inherit",transition:"all .2s",
            }}>Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  );
}