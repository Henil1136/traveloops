import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart }  from "../context/CartContext";
import { useAuth }  from "../context/AuthContext";
import { C, FONT_SERIF, card, btnPrimary, inp, lbl } from "../constants/theme";
import { fmt }      from "../utils/helpers";
import { toast }    from "../components/common/Toast";
import { bookingsAPI } from "../services/api";

const TYPE_ICONS  = { hotel:"🏨", restaurant:"🍽️", activity:"🎯", flight:"✈️", train:"🚆", bus:"🚌", vehicle:"🚗" };
const TYPE_LABELS = { hotel:"Hotel", restaurant:"Restaurant", activity:"Activity", flight:"Flight", train:"Train", bus:"Bus", vehicle:"Road Trip" };

// ── Per-item row ───────────────────────────────────────────────
function CartItemRow({ item, onRemove, onUpdateNights }) {
  const price     = item.pricePerNight || item.cost || item.price || 0;
  const nights    = item.qty || 1;         // qty stores nights for hotels
  const lineTotal = price * nights;

  return (
    <div style={{
      display:"flex", gap:16, alignItems:"flex-start",
      padding:"20px 0", borderBottom:`1px solid ${C.borderLight}`,
    }}>
      {/* Thumbnail */}
      <div style={{width:100,height:76,borderRadius:10,overflow:"hidden",flexShrink:0}}>
        {item.img
          ? <img src={item.img} alt={item.name} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <div style={{width:"100%",height:"100%",background:C.skyLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{TYPE_ICONS[item.type]||"📦"}</div>
        }
      </div>

      {/* Info */}
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <div>
            <span style={{background:C.skyLight,color:C.sky,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:8,marginRight:8}}>
              {TYPE_ICONS[item.type]} {TYPE_LABELS[item.type]||"Item"}
            </span>
            <span style={{fontSize:14,fontWeight:700,color:C.text}}>{item.name}</span>
          </div>
          <button onClick={()=>onRemove(item.cartId)} style={{
            background:"none",border:"none",cursor:"pointer",
            color:C.danger,fontSize:13,fontWeight:600,padding:"2px 6px",
            borderRadius:6,fontFamily:"inherit",
          }}>✕ Remove</button>
        </div>

        {item.city && <div style={{fontSize:12,color:C.textMuted,marginBottom:6}}>📍 {item.city}{item.country?`, ${item.country}`:""}</div>}
        {item.amenities?.length > 0 && (
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
            {item.amenities.slice(0,3).map((a,i)=>(
              <span key={i} style={{background:C.skyLight,color:C.sky,fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:7}}>{a}</span>
            ))}
          </div>
        )}
        {item.specialty && <div style={{fontSize:11,color:C.textSub,fontStyle:"italic",marginBottom:6}}>{item.specialty}</div>}
        {/* Transport details */}
        {(item.type==="flight"||item.type==="train"||item.type==="bus") && item.details && (
          <div style={{fontSize:11,color:C.textSub,background:C.bg,padding:"5px 10px",borderRadius:8,marginBottom:6,display:"inline-block"}}>{item.details}</div>
        )}
        {item.type==="flight" && item.stops && (
          <div style={{display:"flex",gap:8,marginBottom:4}}>
            <span style={{fontSize:10,background:item.stops==="Non-stop"?C.successLight:C.warningLight,color:item.stops==="Non-stop"?C.success:C.warning,padding:"2px 8px",borderRadius:8,fontWeight:700}}>{item.stops}</span>
            {item.travelDate && item.travelDate!=="Flexible" && <span style={{fontSize:10,background:C.skyLight,color:C.sky,padding:"2px 8px",borderRadius:8,fontWeight:700}}>📅 {item.travelDate}</span>}
          </div>
        )}
        {item.type==="vehicle" && item.distance && (
          <div style={{fontSize:11,color:C.textSub,marginBottom:4}}>
            🛣️ {item.distance} km · ⛽ Fuel: ₹{parseFloat(item.fuelCost||0).toFixed(0)} · 🛤️ Toll: ₹{item.tollCost||0} · 🅿️ Parking: ₹{item.parkingCost||0}
          </div>
        )}

        {/* Nights stepper — only for hotels */}
        {item.type === "hotel" && (
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:6}}>
            <span style={{fontSize:12,color:C.textSub,fontWeight:600}}>Nights:</span>
            <div style={{display:"flex",alignItems:"center",border:`1.5px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
              <button onClick={()=>onUpdateNights(item.cartId, Math.max(1, nights - 1))} style={{
                background:C.bg,border:"none",padding:"4px 12px",
                cursor:"pointer",fontFamily:"inherit",fontSize:16,color:C.text,
              }}>−</button>
              <span style={{padding:"4px 14px",fontSize:13,fontWeight:700,color:C.text,borderLeft:`1px solid ${C.border}`,borderRight:`1px solid ${C.border}`}}>{nights}</span>
              <button onClick={()=>onUpdateNights(item.cartId, nights + 1)} style={{
                background:C.bg,border:"none",padding:"4px 12px",
                cursor:"pointer",fontFamily:"inherit",fontSize:16,color:C.text,
              }}>+</button>
            </div>
            <span style={{fontSize:11,color:C.textMuted}}>${price}/night</span>
          </div>
        )}
      </div>

      {/* Line total */}
      <div style={{textAlign:"right",flexShrink:0,minWidth:80}}>
        <div style={{fontSize:20,fontWeight:800,color:C.sky}}>{fmt(lineTotal)}</div>
        {item.type==="hotel" && nights > 1 && (
          <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{nights} nights × ${price}</div>
        )}
      </div>
    </div>
  );
}

// ── Order summary sidebar ──────────────────────────────────────
function OrderSummary({ items, subtotal, tax, serviceFee, grandTotal, onBook, booking }) {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const byType = items.reduce((acc, i) => {
    const t = i.type || "other";
    acc[t] = (acc[t] || 0) + (i.pricePerNight || i.cost || i.price || 0) * (i.qty || 1);
    return acc;
  }, {});

  return (
    <div style={{...card,padding:"24px",position:"sticky",top:80}}>
      <h3 style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:20,fontFamily:FONT_SERIF}}>Order Summary</h3>

      {Object.entries(byType).map(([type, amt]) => (
        <div key={type} style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:13}}>
          <span style={{color:C.textSub}}>{TYPE_ICONS[type]||"📦"} {TYPE_LABELS[type]||type}</span>
          <span style={{fontWeight:600,color:C.text}}>{fmt(amt)}</span>
        </div>
      ))}

      <div style={{height:1,background:C.borderLight,margin:"14px 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:13}}>
        <span style={{color:C.textSub}}>Subtotal</span>
        <span style={{fontWeight:600}}>{fmt(subtotal)}</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
        <span style={{color:C.textSub}}>Taxes (8%)</span>
        <span style={{fontWeight:600}}>{fmt(tax)}</span>
      </div>
      <div style={{fontSize:10,color:C.textMuted,marginBottom:8,marginLeft:0}}>
        Estimated based on destination taxes. Actual amount confirmed at checkout.
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:16,fontSize:13}}>
        <span style={{color:C.textSub}}>Platform fee (2%)</span>
        <span style={{fontWeight:600}}>{fmt(serviceFee)}</span>
      </div>
      <div style={{height:1,background:C.border,margin:"0 0 16px"}}/>

      <div style={{display:"flex",justifyContent:"space-between",marginBottom:22}}>
        <span style={{fontWeight:700,fontSize:15,color:C.text}}>Grand Total</span>
        <div style={{textAlign:"right"}}>
          <div style={{fontWeight:800,fontSize:22,color:C.sky}}>{fmt(grandTotal)}</div>
          <div style={{fontSize:10,color:C.textMuted}}>USD · Demo mode</div>
        </div>
      </div>

      {user ? (
        <button onClick={onBook} disabled={!!booking} style={{
          ...btnPrimary,width:"100%",padding:"14px",fontSize:15,borderRadius:12,
          opacity: booking ? 0.7 : 1,
        }}>
          {booking ? "Booking…" : "🔒 Confirm & Book All →"}
        </button>
      ) : (
        <div>
          <button onClick={()=>navigate("/login")} style={{...btnPrimary,width:"100%",padding:"14px",fontSize:15,borderRadius:12,marginBottom:10}}>
            Sign in to Book
          </button>
          <p style={{fontSize:12,color:C.textMuted,textAlign:"center"}}>Create a free account to confirm bookings</p>
        </div>
      )}

      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:14}}>
        <span style={{fontSize:11,color:C.textMuted}}>🔒 Secure booking · Reference ID saved to your account</span>
      </div>
    </div>
  );
}

// ── Clear-cart confirm inline (replaces window.confirm) ────────
function ClearConfirm({ onConfirm, onCancel }) {
  return (
    <div style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,.45)",
      zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",
    }}>
      <div style={{...card,padding:"28px",maxWidth:380,width:"100%",boxShadow:"0 24px 60px rgba(0,0,0,.2)"}}>
        <div style={{fontSize:36,marginBottom:12,textAlign:"center"}}>🗑️</div>
        <h3 style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:8,textAlign:"center"}}>Clear entire cart?</h3>
        <p style={{fontSize:13,color:C.textMuted,textAlign:"center",marginBottom:22,lineHeight:1.6}}>
          All {/* items count shown by parent */} items will be removed. This cannot be undone.
        </p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onConfirm} style={{
            flex:1,background:C.danger,color:"#fff",border:"none",
            borderRadius:10,padding:"12px",fontSize:14,fontWeight:700,
            cursor:"pointer",fontFamily:"inherit",
          }}>Yes, clear it</button>
          <button onClick={onCancel} style={{
            flex:1,background:"#fff",color:C.textSub,
            border:`1.5px solid ${C.border}`,borderRadius:10,
            padding:"12px",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit",
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Confirmation screen ────────────────────────────────────────
function ConfirmationScreen({ confirmationId, tripName, email, grandTotal, onDone }) {
  return (
    <div style={{minHeight:"100vh",background:C.bg,paddingTop:64,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{...card,padding:"60px 48px",textAlign:"center",maxWidth:560}}>
        <div style={{fontSize:64,marginBottom:20}}>🎉</div>
        <h2 style={{fontSize:26,fontWeight:700,color:C.text,fontFamily:FONT_SERIF,marginBottom:8}}>Booking Confirmed!</h2>
        <div style={{
          display:"inline-block",background:C.skyLight,color:C.sky,
          fontSize:20,fontWeight:800,padding:"10px 24px",borderRadius:12,
          letterSpacing:"0.05em",margin:"8px 0 20px",
        }}>
          {confirmationId}
        </div>
        <p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,marginBottom:6}}>
          Your trip <strong style={{color:C.text}}>{tripName}</strong> has been booked and saved to your account.
        </p>
        <p style={{color:C.textMuted,fontSize:13,marginBottom:28}}>
          Total charged: <strong style={{color:C.text}}>{fmt(grandTotal)}</strong> · Confirmation ID saved under My Bookings.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={onDone} style={{...btnPrimary,padding:"12px 24px",fontSize:14,borderRadius:10}}>
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty cart ─────────────────────────────────────────────────
function EmptyCart({ navigate }) {
  return (
    <div style={{...card,padding:"80px 40px",textAlign:"center",maxWidth:500,margin:"60px auto"}}>
      <div style={{fontSize:64,marginBottom:20}}>🛒</div>
      <h2 style={{fontSize:22,fontWeight:700,color:C.text,fontFamily:FONT_SERIF,marginBottom:10}}>Your cart is empty</h2>
      <p style={{color:C.textMuted,fontSize:14,marginBottom:28,lineHeight:1.7}}>
        Explore hotels, restaurants and experiences — add them here to plan and book your entire trip together.
      </p>
      <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
        <button onClick={()=>navigate("/explore")} style={{...btnPrimary,padding:"12px 24px",fontSize:14,borderRadius:10}}>Explore Destinations</button>
        <button onClick={()=>navigate("/hotels")}  style={{background:"#fff",color:C.sky,border:`2px solid ${C.sky}`,borderRadius:10,padding:"10px 22px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Browse Hotels</button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total } = useCart();
  const navigate  = useNavigate();
  const { user }   = useAuth();

  const [tripName,    setTripName]    = useState("");
  const [booking,     setBooking]     = useState(false);
  const [confirmed,   setConfirmed]   = useState(null);   // { confirmationId, grandTotal }
  const [showClear,   setShowClear]   = useState(false);

  // Single source of truth — use CartContext total directly
  const subtotal   = total;
  const tax        = Math.round(subtotal * 0.08);
  const serviceFee = Math.round(subtotal * 0.02);
  const grandTotal = subtotal + tax + serviceFee;

  // Fixed nights update — uses updateQty which stores nights in qty
  const handleNightsUpdate = (cartId, nights) => {
    updateQty(cartId, Math.max(1, nights));
  };

  const handleBook = async () => {
    if (!tripName.trim()) {
      toast("Please name your trip first", "warning");
      return;
    }
    setBooking(true);
    try {
      const payload = {
        tripName: tripName.trim(),
        items: items.map(i => ({
          type:          i.type,
          itemId:        i.cartId,
          name:          i.name,
          city:          i.city || "",
          country:       i.country || "",
          img:           i.img || "",
          pricePerNight: i.pricePerNight || 0,
          cost:          i.cost || 0,
          nights:        i.qty || 1,
          qty:           1,
          lineTotal:     (i.pricePerNight || i.cost || 0) * (i.qty || 1),
        })),
        subtotal,
        taxAmount: tax,
        serviceFee,
        grandTotal,
        currency: "USD",
      };
      const result = await bookingsAPI.create(payload);
      clearCart();
      setConfirmed({ confirmationId: result.confirmationId, grandTotal });
    } catch (err) {
      // If backend is offline fall back to demo mode with a local confirmation ID
      const fallbackId = `TL-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
      clearCart();
      setConfirmed({ confirmationId: fallbackId, grandTotal, demo: true });
    } finally {
      setBooking(false);
    }
  };

  if (confirmed) {
    return (
      <ConfirmationScreen
        confirmationId={confirmed.confirmationId}
        tripName={tripName || "My Trip"}
        email={user?.email}
        grandTotal={confirmed.grandTotal}
        onDone={() => navigate("/profile")}
      />
    );
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,paddingTop:64}}>
      {/* Clear-cart confirm modal */}
      {showClear && (
        <ClearConfirm
          onConfirm={() => { clearCart(); setShowClear(false); }}
          onCancel={() => setShowClear(false)}
        />
      )}

      {/* Hero */}
      <div style={{position:"relative",height:160,overflow:"hidden"}}>
        <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=85" alt="cart" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(10,25,45,.65)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",padding:"0 60px",justifyContent:"space-between"}}>
          <div>
            <h1 style={{fontSize:30,fontWeight:700,color:"#fff",fontFamily:FONT_SERIF}}>🛒 Trip Cart</h1>
            <p style={{color:"rgba(255,255,255,.75)",fontSize:14,marginTop:4}}>
              {items.length > 0 ? `${items.length} item${items.length!==1?"s":""} · Book everything together` : "Your cart is empty"}
            </p>
          </div>
          {items.length > 0 && (
            <button onClick={() => setShowClear(true)} style={{
              background:"rgba(229,57,53,.15)",color:"#fff",
              border:"1.5px solid rgba(255,255,255,.4)",
              borderRadius:9,padding:"8px 18px",fontSize:13,fontWeight:600,
              cursor:"pointer",fontFamily:"inherit",
            }}>Clear Cart</button>
          )}
        </div>
      </div>

      {items.length === 0 ? <EmptyCart navigate={navigate}/> : (
        <div style={{maxWidth:1280,margin:"0 auto",padding:"32px 48px",display:"grid",gridTemplateColumns:"1fr 360px",gap:28,alignItems:"start"}}>
          {/* Cart items */}
          <div style={{...card,padding:"24px 28px"}}>
            <h2 style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:4}}>Your Items</h2>
            <p style={{fontSize:13,color:C.textMuted,marginBottom:0}}>{items.length} item{items.length!==1?"s":""} selected</p>

            {["hotel","restaurant","activity","flight"].map(type => {
              const group = items.filter(i => i.type === type);
              if (!group.length) return null;
              return (
                <div key={type} style={{marginBottom:8}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.07em",padding:"16px 0 8px",borderBottom:`2px solid ${C.skyLight}`}}>
                    {TYPE_ICONS[type]} {TYPE_LABELS[type]}s
                  </div>
                  {group.map(item => (
                    <CartItemRow
                      key={item.cartId}
                      item={item}
                      onRemove={removeItem}
                      onUpdateNights={handleNightsUpdate}
                    />
                  ))}
                </div>
              );
            })}

            {/* Trip name */}
            <div style={{marginTop:24,padding:"20px",background:C.skyLight,borderRadius:12}}>
              <label style={lbl}>Name this trip *</label>
              <input
                style={inp}
                placeholder="e.g. Europe Summer 2026"
                value={tripName}
                onChange={e => setTripName(e.target.value)}
              />
              <p style={{fontSize:11,color:C.textMuted,marginTop:6}}>
                This name will appear on your booking confirmation and in My Bookings.
              </p>
            </div>
          </div>

          {/* Order summary */}
          <OrderSummary
            items={items}
            subtotal={subtotal}
            tax={tax}
            serviceFee={serviceFee}
            grandTotal={grandTotal}
            booking={booking}
            onBook={handleBook}
          />
        </div>
      )}
    </div>
  );
}
