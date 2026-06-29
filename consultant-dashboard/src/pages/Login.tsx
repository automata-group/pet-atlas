import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';

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
      const response = await axios.post('http://localhost:3000/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('DEBUG Login: Full response.data=', response.data);
      console.log('DEBUG Login: user=', user, 'roleId=', user?.roleId, 'role_id=', user?.role_id);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Immediate role validation for professional protection
      const roleId = user?.roleId ?? user?.role_id;
      if (roleId === 1 || roleId === 2) {
        navigate('/hub');
      } else {
        console.warn('DEBUG Login: Access denied, roleId=', roleId);
        navigate('/unauthorized');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid professional credentials. Access denied.');
      } else {
        setError('Security system offline. Please contact IT support.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <main className="w-full max-w-[480px]">
        <div className="bg-white border border-outline-variant/30 rounded-xl shadow-[0_4px_24px_rgba(0,40,142,0.04)] overflow-hidden">
          {/* Header Section */}
          <div className="p-8 border-b border-outline-variant/30 text-center bg-surface-container-low">
            <div className="flex justify-center mb-4">
              <span className="material-symbols-outlined text-[36px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                health_and_safety
              </span>
            </div>
            <h1 className="text-[24px] font-semibold text-primary mb-1">Pet-Atlas Pro</h1>
            <p className="text-[14px] text-on-surface-variant">Provider Portal Access</p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mb-6 py-2 px-4 bg-secondary-container/20 rounded border border-secondary-container/30">
              <span className="material-symbols-outlined text-[12px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
              <span className="text-[12px] font-semibold text-secondary uppercase tracking-wider">Medical Session Encryption Active</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-[12px] font-semibold text-on-surface mb-2" htmlFor="email">Professional Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[20px] text-outline">
                      mail
                    </span>
                  </div>
                  <input
                    className="block w-full pl-12 pr-4 py-3 bg-surface border border-outline-variant rounded focus:ring-2 focus:ring-secondary focus:border-secondary text-[14px] text-on-surface transition-shadow"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dr.smith@clinic.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[12px] font-semibold text-on-surface" htmlFor="password">Password</label>
                  <a className="text-[11px] text-primary hover:text-primary-container transition-colors" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[20px] text-outline">
                      key
                    </span>
                  </div>
                  <input
                    className="block w-full pl-12 pr-12 py-3 bg-surface border border-outline-variant rounded focus:ring-2 focus:ring-secondary focus:border-secondary text-[14px] text-on-surface transition-shadow"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px] text-outline hover:text-on-surface transition-colors">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-error text-center text-[12px] font-semibold">{error}</p>
              )}

              {/* Submit Button */}
              <button
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-6 bg-primary text-white rounded text-[12px] font-semibold hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-70"
                type="submit"
              >
                <span>{loading ? 'Authenticating...' : 'Secure Login'}</span>
                {!loading && (
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Footer Section */}
          <div className="p-4 bg-surface-container border-t border-outline-variant/30 text-center">
            <p className="text-[11px] text-on-surface-variant">
              By logging in, you agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-6 text-center">
          <p className="text-[14px] text-on-surface-variant">
            Need assistance? <a className="text-[12px] font-semibold text-secondary hover:text-secondary-container transition-colors" href="#">Contact IT Support</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
