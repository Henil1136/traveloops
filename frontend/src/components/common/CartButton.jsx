import { useCart } from "../../context/CartContext";
import { toast }   from "./Toast";
import { C, btnPrimary } from "../../constants/theme";
import { makeCartId } from "../../utils/helpers";

export default function CartButton({ item, type, style={} }) {
  const { addItem, removeItem, isInCart } = useCart();
  const cid = makeCartId(type, item.id);
  const inCart = isInCart(cid);

  const toggle = (e) => {
    e.stopPropagation();
    if (inCart) {
      removeItem(cid);
      toast(`Removed from cart`, "warning");
    } else {
      addItem({ ...item, cartId: cid, type,
        pricePerNight: item.pricePerNight,
        priceRange_num: item.priceRange_num || 0,
        cost: item.cost || 0,
        qty: 1, nights: item.pricePerNight ? 1 : undefined,
      });
      toast(`✅ ${item.name} added to cart!`);
    }
  };

  return (
    <button onClick={toggle} style={{
      ...btnPrimary,
      background: inCart ? C.success : C.sky,
      padding:"8px 16px", fontSize:12, borderRadius:8,
      ...style,
    }}>
      {inCart ? "✓ In Cart" : "+ Add to Cart"}
    </button>
  );
}
