import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [userRoles, setUserRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Pobieranie użytkowników z API
  useEffect(() => {
    axios.get('https://localhost:7213/api/Account/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  // Pobieranie ról użytkownika
  const fetchUserRoles = (userId) => {
    axios.get(`https://localhost:7213/api/Account/roles?userId=${userId}`)
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
    axios.put(`https://localhost:7213/api/Account/users/${selectedUserId}/role`, {
      roles: userRoles,
    })
      .then(() => {
        alert('Roles updated successfully');
        // Odświeżenie listy użytkowników po zapisaniu
        axios.get('https://localhost:7213/api/Account/users')
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
    axios.delete(`https://localhost:7213/api/Account?userId=${userId}`)
      .then(() => {
        alert('User deleted successfully');
        // Odświeżenie listy użytkowników po usunięciu
        axios.get('https://localhost:7213/api/Account/users')
          .then(response => setUsers(response.data))
          .catch(error => console.error('Error fetching updated users:', error));
      })
      .catch(error => {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      });
  };

  // Funkcja do rejestracji nowego użytkownika
  const handleRegisterUser = () => {
    axios.post('https://localhost:7213/api/Account/register', {
      email: registerEmail,
      password: registerPassword,
    })
      .then(() => {
        alert('User registered successfully');
        // Odświeżenie listy użytkowników po rejestracji
        axios.get('https://localhost:7213/api/Account/users')
          .then(response => setUsers(response.data))
          .catch(error => console.error('Error fetching updated users:', error));
      })
      .catch(error => {
        console.error('Error registering user:', error);
        alert('Error registering user');
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Użytkownicy</h2>

      {/* Button to trigger registration dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4 bg-blue-500 hover:bg-blue-800">Dodaj Użytkownika</Button>
        </DialogTrigger>
        <DialogContent>
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
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.userName}</TableCell>
              <TableCell>{user.email}</TableCell>
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
