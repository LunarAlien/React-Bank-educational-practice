import React from 'react';
import LoanCalculator from '../components/LoanCalculator';

export default function AutoLoanCalculator({ title = "Автокредитный калькулятор", annualRate }) {
  return (
    <LoanCalculator
      title={title}
      annualRate={annualRate}
      includeDownPayment={false}
    />
  );
}
