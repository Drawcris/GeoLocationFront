import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignPage from "./pages/SignPage";
import SearchPage from "./pages/SearchPage";
import UsersPage from "./pages/UsersPage";
import AddRoute from "./pages/AddRoute";
import ProfilePage from "./pages/ProfilePage";
import CreatorPage from "./pages/CreatorPage";

import "./App.css";


function App() {
  

  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="loginpage" element={<LoginPage />} />    
      <Route path="signpage" element={<SignPage />} />  
      <Route path="userPage" element={<UsersPage />} />
      <Route path="searchpage" element={<SearchPage />} /> 
      <Route path="addRoute" element={<AddRoute />} />
      <Route path="profilePage" element={<ProfilePage />} />
      <Route path="creatorPage" element={<CreatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
