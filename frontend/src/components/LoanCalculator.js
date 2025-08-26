import React, { useMemo, useState } from 'react';

function computeLoan(amount, years, annualRate) {
  const monthlyRate = (annualRate / 12) / 100;
  const months = years * 12;
  const totalFactor = Math.pow(1 + monthlyRate, months);
  const monthlyPayment = (amount * monthlyRate * totalFactor) / (totalFactor - 1);
  const totalPayment = monthlyPayment * months;
  const requiredIncome = monthlyPayment * 2.5;
  return {
    monthlyRate,
    months,
    totalFactor,
    monthlyPayment,
    totalPayment,
    requiredIncome
  };
}

export default function LoanCalculator({ title, annualRate, includeDownPayment=true }) {
  const [price, setPrice] = useState(2000000);
  const [down, setDown] = useState(500000);
  const [years, setYears] = useState(20);

  const principal = useMemo(() => {
    return includeDownPayment ? Math.max(0, price - down) : price;
  }, [price, down, includeDownPayment]);

  const res = useMemo(() => computeLoan(principal, years, annualRate), [principal, years, annualRate]);

  return (
    <div className="card">
      <h2 style={{marginTop:0}}>{title}</h2>
      <div className="grid-2">
        <div>
          <div className="field">
            <label>Стоимость (руб)</label>
            <input type="number" value={price} onChange={(e)=>setPrice(Number(e.target.value))} />
          </div>
          {includeDownPayment && (
            <div className="field">
              <label>Первоначальный взнос (руб)</label>
              <input type="number" value={down} onChange={(e)=>setDown(Number(e.target.value))} />
            </div>
          )}
          <div className="grid-2">
            <div className="field">
              <label>Срок (лет)</label>
              <input type="number" value={years} onChange={(e)=>setYears(Number(e.target.value))} />
            </div>
            <div className="field">
              <label>Годовая ставка (%)</label>
              <input type="number" value={annualRate} readOnly />
            </div>
          </div>
        </div>
        <div>
          <div className="result">Ежемесячный платёж: {res.monthlyPayment ? Math.round(res.monthlyPayment).toLocaleString('ru-RU') : 0} ₽</div>
          <p>Сумма кредита: <b>{principal.toLocaleString('ru-RU')}</b> ₽</p>
          <p>Всего к оплате за срок: <b>{Math.round(res.totalPayment).toLocaleString('ru-RU')}</b> ₽</p>
          <p>Необходимый доход: <b>{Math.round(res.requiredIncome).toLocaleString('ru-RU')}</b> ₽</p>
          <hr />
          <p>Ежемесячная ставка = {annualRate} / 12 / 100 = <b>{res.monthlyRate.toFixed(3)}</b></p>
          <p>Общая ставка = (1 + {res.monthlyRate.toFixed(3)}) ^ ({years} * 12) = <b>{res.totalFactor.toFixed(2)}</b></p>
          <p>Формула: Платёж = Сумма * Ежемесячная * Общая / (Общая - 1)</p>
        </div>
      </div>
    </div>
  );
}
