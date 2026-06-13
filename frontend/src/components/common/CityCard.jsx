import { C, card } from "../../constants/theme";

export default function CityCard({ city, onClick, compact }) {
  return (
    <div onClick={onClick} style={{
      borderRadius: 14, overflow: "hidden", cursor: "pointer",
      boxShadow: "0 2px 12px rgba(0,0,0,.08)", background: "#fff",
      transition: "transform .2s, box-shadow .2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,.14)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.08)"; }}>
      <div style={{ position: "relative", height: compact ? 140 : 170 }}>
        <img src={city.img} alt={city.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.68),transparent)" }} />
        <div style={{ position: "absolute", top: 10, left: 10, background: C.sky, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10 }}>{city.tag}</div>
        <div style={{ position: "absolute", bottom: 10, left: 12, right: 12 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: compact ? 14 : 16 }}>{city.name}</div>
          <div style={{ color: "rgba(255,255,255,.75)", fontSize: compact ? 11 : 12 }}>{city.country}</div>
        </div>
      </div>
      {!compact && (
        <div style={{ padding: "12px 14px" }}>
          <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 8, lineHeight: 1.5 }}>{city.desc?.slice(0, 65)}…</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>🏨 {city.hotels} hotels</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.sky }}>~${city.costIndex}/night</span>
          </div>
        </div>
      )}
    </div>
  );
}
