import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Store } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const roleId = user?.roleId ?? user?.role_id;
      if (roleId === 1 || roleId === 3) {
        navigate('/overview');
      } else {
        console.warn('Access denied, roleId=', roleId);
        navigate('/unauthorized');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid credentials. Clinic portal is restricted.');
      } else {
        setError('Authentication server unreachable. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0F1E23]">
      <main className="w-full max-w-[480px]">
        <div className="bg-[#14252c] border border-white/5 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Header Section */}
          <div className="p-8 border-b border-white/5 text-center bg-[#1a313b]">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#008B8B] flex items-center justify-center shadow-lg shadow-[#008B8B]/20">
                <Store className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Clinic Atlas</h1>
            <p className="text-sm text-[#9ab0c0]">Clinic & Shop Partner Portal</p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {/* Encryption active message */}
            <div className="flex items-center justify-center gap-2 mb-6 py-2.5 px-4 bg-[#008B8B]/10 rounded-xl border border-[#008B8B]/20 text-[#008B8B]">
              <Lock size={12} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Secure Partner Handshake Encryption</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Professional Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5e7a8e]">
                    <Mail size={18} />
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white placeholder-[#5e7a8e] focus:outline-none focus:border-[#008B8B] focus:ring-1 focus:ring-[#008B8B] transition-all"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@clinic.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-[#9ab0c0] uppercase tracking-wide">Password</label>
                  <a className="text-[11px] text-[#008B8B] hover:text-[#008B8B]/80 transition-colors" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5e7a8e]">
                    <Lock size={18} />
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-3 bg-[#0F1E23] border border-white/5 rounded-xl text-sm text-white placeholder-[#5e7a8e] focus:outline-none focus:border-[#008B8B] focus:ring-1 focus:ring-[#008B8B] transition-all"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#5e7a8e] hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="text-[12px] font-bold select-none">{showPassword ? 'HIDE' : 'SHOW'}</span>
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-center text-xs font-semibold py-1 bg-red-400/5 rounded-lg border border-red-400/10">{error}</p>
              )}

              {/* Submit */}
              <button
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-6 bg-[#008B8B] text-white rounded-xl text-sm font-bold hover:bg-[#008B8B]/90 active:scale-[0.98] transition-all disabled:opacity-70 mt-2 shadow-lg shadow-[#008B8B]/20"
                type="submit"
              >
                <span>{loading ? 'Authenticating...' : 'Secure Partner Access'}</span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>

          {/* Footer Section */}
          <div className="p-4 bg-[#1a313b]/40 border-t border-white/5 text-center">
            <p className="text-[11px] text-[#5e7a8e]">
              By signing in, you agree to the <a className="text-[#008B8B] hover:underline" href="#">Terms of Partner Agreement</a>.
            </p>
          </div>
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#9ab0c0]">
            Need help? <a className="font-semibold text-[#008B8B] hover:underline transition-colors" href="#">Contact Partner Support</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
