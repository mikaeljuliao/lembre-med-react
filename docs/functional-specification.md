# LembreMed — Especificação Funcional

**Versão:** 1.0  
**Status:** Documento de referência para desenvolvimento

## 1. Objetivo e escopo

O LembreMed é uma aplicação para auxiliar na organização do uso de medicamentos e no acompanhamento de medidas de saúde.

A aplicação foi projetada para atender pessoas que precisam de apoio para organizar seus medicamentos e cuidados. O público-alvo principal são **idosos com dificuldade de uso de tecnologia**, portanto simplicidade, clareza, acessibilidade e previsibilidade são requisitos funcionais do produto.

O LembreMed organiza tratamentos, gera doses previstas, permite registrar o que aconteceu e mantém históricos separados para medicamentos e medidas de saúde.

A aplicação não substitui prescrição, diagnóstico ou orientação de profissionais de saúde.

## 2. Modelo conceitual

O domínio do LembreMed é organizado nos seguintes conceitos:

| Conceito | Responsabilidade |
|---|---|
| **Medicamento** | Identifica o produto utilizado. |
| **Tratamento** | Define como, quando e durante quanto tempo o medicamento deve ser utilizado. |
| **Dose prevista** | Representa uma ocorrência programada de um tratamento. |
| **Evento de dose** | Representa o que realmente aconteceu com uma dose prevista. |
| **Histórico de medicamentos** | Reúne os eventos de doses registrados e permite acompanhar a utilização e a adesão. |
| **Medida de saúde** | Registro independente de informações como pressão, glicemia, temperatura e peso. |

A distinção fundamental do domínio é:

> **Dose prevista não significa dose realizada.**

Uma ocorrência programada representa o que deveria acontecer de acordo com o tratamento. O evento de dose representa o que o usuário informou que aconteceu.

## 3. Glossário

### Medicamento

Produto utilizado pelo usuário, identificado por informações como nome, princípio ativo, concentração, apresentação e via de administração.

### Tratamento

Configuração que determina como um medicamento será utilizado, incluindo dosagem, frequência, horários e período.

### Dose prevista

Ocorrência gerada a partir da programação de um tratamento.

### Evento de dose

Registro do acontecimento relacionado a uma dose prevista.

### Dose tomada

Dose que o usuário informou ter realizado.

### Dose pulada

Dose que o usuário informou não ter realizado.

### Dose pendente

Dose prevista para a qual ainda não existe um registro conclusivo.

### Histórico

Conjunto de eventos registrados anteriormente.

### Adesão

Indicador baseado nos eventos de utilização registrados, considerando somente ocorrências que possam ser avaliadas.

## 4. Cadastro de medicamento

O medicamento representa o produto utilizado e pode conter:

- Nome;
- Princípio ativo;
- Concentração;
- Apresentação;
- Via de administração;
- Outras informações necessárias à identificação.

O cadastro do medicamento não determina sozinho quando ele deve ser utilizado. Essa responsabilidade pertence ao tratamento.

## 5. Tratamento e programação

Um tratamento define:

- Medicamento;
- Dosagem;
- Quantidade;
- Unidade da dose;
- Frequência;
- Horários;
- Data de início;
- Data de término;
- Orientações;
- Condição de uso.

### 5.1 Horários programados

O usuário define horários específicos.

Exemplo:

```
08:00
14:00
20:00
```

Cada horário gera uma dose prevista por dia enquanto o tratamento estiver ativo.

### 5.2 A cada X horas

O usuário define um horário inicial e um intervalo.

Exemplo:

```
Início: 08:00
Intervalo: 4 horas
```

A programação gera ocorrências conforme o intervalo definido e o período do tratamento.

O sistema não deve interpretar, alterar ou criar uma prescrição. Ele apenas executa a programação informada pelo usuário.

### 5.3 Se necessário

Medicamentos configurados como "se necessário" não geram doses previstas automaticamente.

O usuário registra a utilização quando ela ocorre.

## 6. Dose prevista e estados

Uma dose prevista representa o que deveria acontecer segundo a programação do tratamento.

Estados funcionais principais:

