import React, { useEffect, useState } from 'react';
import MortgageCalculator from './pages/MortgageCalculator';
import AutoLoanCalculator from './pages/AutoLoanCalculator';
import ConsumerLoanCalculator from './pages/ConsumerLoanCalculator';
import PensionCalculator from './pages/PensionCalculator';
import DynamicCalculator from './pages/DynamicCalculator';
import AdminPanel from './pages/AdminPanel';

const API = process.env.REACT_APP_API || 'http://localhost:5000/api';

export default function App() {
  const [tab, setTab] = useState(null);
  const [calculators, setCalculators] = useState([]);

  useEffect(() => {
    fetch(`${API}/calculators`)
      .then(r => r.json())
      .then(data => {
        setCalculators(data);
        if (data.length > 0 && !tab) setTab(data[0].key);
      })
      .catch(() => {});
  }, []);

  const renderCalculator = (calc) => {
    switch (calc.systemKey) {
      case 'mortgage':
        return <MortgageCalculator title={calc.name} annualRate={calc.annualRate} />;
      case 'auto':
        return <AutoLoanCalculator title={calc.name} annualRate={calc.annualRate} />;
      case 'consumer':
        return <ConsumerLoanCalculator title={calc.name} annualRate={calc.annualRate} />;
      case 'pension':
        return <PensionCalculator title={calc.name} annualRate={calc.annualRate} />;
      default:
        return <DynamicCalculator calculator={calc} />;
    }
  };

  return (
    <div>
      <header className="header">
        <div className="header-inner container">
          <div className="brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            React-Bank
          </div>
          <nav>
            {calculators.map(calc => (
              <button
                key={calc.key}
                className={tab === calc.key ? 'nav-btn active' : 'nav-btn'}
                onClick={() => setTab(calc.key)}
              >
                {calc.name}
              </button>
            ))}
            <button
              className={tab === 'admin' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setTab('admin')}
            >
              Админ. вход
            </button>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        {tab === 'admin'
          ? <AdminPanel />
          : calculators.find(c => c.key === tab) && renderCalculator(calculators.find(c => c.key === tab))}
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} React-Bank — Демо онлайн-калькуляторов
      </footer>
    </div>
  );
}
