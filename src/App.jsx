import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./ProtectedRoute"; 
import LoginPage from "./pages/LoginPage";
import SignPage from "./pages/SignPage";
import SearchPage from "./pages/SearchPage";
import UsersPage from "./pages/UsersPage";
import AddRoute from "./pages/AddRoute";
import ProfilePage from "./pages/ProfilePage";
import CreatorPage from "./pages/CreatorPage";
import RoutingPage from "./pages/RoutingPage";
import Home from "./pages/Home";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="loginpage" element={<LoginPage />} />
          <Route path="signpage" element={<SignPage />} />
          <Route
            path="/userPage"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="searchpage" element={<SearchPage />} />
          <Route
            path="/addRoute"
            element={
              <ProtectedRoute>
                <AddRoute />
              </ProtectedRoute>
            }
          />
          <Route path="profilePage" element={<ProfilePage />} />
          <Route path="creatorPage" element={<CreatorPage />} />
          <Route path="routingPage" element={<RoutingPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;