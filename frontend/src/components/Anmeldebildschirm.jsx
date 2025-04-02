import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../App';

export default function Anmeldebildschirm() {
    const [benutzername, setBenutzername] = useState('');
    const [passwort, setPasswort] = useState('');
    const [fehler, setFehler] = useState('');
    const [isLadeend, setIsLadeend] = useState(false);
    const navigate = useNavigate();
    const auth = useAuth();


    const handleAnmelden = async (e) => {
        e.preventDefault();
        setIsLadeend(true);
        setFehler('');

        try {
            const response = await fetch('http://localhost:8080/anmelden', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: benutzername,
                    password: passwort,
                }),
            });

            if (!response.ok) {
                const fehlerDaten = await response.json();
                throw new Error(fehlerDaten.detail || 'Anmeldung fehlgeschlagen');
            }

            const {access_token} = await response.json();

            // Store the token in localStorage
            localStorage.setItem('token', access_token);

            const benutzerResponse = await fetch('http://localhost:8080/benutzer/aktuell', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            if (!benutzerResponse.ok) {
                throw new Error('Benutzerdaten konnten nicht geladen werden');
            }

            const benutzerDaten = await benutzerResponse.json();

            auth.signin(
                {
                    benutzername: benutzerDaten.benutzername,
                    mussPasswortAendern: benutzerDaten.muss_passwort_aendern,
                    token: access_token,
                },
                () => {
                    if (benutzerDaten.muss_passwort_aendern) {
                        navigate('/passwort-aendern');
                    } else {
                        navigate('/');
                    }
                }
            );
        } catch (error) {
            setFehler(error.message);
            console.error('Anmeldefehler:', error);
        } finally {
            setIsLadeend(false);
        }
    };


    return (
        <div className="flex-grow flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-600">Anmeldung</h2>
                {fehler && <p className="text-red-200 mb-4 text-center text-sm">{fehler}</p>}
                <form onSubmit={handleAnmelden} className="space-y-6">
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
                        <label className="block text-gray-700 font-medium">Passwort:</label>
                        <input
                            type="password"
                            value={passwort}
                            onChange={(e) => setPasswort(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                            required
                        />
                    </div>
                    <button type="submit" disabled={isLadeend}
                            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLadeend ? 'Anmeldung läuft...' : 'Anmelden'}
                    </button>
                </form>
                <button
                    onClick={() => navigate('/registrierung')}
                    className="w-full mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                    Registrieren
                </button>
            </div>
        </div>
    );
}