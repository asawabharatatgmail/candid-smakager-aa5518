import { useEffect } from 'react';

interface Props {
  message: string;
  type?: 'error' | 'success' | 'info';
  onDone: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onDone, duration = 3500 }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className="toast-wrap">
      <div className={`toast ${type}`}>{message}</div>
    </div>
  );
}
