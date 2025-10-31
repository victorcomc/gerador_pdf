// frontend/src/pages/LoginPage.jsx (CORRIGIDO)

import React, { useState } from 'react'; // <--- CORRIGIDO DE [useState] PARA {useState}
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../assets/logo.png';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // IMPORTANTE: Coloque a URL do seu backend do Render aqui
  const API_URL = "https://gerador-excel-exportacao.onrender.com"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        username: username,
        password: password
      });

      const token = response.data.access_token;
      localStorage.setItem('accessToken', token);
      navigate('/'); // Redireciona para a página principal
      
    } catch (err) {
      setError('Usuário ou senha inválidos.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <img src={logo} alt="Logo" className="login-logo" />
        <h2>Draft Login</h2>
        
        <div className="form-group">
          <label htmlFor="username">Usuário</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;