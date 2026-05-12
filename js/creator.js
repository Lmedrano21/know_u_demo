/**
 * ────────────────────────────────────────────────────────────
 * CREATOR.JS - Lógica de Generación de Diseños
 * ────────────────────────────────────────────────────────────
 * Este módulo gestiona la interfaz de creación de prendas
 * personalizadas con IA, incluyendo la selección de estilos,
 * prendas, tallas e imágenes de inspiración.
 */

/* ══════════════════════════════════════════════════════════ */
/* ESTADO GLOBAL - Variables para almacenar selecciones       */
/* ══════════════════════════════════════════════════════════ */

// Almacena el estilo seleccionado actualmente (streetwear, minimalista, etc)
let currentStyle = 'streetwear';

// Almacena la prenda seleccionada (camiseta o gorra)
let currentGarment = 'camiseta';

// Almacena el precio actual de la prenda seleccionada
let currentPrice = 29.99;

// Almacena la talla seleccionada (XS, S, M, L, XL)
let currentSize = 'S';

// Almacena la URL de la imagen generada por la IA
let generatedImage = null;

// Almacena la imagen de inspiración en formato Base64 (si el usuario carga una)
let base64Image = null;

/* ══════════════════════════════════════════════════════════ */
/* REFERENCIAS A ELEMENTOS DEL DOM                            */
/* ══════════════════════════════════════════════════════════ */

// Obtiene todos los botones de estilos (pills)
const stylePills = document.querySelectorAll('.pill');

// Obtiene todos los botones de prendas (camiseta, gorra)
const garmentBtns = document.querySelectorAll('.garment-btn');

// Obtiene todos los botones de tallas (XS, S, M, L, XL)
const sizeBtns = document.querySelectorAll('.size-btn');

// Campo de texto para la descripción de diseño
const descInput = document.getElementById('descInput');

// Botón para generar el diseño
const generateBtn = document.getElementById('generateBtn');

// Texto que se muestra dentro del botón de generar
const btnText = document.getElementById('btnText');

// Spinner (indicador de carga) que aparece mientras se genera
const spinner = document.getElementById('spinner');

// Elemento para mostrar mensajes de estado
const statusMsg = document.getElementById('statusMsg');

// Elemento que se muestra cuando no hay imagen generada
const previewEmpty = document.getElementById('previewEmpty');

// Elemento img que muestra la imagen generada
const previewImg = document.getElementById('previewImg');

// Contenedor de la tarjeta de vista previa
const previewCard = document.getElementById('previewCard');

// Controles para agregar al carrito (talla, precio, botón)
const cartControls = document.getElementById('cartControls');

// Elemento que muestra el precio actual
const displayPrice = document.getElementById('displayPrice');

// Input de tipo file para subir imagen de referencia
const imageInput = document.getElementById('imageInput');

// Elemento img para mostrar la vista previa de la imagen subida
const imagePreview = document.getElementById('imagePreview');

// Etiqueta que indica dónde subir la imagen
const fileLabel = document.getElementById('fileLabel');

// Botón para limpiar la imagen subida
const clearImageBtn = document.getElementById('clearImageBtn');

// Contenedor del área de subida de archivos
const fileUploadWrapper = document.getElementById('fileUploadWrapper');

/* ══════════════════════════════════════════════════════════ */
/* EVENT LISTENERS - Configuración de eventos interactivos    */
/* ══════════════════════════════════════════════════════════ */

/**
 * Listener para cambio de estilo
 * Cuando el usuario hace clic en un estilo, se marca como activo
 */
stylePills.forEach(pill => {
  // Cada vez que se hace clic en un estilo
  pill.addEventListener('click', () => {
    // Remueve la clase 'active' de todos los estilos
    stylePills.forEach(p => p.classList.remove('active'));
    // Añade la clase 'active' al estilo seleccionado
    pill.classList.add('active');
    // Actualiza el estilo actual con el valor del data attribute
    currentStyle = pill.dataset.style;
  });
});

/**
 * Listener para cambio de prenda
 * Cuando el usuario selecciona camiseta o gorra
 */
garmentBtns.forEach(btn => {
  // Cada vez que se hace clic en una prenda
  btn.addEventListener('click', () => {
    // Remueve la clase 'active' de todas las prendas
    garmentBtns.forEach(b => b.classList.remove('active'));
    // Marca la prenda seleccionada como activa
    btn.classList.add('active');
    // Actualiza la prenda actual con el valor del data attribute
    currentGarment = btn.dataset.garment;
    // Actualiza el precio actual según la prenda seleccionada
    currentPrice = parseFloat(btn.dataset.price);
  });
});

