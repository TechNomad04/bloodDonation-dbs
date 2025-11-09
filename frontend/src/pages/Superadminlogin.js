import axios from "axios"
import { use, useState } from "react"

const Superadminlog = () => {
    const [name, setname] = useState('')
    const [email, setemail] = useState('')
    const [loggedin, setloggedin] = useState(false)

    const login = async() => {
        try {
            const response = await axios.post('http://localhost:5000/auth/superadlog', {
                name,
                email
            })
            setloggedin(true)
            console.log(response.data.user)
            Navigate('/superadhome', {state: {loggedin}})
        } catch (err) {
            console.log(err.message)
        }
    }

    return (
        <div>
            <input type="text" value={name} onChange={e=>setname(e.target.value)}/>
            <input type="text" value={email} onChange={e=>setemail(e.target.value)}/>
            <button onClick={login}>Log in</button>
        </div>
    )
}

export default Superadminlog