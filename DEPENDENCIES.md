# DEPENDENCIAS - Know U Beta

## Descripcion General

Este documento lista todas las dependencias del proyecto Know U Beta, incluyendo instalacion, versiones y descripcion de cada libreria.

---

## Instalacion Rapida

### Opcion 1: Instalar desde requirements.txt

```bash
pip install -r requirements.txt
```

### Opcion 2: Instalar Manualmente

```bash
pip install Flask==3.0.0
pip install replicate==0.20.0
pip install Werkzeug==3.0.1
```

---

## Dependencias del Servidor (Backend)

### 1. Flask 3.0.0
**Proposito:** Framework web para crear el servidor HTTP y endpoints API

**Que hace:**
- Crea el servidor web que escucha en http://localhost:5000
- Define rutas (/, /cart, /admin, /api/generate, /api/checkout, /api/orders)
- Maneja peticiones POST y GET
- Sirve archivos estáticos (HTML, CSS, JavaScript)

**Instalacion:**
```bash
pip install Flask==3.0.0
```

**Documentacion:** https://flask.palletsprojects.com/

**Archivo que lo usa:** server.py

---

### 2. Replicate 0.20.0
**Proposito:** Cliente para acceder a modelos de generacion de imagenes con IA

**Que hace:**
- Conecta con la API de Replicate.com
- Envia prompts a modelos FLUX 1.1 Pro (texto a imagen)
- Envia prompts a modelos SDXL (imagen a imagen)
- Retorna URLs de imagenes generadas

**Instalacion:**
```bash
pip install replicate==0.20.0
```

**Modelos Utilizados:**
- `black-forest-labs/flux-1.1-pro` - Generacion texto a imagen (rapido, alta calidad)
- `stability-ai/sdxl` - Generacion imagen a imagen (cuando hay referencia)

**Documentacion:** https://replicate.com/

**Archivo que lo usa:** server.py

**Requisitos:**
- Token API valido de Replicate.com
- Creditos disponibles en tu cuenta de Replicate

---

### 3. Werkzeug 3.0.1
**Proposito:** Herramientas HTTP y utilidades para Flask

**Que hace:**
- Proporciona funciones HTTP basicas para Flask
- Manejo de datos en peticiones
- Respuestas JSON estructuradas
- Servir archivos estaticos

**Instalacion:**
```bash
pip install Werkzeug==3.0.1
```

**Documentacion:** https://werkzeug.palletsprojects.com/

**Archivo que lo usa:** server.py (indirectamente a través de Flask)

---

## Dependencias del Cliente (Frontend)

El cliente (HTML, CSS, JavaScript) NO requiere instalacion de paquetes. Funciona directamente en el navegador.

**Navegadores soportados:**
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Tecnologias utilizadas:**
- HTML5 (sin frameworks)
- CSS3 (sin preprocesadores)
- JavaScript Vanilla (sin frameworks)
- localStorage del navegador

---

## Verificar Instalacion

### Comando 1: Listar paquetes instalados

```bash
pip list
```

Deberia mostrar:
```
Flask           3.0.0
replicate       0.20.0
Werkzeug        3.0.1
```

### Comando 2: Verificar versiones especificas

```bash
pip show Flask
pip show replicate
pip show Werkzeug
```

---

## Actualizar Dependencias

Si necesitas actualizar a versiones mas recientes:

```bash
pip install --upgrade Flask replicate Werkzeug
```

Nota: Los cambios de versiones mayores pueden requerir cambios en el codigo.

---

## Solucionar Problemas

### Error: "ModuleNotFoundError: No module named 'flask'"

**Solucion:**
```bash
pip install Flask
```

---

### Error: "No module named 'replicate'"

**Solucion:**
```bash
pip install replicate
```

**Verificar token API:**
```python
# En server.py, verifica que el token sea valido:
REPLICATE_API_TOKEN = "tu_token_aqui"
```

---

### Error: "pip: command not found"

**Solucion:** Python no está en la variable PATH

En Windows:
```bash
python -m pip install -r requirements.txt
```

---

### Error: "Permission denied"

En Linux/Mac:
```bash
sudo pip install -r requirements.txt
```

O mejor, usa un virtual environment:
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Crear y Usar Virtual Environment

Recomendado para evitar conflictos de versiones:

### Windows

```bash
# Crear virtual environment
python -m venv venv

# Activar
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python server.py

# Desactivar (cuando termines)
deactivate
```

### Linux / Mac

```bash
# Crear virtual environment
python3 -m venv venv

# Activar
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python server.py

# Desactivar (cuando termines)
deactivate
```

---

## Estructura de Archivos Despues de Instalar

```
beta/
├── server.py
├── requirements.txt        ← Para instalar dependencias
├── DEPENDENCIES.md         ← Este archivo
├── venv/                   ← Virtual environment (opcional)
│   ├── bin/
│   ├── lib/
│   └── pyvenv.cfg
├── index.html
├── cart.html
├── admin.html
└── ...
```

---

## Compatibilidad de Versiones

| Libreria | Version | Razon |
|----------|---------|-------|
| Flask | 3.0.0 | Estable, buen soporte |
| replicate | 0.20.0 | Compatible con FLUX y SDXL |
| Werkzeug | 3.0.1 | Sincronizado con Flask 3.0.0 |

---

## Seguridad

NUNCA compartas tu token de Replicate:

```python
# MAL - Nunca hagas esto en codigo publico:
REPLICATE_API_TOKEN = "r8_Ei9vtIXmLhtzoJN6wOlY9MTeg2w3kJ81j55lu"

# BIEN - Usa variables de entorno en produccion:
import os
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
```

---

## Proximos Pasos

1. Ejecuta: `pip install -r requirements.txt`
2. Verifica: `pip list` (debe mostrar Flask, replicate, Werkzeug)
3. Inicia servidor: `python server.py`
4. Abre: http://localhost:5000

---

## Contacto y Ayuda

Si tienes problemas con las dependencias:
1. Verifica Python version: `python --version` (debe ser 3.8+)
2. Verifica pip: `pip --version`
3. Intenta instalar en un virtual environment limpio
4. Consulta: https://pip.pypa.io/en/stable/

---

**Ultima actualizacion:** Mayo 11, 2026  
**Versión:** Know U Beta v1.0
