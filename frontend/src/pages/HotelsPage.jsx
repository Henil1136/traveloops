import { useState, useEffect } from "react";
import { hotelsAPI, CURATED_HOTELS } from "../services/api";
import { C, FONT_SERIF } from "../constants/theme";
import FilterPills from "../components/common/FilterPills";
import HotelCard from "../components/common/HotelCard";
import { HotelSkeletonGrid } from "../components/common/SkeletonLoaders";
import { useDebounce } from "../hooks/useDebounce";

export default function HotelsPage() {
  const [filter, setFilter]   = useState("All");
  const [sort, setSort]       = useState("rating");
  const [search, setSearch]   = useState(() => {
    const prefill = sessionStorage.getItem("tl_search_prefill") || "";
    sessionStorage.removeItem("tl_search_prefill");
    return prefill;
  });
  const [hotels, setHotels]   = useState([]);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch from backend; fall back to curated static data
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    hotelsAPI.list({ city: filter === "All" ? "" : filter, search: debouncedSearch }, abort.signal)
      .then(data => {
        if (!abort.signal.aborted) setHotels(data.length ? data : CURATED_HOTELS);
      })
      .catch(() => {
        if (!abort.signal.aborted) setHotels(CURATED_HOTELS);
      })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [filter, debouncedSearch]);

  const cityFilters = ["All", ...new Set(CURATED_HOTELS.map(h => h.city))];

  const displayed = hotels
    .filter(h =>
      (filter === "All" || h.city === filter) &&
      (debouncedSearch === "" ||
        h.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        h.city.toLowerCase().includes(debouncedSearch.toLowerCase()))
    )
    .sort((a, b) =>
      sort === "price_asc"  ? a.pricePerNight - b.pricePerNight :
      sort === "price_desc" ? b.pricePerNight - a.pricePerNight :
      b.rating - a.rating
    );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingTop: 64 }}>
      {/* Hero */}
      <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=85"
          alt="hotels"
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(10,25,45,.55),rgba(10,25,45,.45))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 48px" }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, color: "#fff", fontFamily: FONT_SERIF, marginBottom: 8, textAlign: "center" }}>Find Your Perfect Hotel</h1>
          <p style={{ color: "rgba(255,255,255,.8)", fontSize: 15, marginBottom: 24, textAlign: "center" }}>Curated stays across 500+ destinations — from budget to luxury</p>
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,.96)", borderRadius: 50, overflow: "hidden", width: "100%", maxWidth: 520, boxShadow: "0 8px 32px rgba(0,0,0,.18)" }}>
            <span style={{ padding: "0 16px", fontSize: 18 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by hotel name or city…"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: "inherit", background: "transparent", padding: "14px 0", color: C.text }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 48px" }}>
        {/* Filters row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <FilterPills options={cityFilters} active={filter} onChange={setFilter} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 600 }}>Sort:</span>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ border: `1.5px solid ${C.border}`, borderRadius: 9, padding: "7px 14px", fontSize: 13, fontFamily: "inherit", color: C.text, background: "#fff", cursor: "pointer", outline: "none" }}>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
            {!loading && <span style={{ fontSize: 13, color: C.textMuted }}>{displayed.length} hotels</span>}
          </div>
        </div>

        {/* Skeleton or grid */}
        {loading ? (
          <HotelSkeletonGrid count={6} />
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
              {displayed.map(h => (
                <HotelCard key={h._id || h.id} hotel={h} />
              ))}
            </div>
            {displayed.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 40px", color: C.textMuted, fontSize: 15 }}>
                No hotels found for "{debouncedSearch}" in {filter}. Try adjusting your search.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
