import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Suchbildschirm() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  useEffect(() => {
    const searchServicefaelle = async () => {
      if (!searchTerm.trim() && selectedStatuses.length === 0 && selectedPriorities.length === 0) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams();
        if (searchTerm.trim()) {
          queryParams.append('q', searchTerm);
        }
        selectedStatuses.forEach(status => {
          queryParams.append('status', status);
        });
        selectedPriorities.forEach(priority => {
          queryParams.append('priority', priority);
        });
        
        const response = await fetch(
          `http://localhost:8080/servicefall/suche?${queryParams.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error('Suche fehlgeschlagen');
        }
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchServicefaelle();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedStatuses, selectedPriorities]);

  return (
    <div className="flex-grow p-8 w-full">
      <h1 className="text-4xl font-bold mb-4 text-red-600">Servicefall Suche</h1>
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Suchbegriff eingeben..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Status:</label>
            <select
              multiple
              value={selectedStatuses}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedStatuses(options);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            >
              {['Offen', 'In Bearbeitung', 'Test', 'Geschlossen'].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Priorität:</label>
            <select
              multiple
              value={selectedPriorities}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedPriorities(options);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            >
              {['Niedrig', 'Mittel', 'Hoch'].map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {isLoading && <p className="text-gray-600">Suche läuft...</p>}
      {error && <p className="text-red-600">{error}</p>}
      
      <div className="space-y-4">
        {results.map((fall) => (
          <div key={fall.id} className="bg-white p-4 rounded-lg shadow-md">
            <Link
              to={`/servicefall/${fall.id}`}
              className="text-lg font-semibold text-red-600 hover:underline"
            >
              {fall.titel}
            </Link>
            <p className="text-gray-600">Status: {fall.zustand}</p>
            <p className="text-gray-600">Priorität: {fall.prioritaet}</p>
          </div>
        ))}
        {!isLoading && results.length === 0 && (searchTerm.trim() || selectedStatuses.length > 0 || selectedPriorities.length > 0) && (
          <p className="text-gray-600">Keine Ergebnisse gefunden</p>
        )}
      </div>
    </div>
  );
}