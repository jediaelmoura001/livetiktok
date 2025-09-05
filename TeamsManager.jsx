import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Upload, 
  Trash2, 
  Trophy, 
  Users,
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { teamsService } from '../services/api';
import socketService from '../services/socket';

const TeamsManager = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newTeam, setNewTeam] = useState({
    name: '',
    logo: null
  });

  useEffect(() => {
    loadTeams();

    // Listeners para atualizações em tempo real
    socketService.onTeamCreated((team) => {
      setTeams(prev => [...prev, team]);
    });

    socketService.onTeamDeleted((data) => {
      setTeams(prev => prev.filter(team => team.id !== data.team_id));
    });

    socketService.onVotesUpdated((data) => {
      setTeams(prev => prev.map(team => 
        team.id === data.team_id 
          ? { ...team, votes: data.votes }
          : team
      ));
    });

    socketService.onVotesReset(() => {
      setTeams(prev => prev.map(team => ({ ...team, votes: 0 })));
    });

    socketService.onNewVote((data) => {
      setTeams(prev => prev.map(team => 
        team.id === data.team_id 
          ? { ...team, votes: team.votes + 1 }
          : team
      ));
    });

    return () => {
      socketService.removeAllListeners('team_created');
      socketService.removeAllListeners('team_deleted');
      socketService.removeAllListeners('votes_updated');
      socketService.removeAllListeners('votes_reset');
      socketService.removeAllListeners('new_vote');
    };
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsService.getAll();
      setTeams(response.data);
    } catch (error) {
      setError('Erro ao carregar times');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newTeam.name.trim()) {
      setError('Nome do time é obrigatório');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newTeam.name);
      if (newTeam.logo) {
        formData.append('logo', newTeam.logo);
      }

      await teamsService.create(formData);
      setSuccess('Time criado com sucesso!');
      setNewTeam({ name: '', logo: null });
      
      // Reset file input
      const fileInput = document.getElementById('logo-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao criar time');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Tem certeza que deseja deletar este time?')) {
      return;
    }

    try {
      await teamsService.delete(teamId);
      setSuccess('Time deletado com sucesso!');
    } catch (error) {
      setError('Erro ao deletar time');
    }
  };

  const handleResetVotes = async () => {
    if (!confirm('Tem certeza que deseja resetar todos os votos?')) {
      return;
    }

    try {
      await teamsService.resetVotes();
      setSuccess('Votos resetados com sucesso!');
    } catch (error) {
      setError('Erro ao resetar votos');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      setNewTeam(prev => ({ ...prev, logo: file }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Times</h2>
          <p className="text-gray-600">Adicione e gerencie os times de futebol</p>
        </div>
        <Button 
          onClick={handleResetVotes}
          variant="outline"
          className="text-orange-600 border-orange-600 hover:bg-orange-50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Resetar Votos
        </Button>
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

      {/* Add New Team Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Adicionar Novo Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Nome do Time</Label>
                <Input
                  id="team-name"
                  type="text"
                  placeholder="Ex: Flamengo"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo do Time (PNG/JPG)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="flex-1"
                  />
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Time
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Teams List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Times Cadastrados ({teams.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && teams.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Carregando times...</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum time cadastrado ainda</p>
              <p className="text-sm text-gray-400">Adicione o primeiro time usando o formulário acima</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <Card key={team.id} className="relative group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
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
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Trophy className="w-3 h-3" />
                            <span>{team.votes} votos</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamsManager;

