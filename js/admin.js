/* ── Know U Beta — Admin Logic ─────────────────────── */

let adminPass = '';

async function login() {
  const pass = document.getElementById('adminPass').value;
  const errorMsg = document.getElementById('loginError');
  
  if (!pass) {
    errorMsg.textContent = 'Ingresa la contraseña';
    errorMsg.classList.remove('hidden');
    return;
  }
  
  adminPass = pass;
  
  // Test login by fetching orders
  const success = await fetchOrders();
  
  if (success) {
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('dashboardView').classList.remove('hidden');
  } else {
    errorMsg.textContent = 'Contraseña incorrecta';
    errorMsg.classList.remove('hidden');
  }
}

async function fetchOrders() {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPass })
    });
    
    const data = await res.json();
    
    if (data.success) {
      renderOrders(data.orders);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error fetching orders:', e);
    return false;
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById('ordersBody');
  const noOrders = document.getElementById('noOrdersMsg');
  
  if (orders.length === 0) {
    tbody.innerHTML = '';
    noOrders.classList.remove('hidden');
    return;
  }
  
  noOrders.classList.add('hidden');
  let html = '';
  
  orders.forEach(order => {
    // Basic items summary
    const itemsDesc = order.items.map(item => `${item.qty}x ${item.garment} (${item.size})`).join('<br>');
    
    html += `
      <tr>
        <td style="font-family: monospace; font-weight: 600;">${order.id}</td>
        <td>${order.date}</td>
        <td>
          <strong>${order.customer.name}</strong><br>
          <span style="color: var(--muted); font-size: 0.85rem;">${order.customer.email}</span>
        </td>
        <td style="font-size: 0.85rem; color: var(--muted);">${itemsDesc}</td>
        <td style="font-weight: 600; color: var(--accent);">$${order.total.toFixed(2)}</td>
        <td><span class="status-badge ${order.status}">${order.status}</span></td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

// Allow Enter key to login
document.getElementById('adminPass').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') login();
});