- **Pendente:** ainda não existe registro conclusivo.
- **Tomada:** o usuário confirmou a realização.
- **Pulada:** o usuário informou que não realizou a dose.

### 6.1 Dose perdida

Uma dose **não é marcada automaticamente como perdida apenas porque o horário passou**.

O sistema exige uma ação explícita do usuário para registrar que a dose não foi realizada.

Isso evita transformar uma ausência de interação em uma conclusão sobre o comportamento do usuário.

## 7. Registro de eventos

### 7.1 Dose tomada

Ao confirmar uma dose como tomada, o sistema deve:

1. Registrar o estado como tomada;
2. Registrar o horário real da tomada;
3. Preservar o horário originalmente previsto;
4. Manter a programação original do tratamento.

### 7.2 Tomada com atraso

Uma dose tomada após o horário previsto deve preservar os dois momentos.

Exemplo:

```
Prevista: 08:00
Tomada:   08:17
```

O atraso é uma informação do histórico. Ele **não altera automaticamente as próximas doses**.

Exemplo:

```
08:00 — prevista e tomada às 08:17
12:00 — próxima dose prevista
```

### 7.3 Dose pulada

Quando o usuário decide não realizar uma dose, ela recebe o registro correspondente e permanece disponível no histórico.

O sistema pode registrar um motivo quando essa informação fizer parte do fluxo.

### 7.4 Adiamento

Adiar um lembrete representa somente uma alteração temporária do momento da notificação.

O adiamento não:

- registra a dose como tomada;
- cria uma nova dose;
- duplica a ocorrência;
- altera a programação original do tratamento.

## 8. Histórico de medicamentos

O histórico de medicamentos fica **dentro da seção Remédios**.

Ele representa o uso efetivamente registrado, e não simplesmente a programação futura.

Cada evento deve preservar, quando aplicável:

- Medicamento;
- Dose;
- Estado;
- Horário previsto;
- Horário real;
- Motivo ou observação.

Exemplo:

```
28 de setembro

08:17
Losartana · 50 mg
Tomada
Prevista para 08:00

14:05
Losartana · 50 mg
Tomada
Prevista para 14:00

20:00
Losartana · 50 mg
Pulada
```

### 8.1 Encerramento do tratamento

Encerrar um tratamento interrompe a geração de novas doses, mas não apaga os eventos históricos relacionados.

### 8.2 Alteração do tratamento

Alterações futuras não devem reescrever acontecimentos passados.

Exemplo:

```
Programação anterior:
08:00 — tomada às 08:12

Nova programação:
09:00
```

O histórico continua registrando o evento ocorrido às 08:12. A nova programação vale para ocorrências futuras.

## 9. Adesão

A adesão deve ser calculada a partir dos eventos de doses, e não simplesmente da quantidade de doses previstas.

Não entram no cálculo:

- Doses futuras;
- Doses que ainda estão pendentes e não podem ser avaliadas.

Uma regra inicial para o cálculo é:

```
Adesão =
doses tomadas /
(doses tomadas + doses explicitamente não realizadas)
× 100
```

A implementação deve manter essa regra alinhada aos estados efetivamente utilizados pelo domínio.

## 10. Responsabilidade das telas

### Início

Responsável pelo acompanhamento do dia.

Deve apresentar:

- Próxima dose;
- Horário;
- Estado das doses do dia;
- Ações para registrar o que aconteceu;
- Situação quando não houver doses previstas.

Fluxo:

```
Programação
    ↓
Dose prevista
    ↓
Acompanhamento do dia
    ↓
Ação do usuário
```

### Remédios

Responsável pelo gerenciamento dos medicamentos e tratamentos.

Deve permitir:

- Cadastrar medicamentos;
- Consultar medicamentos;
- Editar medicamentos e tratamentos;
- Visualizar a programação;
- Encerrar tratamentos;
- Acessar o histórico de medicamentos;
- Consultar informações relacionadas à adesão.

Fluxo:

```
Medicamento
    ↓
Tratamento
    ↓
Programação
    ↓
Histórico
```

### Cuidados

Responsável pelo acompanhamento complementar da saúde.

Contém:

