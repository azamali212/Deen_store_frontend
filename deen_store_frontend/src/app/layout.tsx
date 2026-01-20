import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProviderWrapper from "./ReduxProviderWrapper";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from './providers/ThemeProvider';
import ThemeInitializer from "@/components/ThemeInitializer/ThemeInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProviderWrapper>
          <ThemeProvider>
          <ThemeInitializer />
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              style={{ zIndex: 9999 }}
            />
          </ThemeProvider>
        </ReduxProviderWrapper>
        {/* REMOVE THIS LINE: <script dangerouslySetInnerHTML={{ __html: themeScript }} /> */}
      </body>
    </html>
  );
}