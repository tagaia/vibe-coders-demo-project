import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ServicefallErfolg() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Servicefall erfolgreich erstellt</h1>
        <p className="text-gray-700">Ihr Servicefall wurde erfolgreich erstellt.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
        >
          Zurück zum Dashboard
        </button>
      </div>
    </div>
  );
}