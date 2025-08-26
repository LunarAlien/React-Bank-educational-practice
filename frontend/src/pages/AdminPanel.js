import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API || 'http://localhost:5000/api';

export default function AdminPanel() {
  // Сессия / Логин
  const [token, setToken] = useState(() => {
    try {
      const raw = localStorage.getItem('adminSession');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (obj?.token && obj?.expiresAt && Date.now() < obj.expiresAt) {
        return obj.token;
      }
    } catch {}
    return null;
  });
  const [login, setLogin] = useState('');
  const [key, setKey] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, key })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || 'Ошибка авторизации');
        return;
      }
      if (data?.token) {
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('adminSession', JSON.stringify({ token: data.token, expiresAt }));
        setToken(data.token);
      } else {
        alert('Токен не получен от сервера');
      }
    } catch (e) {
      alert('Ошибка сети при авторизации');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    setToken(null);
  };

  // Список / CRUD
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ key: '', name: '', annualRate: 0 });

  const load = () => {
    fetch(`${API}/calculators`)
      .then(r => r.json())
      .then(setList)
      .catch(() => {});
  };

  useEffect(() => { load(); }, [token]); 

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const save = async () => {
    await fetch(`${API}/calculators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        name: form.name,
        systemKey: form.systemKey,
        annualRate: Number(form.annualRate)
      })
    });
    setForm({ systemKey: '', name: '', annualRate: 0 });
    load();

    // Сообщим, что список изменился — хедер перерисуется
    localStorage.setItem('calculators-updated', Date.now().toString());

     window.location.reload();
  };

  const update = async (id, patch) => {
    const res = await fetch(`${API}/calculators/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(patch)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || 'Ошибка обновления');
      return;
    }
    load();
    localStorage.setItem('calculators-updated', Date.now().toString());
  };

  const remove = async (id) => {
    const res = await fetch(`${API}/calculators/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || 'Ошибка удаления');
      return;
    }
    load();
    localStorage.setItem('calculators-updated', Date.now().toString());

    window.location.reload();
  };

  // Вход, если нет токена
  if (!token) {
    return (
      <div className="card" style={{maxWidth: 420, margin: '40px auto'}}>
        <h2 style={{marginTop:0}}>Вход</h2>
        <div className="field">
          <label>Логин:</label>
          <input placeholder="" value={login} onChange={e => setLogin(e.target.value)} />
        </div>
        <div className="field">
          <label>Пароль:</label>
          <input placeholder="" type="password" value={key} onChange={e => setKey(e.target.value)} />
        </div>
        <button className="primary" onClick={handleLogin}>Войти</button>
      </div>
    );
  }

  // Основная админка
  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={{marginTop:0}}>Администрирование калькуляторов</h2>
        <button className="nav-btn" onClick={handleLogout}>Выйти</button>
      </div>

      <div className="grid-2">
        <div>
          <div className="field">
            <label>Тип калькулятора:</label>
            <input
              value={form.systemKey}
              onChange={(e) => setForm({ ...form, systemKey: e.target.value })}
              placeholder="Например: mortgage, auto, consumer, pension или new"
            />
          </div>
          <div className="field">
            <label>Название:</label>
            <input
              value={form.name}
              onChange={(e)=>setForm({...form, name:e.target.value})}
              placeholder="Название калькулятора"
            />
          </div>
          <div className="field">
            <label>Годовая ставка (%):</label>
            <input
              type="number"
              value={form.annualRate}
              onChange={(e)=>setForm({...form, annualRate:Number(e.target.value)})}
            />
          </div>
          <button className="primary" onClick={save}>Создать</button>
        </div>

        <div>
          <h3>Список калькуляторов</h3>
          {list.map(row => (
            <div key={row._id} style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
              <div style={{flex:1}}>
                <b>{row.name}</b> <span style={{color:'#6b7a90'}}>({row.systemKey})</span> — {row.annualRate}%
              </div>
              <button className="nav-btn" onClick={()=>update(row._id, { annualRate: Number(row.annualRate) + 0.1 })}>+0.1%</button>
              <button className="nav-btn" onClick={()=>update(row._id, { annualRate: Math.max(0, Number(row.annualRate) - 0.1) })}>-0.1%</button>
              <button className="nav-btn" onClick={()=>remove(row._id)}>Удалить</button>
            </div>
          ))}
          {list.length === 0 && <p style={{color:'#6b7a90'}}>Пока нет записей…</p>}
        </div>
      </div>
    </div>
  );
}
