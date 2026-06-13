import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C, FONT_SERIF, inp, lbl, btnPrimary } from "../constants/theme";
import { toast } from "../components/common/Toast";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate           = useNavigate();
  const [mode, setMode]     = useState("login");
  const [form, setForm]     = useState({ name:"", email:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const heroImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=85",
  ];
  const [heroIdx] = useState(()=>Math.floor(Math.random()*3));

  const validate = () => {
    if (!form.email||!form.password) return "Email and password are required";
    if (mode==="signup"&&!form.name)  return "Name is required";
    if (mode==="signup"&&form.password!==form.confirm) return "Passwords do not match";
    if (form.password.length<6) return "Password must be at least 6 characters";
    return null;
  };

  const submit = async () => {
    const e = validate();
    if (e) { setErr(e); return; }
    setLoading(true); setErr("");
    try {
      if (mode==="login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      toast(`Welcome${mode==="login"?" back":""}, ${form.name||form.email.split("@")[0]}! 🎉`);
      navigate("/");
    } catch(ex) {
      // If backend is offline, allow demo login
      if (ex.message?.includes("fetch")||ex.message?.includes("Failed")) {
        // Demo mode
        
        const fakeUser = { id:1, name:form.name||form.email.split("@")[0], email:form.email };
        localStorage.setItem("traveloops_token","demo_token");
        window.location.reload();
      } else {
        setErr(ex.message||"Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",position:"relative",overflow:"hidden"}}>
      {/* Left: Cinematic photo */}
      <div style={{flex:1,position:"relative",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"48px"}}>
        <img src={heroImages[heroIdx]} alt="travel" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(10,25,45,.75) 0%,rgba(10,25,45,.35) 100%)"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"auto",position:"absolute",top:0,left:0}}>
            <div style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,border:"1.5px solid rgba(255,255,255,.4)"}}>✈️</div>
            <span onClick={()=>navigate("/")} style={{fontWeight:700,fontSize:20,color:"#fff",letterSpacing:"-0.03em",fontFamily:FONT_SERIF,cursor:"pointer"}}>Traveloops</span>
          </div>
          <div style={{marginTop:48}}>
            <h1 style={{fontSize:42,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF,lineHeight:1.15,marginBottom:16,textShadow:"0 2px 20px rgba(0,0,0,.3)"}}>
              Your perfect trip,<br/><span style={{color:"#7dd8ea"}}>starts here.</span>
            </h1>
            <p style={{color:"rgba(255,255,255,.75)",fontSize:15,lineHeight:1.7,maxWidth:420}}>
              Hotels, restaurants, experiences & day plans — add to cart and book everything together with one accurate budget.
            </p>
            <div style={{display:"flex",gap:20,marginTop:24}}>
              {["500+ Destinations","10k+ Hotels","50k+ Travelers"].map(b=>(
                <div key={b} style={{background:"rgba(255,255,255,.12)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.22)",borderRadius:10,padding:"8px 14px"}}>
                  <span style={{color:"#fff",fontSize:13,fontWeight:500}}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Auth form */}
      <div style={{
        width:440,flexShrink:0,background:"#fff",
        display:"flex",flexDirection:"column",justifyContent:"center",
        padding:"48px 44px",overflowY:"auto",
        boxShadow:"-8px 0 40px rgba(0,0,0,.12)",
      }}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:40,marginBottom:10}}>✈️</div>
          <h2 style={{fontSize:26,fontWeight:700,color:C.text,fontFamily:FONT_SERIF,marginBottom:6}}>
            {mode==="login"?"Welcome back":"Create your account"}
          </h2>
          <p style={{fontSize:13,color:C.textMuted}}>
            {mode==="login"?"Sign in to plan your next adventure":"Join 50,000+ travelers today — it's free"}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{display:"flex",background:C.bg,borderRadius:12,padding:4,marginBottom:24,gap:3}}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{
              flex:1,padding:"10px",border:"none",borderRadius:9,
              background:mode===m?"#fff":"transparent",
              color:mode===m?C.sky:C.textMuted,
              fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",
              boxShadow:mode===m?"0 2px 10px rgba(0,0,0,.08)":"none",
              transition:"all .2s",
            }}>{m==="login"?"Sign In":"Sign Up"}</button>
          ))}
        </div>

        {mode==="signup"&&(
          <div style={{marginBottom:16}}>
            <label style={lbl}>Full Name</label>
            <input style={inp} placeholder="Your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          </div>
        )}
        <div style={{marginBottom:16}}>
          <label style={lbl}>Email Address</label>
          <input style={inp} type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        </div>
        <div style={{marginBottom: mode==="signup"?16:6}}>
          <label style={lbl}>Password</label>
          <input style={inp} type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        {mode==="signup"&&(
          <div style={{marginBottom:6}}>
            <label style={lbl}>Confirm Password</label>
            <input style={inp} type="password" placeholder="••••••••" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </div>
        )}
        {mode==="login"&&(
          <div style={{textAlign:"right",marginBottom:18}}>
            <span style={{color:C.sky,fontSize:12,cursor:"pointer",fontWeight:600}}>Forgot password?</span>
          </div>
        )}
        {err&&<div style={{background:C.dangerLight,color:C.danger,padding:"10px 14px",borderRadius:9,fontSize:13,marginBottom:16,marginTop:8}}>{err}</div>}

        <button onClick={submit} disabled={loading} style={{
          ...btnPrimary,width:"100%",padding:"14px",fontSize:15,borderRadius:12,marginTop:8,marginBottom:18,
          opacity:loading?.75:1,
        }}>
          {loading?"Loading...":(mode==="login"?"Sign In →":"Create Account →")}
        </button>

        <div style={{textAlign:"center",fontSize:13,color:C.textMuted}}>
          {mode==="login"?"Don't have an account? ":"Already have one? "}
          <span onClick={()=>{setMode(mode==="login"?"signup":"login");setErr("");}} style={{color:C.sky,fontWeight:700,cursor:"pointer"}}>
            {mode==="login"?"Sign up free":"Sign in"}
          </span>
        </div>

        <div style={{marginTop:28,paddingTop:20,borderTop:`1px solid ${C.borderLight}`,textAlign:"center"}}>
          <p style={{fontSize:11,color:C.textMuted,lineHeight:1.6}}>
            By continuing you agree to our Terms of Service and Privacy Policy.
            Your data is encrypted and never sold.
          </p>
        </div>
      </div>
    </div>
  );
}