- Orientações;
- Registro de pressão arterial;
- Registro de glicemia;
- Registro de temperatura;
- Registro de peso;
- Contatos de emergência;
- Histórico das medidas de saúde.

O histórico de medidas de saúde é independente do histórico de medicamentos.

### Como usar

Responsável por explicar o funcionamento da aplicação de forma simples e direta.

## 11. Regras de negócio

### RN-001 — Dose prevista

Toda dose prevista deve estar vinculada a um tratamento.

### RN-002 — Dose tomada

Ao registrar uma dose como tomada, o sistema deve armazenar o horário real da tomada e preservar o horário previsto.

### RN-003 — Tomada com atraso

Registrar uma dose após o horário previsto não altera automaticamente a programação das doses seguintes.

### RN-004 — Dose não realizada

Uma dose não deve ser marcada automaticamente como perdida apenas porque seu horário passou.

### RN-005 — Histórico

Eventos registrados devem permanecer no histórico mesmo quando o tratamento relacionado for encerrado.

### RN-006 — Alteração de tratamento

Alterações na programação não devem modificar eventos históricos já registrados.

### RN-007 — Uso conforme necessário

Medicamentos configurados como "se necessário" não devem gerar doses previstas automaticamente.

### RN-008 — Adiamento

Adiar um lembrete não deve criar uma nova dose nem registrar a dose como tomada.

### RN-009 — Doses futuras

Doses futuras não devem ser contabilizadas como eventos realizados ou como parte da adesão já avaliada.

### RN-010 — Separação dos históricos

O histórico de medicamentos e o histórico de medidas de saúde são domínios distintos e devem permanecer separados na interface e no modelo funcional.

## 12. Fluxos principais

### Registrar uma dose tomada

```
Dose prevista
      ↓
Usuário recebe o lembrete
      ↓
Usuário confirma "Tomada"
      ↓
Sistema registra o horário real
      ↓
Evento é preservado no histórico
```

### Registrar uma dose pulada

```
Dose prevista
      ↓
Usuário escolhe "Pular"
      ↓
Sistema registra a ocorrência
      ↓
Evento é preservado no histórico
```

### Encerrar tratamento

```
Tratamento ativo
      ↓
Usuário encerra tratamento
      ↓
Novas doses deixam de ser previstas
      ↓
Eventos anteriores permanecem no histórico
```

## 13. Critérios de aceite

### RN-003 — Tomada com atraso

- [ ] O usuário consegue registrar uma dose após o horário previsto.
- [ ] O horário real é armazenado.
- [ ] O horário originalmente previsto permanece disponível.
- [ ] A próxima dose mantém o horário originalmente programado.
- [ ] O registro aparece no histórico.

### RN-004 — Dose não realizada

- [ ] Uma dose não muda automaticamente para perdida quando o horário passa.
- [ ] O usuário possui uma ação explícita para registrar que não realizou a dose.
- [ ] O evento registrado permanece disponível no histórico.

### RN-005 — Histórico

- [ ] Eventos registrados permanecem disponíveis após o encerramento do tratamento.
- [ ] O histórico diferencia programação e acontecimento real.

### RN-007 — Uso conforme necessário

- [ ] Medicamentos "se necessário" não geram doses automáticas.
- [ ] O usuário consegue registrar a utilização quando ela ocorre.

## 14. Princípios funcionais

As decisões do produto devem preservar os seguintes princípios:

1. **Simplicidade:** o usuário deve conseguir entender o que precisa fazer sem conhecimento técnico.
2. **Previsibilidade:** uma ação do usuário deve produzir um resultado claro e consistente.
3. **Separação entre planejamento e realidade:** programação e eventos realizados não devem ser tratados como a mesma informação.
4. **Preservação do histórico:** acontecimentos passados não devem ser reescritos por alterações futuras.
5. **Acessibilidade:** textos, ações, estados e navegação devem ser compreensíveis para pessoas com diferentes níveis de familiaridade digital.
6. **Não inferência:** a aplicação não deve concluir que uma dose foi tomada ou não realizada sem um registro correspondente.
7. **Simplicidade antes de complexidade:** novas regras e funcionalidades devem ser introduzidas somente quando resolverem uma necessidade real do usuário.
