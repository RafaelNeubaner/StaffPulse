# StaffPulse — Sistema de Cadastro e Gestão de Colaboradores

Sistema web de cadastro, filtragem, busca e análise de folha salarial de colaboradores desenvolvido em Vanilla JavaScript (ES Modules), HTML5 e CSS3, com suíte de testes unitários no Vitest e cobertura de código via V8.

---

## 1. Integrantes

- **Dev 1 (Core, Validações, Serviços de Domínio e Testes Unitários):** Rafael (`neubanerrafael@gmail.com`)
- **Dev 2 (Interface Web, Testes E2E Playwright, CI/CD Multi-OS e Deploy):** *(Integrante 2)*

---

## 2. Sobre o Sistema

O **StaffPulse** permite gerenciar o ciclo de vida cadastral de colaboradores em uma organização, contemplando:

- **Módulo de Validações (`src/js/validators.js`):**
  - `validateName(name)`: Garante nome não vazio, mínimo de 3 caracteres e apenas letras/acentos.
  - `validateEmail(email)`: Valida estrutura de e-mail corporativo com expressão regular e domínio válido.
  - `validateSalary(salary)`: Valida números positivos iguais ou superiores ao piso mínimo legal (`R$ 1.412,00`).
  - `validateAdmissionDate(date)`: Valida formato cronológico `YYYY-MM-DD`, existência no calendário e impede datas futuras.
  - `validateDepartment(dept)`: Valida contra a lista pré-aprovada de setores (`TI`, `RH`, `Vendas`, `Financeiro`).
  - `validateStatus(status)`: Aceita somente `ativo` ou `inativo`.
  - Erros de validação são instâncias de `ValidationError`, com `field` identificando o campo inválido e `message` preservando a mensagem em português.
- **Serviço de Colaboradores (`src/js/employee-service.js`):**
  - `createEmployee(data, store)`: Cria registro com ID único e imutabilidade (`Object.freeze`).
  - `updateEmployee(id, updates, store)`: Atualiza dados cadastrais preservando ID e imutabilidade.
  - `deleteEmployee(id, store, options)`: Executa remoção física ou lógica (`status: 'inativo'`).
  - `filterEmployees(list, criteria)` & `sortEmployees(list, sortBy, order)`: Filtro combinado por departamento e status com suporte a ordenação.
  - `searchByName(list, query)`: Busca textual insensível a maiúsculas/minúsculas.
  - `calculatePayrollStats(list)`: Calcula soma total da folha salarial, média salarial, total de colaboradores ativos e contagem por cargo.

- **Camada de integração (`src/js/employee-store.js`):**
  - Mantém o estado atual em uma store desacoplada da interface.
  - Encaminha CRUD, busca, filtros, ordenação e estatísticas para os serviços de domínio.
  - Persiste os registros no `localStorage` sem armazenar dados fictícios.
  - Preserva IDs existentes e não perde o estado atual em memória quando a gravação falha.
- **Repositório de persistência (`src/js/employee-repository.js`):**
  - Recupera e valida o formato da lista armazenada no navegador.
  - Exibe `StorageError` para dados inacessíveis ou corrompidos e `PersistenceError` para falhas de gravação.
- **Dashboard (`src/js/dashboard.js`):**
  - Apresenta colaboradores ativos e total cadastrado, folha salarial e salário médio.
  - Exibe distribuições visuais por departamento e cargo; cargos vêm de `calculatePayrollStats`, departamentos dos registros validados.
  - Atualiza os indicadores e distribuições quando a store notifica alterações nos colaboradores.
- **Formulário de cadastro (`src/js/employee-form.js`):**
  - Cria colaboradores usando a camada de integração e apresenta mensagens de sucesso ou erros do serviço.
  - Preenche o seletor de departamentos a partir de `ALLOWED_DEPARTMENTS`, sem duplicar as regras de validação do domínio.
- **Listagem e pesquisa (`src/js/employee-list.js`):**
  - Apresenta os colaboradores persistidos em uma tabela e pesquisa por nome conforme o usuário digita.
  - Combina pesquisa por nome com filtros de departamento/status e oferece ordenação por nome, salário ou data de admissão usando os serviços de domínio.
  - Exibe detalhes do registro em um diálogo acessível, sem alterar os dados.
  - Permite inativar ou excluir permanentemente após confirmação explícita, atualizando a lista e o Dashboard.

---

## 3. Tecnologias Utilizadas

- **Linguagem & Arquitetura:** JavaScript ES6+ (ES Modules desacoplados do DOM), HTML5 Semântico, CSS3
- **Testes Unitários:** [Vitest](https://vitest.dev/) (`v5.1.0`)
- **Cobertura de Código:** `@vitest/coverage-v8` (meta $\ge 80\%$; relatório mais recente: 95,93% statements, 93,55% branches, 95,76% functions e 95,97% lines)
- **Testes End-to-End (Dev 2):** Playwright
- **Integração Contínua (Dev 2):** GitHub Actions em push e pull request (`ubuntu-latest`, `macos-latest`, `windows-latest`), com testes unitários, cobertura e Playwright.

---

## 4. Uso de IA

Ferramentas de IA generativa foram empregadas como apoio técnico nas seguintes tarefas:

1. **Expressões Regulares (`src/js/validators.js`):**
   - Elaboração e refinamento das expressões regulares para validação de nomes com acentuação latina (`/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)*$/`), estrutura de e-mail corporativo (`/^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/`) e formato de data ISO (`YYYY-MM-DD`).
2. **Fixtures e Casos de Teste Unitários (`tests/unit/`):**
   - Geração de cenários de borda (valores limites de piso salarial, datas bissextas/inexistentes como `2023-02-30`, entradas nulas/indefinidas) estruturados no padrão *Given-When-Then* / *Should-When*.

---

## 5. Instruções Claras de Execução Local

### Pré-requisitos
- **Node.js 24** e **npm** instalados.

### Passo a passo

1. **Instalar as dependências do projeto:**
   ```bash
   npm ci
   ```

2. **Iniciar a estrutura inicial da interface:**
   ```bash
   npm run serve
   ```
   Acesse `http://127.0.0.1:4173` no navegador.

3. **Executar os testes unitários:**
   ```bash
   npm test
   ```

4. **Executar os testes unitários com relatório de cobertura (c8/v8):**
   ```bash
   npm run test:unit
   ```
   O Vitest falha quando statements, branches, functions ou lines ficam abaixo de 80%.

5. **Instalar o Chromium do Playwright e executar os testes E2E:**
   ```bash
   npx playwright install chromium
   npm run test:e2e
   ```
   O Playwright inicia e encerra o servidor local automaticamente.

## 6. Integração contínua

O workflow [`ci.yml`](.github/workflows/ci.yml) é executado em cada push e pull request. Ele usa Node.js 24 e executa `npm ci`, os testes unitários, a cobertura com os limites configurados e os testes E2E nas três plataformas: Ubuntu, macOS e Windows. Os relatórios de cobertura e do Playwright são anexados à execução como artefatos.

Para acompanhar uma execução no GitHub, abra a aba **Actions**, selecione **StaffPulse CI** e depois a execução desejada. Cada sistema operacional aparece como um job separado; seus logs mostram o resultado de cada etapa, e a seção **Artifacts** disponibiliza os relatórios gerados.
