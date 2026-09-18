export default function AddressAutocompleteStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      .autocomplete-field{position:relative}
      .address-suggestion-menu{position:absolute;left:0;right:0;top:100%;z-index:50;border:1px solid var(--line);background:#f8f7f3;box-shadow:0 12px 30px rgba(20,18,15,.08);max-height:280px;overflow:auto}
      .address-suggestion{display:grid;gap:4px;width:100%;padding:12px 14px;text-align:left;border:0;border-bottom:1px solid var(--line);background:transparent;cursor:pointer;font:inherit}
      .address-suggestion:hover{background:#efeee9}
      .address-suggestion strong{font-size:12px;font-weight:500}
      .address-suggestion span{font-size:10px;color:var(--muted);line-height:1.5}
      .pin-helper{margin-top:6px;font-size:10px;color:var(--muted);min-height:15px}
    ` }} />
  );
}
