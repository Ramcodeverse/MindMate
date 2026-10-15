import React, { useState } from 'react';
import { Heart, Mail, Lock, User, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const ok = await register(formData.name, formData.email, formData.password);
        if (!ok) {
          setErrors({ email: 'Registration failed or email already in use' });
        } else {
          onClose?.();
        }
      } else {
        const ok = await login(formData.email, formData.password);
        if (!ok) {
          setErrors({ email: 'Invalid email or password' });
        } else {
          onClose?.();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    setIsSubmitting(true);
    try {
      if (role === 'admin') {
        await login('admin@mindmate.com', 'admin123');
      } else {
        await login('sarah.johnson@email.com', 'sarah123');
      }
      onClose?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#163327]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FBFBF7] border border-[#D8E4DC] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#2D5A46] text-white rounded-2xl mb-3 shadow-xs">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#163327]">
            {isSignUp ? 'Create Your Sanctuary' : 'Welcome Back to MindMate'}
          </h2>
          <p className="text-xs text-[#4E6B5D] mt-1">
            {isSignUp
              ? 'Begin your personal wellness and mindfulness journey'
              : 'Sign in to access your mood logs, private journal, and habits'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="e.g. Sarah Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs bg-white border border-[#D8E4DC] rounded-xl pl-9 pr-3 py-2.5 text-[#163327] focus:outline-none focus:ring-1 focus:ring-[#2D5A46]"
                />
              </div>
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs bg-white border border-[#D8E4DC] rounded-xl pl-9 pr-3 py-2.5 text-[#163327] focus:outline-none focus:ring-1 focus:ring-[#2D5A46]"
              />
            </div>
            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full text-xs bg-white border border-[#D8E4DC] rounded-xl pl-9 pr-10 py-2.5 text-[#163327] focus:outline-none focus:ring-1 focus:ring-[#2D5A46]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-xs font-semibold text-white bg-[#2D5A46] hover:bg-[#234739] rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : isSignUp ? 'Create My Account' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="pt-5 mt-5 border-t border-[#E8ECE6] space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-center text-[#5C7A6D] font-semibold">
            Instant Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('user')}
              className="px-3 py-2 text-xs font-medium bg-[#EAF2EC] text-[#2D5A46] hover:bg-[#DCE7DF] rounded-xl transition-colors text-center"
            >
              Sarah (Member)
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="px-3 py-2 text-xs font-medium bg-[#EAF2EC] text-[#2D5A46] hover:bg-[#DCE7DF] rounded-xl transition-colors text-center"
            >
              Dr. Vance (Admin)
            </button>
          </div>
        </div>

        {/* Switch Mode */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrors({});
            }}
            className="text-xs text-[#2D5A46] hover:underline font-medium"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;