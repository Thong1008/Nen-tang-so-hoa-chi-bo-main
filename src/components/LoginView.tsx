import React, { useState } from 'react';
import { PartyMember } from '../types/partyMember';
import { authenticatePartyMember } from '../utils/authService';
import { AuthUser } from '../types/hosoUpdate';
import { 
  Shield, 
  Lock, 
  User, 
  Star, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';

interface LoginViewProps {
  members: PartyMember[];
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ members, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [imageError, setImageError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await authenticatePartyMember(identifier, password, members);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-red-950 via-slate-950 to-red-950 flex flex-col justify-center items-center p-4 sm:p-6 font-interface relative overflow-hidden select-none">
      {/* Background Military Crest Watermark & Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent blur-2xl" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-red-800/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md rounded-2xl border border-red-900/40 shadow-2xl overflow-hidden relative z-10">
        {/* Header Quân Đội Trang Trọng */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 p-6 text-center border-b border-amber-500/30 relative">
          <div className="inline-flex relative mb-3">
            <div className="w-16 h-16 rounded-full ring-3 ring-amber-400/90 ring-offset-2 ring-offset-red-950 bg-red-800 flex items-center justify-center shadow-lg overflow-hidden">
              {!imageError ? (
                <img
                  src="/logo.jpg"
                  alt="Huy hiệu LLVT"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Star className="w-8 h-8 text-amber-300 fill-amber-300" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-red-950 flex items-center justify-center shadow-xs">
              <Shield className="w-3.5 h-3.5 fill-red-950" />
            </div>
          </div>

          <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase">
            ĐẢNG BỘ TRUNG ĐOÀN 6
          </h2>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
            CHI BỘ BAN HẬU CẦN - KỸ THUẬT
          </h1>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tài khoản <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Tài khoản (Số thứ tự)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mật khẩu <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-red-800 via-red-700 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-red-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
