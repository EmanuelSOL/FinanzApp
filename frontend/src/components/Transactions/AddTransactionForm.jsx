import React, { useState } from 'react';

const AddTransactionForm = ({ onTransactionAdded, categories, onClose, initialType = 'expense' }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState(initialType); // Usar initialType
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState(''); // Nuevo estado para notas
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No estás autenticado.');
      setIsLoading(false);
      return;
    }

    const transactionData = {
      amount: parseFloat(amount),
      type,
      date,
      description: description, // Descripción principal
      ...(categoryId && { categoryId: parseInt(categoryId, 10) }),
    };

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });

      const data = await response.json();

      if (response.ok) {
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setNotes('');
        setCategoryId('');
        if (onTransactionAdded) {
          onTransactionAdded(data);
        }
      } else {
        setError(data.message || 'Error al agregar la transacción.');
      }
    } catch (err) {
      setError('Error de red o el servidor no está disponible.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{type === 'expense' ? 'Agregar Nuevo Gasto' : 'Agregar Nuevo Ingreso'}</h3>
          <button onClick={onClose} className="modal-close-button" aria-label="Cerrar">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="add-transaction-form">
          {error && <p className="error-message" style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</p>}

          {/* Selector de Tipo de Transacción */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setType('expense')}
                style={{ flex: 1, padding: '10px', border: `2px solid ${type === 'expense' ? '#5A5898' : '#CBD5E0'}`, borderRadius: '6px', backgroundColor: type === 'expense' ? '#EAE7F8' : 'transparent', color: type === 'expense' ? '#3B3A5F' : '#4A5568', fontWeight: type === 'expense' ? '600' : 'normal' }}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                style={{ flex: 1, padding: '10px', border: `2px solid ${type === 'income' ? '#5A5898' : '#CBD5E0'}`, borderRadius: '6px', backgroundColor: type === 'income' ? '#EAE7F8' : 'transparent', color: type === 'income' ? '#3B3A5F' : '#4A5568', fontWeight: type === 'income' ? '600' : 'normal' }}
              >
                Ingreso
              </button>
            </div>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="description">Descripción:</label>
              <input
                type="text"
                id="description"
                placeholder="Ej. Compras en supermercado"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Monto:</label>
              <div className="input-group-amount">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={isLoading}
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Categoría:</label>
              <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={isLoading}>
                <option value="">Seleccionar categoría</option>
                {categories && categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Fecha:</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notas (opcional):</label>
              <textarea
                id="notes"
                placeholder="Agregar notas adicionales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (type === 'expense' ? 'Guardar Gasto' : 'Guardar Ingreso')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionForm;


