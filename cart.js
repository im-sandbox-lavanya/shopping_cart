export const INITIAL_ITEMS = [
  { id: 1, name: "DELL Inspiron 15 7000 15.6", price: 899.0, qty: 10 },
  { id: 2, name: "MICROSOFT Surface Pro 4 & Typecover - 128 GB", price: 799.0, qty: 5 },
  { id: 3, name: "DELL Inspiron 15 5000 15.6", price: 599.0, qty: 6 },
  { id: 4, name: 'LENOVO Ideapad 320s-14IKB 14" Laptop - Grey', price: 399.0, qty: 8 },
  { id: 5, name: 'ASUS Transformer Mini T102HA 10.1" 2 in 1 - Silver', price: 549.99, qty: 5 },
  { id: 6, name: "DELL Inspiron 15 5000 15", price: 449.99, qty: 2 },
];

let cart = [];

function cloneItems(items) {
  return items.map((item) => ({ ...item }));
}

export function fmt(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function escHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function getCart() {
  return cart;
}

export function setCart(nextCart) {
  cart = cloneItems(nextCart);
}

export function restoreFromStorage(storage = sessionStorage) {
  try {
    const stored = JSON.parse(storage.getItem("cart"));
    cart = Array.isArray(stored) ? stored : cloneItems(INITIAL_ITEMS);
  } catch {
    cart = cloneItems(INITIAL_ITEMS);
  }
  return cart;
}

export function persist(storage = sessionStorage) {
  storage.setItem("cart", JSON.stringify(cart));
}

export function render(doc = document) {
  const tbody = doc.getElementById("cart-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  let total = 0;
  let totalQty = 0;

  cart.forEach((item, idx) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    totalQty += item.qty;

    const tr = doc.createElement("tr");
    tr.innerHTML = `
      <td class="col-action">
        <button class="delete-btn" title="Remove item" data-idx="${idx}">&#128465;</button>
      </td>
      <td>${escHtml(item.name)}</td>
      <td class="col-price">${fmt(item.price)}</td>
      <td class="col-qty">
        <input class="qty-input" type="number" min="1" value="${item.qty}" data-idx="${idx}" />
      </td>
      <td class="col-subtotal">${fmt(subtotal)}</td>
    `;
    tbody.appendChild(tr);
  });

  const totalNode = doc.getElementById("cart-total");
  if (totalNode) totalNode.textContent = fmt(total);

  const countNode = doc.getElementById("cart-count");
  if (countNode) countNode.textContent = totalQty;
}

export function clearCart() {
  cart = [];
  persist();
  render();
}

export function goBack() {
  history.back();
}

export function saveChanges() {
  persist();
  alert("Changes saved!");
}

export function checkout() {
  alert(`Proceeding to checkout.\nTotal items: ${cart.reduce((sum, item) => sum + item.qty, 0)}`);
}

export function init(doc = document) {
  const body = doc.getElementById("cart-body");
  if (!body) return;

  body.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    cart.splice(idx, 1);
    persist();
    render(doc);
  });

  body.addEventListener("change", (e) => {
    if (!e.target.classList.contains("qty-input")) return;
    const idx = parseInt(e.target.dataset.idx, 10);
    const val = parseInt(e.target.value, 10);
    if (!Number.isNaN(val) && val >= 1) {
      cart[idx].qty = val;
      persist();
      render(doc);
    } else {
      e.target.value = cart[idx].qty;
    }
  });

  render(doc);
}

restoreFromStorage();
init();

window.goBack = goBack;
window.saveChanges = saveChanges;
window.clearCart = clearCart;
window.checkout = checkout;
