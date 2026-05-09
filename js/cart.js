/* ── Know U Beta — Cart Logic ─────────────────────── */

const CART_KEY = 'knowu_beta_cart';

// Get cart from localStorage
function getCart() {
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// Update the badge in the navigation bar
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  
  const cart = getCart();
  const count = cart.reduce((total, item) => total + item.qty, 0);
  badge.textContent = count;
  
  if (count > 0) {
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// Add an item to the cart
function addItem(item) {
  const cart = getCart();
  // Generate a unique ID for this generated item
  const id = 'item_' + Date.now();
  cart.push({ ...item, id, qty: 1 });
  saveCart(cart);
  showToast('¡Prenda agregada al carrito!', 'success');
}

// Remove an item
function removeItem(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  if (typeof renderCartPage === 'function') renderCartPage();
}

// Change quantity
function updateQty(id, delta) {
  let cart = getCart();
  const index = cart.findIndex(item => item.id === id);
  if (index !== -1) {
    cart[index].qty += delta;
    if (cart[index].qty < 1) cart[index].qty = 1;
    saveCart(cart);
    if (typeof renderCartPage === 'function') renderCartPage();
  }
}

// Render the cart page (only called on cart.html)
function renderCartPage() {
  const cart = getCart();
  const emptyState = document.getElementById('cartEmpty');
  const itemsContainer = document.getElementById('cartItems');
  const summaryBox = document.getElementById('cartSummary');
  const subtotalEl = document.getElementById('summarySubtotal');
  const totalEl = document.getElementById('summaryTotal');
  
  if (!emptyState || !itemsContainer) return;
  
  if (cart.length === 0) {
    emptyState.classList.remove('hidden');
    itemsContainer.innerHTML = '';
    summaryBox.classList.add('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  summaryBox.classList.remove('hidden');
  
  let html = '';
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    
    html += `
      <div class="cart-item">
        <img src="${item.image_url}" alt="Diseño">
        <div class="item-info">
          <div class="item-name">${capitalize(item.garment)} Personalizado</div>
          <div class="item-meta">Estilo: ${capitalize(item.style)} | Talla: ${item.size}</div>
          <div class="item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="item-actions">
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
          </div>
          <button class="remove-btn" onclick="removeItem('${item.id}')">Eliminar</button>
        </div>
      </div>
    `;
  });
  
  itemsContainer.innerHTML = html;
  
  const formattedSubtotal = '$' + subtotal.toFixed(2);
  subtotalEl.textContent = formattedSubtotal;
  totalEl.textContent = formattedSubtotal;
}

// Checkout dummy function replaced with real modal logic
function checkout() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.remove('hidden');
}

function closeCheckout() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.add('hidden');
}

async function submitCheckout() {
  const name = document.getElementById('custName').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  
  if (!name || !email || !address) {
    showToast('Por favor completa todos los campos.', 'error');
    return;
  }
  
  const btn = document.getElementById('submitOrderBtn');
  btn.textContent = 'Procesando...';
  btn.disabled = true;
  
  const cart = getCart();
  
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: cart,
        userInfo: { name, email, address }
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      showToast('¡Pedido completado con éxito! (Beta)', 'success');
      localStorage.removeItem(CART_KEY);
      updateCartBadge();
      closeCheckout();
      renderCartPage();
    } else {
      showToast('Error: ' + data.error, 'error');
      btn.textContent = 'Confirmar Pedido';
      btn.disabled = false;
    }
  } catch (e) {
    showToast('Error de conexión', 'error');
    btn.textContent = 'Confirmar Pedido';
    btn.disabled = false;
  }
}

// Show a small notification toast
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Helper: capitalize first letter
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize badge on load
document.addEventListener('DOMContentLoaded', updateCartBadge);
