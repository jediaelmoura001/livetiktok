import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Gift,
  Crown,
  Medal,
  Award,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { teamsService, votingService } from '../services/api';
import socketService from '../services/socket';

const VotingDisplay = () => {
  const [teams, setTeams] = useState([]);
  const [recentVotes, setRecentVotes] = useState([]);
  const [stats, setStats] = useState({
    totalVotes: 0,
    votesByTeam: [],
    votesByGift: [],
    recentVotes: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();

    // Listeners para atualizações em tempo real
    socketService.onNewVote((data) => {
      // Atualizar votos do time
      setTeams(prev => prev.map(team => 
        team.id === data.team_id 
          ? { ...team, votes: team.votes + 1 }
          : team
      ));

      // Adicionar ao histórico recente
      setRecentVotes(prev => [
        {
          username: data.username,
          team_name: teams.find(t => t.id === data.team_id)?.name || 'Time',
          gift_name: data.gift_name,
          timestamp: data.timestamp
        },
        ...prev.slice(0, 9) // Manter apenas os 10 mais recentes
      ]);

      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalVotes: prev.totalVotes + 1
      }));
    });

    socketService.onVotesReset(() => {
      setTeams(prev => prev.map(team => ({ ...team, votes: 0 })));
      setRecentVotes([]);
      setStats(prev => ({
        ...prev,
        totalVotes: 0
      }));
    });

    socketService.onTeamCreated((team) => {
      setTeams(prev => [...prev, team]);
    });

    socketService.onTeamDeleted((data) => {
      setTeams(prev => prev.filter(team => team.id !== data.team_id));
    });

    return () => {
      socketService.removeAllListeners('new_vote');
      socketService.removeAllListeners('votes_reset');
      socketService.removeAllListeners('team_created');
      socketService.removeAllListeners('team_deleted');
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsResponse, statsResponse] = await Promise.all([
        teamsService.getAll(),
        votingService.getStats()
      ]);
      
      setTeams(teamsResponse.data);
      setStats(statsResponse.data);
      setRecentVotes(statsResponse.data.recentVotes || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxVotes = () => {
    return Math.max(...teams.map(team => team.votes), 1);
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <Trophy className="w-4 h-4 text-gray-400" />;
    }
  };

  const sortedTeams = [...teams].sort((a, b) => b.votes - a.votes);
  const maxVotes = getMaxVotes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Votação em Tempo Real</h2>
          <p className="text-gray-600">Acompanhe os votos dos times conforme os presentes chegam</p>
        </div>
        <Button 
          onClick={loadData}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams Ranking */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Ranking dos Times</span>
                <Badge variant="secondary">{stats.totalVotes} votos totais</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum time cadastrado ainda</p>
                  <p className="text-sm text-gray-400">Adicione times na aba "Times" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedTeams.map((team, index) => (
                    <div key={team.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(index)}
                        <span className="font-bold text-lg text-gray-600">#{index + 1}</span>
                      </div>

                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                        {team.logo_path ? (
                          <img 
                            src={`http://localhost:3001${team.logo_path}`} 
                            alt={team.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{team.name}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <Progress 
                            value={(team.votes / maxVotes) * 100} 
                            className="flex-1 h-2"
                          />
                          <Badge 
                            variant={index === 0 ? "default" : "secondary"}
                            className={index === 0 ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                          >
                            {team.votes} votos
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Atividade Recente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentVotes.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum voto ainda</p>
                  <p className="text-xs text-gray-400">Os votos aparecerão aqui em tempo real</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentVotes.map((vote, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {vote.username}
                        </p>
                        <p className="text-xs text-gray-600">
                          Enviou <span className="font-medium">{vote.gift_name}</span> para{' '}
                          <span className="font-medium text-blue-600">{vote.team_name}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(vote.timestamp).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Votos</p>
                <p className="text-3xl font-bold">{stats.totalVotes}</p>
              </div>
              <Trophy className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Times Participando</p>
                <p className="text-3xl font-bold">{teams.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Líder Atual</p>
                <p className="text-lg font-bold truncate">
                  {sortedTeams[0]?.name || 'Nenhum'}
                </p>
              </div>
              <Crown className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VotingDisplay;

