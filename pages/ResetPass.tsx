import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { saveNewPasswordApi } from '../services/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email || !token || !password || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await saveNewPasswordApi({
        email,
        token,
        password,
        confirmPassword,
      });

      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <Card className="w-full max-w-md shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* <div>
            <Label>Reset Token</Label>
            <Input
              type="text"
              placeholder="Enter the token from your email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div> */}

          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
