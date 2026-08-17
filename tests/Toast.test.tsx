import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { ToastContainer } from '../src/components/Toast';
import { ToastProvider, useToast } from '../src/context/ToastContext';

const ToastTrigger = () => {
  const { showToast } = useToast();

  return (
    <button onClick={() => showToast('Saved successfully', 'success')}>
      Show toast
    </button>
  );
};

describe('Toast system', () => {
  it('renders no toast before one is created', () => {
    const { container } = render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows a toast message when requested', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
        <ToastContainer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show toast' }));

    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('allows a displayed toast to be dismissed', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
        <ToastContainer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show toast' }));

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(screen.queryByText('Saved successfully')).not.toBeInTheDocument();
  });
});
