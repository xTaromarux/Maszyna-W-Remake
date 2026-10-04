import '@/Styles/Main.scss';
import '@/Styles/Components.css';
import type { ChildrenProps } from '@/Shared/Types/React';

export const metadata = {
  title: 'Maszyna W v.0.2.1',
  description: 'Interaktywny symulator Maszyny W — assembler, mikroinstrukcje i laboratoria.',
  manifest: '/Site.webmanifest',
  icons: {
    icon: [
      { url: '/Favicon96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/Favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/AppleTouchIcon.png',
  },
  appleWebApp: { title: 'Maszyna W' },
};
const RootLayout = ({ children }: ChildrenProps) => {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className="lightMode" suppressHydrationWarning>
        <div id="app">{children}</div>
      </body>
    </html>
  );
};

export default RootLayout;
