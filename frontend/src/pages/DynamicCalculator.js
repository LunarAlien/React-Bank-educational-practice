import React, { useState, useEffect } from 'react';
import MortgageCalculator from './MortgageCalculator';
import AutoLoanCalculator from './AutoLoanCalculator';
import ConsumerLoanCalculator from './ConsumerLoanCalculator';
import PensionCalculator from './PensionCalculator';
import LoanCalculator from '../components/LoanCalculator';

const API = process.env.REACT_APP_API || 'http://localhost:5000/api';

export default function DynamicCalculator({ calculator }) {
  if (!calculator) return <div>Загрузка...</div>;

  switch (calculator.systemKey) {
    case 'mortgage':
      return <MortgageCalculator calculator={calculator} />;
    case 'auto':
      return <AutoLoanCalculator calculator={calculator} />;
    case 'consumer':
      return <ConsumerLoanCalculator calculator={calculator} />;
    case 'pension':
      return <PensionCalculator calculator={calculator} />;
    default:
      // если прилетает новый systemKey
      return (
        <LoanCalculator
          title={calculator.name}
          annualRate={Number(calculator.annualRate)}
          includeDownPayment={true}
        />
      );
  }
}
