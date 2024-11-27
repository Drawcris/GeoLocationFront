import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        setUser(null);
        navigate('/loginpage');
    };

    return (
        <div>
            <nav className="flex items-center justify-between flex-wrap bg-blue-500 p-6">
                <div className="flex items-center flex-shrink-0 text-white mr-6">
                    <span className="font-semibold text-xl tracking-tight">Panda Express</span>
                </div>
                <div className="block lg:hidden">             
                </div>
                <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                    <div className="text-sm lg:flex-grow">
                        <a href="/" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                            Trasa
                        </a>
                        <a href="/searchpage" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                            Wyszukiwarka
                        </a>
                        <a href="/userPage" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                            Użytkownicy
                        </a>
                        <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white">
                            Twórca
                        </a>
                    </div>
                    <div>
                        {user ? (
                            <>
                                <span className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white mt-4 lg:mt-0">
                                   {user.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-black hover:bg-red-600 mt-4 lg:mt-0 ml-4"
                                >
                                    Wyloguj się
                                </button>
                            </>
                        ) : (
                            <Link to="/loginpage" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-500 hover:bg-white mt-4 lg:mt-0">
                                Zaloguj się
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;