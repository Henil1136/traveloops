import { C } from "../../constants/theme";

// Keyframe animation injected once
const SHIMMER_STYLE = `
@keyframes tl-shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}`;
if (!document.querySelector("#tl-shimmer-style")) {
  const el = document.createElement("style");
  el.id = "tl-shimmer-style";
  el.textContent = SHIMMER_STYLE;
  document.head.appendChild(el);
}

const shimmer = {
  background: `linear-gradient(90deg, ${C.borderLight} 25%, #e8ecf0 50%, ${C.borderLight} 75%)`,
  backgroundSize: "600px 100%",
  animation: "tl-shimmer 1.4s infinite linear",
  borderRadius: 8,
};

function Block({ w = "100%", h = 16, style = {} }) {
  return <div style={{ ...shimmer, width: w, height: h, ...style }} />;
}

/** Single hotel card skeleton */
export function HotelCardSkeleton() {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,.06)",
    }}>
      {/* image placeholder */}
      <Block h={210} style={{ borderRadius: 0 }} />
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Block h={18} w="70%" />
        <Block h={13} w="45%" />
        <div style={{ display: "flex", gap: 6 }}>
          <Block h={22} w={60} style={{ borderRadius: 9 }} />
          <Block h={22} w={50} style={{ borderRadius: 9 }} />
          <Block h={22} w={70} style={{ borderRadius: 9 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${C.borderLight}` }}>
          <Block h={28} w={80} />
          <Block h={32} w={100} style={{ borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

/** Single restaurant card skeleton */
export function RestaurantCardSkeleton() {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,.06)",
    }}>
      <Block h={200} style={{ borderRadius: 0 }} />
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Block h={18} w="65%" />
        <Block h={13} w="40%" />
        <Block h={13} w="35%" />
        <Block h={13} w="80%" />
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${C.borderLight}` }}>
          <Block h={22} w={50} />
          <Block h={32} w={100} style={{ borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

/** Grid of n skeletons */
export function HotelSkeletonGrid({ count = 6 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
      {Array.from({ length: count }).map((_, i) => <HotelCardSkeleton key={i} />)}
    </div>
  );
}

export function RestaurantSkeletonGrid({ count = 6 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
      {Array.from({ length: count }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
    </div>
  );
}
