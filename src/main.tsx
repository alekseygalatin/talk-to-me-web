import { Buffer } from 'buffer';
window.Buffer = Buffer;
window.global = window;
import { createRoot } from 'react-dom/client';
import 'regenerator-runtime/runtime';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <App />
);
