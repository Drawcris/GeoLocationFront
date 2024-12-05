import React, { useState, useEffect } from 'react';
import axiosInstance from '@/axiosInstance'; // Upewnij się, że importujesz axiosInstance
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAuth } from '@/context/AuthContext'; // Zakładam, że masz kontekst uwierzytelniania
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';

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
    return <div className="flex justify-center items-center h-screen">Ładowanie...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="mb-8 text-2xl">
        <p>Email: {userData.email}</p>
        <p>Imię: {userData.fullName}</p>
      </div>

      <Card className="w-80">
        <CardHeader>
        <CardTitle className="text-center">Zmień hasło</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">Kliknij poniżej, aby zmienić hasło</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500">Zmień hasło</Button>
            </DialogTrigger>
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
                <Button className="bg-blue-500" onClick={handleChangePassword}>Zmień hasło</Button>
                <Button className="bg-red-500" onClick={() => setOpenDialog(false)}>Anuluj</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      
    </div>
  );
}

export default ProfileInfo;
