import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { SignUpPage } from '../components/SignUpPage';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '@/services/api';

export function LoginPage() {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { login, forgetPassword, saveNewPassword } = useAuth();

  // 🔹 Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔹 Forget password / reset state
  const [showForget, setShowForget] = useState(false);
  const [forgetEmail, setForgetEmail] = useState('');
  const [forgetMessage, setForgetMessage] = useState('');
  const [forgetLoading, setForgetLoading] = useState(false);
  const [emailParams, setEmailParams] = useState('');
  const [tokenParams, setTokenParams] = useState('');
  // const [forgetStep2, setForgetStep2] = useState(false);
  // const [resetToken, setResetToken] = useState('');
  // const [newPassword, setNewPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');

  // 🔹 Confirmation state

  // 🔹 Check for token and email in URL
  React.useEffect(() => {
    const init = async () => {
      const token = searchParams.get('token');
      const emailParam = searchParams.get('email');
      if (token && emailParam) {
        setEmailParams(emailParam.trimEnd());
        setTokenParams(token.trimEnd());
      }
    };
    init();
  }, [searchParams]);

  // 🔹 Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (emailParams && tokenParams) {
        await authAPI.confirmEmail({ token: tokenParams, email: emailParams.trimEnd() });
      }
      await login(email, password);
    } catch (err: any) {
      if (err.response?.status === 400 || err.status === 400) {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"
            style={{
              width: Math.random() * 400 + 200,
              height: Math.random() * 400 + 200,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Package className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl">Circle Code</CardTitle>
              <CardDescription>
                Sign in to access your dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@circlecode.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {emailParams && tokenParams && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const response = await authAPI.resendConfirmEmail(emailParams);
                      setTokenParams(response.token);
                      setError('Confirmation email resent successfully. A new token has been applied.');
                    } catch (err: any) {
                      setError(err.message || 'Failed to resend confirmation email.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  Resend Confirmation Email
                </Button>
              )}

              <Label
                className="text-center text-sm text-slate-500 cursor-pointer hover:text-blue-500"
                onClick={() => setShowForget(true)}
              >
                Forgot your password?
              </Label>

              {/* 🔹 Forget Password / Reset Password */}
              {/* 🔹 Forget Password / Send Reset Link only */}
              {showForget && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg space-y-2">
                  <Label>Email for password reset:</Label>
                  <Input
                    type="email"
                    placeholder="your.email@circlecode.com"
                    value={forgetEmail}
                    onChange={(e) => setForgetEmail(e.target.value)}
                    className="mt-1"
                  />

                  <Button
                    onClick={async () => {
                      if (!forgetEmail) {
                        setForgetMessage('Please enter your email.');
                        return;
                      }
                      setForgetLoading(true);
                      setForgetMessage('');
                      try {
                        const success = await forgetPassword(forgetEmail);
                        if (success) {
                          setForgetMessage('📩 A reset link has been sent to your email.');
                        } else {
                          setForgetMessage('❌ Failed to send reset link. Try again.');
                        }
                      } catch (err) {
                        setForgetMessage(err instanceof Error ? err.message : 'Failed to send request.');
                      } finally {
                        setForgetLoading(false);
                      }
                    }}
                    className="mt-2 w-full"
                    disabled={forgetLoading}
                  >
                    {forgetLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  {forgetMessage && (
                    <p className="text-sm mt-2 text-center text-blue-600 dark:text-blue-400">
                      {forgetMessage}
                    </p>
                  )}

                  <p
                    className="text-center text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-blue-500"
                    onClick={() => setShowForget(false)}
                  >
                  </p>
                </div>
              )}

              <p className="text-blue-500 cursor-pointer" onClick={() => navigate('/signup')}>
                Don't have an account? Sign Up
              </p>

            </form>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6"
        >
          Powered by Circle Code System • {new Date().getFullYear()}
        </motion.p>
      </motion.div>
    </div>
  );
}
