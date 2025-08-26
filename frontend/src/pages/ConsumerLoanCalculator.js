import React from 'react';
import LoanCalculator from '../components/LoanCalculator';

export default function ConsumerLoanCalculator({ title = "Потребительский кредит", annualRate }) {
  return (
    <LoanCalculator
      title={title}
      annualRate={annualRate}
      includeDownPayment={false}
    />
  );
}
