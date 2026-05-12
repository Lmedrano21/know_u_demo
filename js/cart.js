/**
 * ────────────────────────────────────────────────────────────
 * CART.JS - Gestión del Carrito de Compras
 * ────────────────────────────────────────────────────────────
 * Este módulo maneja toda la lógica del carrito de compras,
 * incluyendo agregar/eliminar items, actualizar cantidades,
 * procesar el checkout y guardar datos en localStorage.
 */

/* ══════════════════════════════════════════════════════════ */
/* CONFIGURACIÓN - Constantes del sistema                     */
/* ══════════════════════════════════════════════════════════ */

// Clave única para almacenar el carrito en localStorage del navegador
const CART_KEY = 'knowu_beta_cart';

/* ══════════════════════════════════════════════════════════ */
/* FUNCIONES BÁSICAS DE CARRITO - Gestión de datos             */
/* ══════════════════════════════════════════════════════════ */

/**
 * getCart()
 * Obtiene el carrito almacenado en localStorage del navegador
 * Retorna un array vacío si no hay carrito guardado
 * 
 * @return {Array} Array de items en el carrito
 */
function getCart() {
  // Obtiene la cadena JSON guardada en localStorage con la clave CART_KEY
  const data = localStorage.getItem(CART_KEY);
  // Si existe data, la parsea a objeto; si no, retorna array vacío
  return data ? JSON.parse(data) : [];
}

/**
 * saveCart(cart)
 * Guarda el carrito en localStorage del navegador
 * Después de guardar, actualiza el badge del carrito
 * 
 * @param {Array} cart - Array completo del carrito con todos los items
 */
function saveCart(cart) {
  // Convierte el array a cadena JSON y lo guarda en localStorage
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Actualiza el número mostrado en el badge del carrito
  updateCartBadge();
}

/* ══════════════════════════════════════════════════════════ */
/* ACTUALIZACIÓN DE INTERFAZ - Badge del Carrito              */
/* ══════════════════════════════════════════════════════════ */

/**
 * updateCartBadge()
 * Actualiza el número de items mostrado en el badge del navegador
 * El badge es el pequeño círculo rojo con número en el icono del carrito
 */
function updateCartBadge() {
  // Obtiene el elemento HTML del badge
  const badge = document.getElementById('cartBadge');
  // Si no existe el elemento, salir de la función
  if (!badge) return;
  
  // Obtiene el carrito actual
  const cart = getCart();
  
  // Calcula el total de items sumando las cantidades (qty) de cada item
  // reduce() itera sobre cada item y suma sus cantidades
  const count = cart.reduce((total, item) => total + item.qty, 0);
  
  // Actualiza el texto del badge con el número total
  badge.textContent = count;
  
  // Muestra o oculta el badge según si hay items
  if (count > 0) {
    // Si hay items, muestra el badge con display: flex
    badge.style.display = 'flex';
  } else {
    // Si no hay items, oculta el badge
    badge.style.display = 'none';
  }
}

/* ══════════════════════════════════════════════════════════ */
/* OPERACIONES CON ITEMS - Agregar, eliminar, actualizar       */
/* ══════════════════════════════════════════════════════════ */

/**
 * addItem(item)
 * Agrega un nuevo item (diseño generado) al carrito
 * Genera un ID único y cantidad inicial de 1
 * 
 * @param {Object} item - Objeto con datos de la prenda
 *   - garment: tipo de prenda (camiseta o gorra)
 *   - style: estilo seleccionado
 *   - size: talla elegida
 *   - price: precio
 *   - image_url: URL de la imagen generada
 *   - description: descripción del diseño
 */
function addItem(item) {
  // Obtiene el carrito actual
  const cart = getCart();
  
  // Genera un ID único basado en la marca de tiempo actual
  // Formato: 'item_' + número de milisegundos desde 1970
  const id = 'item_' + Date.now();
  
  // Agrega el item al carrito con el ID único y cantidad inicial
  // El operador ... copia todas las propiedades del item
  cart.push({ ...item, id, qty: 1 });
  
  // Guarda el carrito actualizado en localStorage
  saveCart(cart);
  
  // Muestra una notificación (toast) informando que se agregó el item
  showToast('¡Prenda agregada al carrito!', 'success');
}

/**
 * removeItem(id)
 * Elimina un item del carrito por su ID único
 * 
 * @param {string} id - ID único del item a eliminar
 */
