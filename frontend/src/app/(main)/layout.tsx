// app/main/layout.tsx
import { ReactNode } from 'react';
// import Sidebar from './components/Sidebar'; // Sidebar component
// import Header from './components/Header';   // Header component

interface LayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col"> {/* Global background */}
      <header className="bg-black text-white h-[99px] flex justify-evenly">
        header
      </header>
      <div className="flex flex-1">
        <aside className="bg-white w-[77px]">
          Sidebar
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
