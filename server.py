"""
Know U Beta — Servidor Ligero
Uso: python server.py
Abre automaticamente http://localhost:5000
"""
import os, sys, time, threading, webbrowser, json, datetime
import replicate
from flask import Flask, request, jsonify, send_from_directory

# ── Configuracion ─────────────────────────────────────
REPLICATE_API_TOKEN = "r8_Ei9vtIXmLhtzoJN6wOlY9MTeg2w3kJ81j55lu"
PORT  = 5000
MODEL_TXT2IMG = "black-forest-labs/flux-1.1-pro"
MODEL_IMG2IMG = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
ADMIN_PASS = "knowu_admin"

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE, "data")
ORDERS_FILE = os.path.join(DATA_DIR, "orders.json")

os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(ORDERS_FILE):
    with open(ORDERS_FILE, "w") as f:
        json.dump([], f)


# ── RAG simplificado ──────────────────────────────────
BRAND  = "Know U fashion brand, premium clothing, modern aesthetic, individual self-expression"
QUALITY = "professional flat lay product photo, white background, studio lighting, 8k, sharp focus, detailed fabric texture"

STYLES = {
    "streetwear": "urban streetwear, bold oversized graphic, street culture",
    "minimalista": "minimalist design, clean lines, subtle branding, sophisticated",
    "futurista":   "futuristic cyberpunk, tech-wear, neon accent details",
    "vintage":     "vintage retro graphic, distressed texture, classic americana",
    "abstracto":   "abstract artistic pattern, bold geometric shapes, color blocking",
}
GARMENTS = {
    "camiseta": "t-shirt, crew neck cotton tee",
    "hoodie":   "pullover hoodie sweatshirt, kangaroo pocket",
    "chaqueta": "outerwear jacket, structured silhouette",
    "vestido":  "fashion dress, flowing silhouette",
}
PRICES = {"camiseta": 29.99, "hoodie": 49.99, "chaqueta": 69.99, "vestido": 44.99}

def build_prompt(desc, style, garment):
    parts = [BRAND, desc]
    if style in STYLES:   parts.append(STYLES[style])
    if garment in GARMENTS: parts.append(GARMENTS[garment])
    parts.append(QUALITY)
    return ", ".join(p.strip() for p in parts if p.strip())

# ── App ───────────────────────────────────────────────
app  = Flask(__name__, static_folder=BASE, static_url_path="")

@app.route("/")
def index(): return send_from_directory(BASE, "index.html")

@app.route("/cart")
def cart(): return send_from_directory(BASE, "cart.html")

@app.route("/admin")
def admin(): return send_from_directory(BASE, "admin.html")

@app.route("/<path:path>")
def static_files(path): return send_from_directory(BASE, path)

@app.route("/api/generate", methods=["POST"])
def generate():
    data    = request.get_json() or {}
    desc    = data.get("description", "").strip()
    style   = data.get("style", "")
    garment = data.get("garment", "camiseta")
    image_data = data.get("image_data", None) # Base64 data URI para inspiracion

    if not desc:
        return jsonify({"success": False, "error": "Escribe una descripcion primero"}), 400

    prompt = build_prompt(desc, style, garment)
    try:
        client = replicate.Client(api_token=REPLICATE_API_TOKEN)
        
        if image_data:
            # Usar SDXL Img2Img si el usuario subio una imagen de inspiracion
            print("[INFO] Usando imagen de inspiracion con SDXL Img2Img")
            output = client.run(MODEL_IMG2IMG, input={
                "prompt": prompt,
                "image": image_data,
                "prompt_strength": 0.8, # 0.8 permite rediseñar bastante usando la forma base
                "num_inference_steps": 30,
                "guidance_scale": 7.5
            })
            image_url = str(output[0]) if isinstance(output, list) else str(output)
        else:
            # Texto a imagen normal con FLUX 1.1 Pro
            print("[INFO] Generacion normal con FLUX 1.1 Pro")
            output = client.run(MODEL_TXT2IMG, input={
                "prompt": prompt, "width": 1024, "height": 1024,
                "num_inference_steps": 28, "guidance": 3.5,
                "output_format": "png", "output_quality": 95, "safety_tolerance": 2,
            })
            image_url = str(output)

        return jsonify({
            "success":    True,
            "image_url":  image_url,
            "price":      PRICES.get(garment, 29.99),
            "garment":    garment,
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/checkout", methods=["POST"])
def checkout():
    data = request.get_json() or {}
    cart = data.get("cart", [])
    user_info = data.get("userInfo", {})
    
    if not cart or not user_info:
        return jsonify({"success": False, "error": "Datos incompletos"}), 400
        
    order = {
        "id": "KU-" + str(int(time.time()))[-6:],
        "date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "customer": user_info,
        "items": cart,
        "total": sum(item.get("price", 0) * item.get("qty", 1) for item in cart),
        "status": "Pendiente"
    }
    
    try:
        with open(ORDERS_FILE, "r") as f:
            orders = json.load(f)
        orders.insert(0, order)
        with open(ORDERS_FILE, "w") as f:
            json.dump(orders, f, indent=2)
        return jsonify({"success": True, "order_id": order["id"]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/orders", methods=["POST"])
def get_orders():
    data = request.get_json() or {}
    if data.get("password") != ADMIN_PASS:
        return jsonify({"success": False, "error": "Contraseña incorrecta"}), 403
        
    try:
        with open(ORDERS_FILE, "r") as f:
            orders = json.load(f)
        return jsonify({"success": True, "orders": orders})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    print("=" * 48)
    print("  Know U Beta")
    print(f"  http://localhost:{PORT}")
    print("  Ctrl+C para detener")
    print("=" * 48)
    def _open(): time.sleep(1.5); webbrowser.open(f"http://localhost:{PORT}")
    threading.Thread(target=_open, daemon=True).start()
    app.run(port=PORT, debug=False)
