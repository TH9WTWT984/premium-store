export default function Phase7Styles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
.checkout-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);gap:24px;align-items:start}
.checkout-main{display:grid;gap:14px}.checkout-panel{padding:22px}.checkout-submit{min-height:54px;width:100%;font-size:14px}.checkout-note{margin:0;color:var(--muted);font-size:11px;line-height:1.6}
.checkout-items{display:grid}.checkout-line{display:flex;justify-content:space-between;gap:18px;padding:14px 0;border-top:1px solid var(--line);font-size:12px}.checkout-line div{display:grid;gap:5px}.checkout-line span{color:var(--muted);font-size:11px}
.checkout-total{font-size:14px;padding-top:18px;margin-top:6px}.checkout-success{border:1px solid var(--line);background:#f8f7f3;padding:60px 40px;text-align:center;max-width:720px;margin:0 auto}.checkout-success h2{font-size:42px;font-weight:500;margin:10px 0 14px}.checkout-success p{color:var(--muted);line-height:1.7;margin:0 0 25px}
.order-detail-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);gap:14px}.order-detail-grid .admin-panel{padding:22px}.order-address{color:#5e5d58;line-height:1.8;font-size:13px;margin:14px 0 24px}
@media(max-width:900px){.checkout-grid,.order-detail-grid{grid-template-columns:1fr}}
@media(max-width:560px){.checkout-success{padding:40px 22px}.checkout-success h2{font-size:32px}}
` }} />
  );
}
