import type { Page } from '@playwright/test';

export interface SeededPersona {
  name: string;
  phone: string;
}

export const SEEDED_PERSONAS = {
  ADMIN: { name: 'admin', phone: '+15550000001' },
  BUSINESS: { name: 'business', phone: '+15550000002' },
  MEMBER: { name: 'member', phone: '+15550000003' },
} as const satisfies Record<string, SeededPersona>;

export async function signInAsPersona(page: Page, persona: SeededPersona): Promise<void> {
  await page.goto('/en/sign-in');
  await page.getByLabel('Phone number').fill(persona.phone);
  await page.getByRole('button', { name: 'Use dev bypass' }).click();
}

export async function signUpAndSkipOnboarding(page: Page, phone: string): Promise<void> {
  await page.goto('/en/sign-up');
  await page.getByLabel('Phone number').fill(phone);
  await page.getByRole('button', { name: 'Use dev bypass' }).click();

  await page.waitForURL(/\/en\/m\/onboarding$/, { timeout: 60_000 });
  await page.getByRole('button', { name: 'Fill in later' }).click();
  await page.waitForURL(/\/en\/m\/dashboard/, { timeout: 60_000 });

  const welcomeDialog = page.getByRole('dialog', {
    name: 'Congratulations! Welcome to KYLYVNYK Business Club!',
  });
  if (await welcomeDialog.isVisible().catch(() => false)) {
    await welcomeDialog.getByRole('button', { name: 'Close' }).click();
  }
}
