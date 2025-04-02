import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

export default function PasswortAendernBildschirm() {
const [altesPasswort, setAltesPasswort] = useState('');
const [neuesPasswort, setNeuesPasswort] = useState('');
const [fehler, setFehler] = useState('');
const [isLadeend, setIsLadeend] = useState(false);
const navigate = useNavigate();
const auth = useAuth();

const handlePasswortAenderung = async (e) => {
e.preventDefault();
setIsLadeend(true);
setFehler('');

try {
  const response = await fetch('http://localhost:8080/passwort_aendern', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.user.token}`,
    },
    body: JSON.stringify({
      altes_passwort: altesPasswort,
      neues_passwort: neuesPasswort,
    }),
  });

  if (!response.ok) {
    const fehlerDaten = await response.json();
    throw new Error(fehlerDaten.detail || 'Passwortänderung fehlgeschlagen');
  }

  navigate('/');
} catch (error) {
  setFehler(error.message);
  console.error('Fehler bei der Passwortänderung:', error);
} finally {
  setIsLadeend(false);
}

};

return (
<div className="flex-grow flex items-center justify-center">
<div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
<h2 className="text-2xl font-bold mb-6 text-center text-red-600">Passwort ändern</h2>
{fehler && <p className="text-red-200 mb-4 text-center text-sm">{fehler}</p>}
<form onSubmit={handlePasswortAenderung} className="space-y-6">
<div>
<label className="block text-gray-700 font-medium">Aktuelles Passwort:</label>
<input
type="password"
value={altesPasswort}
onChange={(e) => setAltesPasswort(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
required
/>
</div>
<div>
<label className="block text-gray-700 font-medium">Neues Passwort:</label>
<input
type="password"
value={neuesPasswort}
onChange={(e) => setNeuesPasswort(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
required
/>
</div>
<button type="submit" disabled={isLadeend} className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" >
{isLadeend ? 'Passwort wird geändert...' : 'Passwort aktualisieren'}
</button>
</form>
</div>
</div>
);
}