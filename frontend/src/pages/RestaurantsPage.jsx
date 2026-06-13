import { useState, useEffect } from "react";
import { restaurantsAPI, CURATED_RESTAURANTS } from "../services/api";
import { C, FONT_SERIF } from "../constants/theme";
import FilterPills from "../components/common/FilterPills";
import RestaurantCard from "../components/common/RestaurantCard";
import { RestaurantSkeletonGrid } from "../components/common/SkeletonLoaders";
import { useDebounce } from "../hooks/useDebounce";

export default function RestaurantsPage() {
  const [filter, setFilter]         = useState("All");
  const [cuisineFilter, setCuisine] = useState("All");
  const [search, setSearch]         = useState(() => {
    const prefill = sessionStorage.getItem("tl_search_prefill") || "";
    sessionStorage.removeItem("tl_search_prefill");
    return prefill;
  });
  const [restaurants, setRests]     = useState([]);
  const [loading, setLoading]       = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    restaurantsAPI.list({ city: filter === "All" ? "" : filter, search: debouncedSearch }, abort.signal)
      .then(data => {
        if (!abort.signal.aborted) setRests(data.length ? data : CURATED_RESTAURANTS);
      })
      .catch(() => {
        if (!abort.signal.aborted) setRests(CURATED_RESTAURANTS);
      })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [filter, debouncedSearch]);

  const cityFilters = ["All", ...new Set(CURATED_RESTAURANTS.map(r => r.city))];
  const cuisines    = ["All", ...new Set(CURATED_RESTAURANTS.map(r => r.cuisine))];

  const filtered = restaurants
    .filter(r =>
      (filter === "All" || r.city === filter) &&
      (cuisineFilter === "All" || r.cuisine === cuisineFilter) &&
      (debouncedSearch === "" ||
        r.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.city.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.specialty?.toLowerCase().includes(debouncedSearch.toLowerCase()))
    )
    .sort((a, b) => b.rating - a.rating);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingTop: 64 }}>
      {/* Hero */}
      <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=85" alt="restaurants" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(10,25,45,.55),rgba(10,25,45,.45))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 48px" }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, color: "#fff", fontFamily: FONT_SERIF, marginBottom: 8, textAlign: "center" }}>Best Restaurants Worldwide</h1>
          <p style={{ color: "rgba(255,255,255,.8)", fontSize: 15, marginBottom: 24, textAlign: "center" }}>Special local food for every destination — from street eats to Michelin stars</p>
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,.96)", borderRadius: 50, overflow: "hidden", width: "100%", maxWidth: 520, boxShadow: "0 8px 32px rgba(0,0,0,.18)" }}>
            <span style={{ padding: "0 16px", fontSize: 18 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by restaurant, city or cuisine…"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: "inherit", background: "transparent", padding: "14px 0", color: C.text }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 48px" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Filter by City</div>
          <FilterPills options={cityFilters} active={filter} onChange={setFilter} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Filter by Cuisine</div>
          <FilterPills options={cuisines.slice(0, 8)} active={cuisineFilter} onChange={setCuisine} />
        </div>
        {!loading && <div style={{ marginBottom: 20, fontSize: 13, color: C.textMuted }}>{filtered.length} restaurants found</div>}

        {loading ? (
          <RestaurantSkeletonGrid count={6} />
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
              {filtered.map(r => (
                <RestaurantCard key={r._id || r.id} restaurant={r} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 40px", color: C.textMuted, fontSize: 15 }}>
                No restaurants found. Try adjusting your search.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
