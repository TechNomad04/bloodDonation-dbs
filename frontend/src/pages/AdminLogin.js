import axios from "axios"
import { useState } from "react"

const AdminLogin = () => {
    const [name, setName] = useState('')
    const [city, setcity] = useState('')

    const login = async () => {
        try {
            const response = await axios.post('http://localhost:5000/auth/adlogin', {
                name,
                city
            })
            console.log(response.data.bank)
        } catch (err) {
            console.log(err.message)
        }
    }
    return(
        <div>
            <input type="text" value={name} onChange={e=>setName(e.target.value)}/>
            <input type="text" value={city} onChange={e=>setcity(e.target.value)}/>
            <button onClick={login}>Login</button>
        </div>
    )
}

export default AdminLogin