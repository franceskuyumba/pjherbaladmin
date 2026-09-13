
export const metadata = {
  title: 'PJHerbal Clinic',
  description: 'E-commerce platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}

