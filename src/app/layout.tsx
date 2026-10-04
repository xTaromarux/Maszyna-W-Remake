import '@/styles/main.scss';
import '@/styles/migrated/index.css';
import type { ChildrenProps } from '@/types/common';

export const metadata = {
  title: 'Maszyna W v.0.2.1',
  description: 'Interaktywny symulator Maszyny W — assembler, mikroinstrukcje i laboratoria.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: { title: 'Maszyna W' },
};
export default function RootLayout({ children }: ChildrenProps) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className="lightMode" suppressHydrationWarning>
        <div id="app">{children}</div>
      </body>
    </html>
  );
}
