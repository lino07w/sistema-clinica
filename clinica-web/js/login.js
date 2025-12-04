/**
 * Login - Autenticación de usuarios
 */

const loginBtn = document.getElementById('loginBtn');
const errorElement = document.getElementById('error');

if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('user').value.trim();
    const password = document.getElementById('pass').value;

    // Limpiar mensaje de error
    errorElement.textContent = '';
    errorElement.style.display = 'none';

    if (!username || !password) {
      showError('Por favor complete todos los campos');
      return;
    }

    // Deshabilitar botón mientras se procesa
    loginBtn.disabled = true;
    loginBtn.textContent = 'Ingresando...';

    try {
      console.log('Intentando login con:', username);
      const result = await API.Auth.login(username, password);
      
      console.log('Resultado del login:', result);
      
      if (result.success) {
        showSuccess('¡Login exitoso! Redirigiendo...');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      }
    } catch (error) {
      console.error('Error en login:', error);
      showError(error.message || 'Usuario o contraseña incorrectos');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Ingresar';
    }
  });
}

function showError(message) {
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  errorElement.style.color = '#e74c3c';
}

function showSuccess(message) {
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  errorElement.style.color = '#27ae60';
}