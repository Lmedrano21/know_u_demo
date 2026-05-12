"""
╔════════════════════════════════════════════════════════════════════════════╗
║                        KNOW U BETA - SERVIDOR                             ║
╚════════════════════════════════════════════════════════════════════════════╝

DESCRIPCIÓN:
Servidor Flask ligero que gestiona la generación de diseños con IA,
checkouts, y panel de administración de pedidos.

INSTALACIÓN:
  pip install flask replicate

USO:
  python server.py
  
  El servidor se abre automáticamente en http://localhost:5000

RUTAS DISPONIBLES:
  GET  /                    → Página principal de creación
  GET  /cart                → Página del carrito
  GET  /admin               → Panel administrativo
  POST /api/generate        → Genera diseño con IA
  POST /api/checkout        → Procesa compra y crea pedido
  POST /api/orders          → Obtiene lista de pedidos (requiere contraseña)
"""

# ════════════════════════════════════════════════════════════════════════════
# IMPORTACIONES - Librerías necesarias para el servidor
# ════════════════════════════════════════════════════════════════════════════

import os                  # Para manejo de directorios y rutas
import sys                 # Para acceso a variables del sistema
import time                # Para generar timestamps
import threading           # Para ejecutar servidor en thread separado
import webbrowser          # Para abrir navegador automáticamente
import json                # Para trabajar con archivos JSON
import datetime            # Para fechas y horas de pedidos
import replicate           # API para generar imágenes con IA (FLUX, SDXL)
from flask import Flask, request, jsonify, send_from_directory  # Web framework


# ════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN - Constantes del sistema
# ════════════════════════════════════════════════════════════════════════════

# Token API para acceder a Replicate (generador de imágenes con IA)
# IMPORTANTE: Mantén este token seguro, no lo compartas públicamente
REPLICATE_API_TOKEN = "r8_Ei9vtIXmLhtzoJN6wOlY9MTeg2w3kJ81j55lu"

# Puerto donde escucha el servidor
PORT = 5000

# Modelo para generación texto → imagen (FLUX es más rápido y mejores resultados)
MODEL_TXT2IMG = "black-forest-labs/flux-1.1-pro"

# Modelo para generación imagen → imagen (SDXL, usado cuando hay imagen de inspiración)
MODEL_IMG2IMG = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"

# Contraseña para acceder al panel administrativo
ADMIN_PASS = "knowu_admin"

# Rutas de directorios
BASE = os.path.dirname(os.path.abspath(__file__))           # Directorio raíz del proyecto
DATA_DIR = os.path.join(BASE, "data")                       # Carpeta para guardar datos
ORDERS_FILE = os.path.join(DATA_DIR, "orders.json")         # Archivo JSON con pedidos

# Crea la carpeta de datos si no existe
os.makedirs(DATA_DIR, exist_ok=True)

# Inicializa el archivo de pedidos si no existe
if not os.path.exists(ORDERS_FILE):
    # Crea archivo vacío con array JSON
    with open(ORDERS_FILE, "w") as f:
        json.dump([], f)


# ════════════════════════════════════════════════════════════════════════════
# GENERACIÓN DE PROMPTS - Construcción de descripciones para IA
# ════════════════════════════════════════════════════════════════════════════

# Información de marca para que la IA entienda el contexto
BRAND = "Know U fashion brand, premium clothing, modern aesthetic, individual self-expression"

# Especificaciones de calidad para las imágenes generadas
QUALITY = "professional flat lay product photo, white background, studio lighting, 8k, sharp focus, detailed fabric texture"

# Estilos disponibles que modifica cómo la IA interpreta el diseño
STYLES = {
    "streetwear": "urban streetwear, bold oversized graphic, street culture",
    "minimalista": "minimalist design, clean lines, subtle branding, sophisticated",
    "futurista": "futuristic cyberpunk, tech-wear, neon accent details",
    "vintage": "vintage retro graphic, distressed texture, classic americana",
    "abstracto": "abstract artistic pattern, bold geometric shapes, color blocking",
}

# Tipos de prendas disponibles (SOLO CAMISETA Y GORRA)
GARMENTS = {
    "camiseta": "t-shirt, crew neck cotton tee",    # Camiseta clásica
    "gorra": "baseball cap, adjustable fit",        # Gorra de béisbol
}

# Precios de cada prenda
PRICES = {"camiseta": 29.99, "gorra": 19.99}


