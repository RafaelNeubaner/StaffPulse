import { expect, test } from '@playwright/test';

const employeeDefaults = {
  salary: '6200',
  admissionDate: '2022-03-10',
};

async function openEmployees(page) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Colaboradores' }).click();
  await expect(page).toHaveURL(/#employees$/);
}

function employeeForm(page) {
  return page.getByRole('region', { name: 'Novo colaborador' });
}

function employeeFilters(page) {
  return page.getByRole('region', { name: 'Colaboradores cadastrados' });
}

async function registerEmployee(page, employee) {
  const form = employeeForm(page);
  await form.getByLabel('Nome', { exact: true }).fill(employee.name);
  await form.getByLabel('E-mail', { exact: true }).fill(employee.email);
  await form.getByLabel('Salário', { exact: true }).fill(employee.salary ?? employeeDefaults.salary);
  await form
    .getByLabel('Data de admissão', { exact: true })
    .fill(employee.admissionDate ?? employeeDefaults.admissionDate);
  await form.getByLabel('Departamento', { exact: true }).selectOption(employee.department);
  await form.getByRole('button', { name: 'Cadastrar colaborador' }).click();
}

function employeeRow(page, employeeName) {
  return page.getByRole('row').filter({ hasText: employeeName });
}

test.describe('StaffPulse employee workflows', () => {
  test('registers a valid employee and displays it in the list', async ({ page }) => {
    await openEmployees(page);
    const employee = {
      name: 'Marina Alves',
      email: 'marina.alves.e2e@example.com',
      department: 'TI',
    };

    await registerEmployee(page, employee);

    await expect(employeeRow(page, employee.name)).toContainText(employee.email);
    await expect(employeeRow(page, employee.name)).toContainText('TI');
    await expect(page.getByRole('status')).toContainText(
      'Colaborador cadastrado com sucesso.'
    );
  });

  test('shows validation errors and does not register invalid data', async ({ page }) => {
    await openEmployees(page);
    const form = employeeForm(page);
    await form.getByLabel('Nome', { exact: true }).fill('A');
    await form.getByLabel('E-mail', { exact: true }).fill('invalid-email');
    await form.getByLabel('Salário', { exact: true }).fill('1000');
    await form.getByLabel('Data de admissão', { exact: true }).fill('2022-03-10');
    await form.getByLabel('Departamento', { exact: true }).selectOption('TI');

    await form.getByRole('button', { name: 'Cadastrar colaborador' }).click();

    await expect(page.locator('#employee-name-error')).toHaveText(
      'O nome deve possuir no mínimo 3 caracteres.'
    );
    await expect(page.locator('#employee-email-error')).toHaveText(
      'Formato de e-mail corporativo inválido.'
    );
    await expect(page.locator('#employee-salary-error')).toContainText(
      'piso mínimo legal'
    );
    await expect(employeeRow(page, 'invalid-email')).toHaveCount(0);
    await expect(
      page.getByText('Colaborador cadastrado com sucesso.', { exact: true })
    ).toHaveCount(0);
  });

  test('searches by name and filters the matching department', async ({ page }) => {
    await openEmployees(page);
    const ana = {
      name: 'Ana Martins',
      email: 'ana.martins.e2e@example.com',
      department: 'TI',
    };
    const bruno = {
      name: 'Bruno Costa',
      email: 'bruno.costa.e2e@example.com',
      department: 'RH',
    };

    await registerEmployee(page, ana);
    await registerEmployee(page, bruno);
    await page.getByLabel('Pesquisar por nome').fill('Ana');

    await expect(employeeRow(page, ana.name)).toBeVisible();
    await expect(employeeRow(page, bruno.name)).toHaveCount(0);

    const filters = employeeFilters(page);
    await filters.getByLabel('Departamento', { exact: true }).selectOption('TI');
    await expect(employeeRow(page, ana.name)).toContainText('TI');
    await expect(employeeRow(page, bruno.name)).toHaveCount(0);

    await filters.getByLabel('Departamento', { exact: true }).selectOption('RH');
    await expect(page.getByText('Nenhum colaborador encontrado.')).toBeVisible();
  });

  test('edits an employee and displays the updated information', async ({ page }) => {
    await openEmployees(page);
    const employee = {
      name: 'Caio Ribeiro',
      email: 'caio.ribeiro.e2e@example.com',
      department: 'Vendas',
    };
    await registerEmployee(page, employee);

    await page.getByRole('button', { name: `Editar ${employee.name}` }).click();
    await expect(page.getByRole('heading', { name: 'Editar colaborador' })).toBeVisible();
    await page.getByLabel('Salário', { exact: true }).fill('8100');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();

    await expect(employeeRow(page, employee.name)).toContainText('R$ 8.100,00');
    await expect(page.getByRole('status')).toContainText(
      'Colaborador atualizado com sucesso.'
    );
  });

  test('inactivates an employee after confirmation', async ({ page }) => {
    await openEmployees(page);
    const employee = {
      name: 'Diana Souza',
      email: 'diana.souza.e2e@example.com',
      department: 'Financeiro',
    };
    await registerEmployee(page, employee);

    await page.getByRole('button', { name: `Inativar ${employee.name}` }).click();
    const confirmation = page.getByRole('dialog', { name: 'Inativar colaborador' });
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toContainText(
      'O registro será mantido com status inativo.'
    );
    await confirmation
      .getByRole('button', { name: 'Inativar colaborador', exact: true })
      .click();

    await expect(employeeRow(page, employee.name)).toContainText(/inativo/i);
    await expect(page.getByRole('status')).toContainText(
      'Diana Souza foi inativado com sucesso.'
    );
    await expect(page.getByLabel('Pesquisar por nome')).toBeFocused();
  });
});
