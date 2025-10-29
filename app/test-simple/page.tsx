export default function TestSimplePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Teszt oldal - Működik!</h1>
      <p className="text-gray-600">Ha ezt látod, akkor a Next.js szerver rendben működik.</p>
      <div className="mt-8 p-4 bg-purple-100 rounded">
        <p className="text-purple-800">Port: 3001</p>
      </div>
    </main>
  );
}