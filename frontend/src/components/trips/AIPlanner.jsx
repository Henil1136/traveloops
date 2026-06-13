/**
 * AIPlanner.jsx
 * ─────────────────────────────────────────────────────────────
 * Conversational AI itinerary generator.
 *
 * Flow:
 *  1. User fills a short form (destination, dates, budget, vibe)
 *  2. We POST to Anthropic /v1/messages asking for JSON
 *  3. We stream the response and show a live typing indicator
 *  4. We parse the returned JSON into stops[]
 *  5. User previews the plan and hits "Apply to Trip" → onApply(stops)
 *
 * The component is self-contained — parent just passes trip + callbacks.
 */

import { useState, useRef } from "react";
import { C, FONT_SERIF, card, btnPrimary, inp, lbl } from "../../constants/theme";
import { CURATED_CITIES, ACTIVITIES_LIST, AI_PLANNER_API } from "../../services/api";
import { toast } from "../common/Toast";

// ── Helpers ────────────────────────────────────────────────────
const VIBES = ["Relaxed", "Adventure", "Cultural", "Foodie", "Luxury", "Budget", "Romantic", "Family"];
const PACE  = ["Slow (1-2 sights/day)", "Moderate (3-4 sights/day)", "Packed (5+ sights/day)"];

function daysBetween(a, b) {
  if (!a || !b) return 7;
  return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000));
}

// Map activity names Claude might return → our ACTIVITIES_LIST entries
function matchActivity(name) {
  const n = name.toLowerCase();
  return ACTIVITIES_LIST.find(a =>
    a.name.toLowerCase().includes(n) ||
    n.includes(a.name.toLowerCase().split(" ")[0])
  ) || null;
}

// Build the prompt we send to Claude
function buildPrompt({ destination, days, budget, vibes, pace, travelers, notes }) {
  const cityData = CURATED_CITIES.find(c =>
    c.name.toLowerCase() === destination.toLowerCase()
  );
  const actList = ACTIVITIES_LIST.map(a =>
    `"${a.name}" (${a.type}, $${a.cost}, ${a.duration}h)`
  ).join(", ");

  return `You are an expert travel planner creating a detailed trip itinerary.

TRIP DETAILS:
- Destination: ${destination}${cityData ? ` (${cityData.country}, ~$${cityData.costIndex}/day)` : ""}
- Duration: ${days} days
- Budget: $${budget} USD total
- Travel style: ${vibes.join(", ")}
- Pace: ${pace}
- Travelers: ${travelers}
${notes ? `- Special notes: ${notes}` : ""}

AVAILABLE ACTIVITIES (use these exact names when possible):
${actList}

Return ONLY a valid JSON object — no markdown, no explanation, no preamble. The JSON must match this exact shape:

{
  "summary": "2-sentence trip overview",
  "estimatedTotal": 1200,
  "tips": ["tip1", "tip2", "tip3"],
  "stops": [
    {
      "cityName": "${destination}",
      "days": ${days},
      "highlights": ["highlight1", "highlight2"],
      "activities": [
        {
          "name": "Activity Name",
          "type": "sightseeing|food|culture|adventure|leisure",
          "cost": 25,
          "duration": 2,
          "icon": "🗺️",
          "desc": "Short description",
          "timeOfDay": "morning|afternoon|evening",
          "dayNumber": 1
        }
      ]
    }
  ]
}

Important rules:
- Keep estimatedTotal under the $${budget} budget
- Spread activities realistically across ${days} days
- For multi-city trips, split the days sensibly between cities
- Use the exact activity names from the list above when they fit — only invent new ones when needed
- Every activity must have a cost in USD (use 0 for free activities)
- Be specific and practical — real places, real prices`;
}

// ── Streaming parser ───────────────────────────────────────────
async function streamItinerary({ prompt, onChunk, onDone, onError, abortRef }) {
  try {
    const res = await AI_PLANNER_API.stream(prompt, abortRef.current);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const text = parsed.delta?.text || "";
          if (text) onChunk(text);
        } catch { /* skip malformed SSE */ }
      }
    }
    onDone();
  } catch (err) {
    if (err.name !== "AbortError") onError(err);
  }
}

