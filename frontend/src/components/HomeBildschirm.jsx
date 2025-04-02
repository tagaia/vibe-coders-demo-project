import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function HomeBildschirm() {
  const [servicefall, setServicefall] = useState({
    titel: '',
    beschreibung: '',
    prioritaet: '',
  });
  const [meineServicefaelle, setMeineServicefaelle] = useState([]);
  const [fehler, setFehler] = useState('');
  const [isLadeend, setIsLadeend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeineServicefaelle = async () => {
      try {
        const response = await fetch('http://localhost:8080/servicefall/meine', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Servicefälle');
        }
        const data = await response.json();
        // Sortieren der Servicefälle nach Status
        const sortedData = data.sort((a, b) => {
          const statusOrder = ["Offen", "In Bearbeitung", "Test", "Geschlossen"];
          return statusOrder.indexOf(a.zustand) - statusOrder.indexOf(b.zustand);
        });
        setMeineServicefaelle(sortedData);
      } catch (error) {
        setFehler(error.message);
        console.error('Fehler beim Laden der Servicefälle:', error);
      }
    };
    fetchMeineServicefaelle();
  }, []);

  const handleServicefallErstellen = async (e) => {
    e.preventDefault();
    setIsLadeend(true);
    setFehler('');
    try {
      const response = await fetch(
        'http://localhost:8080/servicefall/erstellen',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(servicefall),
        }
      );
      if (!response.ok) {
        const fehlerDaten = await response.json();
        throw new Error(
          fehlerDaten.detail || 'Servicefall konnte nicht erstellt werden'
        );
      }
      navigate('/servicefall-erfolg');
    } catch (error) {
      setFehler(error.message);
      console.error('Fehler beim Erstellen des Servicefalls:', error);
    } finally {
      setIsLadeend(false);
    }
  };

  return (
    <div className="flex-grow p-8 w-full">
      <h1 className="text-4xl font-bold mb-4 text-red-600">
        Willkommen im Dashboard
      </h1>
      <p className="text-gray-700 mb-8">
        Sie sind erfolgreich angemeldet!
      </p>
      <div className="grid grid-cols-1 gap-8">
        {/* Servicefall erstellen */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Servicefall erstellen
          </h2>
          {fehler && (
            <p className="text-red-200 mb-4 text-center text-sm">{fehler}</p>
          )}
          <form onSubmit={handleServicefallErstellen} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium">Titel:</label>
              <input
                type="text"
                value={servicefall.titel}
                onChange={(e) =>
                  setServicefall({ ...servicefall, titel: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Beschreibung:
              </label>
              <textarea
                value={servicefall.beschreibung}
                onChange={(e) =>
                  setServicefall({
                    ...servicefall,
                    beschreibung: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Priorität:
              </label>
              <select
                value={servicefall.prioritaet}
                onChange={(e) =>
                  setServicefall({
                    ...servicefall,
                    prioritaet: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                required
              >
                <option value="">Bitte auswählen</option>
                <option value="Niedrig">Niedrig</option>
                <option value="Mittel">Mittel</option>
                <option value="Hoch">Hoch</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLadeend}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLadeend
                ? 'Servicefall wird erstellt...'
                : 'Servicefall erstellen'}
            </button>
          </form>
        </div>
        {/* Meine Servicefälle */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Meine Servicefälle
          </h2>
          {meineServicefaelle.length > 0 ? (
            <ul className="space-y-4">
              {meineServicefaelle.map((fall, index) => (
                <li key={index} className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    <Link
                      to={`/servicefall/${fall.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {fall.titel}
                    </Link>
                  </h3>
                  <p className="text-gray-600">Status: {fall.zustand}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Keine Servicefälle vorhanden.</p>
          )}
        </div>
      </div>
    </div>
  );
}