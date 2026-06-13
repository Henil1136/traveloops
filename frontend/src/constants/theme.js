// Song-Kol / Travely-inspired design tokens
export const C = {
  sky:         "#1a9bb5",
  skyDark:     "#127a92",
  skyDeep:     "#0d5f72",
  skyLight:    "#e8f6fa",
  skyGlow:     "rgba(26,155,181,0.12)",

  white:       "#ffffff",
  surface:     "#ffffff",
  surfaceAlt:  "#f9fbfc",
  bg:          "#f5f7fa",
  bgAlt:       "#eef2f7",

  text:        "#1a2332",
  textSub:     "#3d5166",
  textMuted:   "#7a9aaa",

  border:      "#d8e4ec",
  borderLight: "#eef4f7",

  danger:      "#e53935",
  dangerLight: "#fde8e8",
  warning:     "#f57c00",
  warningLight:"#fff7ed",
  success:     "#2e7d32",
  successLight:"#e8f5e9",

  gold:        "#c9a84c",
  goldLight:   "#fdf6e3",

  overlay:     "rgba(10,25,45,0.50)",
  overlayDeep: "rgba(10,25,45,0.72)",

  shadow:      "0 2px 12px rgba(26,155,181,0.08)",
  shadowMd:    "0 6px 24px rgba(0,0,0,0.10)",
  shadowLg:    "0 16px 48px rgba(0,0,0,0.14)",
};

export const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";

// Shared style shortcuts
export const btnPrimary = {
  background: C.sky, color: "#fff", border: "none",
  borderRadius: 10, padding: "12px 26px",
  fontWeight: 700, fontSize: 14, cursor: "pointer",
  fontFamily: "inherit", transition: "all .2s",
  letterSpacing: "0.01em",
};
export const btnOutline = {
  background: "transparent", color: "#fff",
  border: "2px solid rgba(255,255,255,.8)",
  borderRadius: 10, padding: "10px 24px",
  fontWeight: 600, fontSize: 14, cursor: "pointer",
  fontFamily: "inherit", transition: "all .2s",
};
export const btnOutlineDark = {
  ...btnOutline, color: C.sky,
  border: `2px solid ${C.sky}`,
};
export const card = {
  background: C.surface, borderRadius: 16,
  border: `1px solid ${C.border}`, overflow: "hidden",
};
export const inp = {
  width: "100%", padding: "11px 14px",
  border: `1.5px solid ${C.border}`, borderRadius: 10,
  fontSize: 14, fontFamily: "inherit",
  background: C.surface, color: C.text,
  outline: "none", boxSizing: "border-box",
  transition: "border-color .2s",
};
export const lbl = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: C.textSub, marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.07em",
};
