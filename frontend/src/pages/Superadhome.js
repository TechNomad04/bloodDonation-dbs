import axios from "axios"
import { useEffect, useState } from "react"

const Superadhome = () => {
    const [name, setName] = useState('')
    const [addressline1, setaddressline1] = useState('')
    const [addressline2, setaddressline2] = useState('')
    const [pincode, setpincode] = useState('')
    const [city, setcity] = useState('')
    const [state, setstate] = useState('')
    const [loading, setloading] = useState(true)
    const [banks, setbanks] = useState([])

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
            console.log(response.data.bank)
            await fetchbanks()
        } catch (err) {
            console.log(err)
        }
    }

    const fetchbanks = async() => {
        try {
            const response = await axios.get('http://localhost:5000/bank/fetchbanks')
            setbanks(response.data.banks)
            console.log(response.data.banks)
        } catch (err) {
            console.log(err.message)
        } finally {
            setloading(false)
        }
    }

    useEffect(() => {
        fetchbanks()
    }, [])

    return (
        <div>
            <input type="text" value={name} onChange={e=>setName(e.target.value)}/>
            <input type="text" value={addressline1} onChange={e=>setaddressline1(e.target.value)}/>
            <input type="text" value={addressline2} onChange={e=>setaddressline2(e.target.value)}/>
            <input type="text" value={city} onChange={e=>setcity(e.target.value)}/>
            <input type="text" value={state} onChange={e=>setstate(e.target.value)}/>
            <input type="Number" value={pincode} onChange={e=>setpincode(e.target.value)}/>
            <button onClick={addbank}>Add a blood bank</button>
            <div>Blood Banks</div>
            {banks.map((bank)=> (
                <div>
                    <div>{bank.name}</div>
                    <div>{bank.city}</div>
                    <div>{bank.state}</div>
                </div>
            ))}
        </div>
    )
}

export default Superadhome