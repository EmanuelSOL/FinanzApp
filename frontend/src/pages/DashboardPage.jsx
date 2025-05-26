import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './DashboardPage.css';
import AddTransactionForm from '../components/Transactions/AddTransactionForm';
import AddCategoryForm from '../components/Categories/AddCategoryForm';
import MonthlyBudgetCard from '../components/Budgets/MonthlyBudgets';
import EditBudgetsModal from '../components/Budgets/EditBudgetsModal';
import ExpenseDoughnutChart from '../components/Charts/ExpenseDoughnutChart';

// Iconos
const AppLogoIcon = () => <div className="icon-placeholder app-logo-icon">📈</div>;
const UserProfileIcon = () => <div className="icon-placeholder user-profile-icon">👤</div>;
const DashboardIcon = () => <div className="icon-placeholder">📊</div>;
const TransactionsIcon = () => <div className="icon-placeholder">🔄</div>;
const CategoriesIconSideNav = () => <div className="icon-placeholder">🔖</div>;
const LogoutIconTopBar = () => <div className="icon-placeholder">🚪</div>;
const PlusIcon = () => <div className="icon-placeholder plus-icon">➕</div>;
const ExpenseIcon = () => <span className="transaction-icon expense">-</span>;
const IncomeIcon = () => <span className="transaction-icon income">+</span>;

const TopBar = ({ userName, onLogout }) => (
  <header className="top-bar">
    <div className="top-bar-logo-section">
      <AppLogoIcon />
      <h1>FinanzApp</h1>
    </div>
    <div className="top-bar-user-section">
      <div className="user-info">
        <UserProfileIcon />
        <span>{userName || 'Cargando...'}</span>
      </div>
      <button className="logout-button-topbar" onClick={onLogout}>
        <LogoutIconTopBar />
        Cerrar
      </button>
    </div>
  </header>
);

const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-app-identity">
      <div className="sidebar-app-icon"></div>
    </div>
    <nav className="sidebar-nav">
      <ul>
        <li className="active"><DashboardIcon /> Dashboard</li>
      </ul>
    </nav>
  </aside>
);

