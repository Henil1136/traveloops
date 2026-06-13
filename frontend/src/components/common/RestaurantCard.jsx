import { C, card } from "../../constants/theme";
import CartButton from "./CartButton";

const PRICE_MAP = { "$": 15, "$$": 40, "$$$": 85, "$$$$": 160 };
const PRICE_COLOR = { "$": "#2e7d32", "$$": "#e07b39", "$$$": "#e07b39", "$$$$": "#e53953" };

export default function RestaurantCard({ restaurant, compact }) {
  return (
    <div style={{ ...card, transition: "transform .2s,box-shadow .2s", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ position: "relative", height: compact ? 150 : 200, background: C.borderLight }}>
        <img src={restaurant.img} alt={restaurant.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.65)", color: "#fff", fontSize: compact ? 10 : 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
          ⭐ {restaurant.rating}
        </div>
      </div>
      <div style={{ padding: compact ? "14px 16px" : "18px 20px" }}>
        <div style={{ fontWeight: 700, fontSize: compact ? 14 : 16, color: C.text, marginBottom: 2 }}>{restaurant.name}</div>
        <div style={{ fontSize: compact ? 12 : 13, color: C.textMuted, marginBottom: 4 }}>📍 {restaurant.city}, {restaurant.country}</div>
        <div style={{ fontSize: compact ? 11 : 12, color: C.sky, fontWeight: 600, marginBottom: compact ? 10 : 6 }}>{restaurant.cuisine}</div>
        <div style={{ fontSize: compact ? 11 : 12, color: C.textSub, marginBottom: compact ? 10 : 12, fontStyle: "italic", lineHeight: 1.5 }}>{restaurant.specialty}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: compact ? 0 : 10, borderTop: compact ? "none" : `1px solid ${C.borderLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: compact ? 14 : 15, fontWeight: 700, color: PRICE_COLOR[restaurant.priceRange] || C.textSub }}>{restaurant.priceRange}</span>
            <span style={{ fontSize: compact ? 11 : 12, color: C.textMuted }}>per person</span>
          </div>
          <CartButton item={{ ...restaurant, id: restaurant._id || restaurant.id, cost: PRICE_MAP[restaurant.priceRange] || 40 }} type="restaurant" />
        </div>
      </div>
    </div>
  );
}
