async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const mensaje = document.getElementById('mensaje');

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            mensaje.className = 'mensaje exito';
            mensaje.textContent = '¡Bienvenido ' + data.usuario.nombre + '!';
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            setTimeout(() => window.location.href = '/inicio', 1000);
        } else {
            mensaje.className = 'mensaje error';
            mensaje.textContent = data.error;
        }
    } catch (e) {
        mensaje.className = 'mensaje error';
        mensaje.textContent = 'Error conectando con el servidor';
    }
}