import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      
      if (user.roleId !== 1 && user.roleId !== '1') {
        throw new Error('Unauthorized: Admin access only');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/admin');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      // If the backend didn't catch the HTML block but passed it through
      if (typeof msg === 'string' && (msg.includes('<!DOCTYPE') || msg.includes('aiowps-unlock') || msg.includes('blocked for security reasons'))) {
        setError('err_security_block_bot');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md z-10">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-xl shadow-primary/5">
          <div className="text-center mb-8">
            <h1 className="font-h1 text-h1 text-primary mb-2">Pet-Atlas</h1>
            <p className="font-body-sm text-body-sm text-outline">Clinical Administration Console</p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6 text-sm flex flex-col gap-3 animate-shake">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error">error</span>
                <span className="flex-1">
                  {error === 'err_security_block_bot' 
                    ? 'Security Verification Required: Please verify you are human on our main site.' 
                    : error}
                </span>
              </div>
              {error === 'err_security_block_bot' && (
                <a 
                  href="https://pet-atlas.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg text-center font-bold hover:bg-primary-container transition-colors"
                >
                  Solve Challenge & Retry
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface">Username</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-background"
                  placeholder="admin_user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-background"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-md text-label-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-container hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant text-center">
            <p className="text-xs text-outline">
              Authorized access only. All activity is logged and monitored.
              <br />© 2026 Pet-Atlas Medical Intelligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
