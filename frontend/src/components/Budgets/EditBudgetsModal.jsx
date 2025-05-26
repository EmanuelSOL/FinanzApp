import React, { useState, useEffect } from 'react';

const EditBudgetsModal = ({ isOpen, onClose, categories, existingBudgets, onSave, currentMonth, currentYear }) => {
  const [budgetsData, setBudgetsData] = useState({}); 
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMonth(currentMonth);
      setYear(currentYear);
      const initialBudgets = {};
      categories.forEach(cat => {
        const existing = existingBudgets.find(b => b.category.id === cat.id && b.month === month && b.year === year);
        initialBudgets[cat.id] = existing ? existing.amount : '';
      });
      setBudgetsData(initialBudgets);
    }
  }, [isOpen, categories, existingBudgets, currentMonth, currentYear, month, year]);


  const handleAmountChange = (categoryId, amount) => {
    setBudgetsData(prev => ({
      ...prev,
      [categoryId]: amount === '' ? '' : parseFloat(amount) || 0,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No autenticado');
      setIsLoading(false);
      return;
    }

    const budgetsToSave = Object.entries(budgetsData)
      .filter(([_, amount]) => amount !== '' && !isNaN(parseFloat(amount)))
      .map(([categoryId, amount]) => ({
        categoryId: parseInt(categoryId),
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
      }));

    try {

      
      for (const budgetDto of budgetsToSave) {
        const response = await fetch('/api/budgets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(budgetDto),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || `Error guardando presupuesto para categoría ID ${budgetDto.categoryId}`);
        }
      }
      
      onSave();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const yearOptions = [];
  const currentActualYear = new Date().getFullYear();
  for (let y = currentActualYear - 2; y <= currentActualYear + 5; y++) {
    yearOptions.push(y);
  }
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];


  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{maxWidth: '600px'}}> {/* Un poco más ancho para la lista */}
        <div className="modal-header">
          <h3>Editar Presupuestos para {monthNames[month-1]} {year}</h3>
          <button onClick={onClose} className="modal-close-button" aria-label="Cerrar">&times;</button>
        </div>
        {error && <p className="error-message">{error}</p>}
        
        <div style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
            <div className="form-group" style={{flex: 1}}>
                <label htmlFor="budgetMonth">Mes:</label>
                <select id="budgetMonth" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} disabled={isLoading}>
                    {monthNames.map((name, index) => (
                        <option key={index + 1} value={index + 1}>{name}</option>
                    ))}
                </select>
            </div>
            <div className="form-group" style={{flex: 1}}>
                <label htmlFor="budgetYear">Año:</label>
                <select id="budgetYear" value={year} onChange={(e) => setYear(parseInt(e.target.value))} disabled={isLoading}>
                    {yearOptions.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="budget-edit-list" style={{maxHeight: '300px', overflowY: 'auto', marginBottom: '20px'}}>
          {categories.map(category => (
            <div key={category.id} className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor={`budget-${category.id}`} style={{ flexBasis: '150px', flexShrink: 0, marginBottom: 0 }}>{category.name}:</label>
              <div className="input-group-amount" style={{flexGrow: 1}}>
                <span className="currency-symbol" style={{left: '10px'}}>$</span>
                <input
                  type="number"
                  id={`budget-${category.id}`}
                  placeholder="0.00"
                  value={budgetsData[category.id] || ''}
                  onChange={(e) => handleAmountChange(category.id, e.target.value)}
                  disabled={isLoading}
                  step="0.01"
                  style={{paddingLeft: '25px'}}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-cancel" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="button" className="btn btn-submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Presupuestos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBudgetsModal;

