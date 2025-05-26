// frontend/src/components/Charts/ExpenseDoughnutChart.jsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseDoughnutChart = ({ chartData }) => {

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, 
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(context.parsed);
            }
            return label;
          }
        }
      }
    },
    cutout: '70%', 
  };

  if (!chartData || !chartData.datasets || chartData.datasets[0].data.length === 0) {
    return <p style={{ textAlign: 'center', color: '#718096' }}>No hay datos de gastos para mostrar en la gráfica.</p>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '250px' /* Ajusta según necesites */ }}>
      <div style={{ position: 'relative', height: '100%', width: '60%' }}> {/* Ajusta el ancho */}
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="custom-legend" style={{ width: '40%' }}> {/* Ajusta el ancho */}
        {chartData.labels.map((label, index) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              backgroundColor: chartData.datasets[0].backgroundColor[index],
              borderRadius: '50%',
              marginRight: '8px'
            }}></span>
            <span style={{ flexGrow: 1, fontSize: '0.9em', color: '#4A5568' }}>{label}</span>
            <span style={{ fontSize: '0.9em', fontWeight: '500', color: '#2D3748' }}>
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(chartData.datasets[0].data[index])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseDoughnutChart;

