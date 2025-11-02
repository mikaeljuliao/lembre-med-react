// Home.jsx
import { useEffect, useState } from "react";

export default function Home() {
 
  const [nome, setNome] = useState("");
  const [hora, setHora] = useState("");
  const [observacao, setObservacao] = useState("");
  const [dosagem, setDosagem] = useState("")
const [remedios, setRemedios] = useState(() => {
  const remediosSalvos = localStorage.getItem('dadosRemedios');
  return remediosSalvos ? JSON.parse(remediosSalvos) : [];
});

const [historico, setHistorico] = useState(() => {
  const historicoSalvos = localStorage.getItem('historicoMedicamento');
  return historicoSalvos ? JSON.parse(historicoSalvos) : [];
});

  const [medicamentos, setMedicamentos] = useState([]); //medicamentos do json
  const [remedioEmEdicao, setRemedioEmEdicao] = useState(null)
  const [sugestoes, setSugestoes] = useState([])
  
  // novo estado: duração em horas (valor que o usuário digita)
const [duracaoEmHoras, setDuracaoEmHoras] = useState("");

// estado só para visualizar o resultado convertido (milissegundos)
// não inicia contagem ainda — só pra conferir a conversão
const [milissegundosConvertidos, setMilissegundosConvertidos] = useState(0);

// controla o tempo restante
const [tempoRestante, setTempoRestante] = useState(0);

// controla se a contagem está rodando ou não
const [contando, setContando] = useState(false);


// função utilitária: converte horas (número) para milissegundos
function horasParaMilissegundos(horas) {
  // aceita frações (ex: 0.5 = meia hora)
  const horasNumero = Number(horas); 
  if (!Number.isFinite(horasNumero) || horasNumero <= 0) return 0;
  return Math.round(horasNumero * 60 * 60 * 1000); // horas * 60min * 60s * 1000ms
}

// ação: apenas converte e guarda no estado de preview
function converterDuracaoParaMs() {
  const ms = horasParaMilissegundos(duracaoEmHoras);
  setMilissegundosConvertidos(ms);
}

 


  useEffect(() =>{
    localStorage.setItem('dadosRemedios', JSON.stringify(remedios))
    localStorage.setItem('historicoMedicamento', JSON.stringify(historico))
  }, [remedios, historico])



  function iniciarContagem () {
    const ms = horasParaMilissegundos(duracaoEmHoras)
    if (ms <= 0) {
      alert('informe um numero valido acima de 0')
      return
    }
    
  setTempoRestante(ms);
  setContando(true);
  }

useEffect(() => {
  let intervalo;

  if (contando && tempoRestante > 0) {
    intervalo = setInterval(() => {
      setTempoRestante((valorAtual) => {
        if (valorAtual <= 1000) {
          clearInterval(intervalo);
          setContando(false);
          return 0;
        }
        return valorAtual - 1000;
      });
    }, 1000);
  }

  return () => clearInterval(intervalo);
}, [contando, tempoRestante]);



  function formatarTempo(ms) {
   const totalSegundos = Math.floor(ms / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  return `${horas.toString().padStart(2, "0")}:${minutos
    .toString()
    .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
}


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
    ? { ...medicamentoEncontrado, hora, id, dataAdicaoAtual: dataFormatada}
    : { id, nome, hora, dosagem, observacao, dataAdicaoAtual: dataFormatada };

  setHistorico((listaAnterior) => [...listaAnterior, novoMedicamento])  

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
      {/* Formulário de adicionar/editar remédio */}
      <form className="space-y-4" onSubmit={adicionarRemedio}>
        <label htmlFor="nome" className="py-4 text-lg font-bold">
          Nome do Medicamento:
        </label>
        <input
          type="text"
          id="nome"
          placeholder="Nome do remédio"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />

        {/* 🔽 Sugestões de medicamentos */}
        {sugestoes.length > 0 && nome.trim() && (
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

        <label htmlFor="hora" className="py-4 text-lg font-bold">
          Horário:
        </label>
        <input
          type="time"
          id="hora"
          placeholder="A cada quantas horas?"
          value={hora}
          onChange={(e) => {
         const valorDigitado = e.target.value; // pega o que o usuário digitou
         setHora(valorDigitado);               // atualiza o estado 'hora'
         setDuracaoEmHoras(valorDigitado);     // atualiza também 'duracaoEmHoras'
          }}
          className="w-full p-2 border border-gray-300 rounded"
        />






{/* --- Campo: duração em horas (novo) --- */}
<label htmlFor="duracao" className="py-2 font-bold text-lg">Duração (horas)</label>
<input
  id="duracao"
  type="number"
  min="0"
  step="0.25"
  placeholder="Ex: 8 ou 1.5"
  value={duracaoEmHoras}
  onChange={(e) => setDuracaoEmHoras(e.target.value)}
  className="w-full p-2 border border-gray-300 rounded"
/>

<p className="mt-4 font-xl font-bold">
  tempo restante: {tempoRestante > 0 ? formatarTempo(tempoRestante) :  "⏰ Tempo esgotado!"}
</p>



<button
  type="button"
  onClick={iniciarContagem}
  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
>
  Iniciar contagem
</button>


<div className="flex gap-2 mt-2">
  <button 
    type="button"
    onClick={converterDuracaoParaMs}
    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
  >
    Converter (mostrar ms)
  </button>

  <button
    type="button"
    onClick={() => { setDuracaoEmHoras(""); setMilissegundosConvertidos(0); }}
    className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
  >
    Limpar
  </button>
</div>

{/* preview simples */}
<p className="mt-2 text-sm text-gray-600">
  Milissegundos convertidos: <strong>{milissegundosConvertidos}</strong>
</p>














        <label htmlFor="dosagem" className="py-4 font-bold text-lg">
          Dosagem:
        </label>
        <input
          type="text"
          id="dosagem"
          placeholder="EX: 500mg"
          value={dosagem}
          onChange={(e) => setDosagem(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />

        <label htmlFor="observacao" className="py-2 font-bold text-lg">
          Observações:
        </label>
        <textarea
          id="observacao"
          placeholder="Acrescente algum detalhe"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        ></textarea>

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

          {remedio.dataAdicaoAtual && (
            <p className="text-sm text-gray-600">
              📅 Adicionado em: {remedio.dataAdicaoAtual}
            </p>
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

       {/* Histórico de medicamentos */}
      <div className="mt-10 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">
          📜 Histórico de Medicamentos
        </h2>
        {historico.length === 0 ? (
          <p className="text-gray-600">Nenhum medicamento adicionado ainda.</p>
        ) : (
          <ul>
            {historico.map((item) => (
              <li key={item.id} className="border-b border-gray-200 py-2">
                <strong>{item.nome}</strong> — {item.dosagem}
                <br />
                ⏰ {item.hora} | 📅 {item.dataAdicaoAtual}
              </li>
            ))}
          </ul>
        )}
      </div>

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
