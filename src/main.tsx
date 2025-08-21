
import { ToastProvider } from './components/ui/simple-toast';

createRoot(document.getElementById("root")!).render(
	<ToastProvider>
		<App />
	</ToastProvider>
);
