import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  LogOut, 
  Users, 
  Gift, 
  BarChart3, 
  Settings, 
  Play, 
  Square,
  Trophy,
  TrendingUp,
  Zap
} from 'lucide-react';
import TeamsManager from './TeamsManager';
import GiftsManager from './GiftsManager';
import VotingDisplay from './VotingDisplay';
import TikTokConnection from './TikTokConnection';
import socketService from '../services/socket';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('voting');
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [liveStats, setLiveStats] = useState({
    totalVotes: 0,
    activeViewers: 0,
    giftsReceived: 0
  });

  useEffect(() => {
    // Conectar ao Socket.io
    socketService.connect();

    // Listeners para estatísticas em tempo real
    socketService.onNewVote((data) => {
      setLiveStats(prev => ({
        ...prev,
        totalVotes: prev.totalVotes + 1,
        giftsReceived: prev.giftsReceived + 1
      }));
    });

    socketService.onTikTokConnected(() => {
      setConnectionStatus(true);
    });

    socketService.onTikTokDisconnected(() => {
      setConnectionStatus(false);
    });

    socketService.onTikTokGift((data) => {
      setLiveStats(prev => ({
        ...prev,
        giftsReceived: prev.giftsReceived + (data.repeatCount || 1)
      }));
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleLogout = () => {
    socketService.disconnect();
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TikTok Live Voting</h1>
                <p className="text-sm text-gray-500">Bem-vindo, {user?.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge 
                variant={connectionStatus ? "default" : "secondary"}
                className={connectionStatus ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {connectionStatus ? (
                  <>
                    <Zap className="w-3 h-3 mr-1" />
                    Conectado
                  </>
                ) : (
                  <>
                    <Square className="w-3 h-3 mr-1" />
                    Desconectado
                  </>
                )}
              </Badge>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total de Votos</p>
                  <p className="text-3xl font-bold">{liveStats.totalVotes}</p>
                </div>
                <Trophy className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Presentes Recebidos</p>
                  <p className="text-3xl font-bold">{liveStats.giftsReceived}</p>
                </div>
                <Gift className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Status da Live</p>
                  <p className="text-lg font-semibold">
                    {connectionStatus ? 'Ativa' : 'Inativa'}
                  </p>
                </div>
                {connectionStatus ? (
                  <Play className="w-8 h-8 text-green-200" />
                ) : (
                  <Square className="w-8 h-8 text-green-200" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="voting" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Votação</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Times</span>
            </TabsTrigger>
            <TabsTrigger value="gifts" className="flex items-center space-x-2">
              <Gift className="w-4 h-4" />
              <span>Presentes</span>
            </TabsTrigger>
            <TabsTrigger value="connection" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Conexão</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voting" className="space-y-6">
            <VotingDisplay />
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <TeamsManager />
          </TabsContent>

          <TabsContent value="gifts" className="space-y-6">
            <GiftsManager />
          </TabsContent>

          <TabsContent value="connection" className="space-y-6">
            <TikTokConnection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

