import Header from "@/components/Header";

export default function Performance() {
  return (
    <div className="mx-auto max-w-md bg-white min-h-screen shadow-lg relative h-svh flex flex-col">
      <Header showContext={false} onHomeClick={() => {}} />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Performance Board</h1>
        {/* Add performance metrics and charts here */}
      </main>
    </div>
  );
} 