// ── Sub-components ─────────────────────────────────────────────
function PlannerForm({ trip, onGenerate, loading }) {
  const [dest,      setDest]      = useState(trip.stops?.[0]?.cityName || "");
  const [budget,    setBudget]    = useState(trip.budget || 1500);
  const [vibes,     setVibes]     = useState(["Cultural", "Foodie"]);
  const [pace,      setPace]      = useState(PACE[1]);
  const [travelers, setTravelers] = useState("2 adults");
  const [notes,     setNotes]     = useState("");
  const days = daysBetween(trip.startDate, trip.endDate);

  const toggleVibe = (v) =>
    setVibes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v].slice(0, 3));

  const handleSubmit = () => {
    if (!dest.trim()) { toast("Enter a destination", "warning"); return; }
    if (!budget || budget < 100) { toast("Enter a realistic budget", "warning"); return; }
    onGenerate({ destination: dest, days, budget, vibes, pace, travelers, notes });
  };

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Destination *</label>
        <input
          style={inp}
          value={dest}
          onChange={e => setDest(e.target.value)}
          placeholder="e.g. Bali, Paris, Kyoto…"
          list="city-suggestions"
        />
        <datalist id="city-suggestions">
          {CURATED_CITIES.map(c => <option key={c.id} value={c.name} />)}
        </datalist>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 5 }}>
          {days} days · {new Date(trip.startDate).toLocaleDateString("en", { month: "short", day: "numeric" })} – {new Date(trip.endDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Total Budget (USD) *</label>
        <input
          style={{ ...inp, width: 200 }}
          type="number"
          min="100"
          max="50000"
          value={budget}
          onChange={e => setBudget(Number(e.target.value))}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Travel vibe (pick up to 3)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {VIBES.map(v => (
            <button key={v} onClick={() => toggleVibe(v)} style={{
              background: vibes.includes(v) ? C.sky : "#fff",
              color: vibes.includes(v) ? "#fff" : C.textSub,
              border: `1.5px solid ${vibes.includes(v) ? C.sky : C.border}`,
              borderRadius: 20, padding: "6px 16px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              transition: "all .15s",
            }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={lbl}>Pace</label>
          <select
            value={pace}
            onChange={e => setPace(e.target.value)}
            style={{ ...inp, cursor: "pointer" }}
          >
            {PACE.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Who's traveling</label>
          <input
            style={inp}
            value={travelers}
            onChange={e => setTravelers(e.target.value)}
            placeholder="e.g. 2 adults, 1 kid"
          />
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={lbl}>Special requests (optional)</label>
        <textarea
          style={{ ...inp, height: 72, resize: "vertical" }}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Vegetarian food only, avoid crowded tourist spots, must visit specific temples…"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          ...btnPrimary,
          padding: "14px 32px",
          fontSize: 15,
          borderRadius: 12,
          opacity: loading ? 0.7 : 1,
          display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>✨</span>
        {loading ? "Generating your itinerary…" : "Generate AI Itinerary"}
      </button>
    </div>
  );
}

function StreamingPreview({ text }) {
  // Show a "thinking" animation while text is streaming in
  const isPartial = text.length < 50 || !text.includes("}");

  if (isPartial) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "24px", background: C.skyLight, borderRadius: 12,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%", background: C.sky,
              animation: "bounce 1.2s infinite",
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
        <span style={{ fontSize: 14, color: C.sky, fontWeight: 600 }}>
          Claude is building your itinerary…
        </span>
        <style>{`
          @keyframes bounce {
            0%,80%,100% { transform: translateY(0); opacity: .4; }
            40% { transform: translateY(-8px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: C.skyLight, borderRadius: 12, padding: "16px 20px",
      fontSize: 13, color: C.sky, fontFamily: "monospace",
      maxHeight: 200, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all",
    }}>
      {text.slice(0, 400)}{text.length > 400 ? "…" : ""}
    </div>
  );
}

function ItineraryPreview({ plan, onApply, onRegenerate, loading }) {
  const totalActivities = plan.stops.reduce((n, s) => n + s.activities.length, 0);
  const totalDays = plan.stops.reduce((n, s) => n + (s.days || 0), 0);

  return (
    <div>
      {/* Summary header */}
      <div style={{
        ...card, padding: "22px 26px", marginBottom: 16,
        borderLeft: `4px solid ${C.sky}`,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 12,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: FONT_SERIF }}>
            ✨ Your AI-Generated Plan
          </h3>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onRegenerate} style={{
              background: "#fff", color: C.sky, border: `1.5px solid ${C.sky}`,
              borderRadius: 8, padding: "7px 16px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>
              🔄 Regenerate
            </button>
            <button onClick={onApply} disabled={loading} style={{
              ...btnPrimary, padding: "7px 20px", fontSize: 13, borderRadius: 8,
              opacity: loading ? 0.7 : 1,
            }}>
              ✅ Apply to Trip →
            </button>
          </div>
        </div>

        <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.65, marginBottom: 16 }}>
          {plan.summary}
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { label: "Days", value: totalDays },
            { label: "Activities", value: totalActivities },
            { label: "Est. Cost", value: `$${plan.estimatedTotal?.toLocaleString() || "—"}` },
            { label: "Destinations", value: plan.stops.length },
          ].map(s => (
            <div key={s.label} style={{
              background: "#fff", borderRadius: 10,
              padding: "10px 18px", textAlign: "center",
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.sky }}>{s.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-stop breakdown */}
      {plan.stops.map((stop, si) => (
        <div key={si} style={{ ...card, padding: "20px 24px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                background: C.sky, color: "#fff",
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>{si + 1}</div>
              <h4 style={{ fontSize: 17, fontWeight: 700, color: C.text }}>{stop.cityName}</h4>
              <span style={{ fontSize: 13, color: C.textMuted }}>{stop.days} day{stop.days !== 1 ? "s" : ""}</span>
            </div>
            <span style={{ fontSize: 13, color: C.sky, fontWeight: 700 }}>
              ${stop.activities.reduce((n, a) => n + (a.cost || 0), 0).toLocaleString()} activities
            </span>
          </div>

          {/* Highlights */}
          {stop.highlights?.length > 0 && (
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
              {stop.highlights.map((h, i) => (
                <span key={i} style={{
                  background: C.skyLight, color: C.skyDark,
                  fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 9,
                }}>📍 {h}</span>
              ))}
            </div>
          )}

          {/* Activities by day */}
          {Array.from({ length: stop.days }).map((_, day) => {
            const dayActs = stop.activities.filter(a => a.dayNumber === day + 1);
            if (!dayActs.length) return null;
            return (
              <div key={day} style={{ marginBottom: 10 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: C.textSub,
                  textTransform: "uppercase", letterSpacing: "0.07em",
                  marginBottom: 6,
                }}>
                  Day {day + 1}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["morning", "afternoon", "evening"].map(tod => {
                    const acts = dayActs.filter(a => a.timeOfDay === tod);
                    if (!acts.length) return null;
                    return acts.map((act, ai) => (
                      <div key={ai} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px",
                        background: C.bg, borderRadius: 9,
                        border: `1px solid ${C.borderLight}`,
                      }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{act.icon || "🎯"}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>
                            {act.name}
                          </div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>
                            {tod} · {act.duration}h · {act.type}
                          </div>
                          {act.desc && (
                            <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>
                              {act.desc}
                            </div>
                          )}
                        </div>
                        <div style={{
                          fontSize: 14, fontWeight: 800,
                          color: act.cost === 0 ? C.success : C.sky,
                          flexShrink: 0,
                        }}>
                          {act.cost === 0 ? "Free" : `$${act.cost}`}
                        </div>
                      </div>
                    ));
                  })}
                </div>
              </div>
            );
          })}

          {/* Any activities without a dayNumber */}
          {stop.activities.filter(a => !a.dayNumber).map((act, ai) => (
            <div key={`un-${ai}`} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", background: C.bg, borderRadius: 9,
              border: `1px solid ${C.borderLight}`, marginBottom: 6,
            }}>
              <span style={{ fontSize: 18 }}>{act.icon || "🎯"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{act.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{act.type} · {act.duration}h</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: act.cost === 0 ? C.success : C.sky }}>
                {act.cost === 0 ? "Free" : `$${act.cost}`}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Tips */}
      {plan.tips?.length > 0 && (
        <div style={{
          ...card, padding: "18px 22px",
          background: C.goldLight, border: `1px solid ${C.gold}`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#8a6d00", marginBottom: 10 }}>
            💡 Local tips from Claude
          </div>
          {plan.tips.map((tip, i) => (
            <div key={i} style={{ fontSize: 13, color: "#6b5200", marginBottom: 6, display: "flex", gap: 8 }}>
              <span>•</span><span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function AIPlanner({ trip, onApply, onBack }) {
  const [stage, setStage]   = useState("form");    // form | streaming | preview | error
  const [rawText, setRaw]   = useState("");
  const [plan, setPlan]     = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [applying, setApplying] = useState(false);
  const abortRef = useRef(null);

  const handleGenerate = async (formData) => {
    setStage("streaming");
    setRaw("");
    setPlan(null);
    abortRef.current = new AbortController().signal;
    const prompt = buildPrompt(formData);
    let fullText = "";

    await streamItinerary({
      prompt,
      onChunk: (chunk) => {
        fullText += chunk;
        setRaw(t => t + chunk);
      },
      onDone: () => {
        // Extract JSON — Claude sometimes wraps it in ```json fences
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          setErrMsg("Claude returned an unexpected format. Try again.");
          setStage("error");
          return;
        }
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          // Enrich activities with data from our ACTIVITIES_LIST where names match
          const enriched = {
            ...parsed,
            stops: parsed.stops.map(stop => ({
              ...stop,
              activities: stop.activities.map(act => {
                const match = matchActivity(act.name);
                return match
                  ? { ...match, ...act, uid: Date.now() + Math.random() }
                  : { ...act, uid: Date.now() + Math.random() };
              }),
            })),
          };
          setPlan(enriched);
          setStage("preview");
        } catch {
          setErrMsg("Could not parse the itinerary. Please try again.");
          setStage("error");
        }
      },
      onError: (err) => {
        setErrMsg(err.message || "Something went wrong.");
        setStage("error");
      },
      abortRef,
    });
  };

  const handleApply = () => {
    if (!plan) return;
    setApplying(true);

    // Convert AI stops → trip stops format
    const newStops = plan.stops.map(s => ({
      id: Date.now() + Math.random(),
      cityName: s.cityName,
      city: CURATED_CITIES.find(c => c.name.toLowerCase() === s.cityName.toLowerCase()) || {
        name: s.cityName, costIndex: 100,
      },
      days: s.days || 3,
      activities: s.activities.map(a => ({
        id: a.id || `ai_${Date.now()}`,
        name: a.name,
        type: a.type || "sightseeing",
        cost: a.cost || 0,
        duration: a.duration || 2,
        icon: a.icon || "🎯",
        desc: a.desc || "",
        uid: Date.now() + Math.random(),
      })),
    }));

    onApply(newStops, plan.summary);
    toast("✅ AI itinerary applied to your trip!");
    setApplying(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingTop: 64 }}>
      {/* Header */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img
          src={trip.coverUrl || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=85"}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,25,45,.70)" }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 60px",
        }}>
          <div>
            <button onClick={onBack} style={{
              color: "rgba(255,255,255,.75)", background: "none", border: "none",
              cursor: "pointer", fontSize: 14, marginBottom: 8, fontFamily: "inherit",
            }}>
              ← Back to {trip.name}
            </button>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: FONT_SERIF }}>
              ✨ AI Itinerary Planner
            </h1>
            <p style={{ color: "rgba(255,255,255,.72)", fontSize: 13, marginTop: 4 }}>
              Tell Claude about your trip — get a full day-by-day plan in seconds
            </p>
          </div>
          {stage === "preview" && (
            <button onClick={() => setStage("form")} style={{
              background: "rgba(255,255,255,.15)", color: "#fff",
              border: "1.5px solid rgba(255,255,255,.4)",
              borderRadius: 9, padding: "9px 18px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>
              ← Edit Preferences
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 48px" }}>
        {/* FORM */}
        {stage === "form" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: FONT_SERIF, marginBottom: 6 }}>
                Plan your trip
              </h2>
              <p style={{ fontSize: 14, color: C.textMuted }}>
                Claude will generate a complete day-by-day itinerary with activities, costs, and local tips — tailored to your style.
              </p>
            </div>
            <PlannerForm trip={trip} onGenerate={handleGenerate} loading={false} />
          </>
        )}

        {/* STREAMING */}
        {stage === "streaming" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: FONT_SERIF, marginBottom: 6 }}>
                Generating your itinerary…
              </h2>
              <p style={{ fontSize: 14, color: C.textMuted }}>
                Claude is building a personalised day-by-day plan. This takes about 5–10 seconds.
              </p>
            </div>
            <StreamingPreview text={rawText} />
          </>
        )}

        {/* PREVIEW */}
        {stage === "preview" && plan && (
          <ItineraryPreview
            plan={plan}
            onApply={handleApply}
            onRegenerate={() => setStage("form")}
            loading={applying}
          />
        )}

        {/* ERROR */}
        {stage === "error" && (
          <div style={{
            ...card, padding: "40px", textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              Something went wrong
            </h3>
            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>{errMsg}</p>
            <button onClick={() => setStage("form")} style={{ ...btnPrimary, padding: "11px 28px", borderRadius: 10 }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
