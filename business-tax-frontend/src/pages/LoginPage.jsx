import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck
} from 'lucide-react';
import apiClient from '../api/apiClient';

const Toast = ({ message, type, onClose }) => {
  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
        isSuccess
          ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
          : 'bg-red-50/95 border-red-200 text-red-800'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
      <span className="font-medium text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-lg hover:bg-black/5 transition-colors"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const PasswordInput = ({ value, onChange, showPassword, onToggle, error }) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
      <Lock className={`w-5 h-5 ${error ? 'text-red-400' : 'text-slate-400'}`} />
    </div>
    <input
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder="Password"
      className={`w-full pl-12 pr-12 py-4 bg-slate-50/80 border-2 rounded-xl text-slate-800 placeholder-slate-400 transition-all duration-200 outline-none ${
        error
          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100'
          : 'border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100'
      }`}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  </div>
);

const LoginButton = ({ isLoading, children }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="relative w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 disabled:shadow-none disabled:cursor-not-allowed overflow-hidden group"
  >
    {isLoading ? (
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Signing in...</span>
      </div>
    ) : (
      <span className="relative z-10">{children}</span>
    )}
    {!isLoading && (
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    )}
  </button>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!validateForm()) {
      setToast({ message: 'Please fix the errors below', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsLoading(true);
    setToast(null);

    try {
      const response = await apiClient.post('/auth/login', { email, password, rememberMe });
      const { data } = response.data;

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        setToast({ message: 'Welcome back! Redirecting...', type: 'success' });
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Network error. Please try again.';
      setToast({ message, type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background mesh orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-100/20 rounded-full blur-3xl" />
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/10 border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-6"
            >
              <Store className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome Back</h1>
            <p className="mt-2 text-slate-500 text-sm">Sign in to manage your business</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User className={`w-5 h-5 ${errors.email && touched.email ? 'text-red-400' : 'text-slate-400'}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50/80 border-2 rounded-xl text-slate-800 placeholder-slate-400 transition-all duration-200 outline-none ${
                    errors.email && touched.email
                      ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                      : 'border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.email && touched.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                error={errors.password && touched.password}
              />
              {errors.password && touched.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                      rememberMe
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-slate-300 group-hover:border-indigo-400'
                    }`}
                  >
                    {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <span className="text-sm text-slate-600 select-none">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <LoginButton isLoading={isLoading}>Sign In</LoginButton>
          </form>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Secured with 256-bit encryption</span>
            </div>
          </div>
        </div>

        {/* Bottom attribution */}
        <p className="text-center mt-6 text-xs text-slate-400">
          © 2026 Your Business. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
