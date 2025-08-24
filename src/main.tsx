
import './index.css';
import './styles/promozione.css';
import { ToastProvider } from './components/ui/simple-toast';
import App from './App';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById("root")!).render(
	<ToastProvider>
		<App />
	</ToastProvider>
);
