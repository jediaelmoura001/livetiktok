import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Zap, 
  Square, 
  Play, 
  User, 
  Settings,
  RefreshCw,
  TestTube,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';
import { tiktokService } from '../services/api';
import socketService from '../services/socket';

const TikTokConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    username: null,
    giftMappingsCount: 0
  });
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [liveActivity, setLiveActivity] = useState([]);
  const [testGift, setTestGift] = useState({
    giftName: 'Rose',
    giftId: 'rose',
    username: '@testuser',
    repeatCount: 1
  });

  useEffect(() => {
    loadStatus();

    // Listeners para eventos do TikTok Live
    socketService.onTikTokConnected((data) => {
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: true,
        username: data.username
      }));
      setSuccess(`Conectado à live de @${data.username}`);
      addActivity(`Conectado à live de @${data.username}`, 'success');
    });

    socketService.onTikTokDisconnected(() => {
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        username: null
      }));
      addActivity('Desconectado da live', 'info');
    });

    socketService.onTikTokError((data) => {
      setError(`Erro TikTok: ${data.error}`);
      addActivity(`Erro: ${data.error}`, 'error');
    });

    socketService.onTikTokGift((data) => {
      addActivity(
        `${data.username} enviou ${data.repeatCount}x ${data.giftName}${data.teamId ? ` (voto contabilizado)` : ` (não configurado)`}`,
        data.teamId ? 'success' : 'warning'
      );
    });

    socketService.onTikTokComment((data) => {
      addActivity(`${data.username}: ${data.comment}`, 'info');
    });

    socketService.onTikTokMemberJoin((data) => {
      addActivity(`${data.username} entrou na live`, 'info');
    });

    socketService.onTikTokLike((data) => {
      addActivity(`${data.username} deu ${data.likeCount} likes`, 'info');
    });

    return () => {
      socketService.removeAllListeners('tiktok_connected');
      socketService.removeAllListeners('tiktok_disconnected');
      socketService.removeAllListeners('tiktok_error');
      socketService.removeAllListeners('tiktok_gift');
      socketService.removeAllListeners('tiktok_comment');
      socketService.removeAllListeners('tiktok_member_join');
      socketService.removeAllListeners('tiktok_like');
    };
  }, []);

  const loadStatus = async () => {
    try {
      const response = await tiktokService.getStatus();
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  const addActivity = (message, type) => {
    setLiveActivity(prev => [
      {
        message,
        type,
        timestamp: new Date().toLocaleTimeString('pt-BR')
      },
      ...prev.slice(0, 19) // Manter apenas os 20 mais recentes
    ]);
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Username é obrigatório');
      return;
    }

    try {
      setLoading(true);
      await tiktokService.connect(username);
      setUsername('');
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao conectar');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await tiktokService.disconnect();
      setSuccess('Desconectado com sucesso');
    } catch (error) {
      setError('Erro ao desconectar');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMappings = async () => {
    try {
      await tiktokService.refreshMappings();
      setSuccess('Mapeamentos atualizados');
      loadStatus();
    } catch (error) {
      setError('Erro ao atualizar mapeamentos');
    }
  };

  const handleSimulateGift = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await tiktokService.simulateGift(
        testGift.giftName,
        testGift.giftId,
        testGift.username,
        testGift.repeatCount
      );
      setSuccess('Presente simulado com sucesso');
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao simular presente');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return <Zap className="w-3 h-3 text-green-500" />;
      case 'error': return <Square className="w-3 h-3 text-red-500" />;
      case 'warning': return <Activity className="w-3 h-3 text-yellow-500" />;
      default: return <Activity className="w-3 h-3 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Conexão TikTok Live</h2>
        <p className="text-gray-600">Conecte-se à sua live do TikTok para receber votos em tempo real</p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {connectionStatus.isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-gray-400" />
              )}
              <span>Status da Conexão</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  {connectionStatus.isConnected ? 'Conectado' : 'Desconectado'}
                </p>
                {connectionStatus.username && (
                  <p className="text-sm text-gray-600">@{connectionStatus.username}</p>
                )}
                <p className="text-xs text-gray-500">
                  {connectionStatus.giftMappingsCount} presentes configurados
                </p>
              </div>
              <Badge 
                variant={connectionStatus.isConnected ? "default" : "secondary"}
                className={connectionStatus.isConnected ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {connectionStatus.isConnected ? (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Ativo
                  </>
                ) : (
                  <>
                    <Square className="w-3 h-3 mr-1" />
                    Inativo
                  </>
                )}
              </Badge>
            </div>

            {!connectionStatus.isConnected ? (
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tiktok-username">Username do TikTok</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="tiktok-username"
                      type="text"
                      placeholder="@seuusername"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Conectar à Live
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-2">
                <Button 
                  onClick={handleDisconnect}
                  disabled={loading}
                  variant="outline"
                  className="w-full text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Desconectar
                </Button>
                
                <Button 
                  onClick={handleRefreshMappings}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar Mapeamentos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Gift */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="w-5 h-5" />
              <span>Simular Presente (Teste)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSimulateGift} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-gift-name">Nome do Presente</Label>
                  <Input
                    id="test-gift-name"
                    type="text"
                    value={testGift.giftName}
                    onChange={(e) => setTestGift(prev => ({ ...prev, giftName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="test-gift-id">ID do Presente</Label>
                  <Input
                    id="test-gift-id"
                    type="text"
                    value={testGift.giftId}
                    onChange={(e) => setTestGift(prev => ({ ...prev, giftId: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-username">Username</Label>
                  <Input
                    id="test-username"
                    type="text"
                    value={testGift.username}
                    onChange={(e) => setTestGift(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="test-repeat">Quantidade</Label>
                  <Input
                    id="test-repeat"
                    type="number"
                    min="1"
                    max="10"
                    value={testGift.repeatCount}
                    onChange={(e) => setTestGift(prev => ({ ...prev, repeatCount: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={!connectionStatus.isConnected}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Simular Presente
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Atividade da Live</span>
            <Badge variant="secondary">{liveActivity.length} eventos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhuma atividade ainda</p>
              <p className="text-xs text-gray-400">Conecte-se à live para ver eventos em tempo real</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {liveActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TikTokConnection;

