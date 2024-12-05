import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import axiosInstance from "../axiosInstance";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [userRoles, setUserRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  

  // Pobieranie użytkowników z API
  useEffect(() => {
    axiosInstance.get('/api/Account/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  // Pobieranie ról użytkownika
  const fetchUserRoles = (userId) => {
    axiosInstance.get(`/api/Account/roles?userId=${userId}`)
      .then(response => {
        setUserRoles(response.data.userRoles || []);
        setAvailableRoles(['Admin', 'Kierowca']); // Możesz rozbudować to o dynamiczne role, jeżeli API je zwraca
      })
      .catch(error => console.error('Error fetching user roles:', error));
  };

  // Funkcja zmieniająca stan checkboxów
  const handleCheckboxChange = (role) => {
    setUserRoles(prevRoles => {
      if (prevRoles.includes(role)) {
        return prevRoles.filter(r => r !== role); // Usuń rolę, jeśli jest zaznaczona
      } else {
        return [...prevRoles, role]; // Dodaj rolę, jeśli nie jest zaznaczona
      }
    });
  };

  // Funkcja do zmiany ról użytkownika
  const handleRoleChange = () => {
    axiosInstance.put(`/api/Account/users/${selectedUserId}/role`, {
      roles: userRoles,
    })
      .then(() => {
        alert('Zaktualizowano role pomyślnie');
        // Odświeżenie listy użytkowników po zapisaniu
        axiosInstance.get('/api/Account/users')
          .then(response => setUsers(response.data))
          .catch(error => console.error('Error fetching updated users:', error));
      })
      .catch(error => {
        console.error('Error updating roles:', error);
        alert('Error updating roles');
      });
  };

  // Funkcja do usuwania użytkownika
  const handleDeleteUser = (userId) => {
    axiosInstance.delete(`/api/Account?userId=${userId}`)
      .then(() => {
        // Odświeżenie listy użytkowników po usunięciu
        axiosInstance.get('/api/Account/users')
          .then(response => setUsers(response.data))
          .catch(error => console.error('Error fetching updated users:', error));
      })
      .catch(error => {
        console.error('Nie udało się usunąć użytkownika:', error);
        alert('Nie udało się usunąć użytkownika');
      });
  };

  // Funkcja do rejestracji nowego użytkownika
  const handleRegisterUser = () => {
    axiosInstance.post('/api/Account/register', {
      email: registerEmail,
      password: registerPassword,
      fullName: registerName,
    })
      .then(() => {
        // Odświeżenie listy użytkowników po rejestracji
        axiosInstance.get('/api/Account/users')
          .then(response => setUsers(response.data))
          .catch(error => console.error('Error fetching updated users:', error));
      })
      .catch(error => {
        console.error('Nie udało się utworzyć użytkownika:', error);
        alert('Nie udało się utworzyć użytkownika');
      });
  };


  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Użytkownicy</h2>

     
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4 bg-blue-500 hover:bg-blue-800">Dodaj Użytkownika</Button>
        </DialogTrigger>
        <DialogContent>
        <VisuallyHidden>
          <DialogTitle>Dodaj uzytkownika</DialogTitle>
        </VisuallyHidden>
          <DialogHeader>
            <h3 className="text-lg font-semibold">Dodaj użytkownika</h3>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Input 
                type="email" 
                value={registerEmail} 
                onChange={(e) => setRegisterEmail(e.target.value)} 
                placeholder="Email"
                className="w-full" 
              />
            </div>
            <div>
              <Input 
                type="fname" 
                value={registerName} 
                onChange={(e) => setRegisterName(e.target.value)} 
                placeholder="Imię i nazwisko"
                className="w-full" 
              />
            </div>
            <div>
              <Input 
                type="password" 
                value={registerPassword} 
                onChange={(e) => setRegisterPassword(e.target.value)} 
                placeholder="Hasło"
                className="w-full" 
              />
            </div>
          </div>

          <DialogFooter>
            <Button className="bg-blue-500 hover:bg-blue-800" onClick={handleRegisterUser}>Dodaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table className="w-full bg-white shadow-md rounded-lg">
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Username</TableHead>
            <TableHead className="text-left">Email</TableHead>
            <TableHead className="text-left">Imię i nazwisko</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.userName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.fullName}</TableCell>
              <TableCell className="text-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => {
                      setSelectedUserId(user.id);
                      setSelectedUserName(user.userName);
                      fetchUserRoles(user.id); // Pobierz role po kliknięciu
                    }}>
                      Edit Roles
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <h3 className="text-lg font-semibold">Edytuj role dla {selectedUserName}</h3>
                    </DialogHeader>

                    <div className="space-y-4">
                      {availableRoles.map(role => (
                        <div key={role} className="flex items-center">
                          <Checkbox
                            id={role}
                            checked={userRoles.includes(role)}
                            onCheckedChange={() => handleCheckboxChange(role)}
                          />
                          <label htmlFor={role} className="ml-2">{role}</label>
                        </div>
                      ))}
                    </div>

                    <DialogFooter>
                      <Button className="bg-blue-500 hover:bg-blue-800" onClick={handleRoleChange}>Zapisz</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Button do usunięcia konta użytkownika */}
                <Button variant="outline" color="red" onClick={() => handleDeleteUser(user.id)} className="mt-2 ml-2 hover:bg-red-500 hover:text-white">
                  Usuń
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserList;
