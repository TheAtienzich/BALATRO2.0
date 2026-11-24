// Inicio de sesión: valida las credenciales contra la API y entra al menú.
// El destino es el "action" del formulario (src/pages/menu.html), así que la
// navegación sigue funcionando aunque la API no esté disponible (modo local).

const form = document.querySelector('#login-form');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    let res = null;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (err) {
      // Sin servidor: se entra al menú igualmente
      console.warn('API no disponible, entrando al menú sin validar:', err);
    }

    // Solo se bloquea el acceso si el servidor rechaza las credenciales
    if (res && res.status === 401) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Email o contraseña incorrectos');
      return;
    }

    if (res && res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.token) localStorage.setItem('token', data.token);
    } else if (res) {
      console.warn('Login no disponible (' + res.status + '), entrando al menú sin validar');
    }

    window.location.href = form.action;
  });
}
