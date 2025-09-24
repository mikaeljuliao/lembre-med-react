import React from 'react'


import { useState } from "react";

export default function Home() {
  const [remedios, setRemedios] = useState([]); // lista
  const [nome, setNome] = useState("");
  const [hora, setHora] = useState("");

  function handleSubmit(e) {
    e.preventDefault(); // impede recarregar
    if (!nome || !hora) return; // não adiciona vazio

    const novo = { nome, hora };
    setRemedios([...remedios, novo]); // adiciona no array

    // limpa campos
    setNome("");
    setHora("");
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-600 py-6">
        Lembre de tomar seu remédio
      </h1>

      <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome do remédio"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />

          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}


