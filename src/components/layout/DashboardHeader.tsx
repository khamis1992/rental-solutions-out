
export const DashboardHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transform-gpu">
      <div className="container h-[var(--header-height,56px)]">
        <div className="flex h-full items-center px-4">
          <div className="font-semibold text-base md:text-lg hover:text-primary transition-colors">
            Rental Solution
          </div>
        </div>
      </div>
    </header>
  );
};
