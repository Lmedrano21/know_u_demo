/**
 * ────────────────────────────────────────────────────────────
 * ADMIN.JS - Panel de Administración de Pedidos
 * ────────────────────────────────────────────────────────────
 * Este módulo gestiona la autenticación de administrador y
 * la visualización de pedidos en el dashboard. Requiere contraseña
 * correcta para acceder a la información de las órdenes.
 */

/* ══════════════════════════════════════════════════════════ */
/* ESTADO - Variable global para la contraseña del admin       */
/* ══════════════════════════════════════════════════════════ */

// Almacena la contraseña ingresada por el administrador
// Se utiliza para validar futuras peticiones a la API
let adminPass = '';

/* ══════════════════════════════════════════════════════════ */
/* AUTENTICACIÓN - Función de login                            */
/* ══════════════════════════════════════════════════════════ */

/**
 * login()
 * Valida la contraseña del administrador
 * Si es correcta, descarga los pedidos y muestra el dashboard
 * Si es incorrecta, muestra un mensaje de error
 */
async function login() {
  // Obtiene el valor de la contraseña del input
  const pass = document.getElementById('adminPass').value;
  // Obtiene el elemento donde mostrar mensajes de error
  const errorMsg = document.getElementById('loginError');
  
  // Validación: verifica que se haya ingresado una contraseña
  if (!pass) {
    // Muestra mensaje de error
    errorMsg.textContent = 'Ingresa la contraseña';
    // Hace visible el mensaje
    errorMsg.classList.remove('hidden');
    return;
  }
  
  // Almacena la contraseña ingresada para usar en futuras peticiones
  adminPass = pass;
  
  // Intenta obtener los pedidos usando la contraseña
  const success = await fetchOrders();
  
  // Si la validación fue exitosa
  if (success) {
    // Oculta la vista de login agregando clase 'hidden'
    document.getElementById('loginView').classList.add('hidden');
    // Muestra el dashboard removiendo la clase 'hidden'
    document.getElementById('dashboardView').classList.remove('hidden');
  } else {
    // Si la contraseña es incorrecta, muestra error
    errorMsg.textContent = 'Contraseña incorrecta';
    errorMsg.classList.remove('hidden');
  }
}

/* ══════════════════════════════════════════════════════════ */
/* DATOS - Obtención de pedidos desde el servidor              */
/* ══════════════════════════════════════════════════════════ */

/**
 * fetchOrders()
 * Realiza petición al servidor para obtener la lista de pedidos
 * Usa la contraseña guardada en 'adminPass' para autenticarse
 * Si tiene éxito, renderiza los pedidos en la tabla
 * 
 * @return {boolean} true si la petición fue exitosa, false si falló
 */
async function fetchOrders() {
  try {
    // Realiza petición POST al endpoint /api/orders
    const res = await fetch('/api/orders', {
      method: 'POST',  // Usa POST para enviar la contraseña
      headers: { 'Content-Type': 'application/json' },
      // Envía la contraseña en el cuerpo de la petición
      body: JSON.stringify({ password: adminPass })
    });
    
    // Convierte la respuesta a JSON
    const data = await res.json();
    
    // Si el servidor retorna éxito
    if (data.success) {
      // Renderiza los pedidos en la tabla
      renderOrders(data.orders);
      return true;
    }
    // Si falló la autenticación
    return false;
  } catch (e) {
    // Captura y registra cualquier error de conexión
    console.error('Error fetching orders:', e);
    return false;
  }
}

/* ══════════════════════════════════════════════════════════ */
/* RENDERIZADO - Mostrar pedidos en la tabla                  */
/* ══════════════════════════════════════════════════════════ */

/**
 * renderOrders(orders)
 * Genera el HTML de la tabla de pedidos y lo inserta en la página
 * Muestra información de cada pedido incluyendo ID, fecha,
 * cliente, items, total y estado
 * 
 * @param {Array} orders - Array de objetos de pedidos desde el servidor
 *   Cada objeto contiene: id, date, customer, items, total, status
 */
function renderOrders(orders) {
  // Obtiene la referencia al tbody (cuerpo de la tabla)
  const tbody = document.getElementById('ordersBody');
  // Obtiene el mensaje que se muestra cuando no hay pedidos
  const noOrders = document.getElementById('noOrdersMsg');
  
  // Si no hay pedidos
  if (orders.length === 0) {
    // Limpia el cuerpo de la tabla
    tbody.innerHTML = '';
    // Muestra el mensaje "No hay pedidos"
    noOrders.classList.remove('hidden');
    return;
  }
  
  // Si hay pedidos, oculta el mensaje de "No hay pedidos"
  noOrders.classList.add('hidden');
  
  // Variable para acumular el HTML de las filas
  let html = '';
  
  // Itera sobre cada pedido
  orders.forEach(order => {
    // Crea un resumen de los items del pedido
    // Ejemplo: "1x camiseta (M), 2x gorra (S)"
    const itemsDesc = order.items
      .map(item => `${item.qty}x ${item.garment} (${item.size})`)
      .join('<br>');  // Los une con saltos de línea
    
    // Crea una fila de la tabla para este pedido
    html += `
      <tr>
        <!-- ID del Pedido: KU-XXXXXX -->
        <td style="font-family: monospace; font-weight: 600;">${order.id}</td>
        
        <!-- Fecha y hora del pedido -->
        <td>${order.date}</td>
        
        <!-- Información del cliente: nombre y email -->
        <td>
          <strong>${order.customer.name}</strong><br>
          <span style="color: var(--muted); font-size: 0.85rem;">${order.customer.email}</span>
        </td>
        
        <!-- Lista de items en el pedido -->
        <td style="font-size: 0.85rem; color: var(--muted);">${itemsDesc}</td>
        
        <!-- Total del pedido en formato moneda -->
        <td style="font-weight: 600; color: var(--accent);">$${order.total.toFixed(2)}</td>
        
        <!-- Estado del pedido (Pendiente, Enviado, etc) -->
        <td><span class="status-badge ${order.status}">${order.status}</span></td>
      </tr>
    `;
  });
  
  // Inserta todo el HTML generado en el tbody de la tabla
  tbody.innerHTML = html;
}

/* ══════════════════════════════════════════════════════════ */
/* EVENT LISTENERS - Eventos de la página                      */
/* ══════════════════════════════════════════════════════════ */

/**
 * Listener de teclado para el campo de contraseña
 * Permite presionar ENTER para hacer login en lugar de hacer clic
 */
document.getElementById('adminPass').addEventListener('keypress', function(e) {
  // Si la tecla presionada es ENTER (código 'Enter')
  if (e.key === 'Enter') {
    // Ejecuta la función de login
    login();
  }
});
