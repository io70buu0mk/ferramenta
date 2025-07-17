import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  Users, 
  Crown, 
  User, 
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export function UserManagement() {
  const { users, loading, updateUserRole, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'amministratore':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cliente':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'amministratore':
        return <Crown size={14} />;
      default:
        return <User size={14} />;
    }
  };

  const handleRoleUpdate = async (userId: string) => {
    if (newRole) {
      await updateUserRole(userId, newRole);
      setEditingUser(null);
      setNewRole('');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Caricamento utenti...
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Controlli di ricerca e filtri */}
      <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="md:w-5 md:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <Input
                type="text"
                placeholder="Cerca utenti per nome, cognome o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm md:text-base"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter size={14} className="mr-2" />
                  <SelectValue placeholder="Filtra per ruolo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i ruoli</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="Amministratore">Amministratore</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista utenti */}
      <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Utenti Registrati ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.nome[0]}{user.cognome[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-800">
                            {user.nome} {user.cognome}
                          </h3>
                          <p className="text-sm text-neutral-600">@{user.nome_utente}</p>
                        </div>
                        <Badge className={`${getRoleColor(user.role)} flex items-center gap-1`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          {user.email}
                        </div>
                        {user.numero_telefono && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            {user.numero_telefono}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          Registrato {formatDistanceToNow(new Date(user.created_at), { 
                            addSuffix: true, 
                            locale: it 
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {editingUser === user.id ? (
                        <div className="flex items-center gap-2">
                          <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Seleziona ruolo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cliente">Cliente</SelectItem>
                              <SelectItem value="Amministratore">Amministratore</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={() => handleRoleUpdate(user.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Salva
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(null);
                              setNewRole('');
                            }}
                          >
                            Annulla
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(user.id);
                              setNewRole(user.role);
                            }}
                          >
                            <Edit size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Sei sicuro di voler eliminare l'utente {user.nome} {user.cognome}? 
                                  Questa azione non può essere annullata.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 text-neutral-500">
              <Users size={40} className="md:w-12 md:h-12 mx-auto mb-4 text-neutral-300" />
              <p className="text-base md:text-lg font-medium mb-2">
                {searchTerm || roleFilter !== 'all' ? 'Nessun utente trovato' : 'Nessun utente registrato'}
              </p>
              <p className="text-xs md:text-sm">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Gli utenti registrati appariranno qui'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}