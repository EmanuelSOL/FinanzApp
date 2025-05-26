import React from 'react';
import Login from '../components/Auth/Login'; // Tu componente de formulario de Login
import { Link } from 'react-router-dom';     // Para el enlace a Register
import './LoginPage.css';                   // Importa los nuevos estilos

const LoginPage = () => {


  const handleLoginSuccess = (userData) => {
    console.log('Login successful!', userData);

    alert('Inicio de sesión exitoso!');
  };

  return (
    <div className="login-page-container">
      <div className="login-form-card">
        <h1>Iniciar Sesión</h1>
        <Login onLoginSuccess={handleLoginSuccess} />
        <div className="register-link-container">
          <p>
            ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;