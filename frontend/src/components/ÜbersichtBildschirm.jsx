import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const statusOrder = ['Offen', 'In Bearbeitung', 'Test', 'Geschlossen'];

const ServicefallCard = ({ servicefall }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'servicefall',
    item: { id: servicefall.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-white p-4 mb-4 rounded-lg shadow-md cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <h3 className="font-semibold text-gray-800">{servicefall.titel}</h3>
      <p className="text-gray-600">Priorität: {servicefall.prioritaet}</p>
    </div>
  );
};

const StatusColumn = ({ status, servicefaelle, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'servicefall',
    drop: (item) => onDrop(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`flex-1 bg-gray-50 p-4 rounded-lg min-w-[300px] ${
        isOver ? 'bg-gray-200' : ''
      }`}
    >
      <h2 className="text-xl font-bold mb-4 text-red-600">{status}</h2>
      {servicefaelle.map((servicefall) => (
        <ServicefallCard key={servicefall.id} servicefall={servicefall} />
      ))}
    </div>
  );
};

export default function ÜbersichtBildschirm() {
  const [servicefaelle, setServicefaelle] = useState([]);
  const [fehler, setFehler] = useState('');

  const fetchServicefaelle = async () => {
    try {
      const response = await fetch('http://localhost:8080/servicefall/alle', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Fehler beim Laden der Servicefälle');
      const data = await response.json();
      setServicefaelle(data);
    } catch (error) {
      setFehler(error.message);
    }
  };

  useEffect(() => {
    fetchServicefaelle();
  }, []);

  const handleStatusChange = async (servicefallId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:8080/servicefall/${servicefallId}/zustand`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ zustand: newStatus }),
        }
      );
      if (!response.ok) throw new Error('Statusänderung fehlgeschlagen');
      await fetchServicefaelle();
    } catch (error) {
      setFehler(error.message);
    }
  };

  const groupedServicefaelle = servicefaelle.reduce((acc, sf) => {
    acc[sf.zustand] = [...(acc[sf.zustand] || []), sf];
    return acc;
  }, {});

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-grow p-8 w-full">
        <h1 className="text-4xl font-bold mb-8 text-red-600">Übersicht</h1>
        {fehler && <p className="text-red-600 mb-4">{fehler}</p>}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusOrder.map((status) => (
            <StatusColumn
              key={status}
              status={status}
              servicefaelle={groupedServicefaelle[status] || []}
              onDrop={handleStatusChange}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}