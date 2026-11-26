# StaffPulse

Sistema web para cadastro e gestão de colaboradores, com pesquisa, filtros e indicadores de folha salarial. A aplicação foi construída com JavaScript ES Modules, HTML5 e CSS3, sem framework de interface.

## Integrantes

- **Rafael Neubaner de Almeida — Dev 1:** núcleo da aplicação, regras de domínio, validações, serviços de colaboradores e testes unitários.
- **Kauê de Paiva Santos — Dev 2:** interface web, feedback visual, responsividade e acessibilidade, testes E2E com Playwright, CI/CD e configuração do deploy.

## Sobre o sistema

O StaffPulse ajuda a organizar os registros de colaboradores de uma organização. A interface oferece estes fluxos:

- **Dashboard:** consulta de colaboradores ativos e total de registros, folha salarial, salário médio e distribuições por departamento e cargo.
- **Cadastro:** preenchimento dos dados do colaborador, validação dos campos e apresentação de notificações para sucesso ou falha.
- **Consulta da equipe:** listagem, pesquisa por nome, filtros por departamento e status e ordenação por nome, salário ou data de admissão. Pesquisa e filtros podem ser combinados.
- **Detalhes e edição:** visualização dos dados em um diálogo e atualização de um registro existente.
- **Inativação ou exclusão:** confirmação da ação e atualização da listagem e dos indicadores.

Os registros são salvos no `localStorage` do navegador. Eles permanecem naquele navegador após recarregar a página, mas não são compartilhados entre usuários ou dispositivos. O sistema não possui backend ou banco de dados remoto.

## Tecnologias

- **JavaScript ES Modules:** implementa os serviços de domínio, a integração da interface e a lógica do sistema em módulos reutilizáveis.
- **HTML5:** estrutura semântica da interface e dos formulários.
- **CSS3:** identidade visual, estados interativos e adaptação da interface a diferentes tamanhos de tela.
- **Vitest:** execução dos testes unitários.
- **@vitest/coverage-v8:** coleta a cobertura de código usando o mecanismo V8.
- **Playwright:** testa fluxos E2E pela interface em um navegador Chromium.
- **GitHub Actions:** executa testes automaticamente em diferentes sistemas operacionais e automatiza a publicação no Pages quando habilitado.
- **GitHub Pages:** plataforma gratuita escolhida para hospedar os arquivos estáticos do projeto.

## Uso de IA

O **OpenAI Codex** foi utilizado como ferramenta de apoio ao desenvolvimento. A assistência incluiu análise da estrutura existente, implementação e revisão de partes da interface, feedback visual, responsividade, acessibilidade, testes E2E, automação de CI/CD e configuração de publicação. Também apoiou a análise de erros e a documentação.

As sugestões e alterações foram revisadas pelos integrantes. O comportamento foi validado com os testes unitários e E2E; a cobertura indicada neste documento foi gerada executando o comando descrito abaixo.

## Execução local

### Pré-requisitos

- Node.js 24 e npm.
- Chromium instalado pelo Playwright para executar os testes E2E.

### Instalar dependências

Na raiz do repositório, execute:

```bash
npm ci
```

### Iniciar a aplicação

```bash
npm run serve
```

Abra <http://127.0.0.1:4173> no navegador. Os dados ficam armazenados no `localStorage` desse navegador.

### Testes unitários

```bash
npm test
```

### Testes unitários com cobertura

```bash
npm run test:unit
```

### Testes E2E

Instale o Chromium uma vez:

```bash
npm run test:e2e:install
```

Depois execute:

```bash
npm run test:e2e
```

O Playwright inicia o servidor local definido em `playwright.config.js`. A suíte cobre navegação, cadastro válido e inválido, pesquisa e filtro, edição e inativação.

### Suíte completa

Este comando executa a suíte unitária com cobertura e, em seguida, os testes E2E:

```bash
npm run test:unit && npm run test:e2e
```

## Cobertura de testes

A cobertura é gerada pelo Vitest com `@vitest/coverage-v8`. Para gerar o relatório:

```bash
npm run test:unit
```

O relatório HTML fica em `coverage/index.html`; o relatório LCOV fica em `coverage/lcov.info`. Abra `coverage/index.html` no navegador para consultar os detalhes por arquivo.

Resultado obtido nesta execução: **94,96% de statements, 92,88% de branches, 94,21% de functions e 95,12% de lines**. Foram aprovados **72 testes em 8 arquivos**. Os limites configurados no Vitest são 80% para cada métrica.

## CI/CD

O workflow [StaffPulse CI](https://github.com/RafaelNeubaner/TP-ES2/actions/workflows/ci.yml) é disparado em `push` e `pull_request`. Ele usa Node.js 24 e executa testes unitários, cobertura e E2E em Linux (`ubuntu-latest`), macOS (`macos-latest`) e Windows (`windows-latest`). Os relatórios de cobertura e Playwright são anexados às execuções como artefatos.

O workflow [Deploy StaffPulse to GitHub Pages](https://github.com/RafaelNeubaner/TP-ES2/actions/workflows/deploy-pages.yml) executa em atualizações da branch `main` ou manualmente. Ele roda os testes unitários e E2E antes de preparar e publicar os arquivos estáticos.

## Deploy

A plataforma configurada é **GitHub Pages**, adequada à arquitetura estática do StaffPulse. 

URL pública ativa: https://rafaelneubaner.github.io/StaffPulse/

Depois de habilitado, atualizações enviadas para `main` disparam a publicação automaticamente. A URL definitiva pode ser consultada no ambiente `github-pages` ou nas configurações de Pages do repositório.

## Vídeo

Link do vídeo de apresentação no YouTube: **a adicionar**.
