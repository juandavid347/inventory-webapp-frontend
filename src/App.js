import './App.css';
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Items from './pages/Items'
import Contacts from './pages/Contacts'
import Orders from './pages/Orders'
import { AuthContext } from './helpers/AuthContext'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function App() {

    const backendURL = "https://inventory-webapp-backend-production.up.railway.app";
    const navigate = useNavigate();
    const [authState, setAuthState] = useState({
        username: "",
        id: 0,
        status: false,
    });
    
    useEffect(() => {
        axios.get(`${backendURL}/login/auth`, { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
            if (response.data.error) {
                setAuthState({ ...authState, status: false });
            } else {
                setAuthState({
                    username: response.data.username,
                    id: response.data.id,
                    status: true,
                });
            }
        });
    }, []);

    const logout = () => {
        localStorage.removeItem("accessToken");
        setAuthState({ ...authState, status: false });
        navigate("/login");
    }

    return (
        <div>
            <AuthContext.Provider value={{ authState, setAuthState }}>
                    <div className="flex justify-between gap-2 bg-slate-50">
                        <div className="flex justify-start gap-2">
                            <Link to="/" className="hover:bg-slate-200 active:bg-slate-300 p-2" >Home</Link>
                            <Link to="/items" className="hover:bg-slate-200 active:bg-slate-300 p-2" >Items</Link>
                            <Link to="/contacts" className="hover:bg-slate-200 active:bg-slate-300 p-2" >Contacts</Link>
                            <Link to="/orders" className="hover:bg-slate-200 active:bg-slate-300 p-2" >Orders</Link>
                        </div>
                        <div className="flex justify-end gap-2">
                            {!authState.status ? (
                                <>
                                    <Link to="/login" className="hover:bg-slate-200 active:bg-slate-300 p-2" >Log In</Link>
                                    <Link to="/register" className="hover:bg-slate-200 active:bg-slate-300 p-2" >Register</Link>
                                </>
                            ) : (
                                <>
                                    <div className="max-h-11 max-w-28 overflow-auto font-sans text-sm p-1" >Logged In as: <br /> { authState.username } <br /> Welcome!</div>
                                    <button onClick={logout} className="hover:bg-slate-200 active:bg-slate-300 p-2" >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <Routes>
                        <Route path="/" exact element={<Home />} />
                        <Route path="/login" exact element={<Login />} />
                        <Route path="/register" exact element={<Register />} />
                        <Route path="/items" exact element={<Items />} />
                        <Route path="/contacts" exact element={<Contacts />} />
                        <Route path="/orders" exact element={<Orders />} />
                    </Routes>
            </AuthContext.Provider>
        </div>
    );
}

export default App;