function removeItem(id) {
  // Obtiene el carrito actual
  let cart = getCart();
  
  // Filtra el carrito para mantener solo items cuyo ID no coincida
  // filter() crea un nuevo array sin el item eliminado
  cart = cart.filter(item => item.id !== id);
  
  // Guarda el carrito actualizado
  saveCart(cart);
  
  // Si existe la función renderCartPage (en cart.html), la llama
  // para actualizar la vista del carrito en la página
  if (typeof renderCartPage === 'function') renderCartPage();
}

/**
 * updateQty(id, delta)
 * Actualiza la cantidad de un item en el carrito
 * 
 * @param {string} id - ID único del item a actualizar
 * @param {number} delta - Cantidad a sumar (positivo) o restar (negativo)
 *   Ejemplo: delta=1 para +1, delta=-1 para -1
 */
function updateQty(id, delta) {
  // Obtiene el carrito actual
  let cart = getCart();
  
  // Busca el índice del item que coincida con el ID proporcionado
  const index = cart.findIndex(item => item.id === id);
  
  // Si se encontró el item (index no es -1)
  if (index !== -1) {
    // Actualiza la cantidad sumando el delta
    cart[index].qty += delta;
    
    // Asegura que la cantidad nunca sea menor que 1
    if (cart[index].qty < 1) cart[index].qty = 1;
    
    // Guarda el carrito actualizado
    saveCart(cart);
    
    // Si existe la función renderCartPage, la llama para actualizar la vista
    if (typeof renderCartPage === 'function') renderCartPage();
  }
}

/* ══════════════════════════════════════════════════════════ */
/* RENDERIZADO DEL CARRITO - Mostrar items en la página        */
/* ══════════════════════════════════════════════════════════ */

/**
 * renderCartPage()
 * Genera el HTML del carrito y lo muestra en la página
 * Solo se llama cuando estamos en cart.html
 * Muestra lista de items, precios, controles de cantidad, etc.
 */
function renderCartPage() {
  // Obtiene el carrito actual
  const cart = getCart();
  
  // Obtiene referencias a elementos HTML clave
  const emptyState = document.getElementById('cartEmpty');        // Mensaje cuando no hay items
  const itemsContainer = document.getElementById('cartItems');    // Contenedor de items
  const summaryBox = document.getElementById('cartSummary');      // Resumen de precios
  const subtotalEl = document.getElementById('summarySubtotal');  // Elemento de subtotal
  const totalEl = document.getElementById('summaryTotal');        // Elemento de total
  
  // Validación: si faltan elementos HTML, salir de la función
  if (!emptyState || !itemsContainer) return;
  
  // Si el carrito está vacío
  if (cart.length === 0) {
    // Muestra el estado vacío
    emptyState.classList.remove('hidden');
    // Limpia el contenedor de items
    itemsContainer.innerHTML = '';
    // Oculta el resumen de precios
    summaryBox.classList.add('hidden');
    return;
  }
  
  // Si hay items, oculta el estado vacío
  emptyState.classList.add('hidden');
  // Muestra el resumen de precios
  summaryBox.classList.remove('hidden');
  
  // Variable para acumular el HTML de los items
  let html = '';
  // Variable para acumular el subtotal
  let subtotal = 0;
  
  // Itera sobre cada item del carrito
  cart.forEach(item => {
    // Calcula el total de este item (precio * cantidad)
    const itemTotal = item.price * item.qty;
    // Suma al subtotal acumulado
    subtotal += itemTotal;
    
    // Crea el HTML para este item
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
  
  // Inserta el HTML generado en el contenedor
  itemsContainer.innerHTML = html;
  
  // Formatea el subtotal como moneda con 2 decimales
  const formattedSubtotal = '$' + subtotal.toFixed(2);
  // Actualiza el elemento de subtotal en la página
  subtotalEl.textContent = formattedSubtotal;
  // Actualiza el elemento de total (igual al subtotal en esta versión)
  totalEl.textContent = formattedSubtotal;
}

/* ══════════════════════════════════════════════════════════ */
/* CHECKOUT - Proceso de compra                               */
/* ══════════════════════════════════════════════════════════ */

/**
 * checkout()
 * Abre el modal de checkout cuando el usuario quiere comprar
 * El modal solicita nombre, email y dirección de envío
 */
function checkout() {
  // Obtiene el elemento del modal de checkout
  const modal = document.getElementById('checkoutModal');
  // Si existe, lo hace visible removiendo la clase 'hidden'
  if (modal) modal.classList.remove('hidden');
}

/**
 * closeCheckout()
 * Cierra el modal de checkout sin procesar el pago
 */
function closeCheckout() {
  // Obtiene el elemento del modal de checkout
  const modal = document.getElementById('checkoutModal');
  // Si existe, lo oculta agregando la clase 'hidden'
  if (modal) modal.classList.add('hidden');
}

/**
 * submitCheckout()
 * Procesa el pedido: valida datos, envía al servidor, y limpia el carrito
 * Esta es una función asincrónica que se comunica con el servidor
 */
async function submitCheckout() {
  // Obtiene los valores del formulario
  const name = document.getElementById('custName').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  
  // Validación: verifica que todos los campos estén completos
  if (!name || !email || !address) {
    // Si falta algo, muestra error
    showToast('Por favor completa todos los campos.', 'error');
    return;
  }
  
  // Obtiene la referencia al botón de envío
  const btn = document.getElementById('submitOrderBtn');
  // Cambia el texto del botón a "Procesando..."
  btn.textContent = 'Procesando...';
  // Deshabilita el botón para evitar clics múltiples
  btn.disabled = true;
  
  // Obtiene el carrito actual para incluir en el pedido
  const cart = getCart();
  
  try {
    // Realiza petición POST al endpoint /api/checkout
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: cart,  // Array de items del carrito
        userInfo: { name, email, address }  // Datos del cliente
      })
    });
    
    // Convierte la respuesta a JSON
    const data = await res.json();
    
    // Si el pedido fue procesado exitosamente
    if (data.success) {
      // Muestra mensaje de éxito
      showToast('¡Pedido completado con éxito! (Beta)', 'success');
      // Elimina el carrito del localStorage
      localStorage.removeItem(CART_KEY);
      // Actualiza el badge del carrito a 0
      updateCartBadge();
      // Cierra el modal de checkout
      closeCheckout();
      // Actualiza la vista del carrito (ahora vacío)
      renderCartPage();
    } else {
      // Si hay error, muestra mensaje
      showToast('Error: ' + data.error, 'error');
      // Restaura el botón a su estado anterior
      btn.textContent = 'Confirmar Pedido';
      btn.disabled = false;
    }
  } catch (e) {
    // Captura errores de conexión
    showToast('Error de conexión', 'error');
    // Restaura el botón a su estado anterior
    btn.textContent = 'Confirmar Pedido';
    btn.disabled = false;
  }
}

