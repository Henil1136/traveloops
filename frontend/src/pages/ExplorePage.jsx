import { useState, useEffect } from "react";
import { CURATED_CITIES, CURATED_HOTELS, CURATED_RESTAURANTS, ACTIVITIES_LIST } from "../services/api";
import { useNavigate } from "react-router-dom";
import { C, FONT_SERIF, card, btnPrimary } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import FilterPills from "../components/common/FilterPills";
import CityCard from "../components/common/CityCard";
import HotelCard from "../components/common/HotelCard";
import RestaurantCard from "../components/common/RestaurantCard";

// Real city-specific activities data
const CITY_ACTIVITIES = {
  "Bali": [
    { id:"ba1", name:"Tanah Lot Temple Sunset Tour",     type:"culture",   cost:25,  duration:4, icon:"🛕", desc:"Visit the iconic sea temple at golden hour — one of Bali's most sacred sites", location:"Tabanan" },
    { id:"ba2", name:"Ubud Rice Terrace Trek",           type:"adventure", cost:18,  duration:5, icon:"🌾", desc:"Walk through the UNESCO-listed Tegalalang rice paddies at sunrise", location:"Ubud" },
    { id:"ba3", name:"Balinese Cooking Class at Warung", type:"food",      cost:65,  duration:4, icon:"👨‍🍳",desc:"Learn to cook nasi goreng, satay & black rice pudding with local family", location:"Ubud" },
    { id:"ba4", name:"Monkey Forest Sanctuary",          type:"sightseeing",cost:5,  duration:2, icon:"🐒", desc:"500+ sacred monkeys roam freely through ancient temple ruins in the jungle", location:"Ubud" },
    { id:"ba5", name:"Mount Batur Sunrise Hike",         type:"adventure", cost:55,  duration:8, icon:"🌋", desc:"Pre-dawn hike up an active volcano for a spectacular 360° sunrise", location:"Kintamani" },
    { id:"ba6", name:"Seminyak Beach Club Day",          type:"leisure",   cost:40,  duration:6, icon:"🏊", desc:"Spend a day at world-famous Ku De Ta or Potato Head — pool, cocktails, sunset", location:"Seminyak" },
    { id:"ba7", name:"Traditional Kecak Fire Dance",     type:"culture",   cost:12,  duration:2, icon:"🔥", desc:"Watch 100+ performers in a mesmerizing trance-dance ritual at Uluwatu", location:"Uluwatu" },
    { id:"ba8", name:"Snorkeling at Menjangan Island",   type:"adventure", cost:75,  duration:8, icon:"🤿", desc:"Crystal clear waters with coral walls — best snorkeling in Bali, hands down", location:"Buleleng" },
  ],
  "Paris": [
    { id:"pa1", name:"Louvre Museum Skip-the-Line",      type:"culture",   cost:22,  duration:4, icon:"🏛️", desc:"See the Mona Lisa, Venus de Milo and 35,000+ works without the queue", location:"1st Arr." },
    { id:"pa2", name:"Eiffel Tower Summit Entry",        type:"sightseeing",cost:29, duration:3, icon:"🗼", desc:"Take the lift to the very top of the Iron Lady for panoramic city views", location:"Trocadéro" },
    { id:"pa3", name:"Seine River Evening Cruise",       type:"sightseeing",cost:18, duration:2, icon:"⛵", desc:"Glide past Notre-Dame, Musée d'Orsay and illuminated bridges after dark", location:"Pont d'Iéna" },
    { id:"pa4", name:"Montmartre & Sacré-Cœur Walk",    type:"culture",   cost:0,   duration:3, icon:"🎨", desc:"Wander cobblestone streets, artists' squares and Picasso's old neighbourhood", location:"18th Arr." },
    { id:"pa5", name:"French Pastry & Macaroon Class",  type:"food",      cost:95,  duration:3, icon:"🥐", desc:"Learn croissant lamination and macaron technique at a professional pastry kitchen", location:"Le Marais" },
    { id:"pa6", name:"Palace of Versailles Day Trip",    type:"culture",   cost:30,  duration:8, icon:"👑", desc:"Explore the Hall of Mirrors, royal apartments and 800-hectare gardens", location:"Versailles" },
    { id:"pa7", name:"Moulin Rouge Dinner & Show",      type:"leisure",   cost:190, duration:4, icon:"🎭", desc:"The original 1889 cabaret — French cuisine + the world's most famous can-can show", location:"Pigalle" },
    { id:"pa8", name:"Marché d'Aligre Food Tour",       type:"food",      cost:55,  duration:3, icon:"🧀", desc:"Taste 200-year-old market specialties: cheeses, charcuterie & Parisian street food", location:"12th Arr." },
  ],
  "Tokyo": [
    { id:"tk1", name:"Tsukiji Outer Market Food Walk",   type:"food",      cost:45,  duration:3, icon:"🍣", desc:"Taste fresh sashimi, tamagoyaki & rolled omelettes at Japan's historic fish market", location:"Chuo" },
    { id:"tk2", name:"Shibuya Crossing & Harajuku Tour", type:"culture",   cost:15,  duration:4, icon:"🌆", desc:"Experience the world's busiest crossing, then explore kawaii fashion in Harajuku", location:"Shibuya" },
    { id:"tk3", name:"Senso-ji Temple Morning Visit",    type:"culture",   cost:0,   duration:2, icon:"⛩️", desc:"Tokyo's oldest temple glows at dawn — incense, fortune sticks & Nakamise shopping", location:"Asakusa" },
    { id:"tk4", name:"Ramen Making Workshop",           type:"food",      cost:70,  duration:3, icon:"🍜", desc:"Craft tonkotsu broth from scratch and hand-pull your noodles with a Tokyo chef", location:"Shinjuku" },
    { id:"tk5", name:"Akihabara Electronics & Anime",   type:"leisure",   cost:0,   duration:4, icon:"🎮", desc:"Japan's electric town — 8-storey arcades, retro games, anime shops and maid cafes", location:"Akihabara" },
    { id:"tk6", name:"Teamlab Borderless Digital Art",  type:"culture",   cost:32,  duration:3, icon:"🌊", desc:"Immersive digital art museum — light forests, crystal worlds and flower seas", location:"Toyosu" },
    { id:"tk7", name:"Mt. Fuji & Hakone Day Trip",      type:"adventure", cost:85,  duration:12,icon:"🗻", desc:"Bullet train to see Fuji, hot springs in Hakone, and Hakone Open Air Museum", location:"Hakone" },
    { id:"tk8", name:"Shinjuku Golden Gai Bar Crawl",   type:"leisure",   cost:35,  duration:3, icon:"🍶", desc:"200+ tiny bars hidden in a WWII-era alley — yakitori, sake and jazz with locals", location:"Shinjuku" },
  ],
  "Dubai": [
    { id:"du1", name:"Burj Khalifa At the Top (124F)",   type:"sightseeing",cost:43, duration:2, icon:"🏙️", desc:"Views from 452m above the world's tallest building — Dubai skyline & desert beyond", location:"Downtown" },
    { id:"du2", name:"Desert Safari with BBQ Dinner",    type:"adventure", cost:65,  duration:6, icon:"🐪", desc:"Dune bashing, camel ride, sandboarding & traditional Bedouin camp feast", location:"Al Maha Desert" },
    { id:"du3", name:"Dubai Creek Abra Ride & Souks",    type:"culture",   cost:5,   duration:3, icon:"⛵", desc:"Cross the historic creek by wooden boat, then explore gold and spice souks", location:"Old Dubai" },
    { id:"du4", name:"Dubai Frame & Museum Tour",        type:"culture",   cost:20,  duration:2, icon:"🖼️", desc:"Walk the glass skywalk bridging old and new Dubai at 150m height", location:"Zabeel Park" },
    { id:"du5", name:"Dubai Mall & Aquarium Visit",      type:"leisure",   cost:18,  duration:4, icon:"🐠", desc:"Walk through a 10-million-litre tank tunnel — 33,000 aquatic creatures around you", location:"Downtown" },
    { id:"du6", name:"Hot Air Balloon Over Desert",      type:"adventure", cost:180, duration:4, icon:"🎈", desc:"Float 1,500ft above the Arabian desert at sunrise — camels, foxes and endless dunes", location:"Margham" },
    { id:"du7", name:"Palm Jumeirah Monorail & Views",   type:"sightseeing",cost:8,  duration:2, icon:"🌴", desc:"Ride the automated monorail along the frond to the Atlantis and back", location:"Palm Jumeirah" },
  ],
  "Kyoto": [
    { id:"ky1", name:"Arashiyama Bamboo Grove Walk",     type:"sightseeing",cost:0,  duration:3, icon:"🎍", desc:"The iconic towering bamboo path — best visited at 6am before the crowds", location:"Arashiyama" },
    { id:"ky2", name:"Fushimi Inari 10,000 Torii Gates", type:"culture",  cost:0,   duration:4, icon:"⛩️", desc:"Hike the mystical red torii gate tunnel up Mount Inari at golden hour", location:"Fushimi" },
    { id:"ky3", name:"Traditional Tea Ceremony",         type:"culture",   cost:35,  duration:2, icon:"🍵", desc:"Learn chado (the way of tea) with matcha whisking in a 400-year-old machiya", location:"Higashiyama" },
    { id:"ky4", name:"Geisha District Evening Walk",     type:"culture",   cost:20,  duration:2, icon:"🎎", desc:"Guided walk through Gion at dusk — spot real maiko between ochaya appointments", location:"Gion" },
    { id:"ky5", name:"Nishiki Market Food Tour",         type:"food",      cost:55,  duration:3, icon:"🍡", desc:"400m of Kyoto's kitchen: pickles, dashi broth, fresh tofu and kinako mochi", location:"Nakagyo" },
    { id:"ky6", name:"Kinkaku-ji Golden Pavilion",       type:"culture",   cost:5,   duration:2, icon:"✨", desc:"The gold-leafed Zen temple reflected in Kyoko-chi mirror pond — iconic Japan", location:"Kita" },
  ],
  "Santorini": [
    { id:"sa1", name:"Oia Sunset Cliffside Walk",        type:"sightseeing",cost:0,  duration:3, icon:"🌅", desc:"Walk from Fira to Oia along the caldera rim for the world's most famous sunset", location:"Oia" },
    { id:"sa2", name:"Catamaran Sailing & Snorkeling",   type:"adventure", cost:95,  duration:5, icon:"⛵", desc:"Sail to volcanic hot springs, Red Beach, White Beach & snorkel in the caldera", location:"Vlychada" },
    { id:"sa3", name:"Santorini Wine Tasting Tour",      type:"food",      cost:75,  duration:3, icon:"🍷", desc:"Taste Assyrtiko and Vinsanto wines at 3 wineries with caldera views", location:"Pyrgos" },
    { id:"sa4", name:"Akrotiri Archaeological Site",     type:"culture",   cost:14,  duration:2, icon:"🏛️", desc:"The 'Pompeii of the Aegean' — a complete Bronze Age city preserved under volcanic ash", location:"Akrotiri" },
    { id:"sa5", name:"Cooking Class with Local Chef",    type:"food",      cost:85,  duration:4, icon:"🫒", desc:"Make fava, tomatokeftedes & fresh octopus in a local kitchen with Aegean view", location:"Megalochori" },
  ],
  "New York": [
    { id:"ny1", name:"Statue of Liberty & Ellis Island",  type:"culture",  cost:24,  duration:5, icon:"🗽", desc:"Ferry to Lady Liberty and the immigration museum — book the pedestal pass!", location:"Harbor" },
    { id:"ny2", name:"Metropolitan Museum of Art",        type:"culture",  cost:30,  duration:4, icon:"🎨", desc:"5,000 years of human creativity across 2 million+ works of art", location:"Upper East Side" },
    { id:"ny3", name:"Central Park Bike Rental",          type:"adventure",cost:35,  duration:4, icon:"🚲", desc:"Cycle 6 miles of car-free paths through Bethesda Terrace, the Reservoir & Sheep Meadow", location:"Midtown" },
    { id:"ny4", name:"Brooklyn Food & Culture Walk",      type:"food",     cost:65,  duration:4, icon:"🌮", desc:"Smorgasburg, Prospect Park, artisanal pizza and the best bagel in New York", location:"Williamsburg" },
    { id:"ny5", name:"High Line & Chelsea Market",        type:"leisure",  cost:0,   duration:3, icon:"🌿", desc:"Elevated park on a former freight rail line — street art, gardens, Hudson views", location:"Chelsea" },
    { id:"ny6", name:"Broadway Show (Hamilton/Lion King)", type:"culture", cost:120, duration:3, icon:"🎭", desc:"World-class Broadway theatre in the heart of Times Square", location:"Midtown" },
    { id:"ny7", name:"Empire State Building Observatory", type:"sightseeing",cost:44,duration:2, icon:"🏙️", desc:"360° views from the 86th floor — NYC's most iconic building", location:"Midtown" },
  ],
  "Barcelona": [
    { id:"bc1", name:"Sagrada Família Skip-the-Line",     type:"culture",  cost:33,  duration:3, icon:"⛪", desc:"Gaudí's unfinished masterpiece — the towers, the nave and the forest of columns", location:"Eixample" },
    { id:"bc2", name:"Park Güell & Gaudí Trail",          type:"sightseeing",cost:10,duration:3, icon:"🦎", desc:"Mosaic terraces, gingerbread gatehouses and a lizard fountain above the city", location:"Gràcia" },
    { id:"bc3", name:"La Boqueria Market Food Tour",      type:"food",     cost:55,  duration:3, icon:"🥘", desc:"Spain's most famous market — jamón ibérico, fresh seafood, cava and pintxos", location:"Las Ramblas" },
    { id:"bc4", name:"Barceloneta Beach & Paella Lunch",  type:"leisure",  cost:35,  duration:5, icon:"🏖️", desc:"Morning swim at the beach followed by authentic seafood paella at Barceloneta", location:"Barceloneta" },
    { id:"bc5", name:"Tapas & Flamenco Evening",          type:"culture",  cost:80,  duration:4, icon:"💃", desc:"Authentic flamenco show with sangria, tortilla española and patatas bravas", location:"Gothic Quarter" },
  ],
};

