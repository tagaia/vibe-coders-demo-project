import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ServicefallAnsicht() {
  const { id } = useParams();
  const [servicefall, setServicefall] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [fehler, setFehler] = useState('');
  const [isLadeend, setIsLadeend] = useState(false);

  // Servicefall-Daten abrufen
  useEffect(() => {
    const fetchServicefall = async () => {
      try {
        const response = await fetch(`http://localhost:8080/servicefall/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Fehler beim Laden des Servicefalls');
        }
        const data = await response.json();
        setServicefall(data);
      } catch (error) {
        setFehler(error.message);
        console.error('Fehler beim Laden des Servicefalls:', error);
      }
    };
    fetchServicefall();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsLadeend(true);
    setFehler('');
    try {
      const response = await fetch(
        `http://localhost:8080/servicefall/${id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ text: commentText }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || 'Kommentar konnte nicht hinzugefügt werden'
        );
      }
      setCommentText('');
      // Aktualisiere Servicefall-Daten, um neuen Kommentar anzuzeigen
      const updatedResponse = await fetch(
        `http://localhost:8080/servicefall/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (!updatedResponse.ok) {
        throw new Error('Fehler beim Laden des Servicefalls');
      }
      const updatedData = await updatedResponse.json();
      setServicefall(updatedData);
    } catch (error) {
      setFehler(error.message);
      console.error('Fehler beim Hinzufügen des Kommentars:', error);
    } finally {
      setIsLadeend(false);
    }
  };

  const handleZustandChange = async (e) => {
    const newZustand = e.target.value;
    try {
      const response = await fetch(`http://localhost:8080/servicefall/${id}/zustand`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ zustand: newZustand }),
      });
      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren des Zustands');
      }
      const updatedResponse = await fetch(`http://localhost:8080/servicefall/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedData = await updatedResponse.json();
      setServicefall(updatedData);
    } catch (error) {
      setFehler(error.message);
      console.error('Fehler:', error);
    }
  };

  if (!servicefall) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <p>Servicefall wird geladen...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow p-8 w-full">
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            {servicefall.titel}
          </h2>
          <p className="text-gray-700 mb-4">{servicefall.beschreibung}</p>
          <p className="text-gray-600">Priorität: {servicefall.prioritaet}</p>
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">Status:</label>
            <select
              value={servicefall.zustand}
              onChange={handleZustandChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
            >
              <option value="Offen">Offen</option>
              <option value="In Bearbeitung">In Bearbeitung</option>
              <option value="Test">Test</option>
              <option value="Geschlossen">Geschlossen</option>
            </select>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-red-600">Kommentare</h3>
          {servicefall.comments && servicefall.comments.length > 0 ? (
            <ul className="space-y-4">
              {servicefall.comments.map((comment, index) => (
                <li key={index} className="border-b border-gray-200 pb-4">
                  <p className="text-gray-800">{comment.text}</p>
                  <p className="text-gray-600 text-sm">
                    Erstellt am:{' '}
                    {new Date(comment.erstellt_am).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Keine Kommentare vorhanden.</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-red-600">
            Kommentar hinzufügen
          </h3>
          {fehler && (
            <p className="text-red-200 mb-4 text-center text-sm">{fehler}</p>
          )}
          <form onSubmit={handleCommentSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium">
                Kommentar:
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLadeend}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLadeend
                ? 'Kommentar wird hinzugefügt...'
                : 'Kommentar hinzufügen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}