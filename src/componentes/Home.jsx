

// Home.jsx
import { useEffect, useState } from "react";

export default function Home() {
  // estados para controlar inputs
  const [nome, setNome] = useState("");
  const [hora, setHora] = useState("");

  const [remedios, setRemedios] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);

  useEffect(() => {
    // Busca o arquivo JSON que deve estar dentro da pasta "public"
    fetch("/medicamentos.json")
      .then((res) => res.json())
      .then((data) => setMedicamentos(data))
      .catch((error) =>
        console.log("medicamentos não puderam ser carregados", error)
      );
  }, []);

  function AdicionarRemedio(event) {
    event.preventDefault();

    if (nome.trim() !== "" && hora.trim() !== "") {
      const novoMedicamento = { nome, hora };

      setRemedios([...remedios, novoMedicamento]);

      setNome("");
      setHora("");
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-600 py-6">
        Lembre de tomar seu remédio
      </h1>

      <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
        <form className="space-y-4" onSubmit={AdicionarRemedio}>
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

        {/* Lista de remédios adicionados pelo usuário */}
        {remedios.map((remedio, index) => (
          <div key={index}>
            <p>
              {remedio.nome} - {remedio.hora}
            </p>
          </div>
        ))}

        {/* Lista de medicamentos vindos do JSON */}
        <div>
          <ul>
            {medicamentos.map((medicamento) => (
              <li key={medicamento.id}>
                <strong>
                  {medicamento.nome} - {medicamento.dose}
                </strong>{" "}
                <br />
                horário: {medicamento.horario} - frequência:{" "}
                {medicamento.frequencia}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