/**
 * Listener para cambio de talla
 * Permite seleccionar tamaño XS, S, M, L, XL
 */
sizeBtns.forEach(btn => {
  // Cada vez que se hace clic en una talla
  btn.addEventListener('click', () => {
    // Remueve la clase 'active' de todas las tallas
    sizeBtns.forEach(b => b.classList.remove('active'));
    // Marca la talla seleccionada como activa
    btn.classList.add('active');
    // Actualiza la talla actual con el valor del data attribute
    currentSize = btn.dataset.size;
  });
});

/**
 * Listener para subida de imagen de inspiración
 * Convierte la imagen a Base64 para enviarla a la API
 */
imageInput.addEventListener('change', (e) => {
  // Obtiene el archivo seleccionado
  const file = e.target.files[0];
  // Si no hay archivo, salir de la función
  if (!file) return;
  
  // Crea un lector de archivos para convertir a Base64
  const reader = new FileReader();
  
  // Cuando la lectura se completa
  reader.onload = (event) => {
    // Almacena la imagen en Base64
    base64Image = event.target.result;
    // Muestra la vista previa de la imagen
    imagePreview.src = base64Image;
    // Hace visible la imagen de vista previa
    imagePreview.classList.remove('hidden');
    // Oculta la etiqueta de "Sube una imagen"
    fileLabel.classList.add('hidden');
    // Muestra el botón para limpiar la imagen
    clearImageBtn.classList.remove('hidden');
    // Añade clase visual indicando que hay archivo
    fileUploadWrapper.classList.add('has-file');
  };
  
  // Inicia la lectura del archivo como Data URL (Base64)
  reader.readAsDataURL(file);
});

/**
 * Listener para limpiar la imagen subida
 * Permite al usuario deseleccionar su imagen de inspiración
 */
clearImageBtn.addEventListener('click', (e) => {
  // Previene el comportamiento por defecto del botón
  e.preventDefault();
  // Limpia el input de archivo
  imageInput.value = '';
  // Elimina la variable de Base64
  base64Image = null;
  // Limpia la fuente de la imagen de vista previa
  imagePreview.src = '';
  // Oculta la imagen de vista previa
  imagePreview.classList.add('hidden');
  // Muestra nuevamente la etiqueta de subida
  fileLabel.classList.remove('hidden');
  // Oculta el botón de limpiar
  clearImageBtn.classList.add('hidden');
  // Remueve la clase visual de "hay archivo"
  fileUploadWrapper.classList.remove('has-file');
});

/* ══════════════════════════════════════════════════════════ */
/* GENERACIÓN DE DISEÑOS - Comunicación con API IA             */
/* ══════════════════════════════════════════════════════════ */

/**
 * generateDesign()
 * Función principal que genera un diseño de prenda usando IA.
 * Valida la entrada, envía la solicitud al servidor, y maneja la respuesta.
 * Puede usar dos modelos: FLUX (texto a imagen) o SDXL (imagen a imagen).
 */
async function generateDesign() {
  // Obtiene la descripción del textarea y elimina espacios en blanco
  const desc = descInput.value.trim();
  
  // Validación: si no hay descripción, muestra error y enfoca el campo
  if (!desc) {
    showMsg('Por favor escribe una descripción de lo que imaginas.', 'error');
    descInput.focus();
    return;
  }
  
  // Activa el estado de carga (deshabilita botón, muestra spinner)
  setLoading(true);
  
  // Muestra mensaje según si hay imagen de inspiración o no
  showMsg(
    base64Image 
      ? 'Conectando con SDXL Img2Img...' 
      : 'Conectando con FLUX 1.1 Pro (aprox. 6 segundos)...', 
    'info'
  );
  
  try {
    // Realiza petición POST al endpoint /api/generate del servidor
    const res = await fetch('/api/generate', {
      // Método HTTP: POST para enviar datos
      method: 'POST',
      // Define que se envía JSON
      headers: { 'Content-Type': 'application/json' },
      // Cuerpo con los datos necesarios para generar el diseño
      body: JSON.stringify({
        description: desc,           // Descripción del diseño deseado
        style: currentStyle,         // Estilo seleccionado
        garment: currentGarment,     // Prenda (camiseta o gorra)
        image_data: base64Image      // Imagen de inspiración en Base64 (si existe)
      })
    });
    
    // Convierte la respuesta a JSON
    const data = await res.json();
    
    // Si la generación fue exitosa
    if (data.success) {
      // Almacena la URL de la imagen generada
      generatedImage = data.image_url;
      // Actualiza el precio según la prenda seleccionada
      currentPrice = data.price;
      // Muestra el resultado en la interfaz
      showResult(generatedImage, currentPrice);
    } else {
      // Si hubo error, muestra el mensaje de error
      showMsg('Error de IA: ' + data.error, 'error');
      // Desactiva el estado de carga
      setLoading(false);
    }
    
  } catch (err) {
    // Captura errores de conexión con el servidor
    showMsg('Error de conexión con el servidor.', 'error');
    // Desactiva el estado de carga
    setLoading(false);
  }
}

