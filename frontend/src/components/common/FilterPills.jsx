import { C } from "../../constants/theme";

export default function FilterPills({ options, active, onChange }) {
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {options.map(opt => {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const isActive = active === val;
        return (
          <button key={val} onClick={() => onChange(val)} style={{
            background: isActive ? C.sky : "#fff",
            color: isActive ? "#fff" : C.textSub,
            border: `1.5px solid ${isActive ? C.sky : C.border}`,
            borderRadius: 20, padding: "7px 18px",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", transition: "all .2s",
          }}>{label}</button>
        );
      })}
    </div>
  );
}
