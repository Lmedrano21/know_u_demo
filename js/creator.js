/* ── Know U Beta — Creator Logic ──────────────────── */

// State
let currentStyle = 'streetwear';
let currentGarment = 'camiseta';
let currentPrice = 29.99;
let currentSize = 'S';
let generatedImage = null;

// DOM Elements
const stylePills = document.querySelectorAll('.pill');
const garmentBtns = document.querySelectorAll('.garment-btn');
const sizeBtns = document.querySelectorAll('.size-btn');
const descInput = document.getElementById('descInput');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.getElementById('btnText');
const spinner = document.getElementById('spinner');
const statusMsg = document.getElementById('statusMsg');
const previewEmpty = document.getElementById('previewEmpty');
const previewImg = document.getElementById('previewImg');
const previewCard = document.getElementById('previewCard');
const cartControls = document.getElementById('cartControls');
const displayPrice = document.getElementById('displayPrice');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const fileLabel = document.getElementById('fileLabel');
const clearImageBtn = document.getElementById('clearImageBtn');
const fileUploadWrapper = document.getElementById('fileUploadWrapper');

let base64Image = null;

// ── Setup Listeners ──

stylePills.forEach(pill => {
  pill.addEventListener('click', () => {
    stylePills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentStyle = pill.dataset.style;
  });
});

garmentBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    garmentBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGarment = btn.dataset.garment;
    currentPrice = parseFloat(btn.dataset.price);
  });
});

sizeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sizeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSize = btn.dataset.size;
  });
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    base64Image = event.target.result;
    imagePreview.src = base64Image;
    imagePreview.classList.remove('hidden');
    fileLabel.classList.add('hidden');
    clearImageBtn.classList.remove('hidden');
    fileUploadWrapper.classList.add('has-file');
  };
  reader.readAsDataURL(file);
});

clearImageBtn.addEventListener('click', (e) => {
  e.preventDefault();
  imageInput.value = '';
  base64Image = null;
  imagePreview.src = '';
  imagePreview.classList.add('hidden');
  fileLabel.classList.remove('hidden');
  clearImageBtn.classList.add('hidden');
  fileUploadWrapper.classList.remove('has-file');
});

// ── Generation Logic ──

async function generateDesign() {
  const desc = descInput.value.trim();
  
  if (!desc) {
    showMsg('Por favor escribe una descripción de lo que imaginas.', 'error');
    descInput.focus();
    return;
  }
  
  // Set Loading State
  setLoading(true);
  showMsg(base64Image ? 'Conectando con SDXL Img2Img...' : 'Conectando con FLUX 1.1 Pro (aprox. 6 segundos)...', 'info');
  
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: desc,
        style: currentStyle,
        garment: currentGarment,
        image_data: base64Image
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      generatedImage = data.image_url;
      currentPrice = data.price;
      showResult(generatedImage, currentPrice);
    } else {
      showMsg('Error de IA: ' + data.error, 'error');
      setLoading(false);
    }
    
  } catch (err) {
    showMsg('Error de conexión con el servidor.', 'error');
    setLoading(false);
  }
}

function showResult(url, price) {
  // Update Preview
  previewEmpty.classList.add('hidden');
  previewImg.src = url;
  previewImg.classList.remove('hidden');
  previewCard.classList.add('has-image');
  
  // Show Cart Controls
  displayPrice.textContent = '$' + price.toFixed(2);
  cartControls.classList.remove('hidden');
  
  // Reset Generate Button
  setLoading(false);
  showMsg('');
  
  // Scroll to preview on mobile
  if (window.innerWidth <= 900) {
    previewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ── Add to Cart ──

function addToCart() {
  if (!generatedImage) return;
  
  const item = {
    garment: currentGarment,
    style: currentStyle,
    size: currentSize,
    price: currentPrice,
    image_url: generatedImage,
    description: descInput.value.trim()
  };
  
  addItem(item); // Function from cart.js
}

// ── Helpers ──

function setLoading(isLoading) {
  generateBtn.disabled = isLoading;
  if (isLoading) {
    btnText.textContent = 'Generando...';
    spinner.classList.remove('hidden');
  } else {
    btnText.textContent = 'Generar Diseño';
    spinner.classList.add('hidden');
  }
}

function showMsg(msg, type = 'info') {
  if (!msg) {
    statusMsg.classList.add('hidden');
    return;
  }
  statusMsg.textContent = msg;
  statusMsg.className = `status-msg ${type}`;
  statusMsg.classList.remove('hidden');
}