/**
 * showResult(url, price)
 * Muestra el resultado de la generación en la interfaz
 * Actualiza la vista previa, precio y controles de carrito
 * 
 * @param {string} url - URL de la imagen generada por la IA
 * @param {number} price - Precio de la prenda seleccionada
 */
function showResult(url, price) {
  // Oculta el mensaje de "Tu diseño aparecerá aquí"
  previewEmpty.classList.add('hidden');
  // Establece la URL de la imagen generada
  previewImg.src = url;
  // Hace visible la imagen en la previsualizacion
  previewImg.classList.remove('hidden');
  // Añade clase para estilos específicos cuando hay imagen
  previewCard.classList.add('has-image');
  
  // Actualiza el texto del precio mostrado en pantalla
  displayPrice.textContent = '$' + price.toFixed(2);
  // Muestra los controles para agregar al carrito
  cartControls.classList.remove('hidden');
  
  // Desactiva el estado de carga (habilita botón, oculta spinner)
  setLoading(false);
  // Limpia los mensajes de estado
  showMsg('');
  
  // En dispositivos móviles, desplaza hacia la vista previa
  if (window.innerWidth <= 900) {
    previewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* ══════════════════════════════════════════════════════════ */
/* CARRITO - Funciones para agregar productos al carrito       */
/* ══════════════════════════════════════════════════════════ */

/**
 * addToCart()
 * Crea un objeto de item con todos los detalles del diseño
 * y lo agrega al carrito usando la función addItem() de cart.js
 */
function addToCart() {
  // Validación: solo permite agregar si hay una imagen generada
  if (!generatedImage) return;
  
  // Crea un objeto con los detalles del diseño personalizado
  const item = {
    garment: currentGarment,         // Tipo de prenda (camiseta o gorra)
    style: currentStyle,             // Estilo seleccionado
    size: currentSize,               // Talla elegida
    price: currentPrice,             // Precio de la prenda
    image_url: generatedImage,       // URL de la imagen generada
    description: descInput.value.trim() // Descripción escrita por el usuario
  };
  
  // Llama a la función addItem() que está en cart.js
  // Esta función agrega el item al localStorage del carrito
  addItem(item);
}

/* ══════════════════════════════════════════════════════════ */
/* FUNCIONES AUXILIARES - Gestión de UI y mensajes             */
/* ══════════════════════════════════════════════════════════ */

/**
 * setLoading(isLoading)
 * Controla el estado visual de carga del botón y spinner
 * Deshabilita el botón mientras se genera y muestra animación
 * 
 * @param {boolean} isLoading - true mientras se genera, false cuando termina
 */
function setLoading(isLoading) {
  // Deshabilita o habilita el botón de generar
  generateBtn.disabled = isLoading;
  
  if (isLoading) {
    // Si está cargando, cambia el texto a "Generando..."
    btnText.textContent = 'Generando...';
    // Muestra el spinner de animación
    spinner.classList.remove('hidden');
  } else {
    // Si terminó, restaura el texto original
    btnText.textContent = 'Generar Diseño';
    // Oculta el spinner
    spinner.classList.add('hidden');
  }
}

/**
 * showMsg(msg, type)
 * Muestra o oculta mensajes de estado en la interfaz
 * Puede mostrar mensajes de error, info, o success
 * 
 * @param {string} msg - Texto del mensaje a mostrar (vacío para ocultar)
 * @param {string} type - Tipo de mensaje: 'error', 'info', o 'success'
 */
function showMsg(msg, type = 'info') {
  // Si el mensaje está vacío, oculta el elemento
  if (!msg) {
    statusMsg.classList.add('hidden');
    return;
  }
  
  // Establece el texto del mensaje
  statusMsg.textContent = msg;
  // Aplica el tipo de mensaje como clase CSS para estilos
  statusMsg.className = `status-msg ${type}`;
  // Hace visible el elemento de mensaje
  statusMsg.classList.remove('hidden');
}