def build_prompt(desc, style, garment):
    """
    Construye el prompt completo para la IA combinando todos los elementos
    
    Args:
        desc (str): Descripción del diseño del usuario
        style (str): Estilo seleccionado (streetwear, minimalista, etc)
        garment (str): Tipo de prenda (camiseta o gorra)
    
    Returns:
        str: Prompt completo para enviar a la IA
    """
    # Lista de partes que se combinarán
    parts = [BRAND, desc]  # Siempre incluye marca y descripción
    
    # Agrega el estilo si existe
    if style in STYLES:
        parts.append(STYLES[style])
    
    # Agrega la prenda si existe
    if garment in GARMENTS:
        parts.append(GARMENTS[garment])
    
    # Agrega especificaciones de calidad
    parts.append(QUALITY)
    
    # Une todas las partes con comas y elimina espacios extra
    return ", ".join(p.strip() for p in parts if p.strip())


# ════════════════════════════════════════════════════════════════════════════
# APLICACIÓN FLASK - Configuración de rutas y servidor
# ════════════════════════════════════════════════════════════════════════════

# Crea la aplicación Flask
# static_folder=BASE: sirve archivos estáticos desde el directorio raíz
# static_url_path="": mapea archivos sin prefijo de URL
app = Flask(__name__, static_folder=BASE, static_url_path="")


# ════════════════════════════════════════════════════════════════════════════
# RUTAS PÚBLICAS - Páginas principales
# ════════════════════════════════════════════════════════════════════════════

@app.route("/")
def index():
    """
    Ruta raíz
    Devuelve: archivo index.html (página principal de creación de diseños)
    """
    return send_from_directory(BASE, "index.html")


@app.route("/cart")
def cart():
    """
    Ruta del carrito
    Devuelve: archivo cart.html (página de visualización del carrito)
    """
    return send_from_directory(BASE, "cart.html")


@app.route("/admin")
def admin():
    """
    Ruta del panel administrativo
    Devuelve: archivo admin.html (panel de gestión de pedidos)
    """
    return send_from_directory(BASE, "admin.html")


@app.route("/<path:path>")
def static_files(path):
    """
    Ruta para servir archivos estáticos
    Sirve: CSS, JavaScript, imágenes, etc.
    
    Args:
        path (str): Ruta del archivo solicitado
    """
    return send_from_directory(BASE, path)


# ════════════════════════════════════════════════════════════════════════════
# API - GENERACIÓN DE DISEÑOS
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/generate", methods=["POST"])
def generate():
    """
    Endpoint para generar diseños usando IA
    
    Datos esperados (JSON):
    {
        "description": "descripción del diseño",
        "style": "streetwear/minimalista/futurista/vintage/abstracto",
        "garment": "camiseta/gorra",
        "image_data": "URL base64 (opcional) para imagen de inspiración"
    }
    
    Respuesta:
    {
        "success": true/false,
        "image_url": "URL de la imagen generada",
        "price": 29.99 o 19.99,
        "garment": "camiseta" o "gorra"
    }
    """
    # Obtiene los datos JSON de la petición
    data = request.get_json() or {}
    
    # Extrae los parámetros necesarios
    desc = data.get("description", "").strip()               # Descripción
    style = data.get("style", "")                            # Estilo
    garment = data.get("garment", "camiseta")                # Tipo de prenda
    image_data = data.get("image_data", None)                # Imagen de inspiración en Base64
    
    # Validación: la descripción es obligatoria
    if not desc:
        return jsonify({"success": False, "error": "Escribe una descripcion primero"}), 400
    
    # Construye el prompt completo para la IA
    prompt = build_prompt(desc, style, garment)
    
    try:
        # Crea cliente de Replicate con el token API
        client = replicate.Client(api_token=REPLICATE_API_TOKEN)
        
        # Decide qué modelo usar según si hay imagen de inspiración
        if image_data:
            # Si hay imagen, usa SDXL Img2Img (imagen a imagen)
            print("[INFO] Usando imagen de inspiracion con SDXL Img2Img")
            output = client.run(MODEL_IMG2IMG, input={
                "prompt": prompt,
                "image": image_data,
                "prompt_strength": 0.8,       # Qué tanto cambiar la imagen original
                "num_inference_steps": 30,    # Calidad/velocidad (más = mejor pero más lento)
                "guidance_scale": 7.5         # Qué tanto seguir el prompt (7.5 es estándar)
            })
            # Extrae la URL de la imagen (IMG2IMG retorna array)
            image_url = str(output[0]) if isinstance(output, list) else str(output)
        else:
            # Si no hay imagen, usa FLUX 1.1 Pro (texto a imagen)
            print("[INFO] Generacion normal con FLUX 1.1 Pro")
            output = client.run(MODEL_TXT2IMG, input={
                "prompt": prompt,
                "width": 1024,                # Ancho de la imagen
                "height": 1024,               # Alto de la imagen
                "num_inference_steps": 28,    # Pasos de generación
                "guidance": 3.5,              # Intensidad del guía (FLUX usa formato diferente)
                "output_format": "png",       # Formato de salida
                "output_quality": 95,         # Calidad de compresión
                "safety_tolerance": 2,        # Tolerancia de contenido seguro
            })
            # Extrae la URL de la imagen (TXT2IMG retorna string directo)
            image_url = str(output)
        
        # Retorna respuesta exitosa con URL e información
        return jsonify({
            "success": True,
            "image_url": image_url,
            "price": PRICES.get(garment, 29.99),  # Obtiene precio o usa default
            "garment": garment,
        })
    except Exception as e:
        # Si hay error en la generación, retorna con mensaje de error
        return jsonify({"success": False, "error": str(e)}), 500


