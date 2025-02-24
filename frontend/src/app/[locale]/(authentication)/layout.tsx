import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <Image
        src="/assets/images/background.jpg"
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      <div className="relative z-10 w-full max-w-2xl p-5">
        {children}
      </div>
    </div>
  );
}