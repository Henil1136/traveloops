import { C, card } from "../../constants/theme";
import CartButton from "./CartButton";

export default function HotelCard({ hotel, compact }) {
  return (
    <div style={{ ...card, transition: "transform .2s,box-shadow .2s", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ position: "relative", height: compact ? 170 : 210, background: C.borderLight }}>
        <img src={hotel.img} alt={hotel.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,.6)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 7 }}>
          {"★".repeat(hotel.stars)}
        </div>
        {!compact && (
          <div style={{ position: "absolute", top: 12, right: 12, background: C.sky, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
            ⭐ {hotel.rating}
          </div>
        )}
      </div>
      <div style={{ padding: compact ? "14px 16px" : "18px 20px" }}>
        <div style={{ fontWeight: 700, fontSize: compact ? 14 : 16, color: C.text, marginBottom: 2 }}>{hotel.name}</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>📍 {hotel.city}, {hotel.country}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: compact ? 12 : 14 }}>
          {hotel.amenities?.slice(0, compact ? 3 : 5).map((a, i) => (
            <span key={i} style={{ background: C.skyLight, color: C.sky, fontSize: compact ? 10 : 11, fontWeight: 600, padding: "2px 7px", borderRadius: 8 }}>{a}</span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: compact ? 0 : 10, borderTop: compact ? "none" : `1px solid ${C.borderLight}` }}>
          <div>
            <span style={{ fontSize: compact ? 18 : 22, fontWeight: 800, color: C.sky }}>${hotel.pricePerNight}</span>
            <span style={{ fontSize: compact ? 11 : 12, color: C.textMuted }}>/night</span>
          </div>
          <CartButton item={{ ...hotel, id: hotel._id || hotel.id }} type="hotel" />
        </div>
      </div>
    </div>
  );
}
