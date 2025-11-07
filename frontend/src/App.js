import './App.css';
import axios from 'axios'
import { useState } from 'react';

function App() {
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
      console.log(response.user)
    } catch (err) {
      console.log(err.message)
    }
  }

  return (
    <div className="App">
      <input type='text' value={name} onChange={(e) => setName(e.target.value)}/>
      <input type='number' value={contact} onChange={(e) => setcontact(e.target.value)}/>
      <select value={usertype} onChange={(e) => setuser(e.target.value)}>
        <option>Donor</option>
        <option>Patient</option>
      </select>
      <button onClick={signup}>Signup</button>
    </div>
  );
}

export default App;
