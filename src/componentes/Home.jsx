// Home.jsx
import { useEffect, useState } from "react";

export default function Home() {
 
  const [nome, setNome] = useState("");
  const [hora, setHora] = useState("");
  const [observacao, setObservacao] = useState("");
  const [dosagem, setDosagem] = useState("")
  const [remedios, setRemedios] = useState(() =>{ //remedios dom usuario
    const remediosSalvos = localStorage.getItem('dadosRemedios') 
    return remediosSalvos ? JSON.parse(remediosSalvos) : []
  });
  const [medicamentos, setMedicamentos] = useState([]); //medicamentos do json
  const [remedioEmEdicao, setRemedioEmEdicao] = useState(null)
  const [sugestoes, setSugestoes] = useState([]);



  useEffect(() =>{
    localStorage.setItem('dadosRemedios', JSON.stringify(remedios))
  }, [remedios])
  useEffect(() => {
  const nomeDigitado = nome.trim(); // nomeLimpo → nomeDigitado: mais intuitivo

  // 🧹 Se o campo estiver vazio, limpa sugestões
  if (!nomeDigitado) {
    setSugestoes([]);
    return;
  }

  // 🧩 Verifica se o nome digitado já é um medicamento completo
  const nomeJaExisteNoBanco = medicamentos.some(
    (medicamento) =>
      medicamento.nome.toLowerCase() === nomeDigitado.toLowerCase()
  );

  if (nomeJaExisteNoBanco) {
    setSugestoes([]);
    return;
  }

  // 🔎 Filtra medicamentos que começam com o nome digitado
  const medicamentosFiltrados = medicamentos.filter((medicamento) =>
    medicamento.nome.toLowerCase().startsWith(nomeDigitado.toLowerCase())
  );

  setSugestoes(medicamentosFiltrados);
}, [nome, medicamentos]);



  useEffect(() => {
    fetch("/medicamentos.json")
      .then((res) => res.json())
      .then((data) => setMedicamentos(data))
      .catch((error) => console.log("Erro ao carregar medicamentos", error));
  }, []);


  // ➕ Adicionar remédio
 // preparar edição: preenche inputs e marca qual id está em edição
function prepararEdicao(remedio) {
  setHora(remedio.hora);
  setNome(remedio.nome);
  setObservacao(remedio.observacao)
  setDosagem(remedio.dosagem)
  setRemedioEmEdicao(remedio.id); // ✅ nome correto da setter
}

// adicionar / salvar (agora cobre tanto adicionar quanto editar)
function adicionarRemedio(event) {
  event.preventDefault();

  if (nome.trim() === "" || hora.trim() === "" || dosagem.trim() === "") return;

  // se estamos editando, vamos atualizar o remédio com esse id
  if (remedioEmEdicao) {
    // encontra se o nome atual do formulário corresponde a um medicamento do JSON
    const medicamentoDoJson = medicamentos.find(
      (m) => m.nome.toLowerCase() === nome.toLowerCase()
    );

    setRemedios((listaAnterior) =>
      listaAnterior.map((remedio) => {
        if (remedio.id !== remedioEmEdicao) return remedio;

        // Se existir no JSON, mescla os dados do JSON (dose, frequência, etc)
        if (medicamentoDoJson) {
          return { ...medicamentoDoJson, id: remedioEmEdicao, hora, dosagem, observacao };
        }

        // Senão, atualiza somente os campos nome/hora, preservando outros campos existentes
        return { ...remedio, nome, hora, dosagem, observacao };
      })
    );

    // limpa o modo edição
    setRemedioEmEdicao(null);
    setNome("");
    setHora("");
    setDosagem("")
     setObservacao("")
    return;
  }

  // se não estivermos em edição: fluxo de adicionar novo remédio
  const medicamentoEncontrado = medicamentos.find(
    (m) => m.nome.toLowerCase() === nome.toLowerCase()
  );

  const id = medicamentoEncontrado ? medicamentoEncontrado.id : Date.now();
  // 🕓 Gera data e hora atual formatada (ex: 24/10/2025 13:45)
const dataAtual = new Date();
const dataFormatada = dataAtual.toLocaleString("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

  const novoMedicamento = medicamentoEncontrado
    ? { ...medicamentoEncontrado, hora, id, dataAdicao: dataFormatada}
    : { id, nome, hora, dosagem, observacao, dataAdicao: dataFormatada };

  setRemedios((listaAnterior) => [...listaAnterior, novoMedicamento]);

  setNome("");
  setHora("");
  setDosagem("")
   setObservacao("")
   
}



  // ❌ Remover remédio
  function removerRemedio(idDoRemedio) {
    setRemedios((listaAnteriorDeRemedios) =>
      listaAnteriorDeRemedios.filter(
        (remedio) => remedio.id !== idDoRemedio
      )
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-600 py-6">
        Lembre de tomar seu remédio
      </h1>

      <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
        <form className="space-y-4" onSubmit={adicionarRemedio}>
          <label htmlFor="nome" className="py-4 text-lg font-bold ">Nome do Medicamento:</label>
          <input
            type="text" id="nome"
            placeholder="Nome do remédio"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* 🔽 Sugestões de medicamentos */}
{(sugestoes.length > 0 && nome.trim()) && (
  <ul className="border border-gray-300 rounded mt-1 bg-white shadow">
    {sugestoes.map((s, index) => (
      <li
        key={index}
        onClick={() => {
          setNome(s.nome);
          setSugestoes([]);
        }}
        className="p-2 cursor-pointer hover:bg-blue-100"
      >
        {s.nome}
      </li>
    ))}
  </ul>
)}



         <label htmlFor="hora"  className="py-4 text-lg font-bold">Horário:</label>
          <input
            type="time"
            placeholder="A cada quantas horas?"
            id="hora"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />


         <label htmlFor="dosagem" className="py-4 font-bold text-lg ">Dosagem:</label>
          <input type="text" id="dosagem" placeholder="EX: 500mg" value={dosagem} 
          onChange={(e) => setDosagem(e.target.value) }
          className="w-full p-2 border border-gray-300 rounded" />
          
          <label htmlFor="observacao" className="py-2 font-bold text-lg ">Observações::</label>
          <textarea id="observacao" placeholder="Acresente algum detalhe" value={observacao}
          onChange={(e) => setObservacao(e.target.value)} className="w-full p-2 border border-gray-300 rounded ">
            
          </textarea>

         <button
  type="submit"
  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
>

  {remedioEmEdicao ? "Salvar Alterações" : "Adicionar"}
</button>

        </form>

        {/* Lista de remédios adicionados pelo usuário */}
        {remedios.map((remedio) => (
          <div
            key={remedio.id}
            className="border bg-green-100 border-green-600 p-4 mt-4 shadow-lg rounded-lg"
          >
            <p className="text-lg font-bold text-blue-600">
              <strong>{remedio.nome}</strong>
            </p>

            <p className="text-gray-800">⏰ Horário escolhido: {remedio.hora}</p>
            {remedio.dataAdicao && (
  <p className="text-sm text-gray-600">📅 Adicionado em: {remedio.dataAdicao}</p>
)}

         <p className="text-lg font-bold text-blue-600">
             Dosagem: {remedio.dosagem}
           </p>

            <p className="text-lg font-bold text-blue-600">
             Observação: {remedio.observacao}
           </p>

       

            {remedio.dose && (
              <p className="text-sm text-gray-600">💊 Dose: {remedio.dose}</p>
            )}
       
    

            {remedio.frequencia && (
              <p className="text-sm text-gray-600">
                🔄 Frequência: {remedio.frequencia}
              </p>

              
            )}
            <button
              onClick={() => removerRemedio(remedio.id)}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Remover
            </button>
         <button
  onClick={() => prepararEdicao(remedio)}
  className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
>
  Editar
</button>


          </div>
        ))}

        {/* Lista de medicamentos vindos do JSON */}
        <div className="mt-10">
          <ul>
            {medicamentos.map((medicamento) => (
              <li key={medicamento.id}>
                <strong>
                  {medicamento.nome} - {medicamento.dose}
                </strong>
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
