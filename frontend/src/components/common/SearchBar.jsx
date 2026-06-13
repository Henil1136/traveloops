import { useState } from "react";
import { C } from "../../constants/theme";

export default function SearchBar({ placeholder="Search...", onSearch, size="lg", value="", onChange }) {
  const [q, setQ] = useState(value);
  const isLg = size === "lg";
  return (
    <div style={{
      display:"flex", alignItems:"center",
      background:"rgba(255,255,255,.96)",
      borderRadius: 50, overflow:"hidden",
      width:"100%", maxWidth: isLg ? 580 : 380,
      boxShadow:"0 8px 32px rgba(0,0,0,.15)",
    }}>
      <span style={{ padding:"0 16px", fontSize: isLg?20:16 }}>🔍</span>
      <input
        value={q}
        onChange={e => { setQ(e.target.value); onChange?.(e.target.value); }}
        onKeyDown={e => e.key==="Enter" && onSearch?.(q)}
        placeholder={placeholder}
        style={{
          flex:1, border:"none", outline:"none",
          fontSize: isLg?15:14, fontFamily:"inherit",
          background:"transparent", padding:`${isLg?14:10}px 0`, color:C.text,
        }}
      />
      <button
        onClick={() => onSearch?.(q)}
        style={{
          background:C.sky, color:"#fff", border:"none",
          borderRadius:50, margin:4, padding: isLg?"10px 24px":"8px 18px",
          fontWeight:700, fontSize: isLg?14:13,
          cursor:"pointer", fontFamily:"inherit",
        }}
      >Search</button>
    </div>
  );
}
