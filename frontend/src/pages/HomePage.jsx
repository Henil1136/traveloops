import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CURATED_CITIES, CURATED_HOTELS, CURATED_RESTAURANTS, ACTIVITIES_LIST } from "../services/api";
import { C, FONT_SERIF, card, btnPrimary, btnOutline } from "../constants/theme";
import CartButton from "../components/common/CartButton";
import CityCard from "../components/common/CityCard";
import HotelCard from "../components/common/HotelCard";
import RestaurantCard from "../components/common/RestaurantCard";

// ── Typewriter ────────────────────────────────────────────────
function Typewriter({ phrases }) {
  const idxRef = useRef(0);
  const txtRef = useRef("");
  const delRef = useRef(false);
  const [display, setDisplay] = useState("");
  useEffect(() => {
    const p = phrases[idxRef.current]; let t;
    if (!delRef.current && txtRef.current.length < p.length) {
      txtRef.current = p.slice(0, txtRef.current.length + 1);
      t = setTimeout(() => setDisplay(txtRef.current), 55);
    } else if (!delRef.current) {
      t = setTimeout(() => { delRef.current = true; }, 2200);
    } else if (delRef.current && txtRef.current.length > 0) {
      txtRef.current = txtRef.current.slice(0, -1);
      t = setTimeout(() => setDisplay(txtRef.current), 28);
    } else {
      delRef.current = false;
      idxRef.current = (idxRef.current + 1) % phrases.length;
      t = setTimeout(() => setDisplay(""), 0);
    }
    return () => clearTimeout(t);
  }, [display, phrases]);
  return <span style={{borderRight:"3px solid rgba(255,255,255,.85)",paddingRight:3}}>{display}</span>;
}

