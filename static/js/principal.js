// Verificar que hay sesión activa
const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

if (!token || !usuario) {
    window.location.href = '/login';
}

// Mostrar datos del usuario
document.getElementById('nombre').textContent = '¡Bienvenido, ' + usuario.nombre + '!';
document.getElementById('email').textContent = ' ' + usuario.email;
document.getElementById('avatar').textContent = usuario.nombre.charAt(0).toUpperCase();

// Cerrar sesión
async function cerrarSesion() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });
    } catch (e) { }
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
}