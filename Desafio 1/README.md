# 🧾 PRD – Aplicativo de Organização de Finanças Pessoais com Chat

## Contexto

Quero desenvolver um aplicativo de organização financeira pessoal que funcione por meio de conversas naturais com o usuário, como se ele estivesse trocando mensagens com um assistente financeiro inteligente. O objetivo é simplificar o controle financeiro, eliminando formulários e planilhas complexas, e oferecendo uma experiência fluida e educativa.

---

## Problema

A maioria dos aplicativos de finanças exige entrada manual e categorização repetitiva, o que gera desmotivação e abandono. Usuários que desejam organizar melhor seus gastos acabam desistindo porque o processo é burocrático e pouco intuitivo. A proposta é tornar o controle financeiro algo natural, automático e agradável, com registro via chat e recomendações personalizadas.

---

## Público-Alvo

Pessoas que estão começando a cuidar das finanças pessoais e desejam um método simples, automatizado e acessível, sem precisar entender de planilhas ou categorias contábeis. O foco está em usuários leigos que buscam praticidade e aprendizado sobre como economizar e planejar melhor o uso do dinheiro.

---

## Funcionalidades-Chave

1. Registro de gastos via chat: o usuário pode digitar mensagens como "gastei R$20 com café" e o sistema entende automaticamente.
2. Classificação automática das transações com base no texto e histórico do usuário.
3. Definição e acompanhamento de metas financeiras com alertas e relatórios automáticos.
4. Agente financeiro inteligente, que envia dicas e recomendações personalizadas de economia.
5. Relatórios e gráficos interativos, com linguagem acessível e mensagens motivacionais.
6. Integração com APIs bancárias (opcional) para importação automática de transações.

---

## Entregável Esperado

Gerar um plano completo de MVP (Minimum Viable Product) contendo:

* As principais telas e fluxos de navegação do app (wireframes conceituais em texto).
* Um roteiro de validação inicial, com ideias de testes com usuários e formas simples de coletar feedback.
* Explicações em tom educativo e linguagem clara, voltadas a um público técnico iniciante.

---

## Tom e Estilo da Resposta

* Linguagem: português natural e instrutivo.
* Estrutura: organizada, com seções claras e exemplos práticos.
* Foco: explicativo e pragmático, evitando jargões desnecessários.
* Objetivo final: que o leitor entenda o que construir, como começar e como validar a ideia.

---

## MVP Prototipado neste Repositório

- Implementação estática localizada em `app/index.html`, simulando o chat financeiro descrito no PRD.
- Basta abrir o arquivo no navegador para testar o fluxo de registro de despesas, resumo automático e respostas orientativas.
- Os dados ficam salvos em `localStorage`, permitindo continuar a conversa em visitas futuras.
- Pronto para ser evoluído para um stack completo (React Native, backend serverless e IA conversacional real).