import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Auth = () => {
    const navigate = useNavigate()
    const [name, setName] = useState('');
    const [contact, setcontact] = useState('')
    const [usertype, setuser] = useState('')

    const signup = async () => {
        try {
        const response = await axios.post('http://localhost:5000/auth/signup', {
            name,
            contact,
            usertype
        })
        console.log(response.data.user)
        navigate('/home', {state:{isloggedin:true}})
        } catch (err) {
        console.log(err.message)
        }
    }

    const login = async() => {
        try {
        const response = await axios.post('http://localhost:5000/auth/login', {
            name,
            contact,
            usertype
        })
        console.log(response.data.user)
        navigate('/home', {state:{isloggedin:true}})
        } catch (err) {
        console.log(err.message)
        }
    }

    return (
        <div className="App">
        <div>
            <input type='text' value={name} onChange={(e) => setName(e.target.value)}/>
            <input type='number' value={contact} onChange={(e) => setcontact(e.target.value)}/>
            <select value={usertype} onChange={(e) => setuser(e.target.value)}>
                <option>--Choose role--</option>
                <option>Donor</option>
                <option>Patient</option>
            </select>
            <button onClick={signup}>Signup</button>
            <button onClick={login}>Login</button>
            <button onClick={() => {navigate('/adlogin')}}>Go to admin login</button>
            <button onClick={() => {navigate('/superadlogin')}}>Go to superadmin login</button>
        </div>
        </div>
    );
}

export default Auth