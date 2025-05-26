import React, { useState } from 'react';

const AddCategoryForm = ({ onCategoryAdded }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name.trim()) {
        setError('El nombre de la categoría no puede estar vacío.');
        setIsLoading(false);
        return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No estás autenticado.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('¡Categoría agregada!');
        setName('');
        if (onCategoryAdded) {
          onCategoryAdded(data); // Llama a la función para actualizar el dashboard
        }
      } else {
        setError(data.message || 'Error al agregar la categoría.');
      }
    } catch (err) {
      setError('Error de red o el servidor no está disponible.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-category-form">
      <h4>Agregar Nueva Categoría</h4>
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      <div>
        <label htmlFor="categoryName">Nombre:</label>
        <input
          type="text"
          id="categoryName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Agregando...' : 'Agregar Categoría'}
      </button>
    </form>
  );
};

export default AddCategoryForm;


