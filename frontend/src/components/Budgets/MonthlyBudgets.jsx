import React from 'react';

const EditIcon = () => <span className="icon-placeholder">✏️</span>;

const MonthlyBudgetCard = ({ budgets, onEditBudgets, currentMonth, currentYear }) => {
  const formatCurrency = (value) => {
    return `$${(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getProgressBarColor = (spent, total) => {
    if (total === 0) return '#E2E8F0'; // Gris si no hay presupuesto
    const percentage = (spent / total) * 100;
    if (percentage > 100) return '#E53E3E'; // Rojo si se excede
    if (percentage > 75) return '#F6E05E'; // Amarillo si está cerca del límite
    return '#4299E1'; 
  };
  

  return (
    <div className="card budget-section">
      <div className="budget-section-header">
        <h4>Presupuesto Mensual ({new Date(currentYear, currentMonth - 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' })})</h4>
        <button onClick={onEditBudgets} className="edit-budget-button">
          <EditIcon /> Editar Presupuesto
        </button>
      </div>
      {budgets && budgets.length > 0 ? (
        <div className="budget-list">
          {budgets.map((budget) => {
            const spent = budget.spentAmount || 0;
            const total = budget.amount || 0;
            const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
            const barColor = getProgressBarColor(spent, total);


            return (
              <div key={budget.category.id} className="budget-item">
                <div className="budget-item-info">
                  <span className="category-name">{budget.category.name}</span>
                  <span className="budget-amounts">
                    {formatCurrency(spent)} / {formatCurrency(total)}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%`, backgroundColor: barColor }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No hay presupuestos definidos para este mes. Haz clic en "Editar Presupuesto" para comenzar.</p>
      )}
    </div>
  );
};

export default MonthlyBudgetCard;