// ── Global Search ─────────────────────────────────────────────
function GlobalSearch({ onNavigate }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = (val) => {
    setQ(val);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    const v = val.toLowerCase();
    const cityHits  = CURATED_CITIES.filter(c => c.name.toLowerCase().includes(v)||c.country.toLowerCase().includes(v)||c.desc?.toLowerCase().includes(v)).slice(0,3).map(c=>({...c,_type:"city"}));
    const hotelHits = CURATED_HOTELS.filter(h => h.name.toLowerCase().includes(v)||h.city.toLowerCase().includes(v)||h.amenities?.join(" ").toLowerCase().includes(v)).slice(0,3).map(h=>({...h,_type:"hotel"}));
    const restHits  = CURATED_RESTAURANTS.filter(r => r.name.toLowerCase().includes(v)||r.city.toLowerCase().includes(v)||r.cuisine?.toLowerCase().includes(v)||r.specialty?.toLowerCase().includes(v)).slice(0,3).map(r=>({...r,_type:"restaurant"}));
    const actHits   = ACTIVITIES_LIST.filter(a => a.name.toLowerCase().includes(v)||a.type.toLowerCase().includes(v)||a.desc?.toLowerCase().includes(v)).slice(0,2).map(a=>({...a,_type:"activity"}));
    setResults([...cityHits,...hotelHits,...restHits,...actHits]);
    setOpen(true);
  };

  const typeIcons = { city:"📍", hotel:"🏨", restaurant:"🍽️", activity:"🎯" };
  const typeLabels = { city:"City", hotel:"Hotel", restaurant:"Restaurant", activity:"Activity" };

  const handleSelect = (item) => {
    setOpen(false);
    // Store the search term so the destination page can auto-filter to this item
    sessionStorage.setItem("tl_search_prefill", item.name || "");
    if (item._type === "hotel")      { onNavigate("hotels");      }
    else if (item._type === "restaurant") { onNavigate("restaurants"); }
    else if (item._type === "activity")   { onNavigate("explore");     }
    else                                  { onNavigate("explore");     }
    setQ("");
  };

  return (
    <div ref={ref} style={{position:"relative",width:"100%",maxWidth:700}}>
      <div style={{
        display:"flex",alignItems:"center",
        background:"rgba(255,255,255,.97)",
        borderRadius:50,overflow:"visible",
        boxShadow:"0 12px 40px rgba(0,0,0,.2)",
        position:"relative",zIndex:2,
      }}>
        <span style={{padding:"0 20px",fontSize:22}}>🔍</span>
        <input
          value={q}
          onChange={e=>search(e.target.value)}
          onFocus={()=>q&&setOpen(true)}
          placeholder="Search hotels, restaurants, cities, activities…"
          style={{flex:1,border:"none",outline:"none",fontSize:16,fontFamily:"inherit",
            background:"transparent",padding:"16px 0",color:C.text}}
        />
        <button style={{...btnPrimary,borderRadius:50,margin:5,padding:"12px 28px",fontSize:15}}>
          Search
        </button>
      </div>
      {/* Dropdown results */}
      {open && results.length>0 && (
        <div style={{
          position:"absolute",top:"calc(100% + 8px)",left:0,right:0,
          background:"#fff",borderRadius:16,
          boxShadow:"0 16px 48px rgba(0,0,0,.16)",
          border:`1px solid ${C.border}`,overflow:"hidden",zIndex:300,
        }}>
          {results.map((item,i)=>(
            <div key={i} onClick={()=>handleSelect(item)} style={{
              display:"flex",alignItems:"center",gap:12,
              padding:"12px 18px",cursor:"pointer",
              borderBottom:i<results.length-1?`1px solid ${C.borderLight}`:"none",
              transition:"background .15s",
            }}
              onMouseEnter={e=>e.currentTarget.style.background=C.skyLight}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {item.img
                ? <img src={item.img} alt={item.name} style={{width:44,height:44,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
                : <div style={{width:44,height:44,borderRadius:8,background:C.skyLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{typeIcons[item._type]}</div>}
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:C.text}}>{item.name}</div>
                <div style={{fontSize:12,color:C.textMuted}}>{item.city||item.country||item.type}</div>
              </div>
              <span style={{background:C.skyLight,color:C.sky,fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:10}}>
                {typeLabels[item._type]}
              </span>
            </div>
          ))}
          {/* View all link */}
          <div onClick={()=>{setOpen(false);onNavigate("explore");}} style={{
            padding:"12px 18px",textAlign:"center",cursor:"pointer",
            color:C.sky,fontWeight:600,fontSize:13,
            background:C.bg,
          }}>View all results for "{q}" →</div>
        </div>
      )}
    </div>
  );
}

// ── Trip Type Tabs ────────────────────────────────────────────
function TripTypeTabs({ active, onChange }) {
  const tabs = [
    {id:"hotels",    icon:"🏨", label:"Hotels"},
    {id:"flights",   icon:"✈️", label:"Flights"},
    {id:"transport", icon:"🚆", label:"Transport"},
    {id:"restaurants",icon:"🍽️",label:"Restaurants"},
    {id:"experiences",icon:"🎯",label:"Experiences"},
  ];
  return (
    <div style={{display:"flex",gap:4,background:"rgba(255,255,255,.14)",borderRadius:14,padding:5,backdropFilter:"blur(8px)"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} style={{
          background:active===t.id?"rgba(255,255,255,.95)":"transparent",
          color:active===t.id?C.sky:"rgba(255,255,255,.8)",
          border:"none",borderRadius:10,
          padding:"10px 20px",fontSize:14,fontWeight:600,
          cursor:"pointer",fontFamily:"inherit",
          display:"flex",alignItems:"center",gap:7,
          transition:"all .2s",
        }}>
          <span>{t.icon}</span><span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── City Card ─────────────────────────────────────────────────
// (using shared CityCard component from ../components/common/CityCard)

// ── Section Header ────────────────────────────────────────────
function SectionHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:700,color:C.text,fontFamily:FONT_SERIF}}>{title}</h2>
        {subtitle && <p style={{fontSize:13,color:C.textMuted,marginTop:3}}>{subtitle}</p>}
      </div>
      {onAction && (
        <button onClick={onAction} style={{
          background:"transparent",color:C.sky,
          border:`1.5px solid ${C.sky}`,borderRadius:9,
          padding:"7px 16px",fontSize:13,fontWeight:600,
          cursor:"pointer",fontFamily:"inherit",
        }}>{actionLabel||"View All"} →</button>
      )}
    </div>
  );
}

// ── Hotel Card (Home) ─────────────────────────────────────────
// (using shared HotelCard component from ../components/common/HotelCard)

// ── Restaurant Card (Home) ────────────────────────────────────
// (using shared RestaurantCard component from ../components/common/RestaurantCard)

// ── Trust Badges ──────────────────────────────────────────────
function TrustBadges() {
  const badges = [
    {icon:"🏨",count:"10,000+",label:"Hotels"},
    {icon:"🍽️",count:"25,000+",label:"Restaurants"},
    {icon:"📍",count:"500+",   label:"Cities"},
    {icon:"👥",count:"50,000+",label:"Travelers"},
    {icon:"⭐",count:"4.9/5",  label:"Rating"},
  ];
  return (
    <div style={{
      background:`linear-gradient(135deg,${C.sky},${C.skyDeep})`,
      borderRadius:20,padding:"32px 40px",
    }}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:16,textAlign:"center"}}>
        {badges.map(b=>(
          <div key={b.label}>
            <div style={{fontSize:28,marginBottom:6}}>{b.icon}</div>
            <div style={{fontSize:22,fontWeight:800,color:"#fff"}}>{b.count}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.7)",marginTop:2}}>{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {n:"01",icon:"🔍",title:"Search Everything",    desc:"Hotels, restaurants, experiences — search our entire database by city, keyword or cuisine"},
    {n:"02",icon:"🛒",title:"Build Your Cart",      desc:"Add hotels, meals and activities from different providers into one unified trip cart"},
    {n:"03",icon:"💰",title:"See Exact Budget",     desc:"Get an accurate, itemized cost breakdown for your entire trip before you commit"},
    {n:"04",icon:"📅",title:"Book All at Once",     desc:"Confirm every booking in a single checkout — hotels, restaurants, and experiences together"},
  ];
  return (
    <div style={{background:C.bg,borderRadius:20,padding:"40px 48px"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <h2 style={{fontSize:28,fontWeight:700,color:C.text,fontFamily:FONT_SERIF,marginBottom:8}}>How Traveloops Works</h2>
        <p style={{fontSize:15,color:C.textMuted}}>Plan your entire trip in 4 simple steps — smarter than any travel app</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24}}>
        {steps.map((s,i)=>(
          <div key={s.n} style={{textAlign:"center",position:"relative"}}>
            {i<3&&<div style={{position:"absolute",top:28,left:"calc(50% + 28px)",right:"calc(-50% + 28px)",height:2,background:`linear-gradient(to right,${C.sky},${C.skyLight})`,zIndex:0}}/>}
            <div style={{
              width:56,height:56,borderRadius:16,
              background:`linear-gradient(135deg,${C.sky},${C.skyDeep})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:24,margin:"0 auto 14px",position:"relative",zIndex:1,
              boxShadow:`0 6px 20px ${C.skyGlow}`,
            }}>{s.icon}</div>
            <div style={{color:C.skyDark,fontSize:11,fontWeight:700,letterSpacing:"0.07em",marginBottom:6}}>STEP {s.n}</div>
            <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:8}}>{s.title}</div>
            <div style={{color:C.textMuted,fontSize:13,lineHeight:1.6}}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main HomePage ─────────────────────────────────────────────
export default function HomePage() {
  const navigate      = useNavigate();
  const { user }       = useAuth();
  const [heroIdx, setHeroIdx]     = useState(0);
  const [searchType, setSearchType] = useState("hotels");
  const [filter, setFilter]       = useState("All");

  const heroImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85",
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=85",
  ];
  const phrases = [
    "Can't find the right hotel in your budget?",
    "Looking for the best local food at every destination?",
    "Want a full day plan for any city?",
    "Tired of booking everything separately?",
    "Need an accurate trip budget estimate?",
  ];
  const bottomCities = CURATED_CITIES.slice(0,6);
  const regionFilters = ["All","Asia","Europe","Americas","Middle East","Africa","Beach"];
  const filteredCities = filter==="All" ? CURATED_CITIES : filter==="Beach"
    ? CURATED_CITIES.filter(c=>c.tag==="Beach"||c.name==="Maldives"||c.name==="Bali")
    : CURATED_CITIES.filter(c=>c.region===filter);

  useEffect(()=>{
    const t=setInterval(()=>setHeroIdx(i=>(i+1)%heroImages.length),5500);
    return()=>clearInterval(t);
  },[]);

  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      {/* ── HERO ── */}
      <div style={{position:"relative",minHeight:"100vh",overflow:"hidden"}}>
        {heroImages.map((img,i)=>(
          <div key={i} style={{
            position:"absolute",inset:0,
            backgroundImage:`url(${img})`,backgroundSize:"cover",backgroundPosition:"center",
            opacity:i===heroIdx?1:0,transition:"opacity 1.8s ease",zIndex:0,
          }}/>
        ))}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(10,25,45,.6) 0%,rgba(10,25,45,.38) 50%,rgba(10,25,45,.76) 100%)",zIndex:1}}/>

        {/* Hero content */}
        <div style={{
          position:"relative",zIndex:2,minHeight:"100vh",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          padding:"120px 48px 200px",textAlign:"center",
        }}>
          <div style={{display:"flex",gap:14,marginBottom:28,flexWrap:"wrap",justifyContent:"center"}}>
            {[{icon:"🗺️",text:"500+ Destinations"},{icon:"🏨",text:"10k+ Hotels"},{icon:"⭐",text:"Trusted by 50k+"}].map(m=>(
              <div key={m.text} style={{
                display:"flex",alignItems:"center",gap:7,
                background:"rgba(255,255,255,.14)",backdropFilter:"blur(8px)",
                border:"1px solid rgba(255,255,255,.28)",borderRadius:22,padding:"7px 16px",
              }}>
                <span style={{fontSize:15}}>{m.icon}</span>
                <span style={{color:"#fff",fontSize:13,fontWeight:500}}>{m.text}</span>
              </div>
            ))}
          </div>

          <h1 style={{
            fontSize:58,fontWeight:700,color:"#fff",lineHeight:1.08,
            marginBottom:18,fontFamily:FONT_SERIF,
            textShadow:"0 2px 28px rgba(0,0,0,.35)",maxWidth:780,
          }}>
            Your perfect trip,<br/><span style={{color:"#7dd8ea"}}>crafted in minutes.</span>
          </h1>

          <div style={{fontSize:20,color:"rgba(255,255,255,.88)",marginBottom:18,minHeight:32,fontWeight:300}}>
            <Typewriter phrases={phrases}/>
          </div>

          <p style={{fontSize:15,color:"rgba(255,255,255,.7)",marginBottom:40,maxWidth:560,lineHeight:1.78}}>
            Hotels, restaurants, experiences & day plans — all in one place.
            Add to cart, book together, track your budget. Travel smart.
          </p>

          {/* Trip type tabs */}
          <TripTypeTabs active={searchType} onChange={setSearchType}/>

          {/* Global search */}
          <div style={{marginTop:16,width:"100%",maxWidth:700}}>
            <GlobalSearch onNavigate={navigate}/>
          </div>
        </div>

        {/* Bottom photo strip */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:3,display:"flex",height:130,overflow:"hidden"}}>
          {bottomCities.map((d,i)=>(
            <div key={i} onClick={()=>navigate("/explore")} style={{flex:1,position:"relative",overflow:"hidden",cursor:"pointer"}}>
              <img src={d.img} alt={d.name} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.75,transition:"opacity .3s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                onMouseLeave={e=>e.currentTarget.style.opacity=".75"}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.68),transparent)"}}/>
              <div style={{position:"absolute",bottom:10,left:12}}>
                <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{d.name}</div>
                <div style={{color:"rgba(255,255,255,.78)",fontSize:11}}>~${d.costIndex}/night</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"60px 48px"}}>

        {/* Trust badges */}
        <div style={{marginBottom:64}}><TrustBadges/></div>

        {/* Featured destinations */}
        <div style={{marginBottom:64}}>
          <SectionHeader
            title="Explore Destinations"
            subtitle="Handpicked cities loved by millions of travelers worldwide"
            actionLabel="See All Cities"
            onAction={()=>navigate("/explore")}
          />
          {/* Region filter */}
          <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
            {regionFilters.map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{
                background:filter===f?C.sky:"#fff",
                color:filter===f?"#fff":C.textSub,
                border:`1.5px solid ${filter===f?C.sky:C.border}`,
                borderRadius:20,padding:"7px 18px",fontSize:13,fontWeight:600,
                cursor:"pointer",fontFamily:"inherit",transition:"all .2s",
              }}>{f}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18}}>
            {filteredCities.slice(0,8).map(city=>(
              <CityCard key={city.id} city={city} onClick={()=>navigate("/explore")}/>
            ))}
          </div>
        </div>

        {/* Top Hotels */}
        <div style={{marginBottom:64}}>
          <SectionHeader
            title="Top Hotels Worldwide"
            subtitle="Curated stays — from budget escapes to five-star luxury"
            actionLabel="All Hotels"
            onAction={()=>navigate("/hotels")}
          />
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18}}>
            {CURATED_HOTELS.slice(0,4).map(h=><HotelCard key={h.id} hotel={h} compact/>)}
          </div>
        </div>

        {/* Top Restaurants */}
        <div style={{marginBottom:64}}>
          <SectionHeader
            title="Best Restaurants"
            subtitle="Special local food for every destination — from street eats to fine dining"
            actionLabel="All Restaurants"
            onAction={()=>navigate("/restaurants")}
          />
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18}}>
            {CURATED_RESTAURANTS.slice(0,4).map(r=><RestaurantCard key={r.id} restaurant={r} compact/>)}
          </div>
        </div>

        {/* How it works */}
        <div style={{marginBottom:64}}><HowItWorks/></div>

        {/* CTA Banner */}
        <div style={{
          borderRadius:20,overflow:"hidden",position:"relative",height:280,
          background:`linear-gradient(135deg,${C.sky},${C.skyDeep})`,
        }}>
          <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80" alt="cta"
            style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.25}}/>
          <div style={{position:"relative",zIndex:1,height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 60px"}}>
            <h2 style={{fontSize:34,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF,marginBottom:12}}>
              {user ? `Welcome back, ${user.name}! Ready to plan?` : "Start planning your dream trip today"}
            </h2>
            <p style={{color:"rgba(255,255,255,.8)",fontSize:15,marginBottom:28,maxWidth:520,lineHeight:1.7}}>
              Hotels, restaurants, experiences — add them all to your cart and book together with one accurate budget.
            </p>
            <div style={{display:"flex",gap:14}}>
              <button onClick={()=>navigate(user?"/trips":"/login")} style={{
                ...btnPrimary,background:"#fff",color:C.sky,padding:"13px 32px",fontSize:15,borderRadius:12,
              }}>{user?"Plan a New Trip →":"Sign Up Free →"}</button>
              <button onClick={()=>navigate("/explore")} style={{
                background:"transparent",color:"#fff",border:"2px solid rgba(255,255,255,.7)",
                borderRadius:12,padding:"11px 28px",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
              }}>Explore Destinations</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
