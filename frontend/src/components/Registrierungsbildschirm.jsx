import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Registrierungsbildschirm() {
const [benutzername, setBenutzername] = useState('');
const [email, setEmail] = useState('');
const [fehler, setFehler] = useState('');
const [isLadeend, setIsLadeend] = useState(false);
const navigate = useNavigate();

const handleRegistrierung = async (e) => {
e.preventDefault();
setIsLadeend(true);
setFehler('');

try {
  const response = await fetch('http://localhost:8080/registrierung', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      benutzername: benutzername,
      email: email,
    }),
  });

  if (!response.ok) {
    const fehlerDaten = await response.json();
    throw new Error(fehlerDaten.detail || 'Registrierung fehlgeschlagen');
  }

  navigate('/anmeldung');
} catch (error) {
  setFehler(error.message);
  console.error('Registrierungsfehler:', error);
} finally {
  setIsLadeend(false);
}

};

return (
<div className="flex-grow flex items-center justify-center">
<div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
<h2 className="text-2xl font-bold mb-6 text-center text-red-600">Registrierung</h2>
{fehler && <p className="text-red-200 mb-4 text-center text-sm">{fehler}</p>}
<form onSubmit={handleRegistrierung} className="space-y-6">
<div>
<label className="block text-gray-700 font-medium">Benutzername:</label>
<input
type="text"
value={benutzername}
onChange={(e) => setBenutzername(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
required
/>
</div>
<div>
<label className="block text-gray-700 font-medium">E-Mail:</label>
<input
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
required
/>
</div>
<button type="submit" disabled={isLadeend} className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" >
{isLadeend ? 'Registrierung läuft...' : 'Registrieren'}
</button>
</form>
</div>
</div>
);
}