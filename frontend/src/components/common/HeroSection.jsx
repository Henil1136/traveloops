import { C, FONT_SERIF } from "../../constants/theme";

export default function HeroSection({ img, height=220, title, subtitle, back, backLabel, children, overlay="rgba(10,25,45,.65)" }) {
  return (
    <div style={{ position:"relative", height, overflow:"hidden", flexShrink:0 }}>
      <img src={img} alt={title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
      <div style={{ position:"absolute", inset:0, background:overlay }} />
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
        justifyContent:"space-between", padding:"0 60px" }}>
        <div>
          {back && (
            <button onClick={back} style={{
              color:"rgba(255,255,255,.75)", background:"none", border:"none",
              cursor:"pointer", fontSize:14, marginBottom:8, fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:6,
            }}>← {backLabel||"Back"}</button>
          )}
          <h1 style={{ fontSize:32, fontWeight:700, color:"#fff", fontFamily:FONT_SERIF, lineHeight:1.2 }}>{title}</h1>
          {subtitle && <p style={{ color:"rgba(255,255,255,.75)", fontSize:14, marginTop:6 }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
