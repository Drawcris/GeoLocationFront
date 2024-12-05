import React, { useState } from 'react';   
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { decodeJwt } from 'jose';  
import { Link } from 'react-router-dom';

function FormLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setUser } = useAuth();  

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "email") {
            setEmail(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Wszystkie pola są wymagane");
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Niepoprawny email");
        } else {
            setError("");
            try {
                const response = await axios.post("https://localhost:7213/api/account/login", {
                    email,
                    password
                });

                if (response.status === 200) {
                    const { token } = response.data;
                
                    localStorage.setItem("accessToken", token);
                    const decodedToken = decodeJwt(token);
                    const roles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                    const user = { email, token, roles: Array.isArray(roles) ? roles : [roles] };  
                    setUser(user);  
                    
                    setError("");
                    console.log(user);
                    navigate("/");  
                }
            } catch (error) {
                console.error("Błąd logowania:", error);
                
                if (error.response) {
                    console.log("Response error data:", error.response.data);
                    console.log("Response error status:", error.response.status);
                }

                if (error.response && error.response.status === 401) {
                    setError("Niepoprawny email lub hasło");
                } else {
                    setError("Błąd podczas logowania. Spróbuj ponownie później.");
                }
            }
        }
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <p className="font-medium mt-20">Panda Express</p>  
            <img className="object-center inline w-40 h-40 border rounded-xl" src="panda.jpg" alt="Witaj" />

            <h1 className="text-5xl mt-10">Zaloguj się</h1>
            <p className="mt-4">Podaj email oraz hasło aby się zalogować</p>

            <form className="mt-10" onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Imie@example.com"
                    className="input bg-slate-300 rounded-xl text-center h-10 w-80"
                />
                <p className="text-slate-600">Podaj swój email</p>

                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    placeholder="ExamplePassword"
                    className="input bg-slate-300 rounded-xl text-center h-10 w-80 mt-4"
                />
                <p className="text-slate-600">Podaj swoje hasło</p>

                {error && <p className="text-red-500 mt-2">{error}</p>}

                <button type="submit" className="btn mt-5 bg-blue-500 rounded-xl w-80 h-10 text-white">
                    Zaloguj się
                </button>
            </form>

            <p className="mt-4">Nie masz konta?</p>
            <Link to="/SignPage" className="text-blue-500">
                <button className="btn mt-5 bg-blue-500 rounded-xl w-40 h-10 text-white">Utwórz konto</button>
            </Link>
        </div>
    );
}

export default FormLogin;