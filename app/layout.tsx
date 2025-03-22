import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../components/auth/authContext';
import Navbar from '../components/layout/navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define the fonts
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono' });

export const metadata: Metadata = {
  title: "RAMS ",
  description: "A dependency matrix management tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Remove the hooks from here - they can't be used in a Server Component
  
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </main>
          <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
      </body>
    </html>
  );
}
