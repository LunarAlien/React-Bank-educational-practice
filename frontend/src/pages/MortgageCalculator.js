import React from 'react';
import LoanCalculator from '../components/LoanCalculator';

export default function MortgageCalculator({ title = "Ипотечный калькулятор", annualRate }) {
  return (
    <LoanCalculator
      title={title}
      annualRate={annualRate}
      includeDownPayment={false}
    />
  );
}
