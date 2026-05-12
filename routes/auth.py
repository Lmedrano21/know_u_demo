from flask import Blueprint, request, jsonify
import bcrypt
import uuid
from datetime import datetime, timedelta
from database import get_connection

auth = Blueprint('auth', __name__)

@auth.route('/registro', methods=['POST'])
def registro():
    datos = request.json
    nombre   = datos.get('nombre')
    email    = datos.get('email')
    password = datos.get('password')
    telefono = datos.get('telefono', None)

    if not nombre or not email or not password:
        return jsonify({'error': 'Faltan campos obligatorios'}), 400

    hash_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        con = get_connection()
        cur = con.cursor()
        cur.execute(
            'INSERT INTO usuarios (nombre, email, password_hash, telefono) VALUES (%s, %s, %s, %s)',
            (nombre, email, hash_pw.decode('utf-8'), telefono)
        )
        con.commit()
        return jsonify({'mensaje': 'Usuario registrado correctamente'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        con.close()

@auth.route('/login', methods=['POST'])
def login():
    datos    = request.json
    email    = datos.get('email')
    password = datos.get('password')

    if not email or not password:
        return jsonify({'error': 'Faltan campos obligatorios'}), 400

    try:
        con = get_connection()
        cur = con.cursor(dictionary=True)
        cur.execute('SELECT * FROM usuarios WHERE email = %s AND estado = 1', (email,))
        usuario = cur.fetchone()

        if not usuario or not bcrypt.checkpw(password.encode('utf-8'), usuario['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Credenciales incorrectas'}), 401

        token     = str(uuid.uuid4())
        expira_en = datetime.now() + timedelta(hours=8)

        cur.execute(
            'INSERT INTO sesiones (usuario_id, token, expira_en) VALUES (%s, %s, %s)',
            (usuario['id'], token, expira_en)
        )
        cur.execute('UPDATE usuarios SET ultimo_login = %s WHERE id = %s', (datetime.now(), usuario['id']))
        con.commit()

        return jsonify({
            'mensaje': 'Login exitoso',
            'token': token,
            'usuario': {
                'id':     usuario['id'],
                'nombre': usuario['nombre'],
                'email':  usuario['email']
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        con.close()

@auth.route('/logout', methods=['POST'])
def logout():
    token = request.headers.get('Authorization')

    if not token:
        return jsonify({'error': 'Token requerido'}), 400

    try:
        con = get_connection()
        cur = con.cursor()
        cur.execute('DELETE FROM sesiones WHERE token = %s', (token,))
        con.commit()
        return jsonify({'mensaje': 'Sesión cerrada correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        con.close()

def verificar_token(token):
    try:
        con = get_connection()
        cur = con.cursor(dictionary=True)
        cur.execute(
            'SELECT * FROM sesiones WHERE token = %s AND expira_en > %s',
            (token, datetime.now())
        )
        sesion = cur.fetchone()
        return sesion
    except:
        return None
    finally:
        cur.close()
        con.close()