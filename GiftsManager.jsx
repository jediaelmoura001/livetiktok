import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Gift, 
  Plus, 
  Upload, 
  Trash2, 
  Settings,
  Image as ImageIcon,
  Link,
  Users
} from 'lucide-react';
import { giftsService, teamsService } from '../services/api';
import socketService from '../services/socket';

const GiftsManager = () => {
  const [gifts, setGifts] = useState([]);
  const [availableGifts, setAvailableGifts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newGift, setNewGift] = useState({
    name: '',
    tiktok_id: '',
    team_id: '',
    image: null
  });

  useEffect(() => {
    loadData();

    // Listeners para atualizações em tempo real
    socketService.onGiftConfigured((gift) => {
      setGifts(prev => [...prev, gift]);
    });

    socketService.onGiftUpdated((data) => {
      setGifts(prev => prev.map(gift => 
        gift.id === data.gift_id 
          ? { ...gift, team_id: data.team_id }
          : gift
      ));
    });

    socketService.onGiftDeleted((data) => {
      setGifts(prev => prev.filter(gift => gift.id !== data.gift_id));
    });

    return () => {
      socketService.removeAllListeners('gift_configured');
      socketService.removeAllListeners('gift_updated');
      socketService.removeAllListeners('gift_deleted');
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [giftsResponse, availableResponse, teamsResponse] = await Promise.all([
        giftsService.getAll(),
        giftsService.getAvailable(),
        teamsService.getAll()
      ]);
      
      setGifts(giftsResponse.data);
      setAvailableGifts(availableResponse.data);
      setTeams(teamsResponse.data);
    } catch (error) {
      setError('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newGift.name.trim() || !newGift.tiktok_id.trim()) {
      setError('Nome e ID do TikTok são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newGift.name);
      formData.append('tiktok_id', newGift.tiktok_id);
      if (newGift.team_id) {
        formData.append('team_id', newGift.team_id);
      }
      if (newGift.image) {
        formData.append('image', newGift.image);
      }

      await giftsService.create(formData);
      setSuccess('Presente configurado com sucesso!');
      setNewGift({ name: '', tiktok_id: '', team_id: '', image: null });
      
      // Reset file input
      const fileInput = document.getElementById('gift-image-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao configurar presente');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGiftTeam = async (giftId, teamId) => {
    try {
      await giftsService.update(giftId, teamId);
      setSuccess('Presente atualizado com sucesso!');
    } catch (error) {
      setError('Erro ao atualizar presente');
    }
  };

  const handleDeleteGift = async (giftId) => {
    if (!confirm('Tem certeza que deseja deletar esta configuração?')) {
      return;
    }

    try {
      await giftsService.delete(giftId);
      setSuccess('Configuração deletada com sucesso!');
    } catch (error) {
      setError('Erro ao deletar configuração');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      setNewGift(prev => ({ ...prev, image: file }));
    }
  };

  const handleSelectAvailableGift = (gift) => {
    setNewGift(prev => ({
      ...prev,
      name: gift.name,
      tiktok_id: gift.tiktok_id
    }));
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Não associado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Presentes</h2>
        <p className="text-gray-600">Configure quais presentes do TikTok contam para cada time</p>
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
        {/* Available Gifts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>Presentes Disponíveis do TikTok</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {availableGifts.map((gift) => (
                <Button
                  key={gift.tiktok_id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAvailableGift(gift)}
                  className="justify-start text-left h-auto p-2"
                >
                  <div>
                    <div className="font-medium text-xs">{gift.name}</div>
                    <div className="text-xs text-gray-500">{gift.tiktok_id}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add New Gift Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Configurar Presente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGift} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gift-name">Nome do Presente</Label>
                <Input
                  id="gift-name"
                  type="text"
                  placeholder="Ex: Rose"
                  value={newGift.name}
                  onChange={(e) => setNewGift(prev => ({ ...prev, name: e.target.value }))}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gift-tiktok-id">ID do TikTok</Label>
                <Input
                  id="gift-tiktok-id"
                  type="text"
                  placeholder="Ex: rose"
                  value={newGift.tiktok_id}
                  onChange={(e) => setNewGift(prev => ({ ...prev, tiktok_id: e.target.value }))}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gift-team">Associar ao Time (opcional)</Label>
                <Select 
                  value={newGift.team_id} 
                  onValueChange={(value) => setNewGift(prev => ({ ...prev, team_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não associar</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gift-image-upload">Imagem Personalizada (opcional)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="gift-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="flex-1"
                  />
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar Presente
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Configured Gifts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="w-5 h-5" />
            <span>Presentes Configurados ({gifts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && gifts.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Carregando configurações...</p>
            </div>
          ) : gifts.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum presente configurado ainda</p>
              <p className="text-sm text-gray-400">Configure presentes para começar a receber votos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gifts.map((gift) => (
                <Card key={gift.id} className="relative group hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {gift.image_path ? (
                          <img 
                            src={`http://localhost:3001${gift.image_path}`} 
                            alt={gift.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{gift.name}</h3>
                        <p className="text-sm text-gray-500">ID: {gift.tiktok_id}</p>
                        <div className="mt-1">
                          <Badge 
                            variant={gift.team_id ? "default" : "secondary"}
                            className="flex items-center space-x-1 w-fit"
                          >
                            <Users className="w-3 h-3" />
                            <span>{getTeamName(gift.team_id)}</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Select 
                          value={gift.team_id?.toString() || ""} 
                          onValueChange={(value) => handleUpdateGiftTeam(gift.id, value || null)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Associar time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Não associar</SelectItem>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.id.toString()}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGift(gift.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

export default GiftsManager;

