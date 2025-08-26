import React, { useMemo, useState } from 'react';

function computePension(monthlyContribution, years, annualRate, initial) {
  const r = (annualRate / 12) / 100;
  const n = years * 12;
  const fvContrib = monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);
  const fvInitial = initial * Math.pow(1 + r, n);
  const total = fvContrib + fvInitial;
  return { monthlyRate: r, months: n, futureValue: total };
}

export default function PensionCalculator ({ title = "Пенсионные накопления", annualRate }) {
  const [monthly, setMonthly] = useState(15000);
  const [years, setYears] = useState(20);
  const [initial, setInitial] = useState(0);

  const res = useMemo(() => computePension(monthly, years, annualRate, initial), [monthly, years, annualRate, initial]);

  return (
    <div className="card">
      <h2 style={{marginTop:0}}>{title}</h2>
      <div className="grid-2">
        <div>
          <div className="field">
            <label>Ежемесячный взнос (руб)</label>
            <input type="number" value={monthly} onChange={(e)=>setMonthly(Number(e.target.value))} />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Срок (лет)</label>
              <input type="number" value={years} onChange={(e)=>setYears(Number(e.target.value))} />
            </div>
            <div className="field">
              <label>Годовая ставка доходности (%)</label>
              <input type="number" value={annualRate} readOnly />
            </div>
          </div>
          <div className="field">
            <label>Начальный капитал (руб)</label>
            <input type="number" value={initial} onChange={(e)=>setInitial(Number(e.target.value))} />
          </div>
        </div>
        <div>
          <div className="result">Будущая стоимость: {Math.round(res.futureValue).toLocaleString('ru-RU')} ₽</div>
          <p>Ежемесячная ставка = {annualRate} / 12 / 100 = <b>{res.monthlyRate.toFixed(3)}</b></p>
          <p>Количество месяцев: <b>{res.months}</b></p>
          <p>Формула: FV = Взнос × ( (1+r)^n − 1 ) / r + Начальный×(1+r)^n</p>
        </div>
      </div>
    </div>
  );
}
