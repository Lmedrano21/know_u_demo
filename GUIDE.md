# GUÍA DE DESARROLLO - Know U Beta

## Tabla de Contenidos
1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Agregar Nuevas Funciones](#agregar-nuevas-funciones)
3. [Modificar Funciones Existentes](#modificar-funciones-existentes)
4. [Agregar Nuevos Productos](#agregar-nuevos-productos)
5. [Agregar Nuevos Estilos](#agregar-nuevos-estilos)
6. [Agregar Nuevas Rutas API](#agregar-nuevas-rutas-api)
7. [Troubleshooting](#troubleshooting)

---

## Estructura del Proyecto

```
beta/
├── index.html              # Página principal de creación de diseños
├── cart.html               # Página del carrito de compras
├── admin.html              # Panel administrativo de pedidos
├── server.py               # Servidor Flask con endpoints API
├── README.md               # Descripción general del proyecto
├── GUIDE.md                # Esta documentación
├── css/
│   └── style.css           # Estilos CSS de la aplicación
├── js/
│   ├── creator.js          # Lógica de generación de diseños
│   ├── cart.js             # Lógica de carrito y checkout
│   └── admin.js            # Lógica del panel administrativo
├── data/
│   └── orders.json         # Archivo JSON que almacena los pedidos
└── new_features/           # Carpeta para nuevas funcionalidades
```

### Archivos Principales y Sus Funciones

| Archivo | Propósito |
|---------|-----------|
| **server.py** | Backend Flask. Procesa generación IA, checkouts y pedidos. |
| **creator.js** | Frontend. Interfaz para crear diseños (estilos, prendas, tallas). |
| **cart.js** | Frontend. Gestiona carrito local, checkout y notificaciones. |
| **admin.js** | Frontend. Panel para ver pedidos con autenticación. |
| **orders.json** | Base de datos. Almacena todos los pedidos procesados. |

---

## Agregar Nuevas Funciones

### Ejemplo 1: Agregar un Botón de Favoritos

**Paso 1: Modificar HTML (index.html)**
```html
<!-- Después del botón "Agregar al Carrito", agrega: -->
<button class="fav-btn" id="favBtn" onclick="toggleFavorite()">
  Agregar a Favoritos
</button>
```

**Paso 2: Agregar Función en JavaScript (creator.js)**
```javascript
/**
 * toggleFavorite()
 * Agrega o quita el diseño actual de favoritos
 * Los favoritos se guardan en localStorage
 */
function toggleFavorite() {
  // Obtiene favoritos actuales del localStorage
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  // Crea objeto del diseño favorito
  const favorite = {
    image_url: generatedImage,
    description: descInput.value.trim(),
    garment: currentGarment,
    style: currentStyle
  };
  
  // Verifica si ya existe en favoritos
  const exists = favorites.some(f => f.image_url === generatedImage);
  
  if (exists) {
    // Si existe, lo elimina
    favorites = favorites.filter(f => f.image_url !== generatedImage);
    showToast('Eliminado de favoritos', 'info');
  } else {
    // Si no existe, lo agrega
    favorites.push(favorite);
    showToast('Agregado a favoritos!', 'success');
  }
  
  // Guarda favoritos actualizados
  localStorage.setItem('favorites', JSON.stringify(favorites));
}
```

**Paso 3: Actualizar Estilos CSS (css/style.css)**
```css
.fav-btn {
  background: #fff;
  border: 2px solid #ff1493;
  color: #ff1493;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.fav-btn:hover {
  background: #ff1493;
  color: #fff;
}
```

---

## Modificar Funciones Existentes

### Ejemplo 1: Cambiar Mensajes de Error

**Ubicación: creator.js, función `generateDesign()`**

**Antes:**
```javascript
if (!desc) {
  showMsg('Por favor escribe una descripción de lo que imaginas.', 'error');
  descInput.focus();
  return;
}
```

**Después:**
```javascript
if (!desc) {
  showMsg('⚠️ Describe tu idea antes de generar. Sé creativo!', 'error');
  descInput.focus();
  return;
}
```

---

### Ejemplo 2: Cambiar Precio de una Prenda

**Ubicación: server.py**

**Antes:**
```python
PRICES = {"camiseta": 29.99, "gorra": 19.99}
```

**Después (aumenta precio de camiseta a $34.99):**
```python
PRICES = {"camiseta": 34.99, "gorra": 19.99}
```

Nota: Los cambios se aplican a nuevos diseños. No afecta carros existentes.

---

### Ejemplo 3: Cambiar Contraseña de Admin

**Ubicación: server.py**

**Antes:**
```python
ADMIN_PASS = "knowu_admin"
```

**Después:**
```python
ADMIN_PASS = "mi_contraseña_segura_123"
```

Nota: Usa una contraseña fuerte con números, letras y caracteres especiales.

---

### Ejemplo 4: Aumentar Cantidad Máxima de Items en Carrito

**Ubicación: cart.js, función `updateQty()`**

**Antes:**
```javascript
if (cart[index].qty < 1) cart[index].qty = 1;
```

**Después (permite máximo 10 items):**
```javascript
// Evita cantidad menor a 1 o mayor a 10
if (cart[index].qty < 1) cart[index].qty = 1;
if (cart[index].qty > 10) cart[index].qty = 10;
```

---

## Agregar Nuevos Productos

### Paso 1: Agregar Producto a server.py

```python
# En la sección de CONFIGURACIÓN, modifica:
GARMENTS = {
    "camiseta": "t-shirt, crew neck cotton tee",
    "gorra": "baseball cap, adjustable fit",
    "sudadera": "hoodie sweatshirt, comfortable fit",  # ← NUEVO
}

PRICES = {
    "camiseta": 29.99,
    "gorra": 19.99,
    "sudadera": 39.99,  # ← NUEVO
}
```

### Paso 2: Agregar Botón en index.html

```html
<!-- En la sección "Prenda", agrega dentro de .garment-grid: -->
<button class="garment-btn" data-garment="sudadera" data-price="39.99">
  <span class="garment-icon">H</span>
  <span>Sudadera</span>
  <span class="garment-price">$39.99</span>
</button>
```

### Paso 3: Verificar en creator.js

El JavaScript ya soporta cualquier prenda. No necesita cambios.

### Resultado

Los usuarios ahora podrán seleccionar sudadera como opción junto a camiseta y gorra.

---

## Agregar Nuevos Estilos

### Paso 1: Agregar Estilo a server.py

```python
# En la sección STYLES, agrega:
STYLES = {
    "streetwear": "urban streetwear, bold oversized graphic, street culture",
    "minimalista": "minimalist design, clean lines, subtle branding, sophisticated",
    "futurista": "futuristic cyberpunk, tech-wear, neon accent details",
    "vintage": "vintage retro graphic, distressed texture, classic americana",
    "abstracto": "abstract artistic pattern, bold geometric shapes, color blocking",
    "retro_90s": "90s retro style, bold colors, nostalgia, grunge aesthetic",  # ← NUEVO
}
```

### Paso 2: Agregar Botón en index.html

```html
<!-- En .style-pills agrega: -->
<button class="pill" data-style="retro_90s">Retro 90s</button>
```

### Resultado

El nuevo estilo "Retro 90s" aparecerá en las opciones de estilos y modificará cómo la IA genera diseños.

---

## Agregar Nuevas Rutas API

### Ejemplo: Crear Endpoint para Obtener Estadísticas de Ventas

**Paso 1: Agregar función en server.py**

```python
@app.route("/api/stats", methods=["POST"])
def get_stats():
    """
    Obtiene estadísticas de ventas (requiere contraseña admin)
    
    Datos esperados:
    {
        "password": "knowu_admin"
    }
    """
    # Valida contraseña
    data = request.get_json() or {}
    if data.get("password") != ADMIN_PASS:
        return jsonify({"success": False, "error": "Acceso denegado"}), 403
    
    try:
        # Lee pedidos
        with open(ORDERS_FILE, "r") as f:
            orders = json.load(f)
        
        # Calcula estadísticas
        total_ventas = sum(o["total"] for o in orders)
        total_ordenes = len(orders)
        
        # Cuenta por tipo de prenda
        prendas_vendidas = {}
        for order in orders:
            for item in order["items"]:
                prenda = item["garment"]
                prendas_vendidas[prenda] = prendas_vendidas.get(prenda, 0) + item["qty"]
        
        return jsonify({
            "success": True,
            "total_ventas": total_ventas,
            "total_ordenes": total_ordenes,
            "prendas_vendidas": prendas_vendidas
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
```

**Paso 2: Llamar desde JavaScript (admin.js)**

```javascript
/**
 * loadStats()
 * Obtiene y muestra estadísticas de ventas
 */
async function loadStats() {
  try {
    const res = await fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPass })
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log('Ventas totales: $' + data.total_ventas.toFixed(2));
      console.log('Órdenes: ' + data.total_ordenes);
      console.log('Prendas vendidas:', data.prendas_vendidas);
    }
  } catch (e) {
    console.error('Error:', e);
  }
}
```

---

## Iniciar el Servidor

```bash
# Instalar dependencias (si no las tienes)
pip install flask replicate

# Iniciar el servidor
python server.py

# Se abrirá automáticamente en http://localhost:5000
```

---

## Troubleshooting

### Problema: "ModuleNotFoundError: No module named 'flask'"

**Solución:**
```bash
pip install flask replicate
```

### Problema: "Port 5000 already in use"

**Solución:**
```python
# En server.py, cambia:
PORT = 5000

# A:
PORT = 5001  # O cualquier puerto disponible
```

### Problema: Las imágenes generadas no se cargan

**Causas:**
1. Token API de Replicate inválido o vencido
2. Cuota de API agotada
3. Descripción vacía o muy corta

**Solución:**
- Verifica tu token en server.py: `REPLICATE_API_TOKEN`
- Asegúrate de tener créditos en Replicate.com
- Escribe descripciones más detalladas

### Problema: Carrito no guarda items

**Causa:** localStorage deshabilitado en el navegador

**Solución:**
1. Abre DevTools (F12)
2. Ve a Console
3. Verifica: `console.log(localStorage.getItem('knowu_beta_cart'))`
4. Si retorna `null`, habilita localStorage en tu navegador

### Problema: Admin panel no carga

**Causa:** Contraseña incorrecta

**Solución:**
- Verifica que la contraseña sea exactamente `knowu_admin`
- Recuerda que es sensible a mayúsculas/minúsculas

---

## Recursos Útiles

- **Flask Documentation:** https://flask.palletsprojects.com/
- **Replicate API:** https://replicate.com/
- **JavaScript MDN:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/
- **CSS Reference:** https://developer.mozilla.org/en-US/docs/Web/CSS/

---

## Consejos para Desarrollo

### Buenas Prácticas

1. **Siempre comenta tu código** siguiendo el formato de este proyecto
2. **Prueba cambios localmente** antes de subir a producción
3. **Usa nombres descriptivos** para funciones y variables
4. **Mantén la estructura consistente** del código existente
5. **Valida inputs del usuario** antes de procesarlos

### Evita

1. Modificar archivos JSON manualmente (usa la API)
2. Compartir el token de API en repositorios públicos
3. Cambiar nombres de variables de estado existentes
4. Eliminar comentarios de documentación
5. Hacer cambios sin probarlos primero

### Seguridad

- Nunca dejes el token de API hardcodeado en producción
- Usa variables de entorno para datos sensibles
- Valida todas las contraseñas del lado del servidor
- Protege el archivo `orders.json` con permisos restringidos

---

## Notas Finales

- Este proyecto usa **localStorage** para el carrito (datos en el navegador del usuario)
- Los pedidos se almacenan en `data/orders.json` (archivo de texto simple)
- Para producción, considera usar una base de datos real (MongoDB, PostgreSQL, etc.)
- La generación de imágenes consume créditos de Replicate

---

**Última actualización:** Mayo 11, 2026  
**Versión:** Know U Beta v1.0  
**Autor:** Know U Development Team
