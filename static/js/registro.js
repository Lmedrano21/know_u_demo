async function registro() {
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    const mensaje = document.getElementById('mensaje');

    if (!nombre || !email || !password) {
        mensaje.className = 'mensaje error';
        mensaje.textContent = 'Por favor llena todos los campos obligatorios';
        return;
    }

    if (password !== password2) {
        mensaje.className = 'mensaje error';
        mensaje.textContent = 'Las contraseñas no coinciden';
        return;
    }

    try {
        const res = await fetch('/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password, telefono })
        });
        const data = await res.json();

        if (res.ok) {
            mensaje.className = 'mensaje exito';
            mensaje.textContent = '¡Cuenta creada! Redirigiendo...';
            setTimeout(() => window.location.href = '/login', 2000);
        } else {
            mensaje.className = 'mensaje error';
            mensaje.textContent = data.error;
        }
    } catch (e) {
        mensaje.className = 'mensaje error';
        mensaje.textContent = 'Error conectando con el servidor';
    }
}