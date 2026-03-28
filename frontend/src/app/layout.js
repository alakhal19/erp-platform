import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

export const metadata = {
  title: 'ERP Platform',
  description: 'B2B ERP Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}