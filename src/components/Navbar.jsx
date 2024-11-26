import react from 'react';
import {Link, useNavigate} from 'react-router-dom';

function Navbar() {
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
                    
                        <a href="/"
                           className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                            Trasa
                        </a>
                        
                        
                        <a href="/searchpage"
                           className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                            Wyszukiwarka
                        </a>
                        
                        <a href="#responsive-header"
                           className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white">
                            Twórca
                        </a>
                    </div>
                    <div>
                        <a href="/loginpage"
                           className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-500 hover:bg-white mt-4 lg:mt-0">Wyloguj</a>
                    </div>
                </div>
            </nav>
        </div>
    )
    }

    export default Navbar;