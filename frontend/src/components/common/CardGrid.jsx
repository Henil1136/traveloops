export default function CardGrid({ cols=3, gap=20, children, style={} }) {
  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:`repeat(${cols}, 1fr)`,
      gap, ...style,
    }}>{children}</div>
  );
}
