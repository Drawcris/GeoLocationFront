import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function FormSign() {
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "email") {
            setEmail(value);
        } else if (name === "password") {
            setPassword(value);
        } else if (name === "confirmPassword") {
            setConfirmPassword(value);
        } else if (name === "fullName") {
            setFullName(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password || !confirmPassword || !fullName) {
            setError("Wszystkie pola są wymagane");
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Niepoprawny email");
        } else if (password.length < 8) {
            setError("Hasło musi mieć co najmniej 8 znaków");
        } else if (password !== confirmPassword) {
            setError("Hasła nie są takie same");
        } else {
            setError("");
            try {
                const response = await axios.post("https://localhost:7213/api/Account/register", {
                    email,
                    password,
                    fullName
                });

                if (response.status === 200) {
                    setError("Rejestracja zakończona sukcesem");
                    navigate("/LoginPage");  // Przeniesienie na stronę logowania
                } else {
                    setError("Błąd podczas rejestracji");
                }
            } catch (error) {
                console.error("Błąd rejestracji:", error);
                setError("Błąd podczas rejestracji");
            }
        }
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <p className='font-medium mt-20'>Panda Express</p>
            <img className="object-center inline w-40 h-40 border rounded-xl" src="panda.jpg" alt="Witaj" />

            <h1 className="text-5xl mt-5">Utwórz konto</h1>
            <p className="mt-4">Podaj email oraz hasło aby utworzyć konto</p>

            <form className="mt-10" onSubmit={handleSubmit}>
                <input
                    type="fname"
                    name="fullName"
                    placeholder="Imię i nazwisko"
                    value={fullName}
                    onChange={handleChange}
                    className="input bg-slate-300 rounded-xl  text-center h-10 w-80 mt-4"
                />
                <p className="text-slate-600">Podaj swoje imię i nazwisko</p>

                <input
                    type="email"
                    name="email"
                    placeholder="Imie@example.com"
                    value={email}
                    onChange={handleChange}
                    className="input bg-slate-300 rounded-xl text-center h-10 w-80 mt-4"
                />
                <p className="text-slate-600">Podaj swój email</p>

                <input
                    type="password"
                    name="password"
                    placeholder="ExamplePassword"
                    value={password}
                    onChange={handleChange}
                    className="input bg-slate-300 rounded-xl text-center h-10 w-80 mt-4"
                />
                <p className="text-slate-600">Podaj swoje hasło</p>

                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Powtórz hasło"
                    value={confirmPassword}
                    onChange={handleChange}
                    className="input bg-slate-300 rounded-xl text-center h-10 w-80 mt-4"
                />
                <p className="text-slate-600">Powtórz swoje hasło</p>

                {error && <p className="text-red-500 mt-2">{error}</p>}

                <button type="submit" className="btn mt-5 bg-blue-500 rounded-xl w-80 h-10 text-white">
                    Utwórz konto
                </button>
            </form>

            <p className="mt-4">Masz już konto?</p>

            <Link to="/LoginPage" className="text-blue-500">
                <button className="btn mt-5 bg-blue-500 rounded-xl w-40 h-10 text-white">Zaloguj się</button>
            </Link>
        </div>
    );
}

export default FormSign;