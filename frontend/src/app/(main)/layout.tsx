// app/main/layout.tsx
import { ReactNode } from 'react';
// import Sidebar from './components/Sidebar'; // Sidebar component
// import Header from './components/Header';   // Header component

interface LayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex "> {/* Global background */}
        sidebar
        {/* <Header /> */}
        <div className="flex-1 flex flex-col border border-red w-[1426px] ">
        {/* <Sidebar /> */}
        header
          {/* Content passed from child pages */}
          <main className="flex-1 p-6 bg-white">
            {children}
          </main>
        </div>
    </div>
  );
};

export default MainLayout;
