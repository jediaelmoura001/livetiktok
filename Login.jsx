import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, User, TrendingUp } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Por favor, insira seu username do TikTok');
      return;
    }

    if (!username.startsWith('@')) {
      setError('Username deve começar com @');
      return;
    }

    const result = await login(username);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              TikTok Live Voting
            </CardTitle>
            <CardDescription className="text-gray-600">
              Faça login com seu username do TikTok para começar a votação
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username do TikTok
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="@seuusername"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Conecte-se à sua live do TikTok para começar a receber votos através de presentes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

