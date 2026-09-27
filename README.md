# LembreMed

Aplicação web para organização de medicamentos e acompanhamento de cuidados de saúde, desenvolvida com foco em **simplicidade, acessibilidade e usabilidade**.

O LembreMed permite cadastrar medicamentos, configurar lembretes de uso, acompanhar a próxima medicação e registrar medidas de saúde em uma interface pensada para reduzir a complexidade durante o uso.

## Funcionalidades

- Cadastro e gerenciamento de medicamentos e tratamentos
- Lembretes por horário, intervalo ou uso conforme necessidade
- Visualização da próxima medicação e confirmação de doses
- Autocomplete para facilitar o cadastro de medicamentos
- Registro de pressão arterial, temperatura, glicemia e peso
- Orientações sobre sintomas e cuidados de saúde
- Contatos de emergência com acionamento direto por telefone
- Interface responsiva para desktop e dispositivos móveis
- Persistência local dos dados no navegador

## Tecnologias

- **Next.js 16**
- **React 19**
- **Tailwind CSS 4**
- **JavaScript (ES6+)**
- **Lucide React**
- **Vitest**
- **ESLint**

## Arquitetura

O projeto utiliza o **Next.js App Router**, com componentes React organizados por domínio e uma camada de utilitários responsável pelas regras de negócio, persistência e lógica dos lembretes.

A aplicação foi estruturada para manter separadas:

- Interface e componentes
- Regras de negócio
- Persistência de dados
- Lógica temporal dos lembretes
- Conteúdo de saúde

## Qualidade e boas práticas

- Componentização por responsabilidade
- Layout responsivo e mobile-first
- Acessibilidade e áreas de toque adequadas
- Validação com ESLint
- Testes automatizados com Vitest
- Código sem dependências desnecessárias
- Persistência local sem necessidade de backend para o uso atual

## Executar localmente

```bash
npm install
npm run dev
```

## Objetivo do projeto

O LembreMed é um **projeto de portfólio e laboratório de desenvolvimento**, utilizado para aplicar conceitos de desenvolvimento frontend, arquitetura de componentes, regras de negócio, responsividade, acessibilidade e qualidade de código em uma aplicação completa.

