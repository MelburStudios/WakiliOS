import { ModalProvider } from "./context/modalContext";
import { UserProvider } from "./context/userContext";
import I18nProvider from "./providers/i18n";
import "./styles/global.scss";


export const metadata = {
  title: "LawStick",
  description: "LawFirm Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
        <head>
        <link rel="shortcut icon" type="image/x-icon" href="/images/favimage.png" />
      </head>
      <body
        suppressHydrationWarning
      >
        <I18nProvider>
        <UserProvider>
        <ModalProvider>
        {children}
        </ModalProvider>
        </UserProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