# ════════════════════════════════════════════════════════════════════════════
# API - CHECKOUT
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/checkout", methods=["POST"])
def checkout():
    """
    Endpoint para procesar checkouts y crear pedidos
    
    Datos esperados (JSON):
    {
        "cart": [
            {
                "garment": "camiseta",
                "style": "streetwear",
                "size": "M",
                "price": 29.99,
                "qty": 1,
                "image_url": "...",
                "description": "..."
            }
        ],
        "userInfo": {
            "name": "Juan García",
            "email": "juan@example.com",
            "address": "Calle 123, Apto 456"
        }
    }
    
    Respuesta:
    {
        "success": true/false,
        "order_id": "KU-123456"
    }
    """
    # Obtiene los datos de la petición
    data = request.get_json() or {}
    cart = data.get("cart", [])              # Array de items
    user_info = data.get("userInfo", {})     # Datos del cliente
    
    # Validación: debe haber items y datos del usuario
    if not cart or not user_info:
        return jsonify({"success": False, "error": "Datos incompletos"}), 400
    
    # Crea objeto de pedido con información completa
    order = {
        "id": "KU-" + str(int(time.time()))[-6:],  # ID único: KU-XXXXXX
        "date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),  # Fecha actual
        "customer": user_info,  # Información del cliente
        "items": cart,          # Items del carrito
        # Calcula total: suma (precio * cantidad) de todos los items
        "total": sum(item.get("price", 0) * item.get("qty", 1) for item in cart),
        "status": "Pendiente"   # Estado inicial del pedido
    }
    
    try:
        # Abre el archivo de pedidos y carga los existentes
        with open(ORDERS_FILE, "r") as f:
            orders = json.load(f)
        
        # Inserta el nuevo pedido al inicio (más reciente primero)
        orders.insert(0, order)
        
        # Guarda el archivo actualizado con tabulación para legibilidad
        with open(ORDERS_FILE, "w") as f:
            json.dump(orders, f, indent=2)
        
        # Retorna respuesta exitosa con ID del pedido
        return jsonify({"success": True, "order_id": order["id"]})
    except Exception as e:
        # Si hay error al guardar, retorna con mensaje de error
        return jsonify({"success": False, "error": str(e)}), 500


# ════════════════════════════════════════════════════════════════════════════
# API - ADMINISTRACIÓN
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/orders", methods=["POST"])
def get_orders():
    """
    Endpoint para obtener lista de pedidos (requiere autenticación)
    
    Datos esperados (JSON):
    {
        "password": "contraseña_admin"
    }
    
    Respuesta si autenticación exitosa:
    {
        "success": true,
        "orders": [...]  # Array de todos los pedidos
    }
    
    Respuesta si autenticación falla:
    {
        "success": false,
        "error": "Contraseña incorrecta"
    }
    """
    # Obtiene los datos de la petición
    data = request.get_json() or {}
    
    # Valida que la contraseña coincida
    if data.get("password") != ADMIN_PASS:
        # Si no coincide, retorna error 403 (Forbidden)
        return jsonify({"success": False, "error": "Contraseña incorrecta"}), 403
    
    try:
        # Abre y carga el archivo de pedidos
        with open(ORDERS_FILE, "r") as f:
            orders = json.load(f)
        
        # Retorna respuesta exitosa con todos los pedidos
        return jsonify({"success": True, "orders": orders})
    except Exception as e:
        # Si hay error al leer, retorna con mensaje de error
        return jsonify({"success": False, "error": str(e)}), 500


# ════════════════════════════════════════════════════════════════════════════
# INICIO DEL SERVIDOR
# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    # Muestra banner de bienvenida
    print("=" * 48)
    print("  Know U Beta")
    print(f"  http://localhost:{PORT}")
    print("  Ctrl+C para detener")
    print("=" * 48)
    
    # Función para abrir navegador automáticamente después de 1.5 segundos
    def _open():
        time.sleep(1.5)  # Espera a que el servidor inicie
        webbrowser.open(f"http://localhost:{PORT}")
    
    # Inicia el navegador en un thread separado (no bloquea el servidor)
    threading.Thread(target=_open, daemon=True).start()
    
    # Inicia el servidor Flask
    # debug=False para modo producción (no recarga automáticamente)
    app.run(port=PORT, debug=False)
