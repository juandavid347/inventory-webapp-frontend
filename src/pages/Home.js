import React from 'react'
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

function Home() {

    const backendURL = "https://inventory-webapp-backend-production.up.railway.app";
    const navigate = useNavigate();
    const [listOfUsers, setListOfUsers] = useState([]);
    
    useEffect(() => {
        axios.get(`${backendURL}/users`, { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
            if (response.data.error) navigate("/login");
            else setListOfUsers(response.data);
        })
    }, []);
    
    const listUsers = listOfUsers.map((value, key) => 
        <tr key={key}>
            <td class="hover:bg-teal-200 rounded-md">{value.username}</td>
            <td class="hover:bg-teal-200 rounded-md">{value.email}</td>
        </tr>
    );
    
    return (
        <div class="mx-auto flex items-center max-w-2xl bg-cyan-100 p-1 rounded-xl shadow-lg outline outline-black/5">
            <table class="table w-full ...">
                <thead>
                    <tr>
                        <th class="hover:bg-teal-200 rounded-md">User</th>
                        <th class="hover:bg-teal-200 rounded-md">Email</th>
                    </tr>
                </thead>
                <tbody>
                    {listUsers}
                </tbody>
            </table>
        </div>
    )
}

export default Home
