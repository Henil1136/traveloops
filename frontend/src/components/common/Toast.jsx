import { useState, useEffect } from "react";
import { C } from "../../constants/theme";

let _show = null;
export const toast = (msg, type="success") => _show?.({ msg, type });

export default function Toast() {
  const [item, setItem] = useState(null);
  useEffect(() => { _show = setItem; return () => { _show = null; }; }, []);
  useEffect(() => {
    if (!item) return;
    const t = setTimeout(() => setItem(null), 3000);
    return () => clearTimeout(t);
  }, [item]);
  if (!item) return null;
  const bg = item.type==="error" ? C.danger : item.type==="warning" ? C.warning : C.success;
  return (
    <div style={{
      position:"fixed", bottom:28, right:28, zIndex:500,
      background:bg, color:"#fff",
      padding:"13px 22px", borderRadius:12,
      fontWeight:600, fontSize:14,
      boxShadow:"0 8px 32px rgba(0,0,0,.18)",
      animation:"fadeUp .3s ease both",
    }}>{item.msg}</div>
  );
}
