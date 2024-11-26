import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

function FormSign() {

    return (
        <div className="flex flex-col justify-center items-center">
          <p className='font-medium mt-20'>Panda Express</p>  
          <img className="object-center inline w-40 h-40 border rounded-xl " src="panda.jpg" alt="Witaj"/>
    
          <h1 className="text-5xl mt-5">Utwórz konto</h1>
          <p className="mt-4">Podaj email oraz hasło aby utworzyć konto</p>
    
          <form className="mt-10" >
            <input
              type="email"
              placeholder="Imie@example.com"
              className="input bg-slate-300 rounded-xl text-center h-10 w-80 mt-4"
            />
            <p className="text-slate-600">Podaj swój email</p>
            <div className="mt-4"></div>
            <input
              type="password"
              placeholder="ExamplePassword"
              className="input bg-slate-300 rounded-xl text-center h-10 w-80"
            />
            <p className="text-slate-600">Podaj swoje hasło</p>
    
            <input
              type="userName"
              placeholder="ExampleUserName"
              className="input bg-slate-300 rounded-xl text-center h-10 w-80"
            />
            <p className="text-slate-600">Podaj swoją nazwe</p>
    
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