/* ══════════════════════════════════════════════════════════ */
/* NOTIFICACIONES - Mostrar mensajes al usuario                */
/* ══════════════════════════════════════════════════════════ */

/**
 * showToast(msg, type)
 * Muestra una notificación pequeña (toast) en la pantalla
 * Se oculta automáticamente después de 3 segundos
 * 
 * @param {string} msg - Texto del mensaje a mostrar
 * @param {string} type - Tipo de toast: 'success', 'error', o 'info'
 */
function showToast(msg, type = 'success') {
  // Obtiene el elemento del toast
  const toast = document.getElementById('toast');
  // Si no existe, salir de la función
  if (!toast) return;
  
  // Establece el texto del mensaje
  toast.textContent = msg;
  // Aplica el tipo como clase CSS (para estilos de color)
  toast.className = `toast ${type}`;
  
  // Configura un temporizador para ocultar el toast después de 3 segundos
  setTimeout(() => {
    // Agrega la clase 'hidden' para ocultarlo
    toast.classList.add('hidden');
  }, 3000);
}

/* ══════════════════════════════════════════════════════════ */
/* UTILIDADES - Funciones auxiliares                           */
/* ══════════════════════════════════════════════════════════ */

/**
 * capitalize(str)
 * Convierte la primera letra de una cadena a mayúscula
 * Ejemplo: 'camiseta' -> 'Camiseta'
 * 
 * @param {string} str - Cadena a capitalizar
 * @return {string} Cadena con primera letra en mayúscula
 */
function capitalize(str) {
  // Si la cadena está vacía, retorna cadena vacía
  if (!str) return '';
  // Retorna la primera letra en mayúscula + el resto de la cadena
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ══════════════════════════════════════════════════════════ */
/* INICIALIZACIÓN - Ejecutar al cargar la página               */
/* ══════════════════════════════════════════════════════════ */

// Cuando el DOM está completamente cargado, actualiza el badge del carrito
document.addEventListener('DOMContentLoaded', updateCartBadge);
