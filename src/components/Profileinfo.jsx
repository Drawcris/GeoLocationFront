import React, { useState, useEffect } from 'react';
import axiosInstance from '@/axiosInstance'; // Upewnij się, że importujesz axiosInstance
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAuth } from '@/context/AuthContext'; // Zakładam, że masz kontekst uwierzytelniania

function ProfileInfo() {
  const { user } = useAuth(); // Pobierz dane zalogowanego użytkownika z kontekstu
  const [userData, setUserData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState([]);

  // Fetch user data
  useEffect(() => {
    if (user && user.email) {
      axiosInstance.get(`/api/Account/users/email/${encodeURIComponent(user.email)}`)
        .then(response => {
          setUserData(response.data);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });

      axiosInstance.get(`/api/Routes?driverEmail=${encodeURIComponent(user.email)}`)
        .then(response => {
          setRoutes(response.data);
        })
        .catch(error => {
          console.error('Error fetching routes:', error);
        });
    }
  }, [user]);

  // Handle password change
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setError("Hasła się nie zgadzają!");
      return;
    }

    const payload = {
      currentPassword,
      newPassword
    };

    console.log('Payload:', payload);

    if (!userData || !userData.id) {
      console.error('User ID is undefined');
      setError('Nie można zmienić hasła, ponieważ ID użytkownika jest nieznane.');
      return;
    }

    axiosInstance.put(`/api/Account/users/${userData.id}/password`, payload)
      .then(response => {
        alert("Hasło zostało zmienione!");
        setOpenDialog(false);
        setError('');
      })
      .catch(error => {
        console.error('Error changing password:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
          if (error.response.status === 400) {
            setError("Błędne hasło.");
          } else {
            setError("Błąd podczas zmiany hasła.");
          }
        } else {
          setError("Błąd podczas zmiany hasła.");
        }
      });
  };

  if (!userData) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold">Profil</h1> <br />
      <p>Email: {userData.email}</p>
      <p>Imię: {userData.fullName}</p> <br />
      <Button className='bg-blue-500' onClick={() => setOpenDialog(true)}>Zmień hasło</Button>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zmień hasło</DialogTitle>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Aktualne hasło"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Nowe hasło"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Potwierdź nowe hasło"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <DialogFooter>
            <Button className='bg-blue-500' onClick={handleChangePassword}>Zmień hasło</Button>
            <Button className='bg-red-500' onClick={() => setOpenDialog(false)}>Anuluj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <h2 className="text-xl font-semibold mt-8">Przypisane trasy</h2>
      <ul className="list-disc list-inside">
        {routes.map(route => (
          <li key={route.id}>
            <p><b>Nazwa trasy:</b> {route.name}</p>
            <p><b>Status:</b> {route.status}</p>
            <p><b>Data:</b> {new Date(route.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProfileInfo;