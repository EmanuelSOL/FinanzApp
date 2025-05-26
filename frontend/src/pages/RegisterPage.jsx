import React from 'react';
import Register from '../components/Auth/Register'; // Tu componente de formulario
import { Link } from 'react-router-dom'; // Para el enlace a Login
import './RegisterPage.css'; // Importa los nuevos estilos

const RegisterPage = () => {
  const handleRegisterSuccess = (userData) => {
    console.log('Registration successful!', userData);
    // Aquí podrías redirigir al usuario o mostrar un mensaje de éxito
    // Por ejemplo: navigate('/login');
    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
  };

  return (
    <div className="register-page-container">
      <div className="register-form-card">
        <h1>Crear Cuenta</h1>
        <Register onRegisterSuccess={handleRegisterSuccess} />
        <div className="login-link-container">
          <p>
            ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

