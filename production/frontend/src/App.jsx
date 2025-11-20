import { Routes, Route } from "react-router-dom";
import Home from "./views/user/dashboard.jsx";
import Login from "./views/auth/login.jsx";
import Register from "./views/auth/register.jsx"
import Dashboard from "./views/user/dashboard.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