const DashboardPage = () => {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [balanceTotal, setBalanceTotal] = useState(0);
  const [ingresosMes, setIngresosMes] = useState(0);
  const [gastosMes, setGastosMes] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState('expense');
  
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);

  const [budgetsData, setBudgetsData] = useState([]);
  const [showEditBudgetsModal, setShowEditBudgetsModal] = useState(false);
  const [currentBudgetMonth, setCurrentBudgetMonth] = useState(new Date().getMonth() + 1);
  const [currentBudgetYear, setCurrentBudgetYear] = useState(new Date().getFullYear());

  const [expensesByCategoryChartData, setExpensesByCategoryChartData] = useState(null);
  const [currentChartPeriod, setCurrentChartPeriod] = useState('Este Mes');

  const fetchDataWithAuth = useCallback(async (url, setter, errorMessage) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return null;
    }
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login');
          throw new Error('Sesión expirada o no autorizado.');
        }
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || errorMessage || `Error ${response.status}`);
      }
      const data = await response.json();
      if (setter) setter(data);
      return data;
    } catch (err) {
      console.error(`Error en fetchDataWithAuth para ${url}:`, err);
      setError(err.message); // Considera mostrar este error de forma más visible si es específico del gráfico
      return null;
    }
  }, [navigate]);

  const loadDashboardData = useCallback(async (month = currentBudgetMonth, year = currentBudgetYear, chartPeriod = currentChartPeriod) => {
    setIsDataLoading(true);
    setError(''); // Limpia errores anteriores al recargar
    
    const profileData = userName 
      ? { username: userName } 
      : await fetchDataWithAuth('/api/auth/profile', (data) => setUserName(data.username || data.email), 'Error al cargar perfil');
      
    if (!profileData && !userName) {
      setIsLoading(false);
      setIsDataLoading(false);
      return;
    }

    await fetchDataWithAuth('/api/categories', setUserCategories, 'Error al cargar categorías');
    
    const fetchExpensesByCategory = async (period) => {
      // Llama al endpoint real del backend
      const data = await fetchDataWithAuth(
        `/api/dashboard/expenses-by-category?period=${encodeURIComponent(period)}`,
        null, // No usamos setter aquí, procesamos directamente
        'Error al cargar gastos por categoría para el gráfico'
      );

      if (data && data.length > 0) {
        const predefinedColors = [
          '#43A047', '#FFB300', '#E53935', '#1E88E5', 
          '#8E44AD', '#78909C', '#D81B60', '#00ACC1',
          '#FDD835', '#FB8C00', '#5E35B1', '#3949AB'
        ];

        const labels = data.map(item => item.categoryName || 'Sin Categoría');
        const amounts = data.map(item => item.totalSpent);
        const backgroundColors = data.map((item, index) => 
          item.categoryColor || predefinedColors[index % predefinedColors.length]
        );
        // Asegurarse de que borderColor sea un array incluso si backgroundColor no lo es (aunque debería serlo)
        const borderColors = Array.isArray(backgroundColors) 
            ? backgroundColors.map(color => typeof color === 'string' ? color.replace(/,( 0\.?\d+)\)/, ', 1)') : 'rgba(0,0,0,0.1)')
            : ['rgba(0,0,0,0.1)'];


        setExpensesByCategoryChartData({
          labels: labels,
          datasets: [{
            label: 'Gastos por Categoría',
            data: amounts,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          }]
        });
      } else {
        // Si no hay datos, configura para que el gráfico muestre "sin datos"
        setExpensesByCategoryChartData({
            labels: [],
            datasets: [{
                label: 'Gastos por Categoría',
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1,
            }]
        });
      }
    };

    await Promise.all([
      fetchDataWithAuth('/api/dashboard/summary', (data) => {
        setBalanceTotal(data.balanceTotal || 0);
        setIngresosMes(data.ingresosMes || 0);
        setGastosMes(data.gastosMes || 0);
      }, 'Error al cargar resumen financiero'),
      fetchDataWithAuth('/api/transactions/recent?limit=5', setRecentTransactions, 'Error al cargar transacciones recientes'),
      fetchDataWithAuth(`/api/budgets?month=${month}&year=${year}`, setBudgetsData, 'Error al cargar presupuestos'),
      fetchExpensesByCategory(chartPeriod)
    ]);
    setIsLoading(false); 
    setIsDataLoading(false);
  }, [fetchDataWithAuth, userName, currentBudgetMonth, currentBudgetYear, currentChartPeriod]); // Se mantiene currentChartPeriod aquí

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    loadDashboardData(currentBudgetMonth, currentBudgetYear, currentChartPeriod);
  }, [loadDashboardData, navigate, currentBudgetMonth, currentBudgetYear, currentChartPeriod]);


  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const handleTransactionAdded = () => {
    loadDashboardData(currentBudgetMonth, currentBudgetYear, currentChartPeriod); 
    setShowAddTransactionModal(false);
  };

  const handleCategoryAdded = () => {
    fetchDataWithAuth('/api/categories', setUserCategories, 'Error al cargar categorías');
    // Opcionalmente, recargar todo el dashboard si una nueva categoría podría afectar los gastos por categoría
    loadDashboardData(currentBudgetMonth, currentBudgetYear, currentChartPeriod);
    setShowAddCategoryForm(false);
  };

  const handleBudgetsSaved = () => {
    loadDashboardData(currentBudgetMonth, currentBudgetYear, currentChartPeriod); 
    setShowEditBudgetsModal(false);
  };

  const openTransactionModal = (type) => {
    setTransactionModalType(type);
    setShowAddTransactionModal(true);
  };
  
  const handleBudgetMonthYearChange = (newMonth, newYear) => {
    setCurrentBudgetMonth(newMonth);
    setCurrentBudgetYear(newYear);
    // loadDashboardData se llamará por el useEffect que depende de estos estados
  };
  
  const handleChartPeriodChange = (event) => {
    const newPeriod = event.target.value;
    setCurrentChartPeriod(newPeriod);
    // loadDashboardData se llamará por el useEffect que depende de currentChartPeriod
  };

  if (isLoading && !userName) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando Dashboard...</div>;
  }

  if (error && !userName) { // Muestra error principal si no se pudo cargar el perfil
    return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Error: {error} <br /> <button onClick={() => { setError(''); navigate('/login'); }}>Ir a Login</button></div>;
  }

  return (
    <div className="app-container">
      <TopBar userName={userName} onLogout={handleLogout} />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <header className="main-content-header">
            <div className="title-section">
              <h2>Dashboard Financiero</h2>
              <p className="subtitle">
                {userName ? `Bienvenido ${userName}, controla tus finanzas personales` : 'Controla tus finanzas personales'}
              </p>
            </div>
            <div className="actions-section">
              <button
                className="action-button primary-action"
                onClick={() => openTransactionModal('expense')}
              >
                <PlusIcon /> Agregar Gasto
              </button>
              <button
                className="action-button"
                style={{backgroundColor: '#38A169', color: 'white'}}
                onClick={() => openTransactionModal('income')}
              >
                <PlusIcon /> Agregar Ingreso
              </button>
              <button
                className="action-button secondary-action"
                onClick={() => setShowAddCategoryForm(prev => !prev)}
              >
                <PlusIcon /> {showAddCategoryForm ? 'Ocultar Form. Categoría' : 'Nueva Categoría'}
              </button>
            </div>
          </header>

          {/* Muestra errores generales del dashboard si ya se cargó el perfil */}
          {error && userName && <p className="error-message" style={{textAlign: 'center'}}>{error}</p>}

          {showAddCategoryForm && (
            <section className="add-category-section card">
              <AddCategoryForm onCategoryAdded={handleCategoryAdded} />
            </section>
          )}

          {showAddTransactionModal && (
            <AddTransactionForm
              onTransactionAdded={handleTransactionAdded}
              categories={userCategories}
              onClose={() => setShowAddTransactionModal(false)}
              initialType={transactionModalType}
            />
          )}

          {showEditBudgetsModal && (
            <EditBudgetsModal
              isOpen={showEditBudgetsModal}
              onClose={() => setShowEditBudgetsModal(false)}
              categories={userCategories}
              existingBudgets={budgetsData || []}
              onSave={handleBudgetsSaved}
              currentMonth={currentBudgetMonth}
              currentYear={currentBudgetYear}
              onMonthYearChange={handleBudgetMonthYearChange}
            />
          )}

          <section className="summary-cards-grid">
            <div className="card summary-card">
              <h4>Balance Total</h4>
              <p className="summary-amount">${balanceTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="card summary-card">
              <h4>Gastos del Mes</h4>
              <p className="summary-amount">${gastosMes.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="card summary-card">
              <h4>Ingresos del Mes</h4>
              <p className="summary-amount">${ingresosMes.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
             <div className="card summary-card">
              <h4>Ahorro del Mes</h4>
              <p className="summary-amount">${(ingresosMes - gastosMes).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </section>

          <div className="dashboard-columns">
            <div className="column">
                <div className="card transactions-card">
                  <div className="transactions-card-header">
                    <h4>Transacciones Recientes</h4>
                    <Link to="/transactions" className="view-all-link">Ver todas</Link>
                  </div>
                  {isDataLoading && recentTransactions.length === 0 && <p>Cargando transacciones...</p>}
                  {!isDataLoading && recentTransactions.length === 0 && <p>No hay transacciones recientes.</p>}
                  {recentTransactions.length > 0 && (
                    <ul className="transaction-list">
                      {recentTransactions.map(t => (
                        <li key={t.id} className="transaction-item">
                          {t.type === 'expense' ? <ExpenseIcon /> : <IncomeIcon />}
                          <div className="transaction-details">
                            <div className="description">{t.description}</div>
                          </div>
                          <span className="transaction-category">{t.category ? t.category.name : 'Sin categoría'}</span>
                          <span className="transaction-date">{new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                          <span className={`transaction-amount ${t.type}`}>
                            {t.type === 'expense' ? '-' : '+'}${t.amount.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                          </span>
                           <span className="transaction-status-badge">Completado</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
            </div>

            <div className="column">
               <MonthlyBudgetCard
                budgets={budgetsData || []}
                onEditBudgets={() => setShowEditBudgetsModal(true)}
                currentMonth={currentBudgetMonth}
                currentYear={currentBudgetYear}
                isLoading={isDataLoading}
              />
                            
              <div className="card chart-card">
                <div className="chart-header">
                  <h4>Gastos por Categoría</h4>
                  <select value={currentChartPeriod} onChange={handleChartPeriodChange}>
                    <option value="Este Mes">Este Mes</option>
                    <option value="Mes Anterior">Mes Anterior</option>
                    <option value="Este Año">Este Año</option>
                    {/* Podrías añadir más opciones y lógica para cambiar el período */}
                  </select>
                </div>
                {isDataLoading && !expensesByCategoryChartData ? ( // Muestra cargando si está cargando datos Y no hay datos de gráfico aún
                  <div className="chart-placeholder doughnut-chart-placeholder">
                    <p>Cargando gráfica...</p>
                  </div>
                ) : expensesByCategoryChartData && expensesByCategoryChartData.datasets && expensesByCategoryChartData.datasets[0].data.length > 0 ? (
                  <ExpenseDoughnutChart chartData={expensesByCategoryChartData} />
                ) : (
                  <div className="chart-placeholder doughnut-chart-placeholder">
                    <p>No hay datos de gastos para mostrar para "{currentChartPeriod}".</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;

