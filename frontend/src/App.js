import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import Superadminlog from "./pages/Superadminlogin";

function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Auth/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/adlogin" element={<AdminLogin/>}/>
        <Route path="/superadlogin" element={<Superadminlog/>}/>
      </Routes>
    </Router>
  )
}

export default App;
