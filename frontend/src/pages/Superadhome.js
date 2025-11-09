import axios from "axios"
import { useState } from "react"

const Superadhome = () => {
    const [name, setName] = useState('')
    const [addressline1, setaddressline1] = useState('')
    const [addressline2, setaddressline2] = useState('')
    const [pincode, setpincode] = useState('')
    const [city, setcity] = useState('')
    const [state, setstate] = useState('')

    const addbank = async() => {
        try {
            const response = await axios.post('http://localhost:5000/bank/addbank', {
                name,
                addressline1,
                addressline2,
                pincode,
                city,
                state
            })
            console.log(response.message.bank)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div>
            <input type="text" value={name} onChange={e=>setName(e.target.value)}/>
            <input type="text" value={addressline1} onChange={e=>setaddressline1(e.target.value)}/>
            <input type="text" value={addressline2} onChange={e=>setaddressline2(e.target.value)}/>
            <input type="text" value={pincode} onChange={e=>setpincode(e.target.value)}/>
            <input type="text" value={city} onChange={e=>setcity(e.target.value)}/>
            <input type="Number" value={state} onChange={e=>setstate(e.target.value)}/>
            <button onClick={addbank}>Add a blood bank</button>
        </div>
    )
}

export default Superadhome