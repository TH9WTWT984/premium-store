export default function Phase6Styles() {
  return <style dangerouslySetInnerHTML={{ __html: `/* Phase 6 additions. Imported once from app/layout.tsx in the patch. */
.cart-layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(320px,.7fr);gap:24px;align-items:start}
.cart-items{border-top:1px solid var(--line)}
.cart-item{display:grid;grid-template-columns:130px minmax(0,1fr);gap:18px;padding:20px 0;border-bottom:1px solid var(--line)}
.cart-item-image{aspect-ratio:4/5;background:#e9e7e1;overflow:hidden}.cart-item-image img,.cart-item-image .product-image-fallback{width:100%;height:100%;display:block;object-fit:cover}
.cart-item-top{display:flex;justify-content:space-between;gap:20px}.cart-item-top h2{margin:0 0 6px;font-size:24px;font-weight:500}.cart-item-variant,.cart-item-unit{color:var(--muted);font-size:11px}
.cart-item-bottom{display:flex;align-items:center;gap:16px;margin-top:25px}.quantity-control{display:flex;align-items:center;border:1px solid var(--line);background:#f8f7f3}.quantity-control button{width:34px;height:34px;border:0;background:transparent;cursor:pointer}.quantity-control span{min-width:34px;text-align:center;font-size:12px}
.cart-summary{border:1px solid var(--line);background:#f8f7f3;padding:24px;position:sticky;top:100px}.cart-summary h2{margin:8px 0 28px;font-size:30px;font-weight:500}.cart-summary-row{display:flex;justify-content:space-between;gap:15px;padding:14px 0;border-top:1px solid var(--line);font-size:13px}.cart-summary-row.muted{color:var(--muted);font-size:11px}.cart-checkout-button{width:100%;margin-top:20px}.cart-note{color:var(--muted);font-size:10px;line-height:1.6;margin:16px 0 0}
.cart-action-stack{display:grid;gap:8px;margin-top:8px}.cart-action-message{color:var(--muted);font-size:11px}.wishlist-action{margin-top:8px;display:flex;align-items:center;gap:10px}.wishlist-button{min-height:46px;padding:0 16px;border:1px solid var(--line);background:transparent;cursor:pointer;font-size:12px}.wishlist-button.is-active{border-color:#bfa49a;background:#f2e9e4}
@media(max-width:900px){.cart-layout{grid-template-columns:1fr}.cart-summary{position:static}}@media(max-width:560px){.cart-item{grid-template-columns:90px minmax(0,1fr);gap:12px}.cart-item-top h2{font-size:18px}.cart-item-bottom{flex-wrap:wrap;margin-top:15px}}
` }} />;
}
