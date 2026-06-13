import { Component } from "react";
import { C, FONT_SERIF } from "../../constants/theme";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to Sentry / Datadog
    console.error("[ErrorBoundary] Caught:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✈️</div>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 28, color: C.text, marginBottom: 8 }}>
          Something went wrong
        </h2>
        <p style={{ color: C.textMuted, fontSize: 15, maxWidth: 400, marginBottom: 28, lineHeight: 1.6 }}>
          This page hit an unexpected error. Your trips and cart are safe — just reload to continue.
        </p>
        {/* Show error detail in dev only */}
        {import.meta.env.DEV && (
          <pre style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: "14px 20px",
            fontSize: 12,
            color: "#b91c1c",
            maxWidth: 560,
            textAlign: "left",
            overflow: "auto",
            marginBottom: 24,
          }}>
            {this.state.error?.toString()}
          </pre>
        )}
        <button
          onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          style={{
            background: C.sky,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 28px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }
}
