import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept benign aborts and audio context interruptions to avoid console errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (
      reason?.name === 'AbortError' ||
      reason?.name === 'NotAllowedError' ||
      (typeof reason?.message === 'string' &&
        (reason.message.includes('interrupted') ||
          reason.message.includes('user gesture') ||
          reason.message.includes('play()')))
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