const getActivitiesForCity = (cityName) =>
  CITY_ACTIVITIES[cityName] || ACTIVITIES_LIST.map(a => ({...a, location: cityName}));


// (using shared CityCard component from ../components/common/CityCard)

function CityDetailView({ city, onBack, navigate }) {
  const { addItem, isInCart } = useCart();
  const [tab, setTab] = useState("hotels");
  const hotels      = CURATED_HOTELS.filter(h=>h.city===city.name);
  const restaurants = CURATED_RESTAURANTS.filter(r=>r.city===city.name);
  const cityActivities = getActivitiesForCity(city.name);

  const addActivity = (act) => {
    const cartId = `activity-${act.id}-${city.name}`;
    if (isInCart(cartId)) return;
    addItem({ ...act, cartId, type:"activity", name:`${act.name} — ${city.name}`, city: city.name });
  };

  const displayHotels = hotels.length > 0 ? hotels : [];
  const displayRests  = restaurants.length > 0 ? restaurants : [];

  const tabs = [{id:"hotels",label:"🏨 Hotels"},{id:"restaurants",label:"🍽️ Restaurants"},{id:"activities",label:"🎯 Activities"},{id:"spots",label:"📍 Spots"}];

  return (
    <div>
      <button onClick={onBack} style={{color:C.sky,background:"none",border:`1.5px solid ${C.sky}`,borderRadius:9,padding:"8px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
        ← Back to Cities
      </button>

      {/* City hero banner */}
      <div style={{position:"relative",height:260,borderRadius:18,overflow:"hidden",marginBottom:28}}>
        <img src={city.img} alt={city.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(10,25,45,.82),rgba(10,25,45,.25))"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",padding:"0 36px"}}>
          <div>
            <div style={{background:C.sky,color:"#fff",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:10,display:"inline-block",marginBottom:10}}>{city.tag}</div>
            <h2 style={{fontSize:38,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF,marginBottom:6}}>{city.name}</h2>
            <p style={{color:"rgba(255,255,255,.8)",fontSize:14,maxWidth:500,lineHeight:1.6}}>{city.desc}</p>
            <div style={{display:"flex",gap:16,marginTop:14}}>
              {[`🏨 ${city.hotels} hotels`,`📍 ${city.spots} spots`,`💰 ~$${city.costIndex}/night`,`🌍 ${city.country}`].map(m=>(
                <span key={m} style={{background:"rgba(255,255,255,.15)",color:"#fff",fontSize:12,fontWeight:500,padding:"5px 12px",borderRadius:9,backdropFilter:"blur(6px)"}}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{display:"flex",gap:4,background:"#fff",borderRadius:12,padding:4,marginBottom:24,border:`1px solid ${C.border}`,width:"fit-content",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:tab===t.id?C.sky:"transparent",
            color:tab===t.id?"#fff":C.textSub,
            border:"none",borderRadius:9,padding:"10px 20px",
            fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Hotels tab */}
      {tab==="hotels"&&(
        displayHotels.length === 0 ? (
          <div style={{...card,padding:"48px",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>🏨</div>
            <h3 style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>No hotels listed yet for {city.name}</h3>
            <p style={{fontSize:13,color:C.textMuted,marginBottom:20,lineHeight:1.6}}>
              Run <code style={{background:C.bg,padding:"2px 6px",borderRadius:5}}>npm run seed</code> in the backend to seed hotels, or browse all hotels below.
            </p>
            <button onClick={()=>navigate("/hotels")} style={{...btnPrimary,padding:"10px 22px",borderRadius:10,fontSize:13}}>Browse All Hotels →</button>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
            {displayHotels.map(h=>(
              <HotelCard key={h.id||h._id} hotel={h} compact/>
            ))}
          </div>
        )
      )}

      {/* Restaurants tab */}
      {tab==="restaurants"&&(
        displayRests.length === 0 ? (
          <div style={{...card,padding:"48px",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>🍽️</div>
            <h3 style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>No restaurants listed yet for {city.name}</h3>
            <p style={{fontSize:13,color:C.textMuted,marginBottom:20,lineHeight:1.6}}>
              Run <code style={{background:C.bg,padding:"2px 6px",borderRadius:5}}>npm run seed</code> in the backend, or browse all restaurants.
            </p>
            <button onClick={()=>navigate("/restaurants")} style={{...btnPrimary,padding:"10px 22px",borderRadius:10,fontSize:13}}>Browse All Restaurants →</button>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
            {displayRests.map(r=>(
              <RestaurantCard key={r.id||r._id} restaurant={r} compact/>
            ))}
          </div>
        )
      )}

      {/* Activities tab — Real city-specific attractions */}
      {tab==="activities"&&(
        <div>
          <div style={{marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>
              🎯 {cityActivities.length} Real Activities in {city.name}
            </div>
            {CITY_ACTIVITIES[city.name] && (
              <span style={{fontSize:11,background:C.successLight,color:C.success,padding:"3px 10px",borderRadius:20,fontWeight:700}}>
                ✓ Curated Real Experiences
              </span>
            )}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {cityActivities.map(act=>{
              const cartId = `activity-${act.id}-${city.name}`;
              const inCart = isInCart(cartId);
              return (
                <div key={act.id} style={{...card,padding:"20px",transition:"transform .2s,box-shadow .2s",display:"flex",flexDirection:"column"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 24px rgba(0,0,0,.1)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
                    <div style={{fontSize:28,lineHeight:1}}>{act.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13,color:C.text,lineHeight:1.3,marginBottom:4}}>{act.name}</div>
                      <div style={{fontSize:10,color:C.textMuted,textTransform:"capitalize"}}>
                        {act.type} · {act.duration}h
                        {act.location && <span style={{marginLeft:6}}>📍 {act.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:C.textSub,lineHeight:1.6,flex:1,marginBottom:14}}>{act.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:20,fontWeight:800,color:C.sky}}>
                      {act.cost===0?"Free":`$${act.cost}`}
                    </div>
                    <button onClick={()=>addActivity(act)} disabled={inCart}
                      style={{background:inCart?C.success:C.sky,color:"#fff",border:"none",borderRadius:9,
                        padding:"8px 16px",fontSize:12,fontWeight:700,cursor:inCart?"default":"pointer",
                        fontFamily:"inherit",opacity:inCart?.8:1}}>
                      {inCart?"✓ Added":"+ Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spots tab */}
      {tab==="spots"&&(
        <div style={{...card,padding:"32px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:14}}>🗺️</div>
          <h3 style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:8}}>Explore {city.name} Spots</h3>
          <p style={{color:C.textMuted,fontSize:14,marginBottom:20,maxWidth:440,margin:"0 auto 20px"}}>
            Discover {city.spots}+ attractions, landmarks and hidden gems in {city.name} using our live map powered by OpenStreetMap.
          </p>
          <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(city.name)}`} target="_blank" rel="noopener noreferrer"
            style={{...btnPrimary,display:"inline-flex",alignItems:"center",gap:8,textDecoration:"none",borderRadius:10}}>
            🗺️ Open Interactive Map
          </a>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  const navigate           = useNavigate();
  const { user }            = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedCity, setSelectedCity] = useState(null);

  const regionFilters = ["All","Asia","Europe","Americas","Middle East","Africa"];
  const tagFilters    = ["All","Popular","Trending","Luxury","Cultural","Beach","City","Historic","Adventure","Vibrant","Scenic","Classic"];

  const filtered = CURATED_CITIES.filter(c =>
    (filter==="All" || c.region===filter || c.tag===filter) &&
    (search==="" || c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()))
  );

  if (selectedCity) {
    return (
      <div style={{minHeight:"100vh",background:C.bg,paddingTop:64}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"32px 48px"}}>
          <CityDetailView city={selectedCity} onBack={()=>setSelectedCity(null)} navigate={navigate}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,paddingTop:64}}>
      {/* Hero */}
      <div style={{position:"relative",height:300,overflow:"hidden"}}>
        <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=85" alt="explore" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(10,25,45,.62),rgba(10,25,45,.42))"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 48px"}}>
          <h1 style={{fontSize:42,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF,marginBottom:8,textAlign:"center"}}>Explore the World</h1>
          <p style={{color:"rgba(255,255,255,.8)",fontSize:15,marginBottom:26,textAlign:"center",maxWidth:520}}>
            Select a city to discover its hotels, restaurants, experiences and spots — then add everything to your trip cart
          </p>
          <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,.96)",borderRadius:50,overflow:"hidden",width:"100%",maxWidth:560,boxShadow:"0 8px 32px rgba(0,0,0,.18)"}}>
            <span style={{padding:"0 16px",fontSize:18}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search cities or countries…"
              style={{flex:1,border:"none",outline:"none",fontSize:15,fontFamily:"inherit",background:"transparent",padding:"14px 0",color:C.text}}/>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1280,margin:"0 auto",padding:"36px 48px"}}>
        {/* Filters */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>By Region</div>
          <FilterPills options={regionFilters} active={filter} onChange={setFilter}/>
        </div>
        <div style={{marginBottom:28}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>By Type</div>
          <FilterPills options={tagFilters} active={filter} onChange={setFilter}/>
        </div>

        <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,color:C.textMuted}}>{filtered.length} destinations found</span>
          {!user&&<span style={{fontSize:13,color:C.sky,fontWeight:600,cursor:"pointer"}} onClick={()=>navigate("/login")}>Sign in to build trips →</span>}
        </div>

        {/* City grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20}}>
          {filtered.map(city=>(
            <CityCard key={city.id} city={city} onClick={()=>setSelectedCity(city)}/>
          ))}
        </div>

        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"60px",color:C.textMuted,fontSize:15}}>
            No destinations found. Try a different search or filter.
          </div>
        )}
      </div>
    </div>
  );
}
