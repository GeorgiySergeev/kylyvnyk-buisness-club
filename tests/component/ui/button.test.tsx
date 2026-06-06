import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../../src/components/ui/button';

describe('Button component', () => {
  it('renders an accessible button and handles clicks', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Save changes</Button>);

    const button = screen.getByRole('button', { name: 'Save changes' });
    await user.click(button);

    expect(button).toBeEnabled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables interaction while loading', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button isLoading onClick={onClick}>
        Save changes
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save changes' });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps anchor semantics when rendered as child', () => {
    render(
      <Button asChild variant="link">
        <a href="/en/directory">Open directory</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Open directory' });

    expect(link).toHaveAttribute('href', '/en/directory');
    expect(link).toHaveAttribute('data-slot', 'button');
    expect(link).toHaveAttribute('data-variant', 'link');
  });
});
