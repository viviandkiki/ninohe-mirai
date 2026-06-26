interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export default function PageContainer({ children, className = "", narrow = false }: PageContainerProps) {
  return (
    <main className={`max-w-5xl mx-auto px-4 py-8 ${narrow ? "max-w-3xl" : ""} ${className}`}>
      {children}
    </main>
  );
}
