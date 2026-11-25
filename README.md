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

---

## 3. Tecnologias Utilizadas

- **Linguagem & Arquitetura:** JavaScript ES6+ (ES Modules desacoplados do DOM), HTML5 Semântico, CSS3
- **Testes Unitários:** [Vitest](https://vitest.dev/) (`v5.1.0`)
- **Cobertura de Código:** `@vitest/coverage-v8` (meta $\ge 80\%$, atingido $> 99\%$)
- **Testes End-to-End (Dev 2):** Playwright
- **Integração Contínua (Dev 2):** GitHub Actions (`ubuntu-latest`, `windows-latest`, `macos-latest`)

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
- **Node.js** `v18+` (ou `v20+` / `v24+`) e **npm** instalados.

### Passo a passo

1. **Instalar as dependências do projeto:**
   ```bash
   npm install
   ```

2. **Executar os testes unitários:**
   ```bash
   npm test
   ```

3. **Executar os testes unitários com relatório de cobertura (c8/v8):**
   ```bash
   npm run test:unit
   ```
   *(Ou diretamente via `npx vitest run --coverage`)*
