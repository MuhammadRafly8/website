"use client";

import MatrixTable from '../../components/matrix/matrixTable';


export default function MatrixPage() {
  return (
    <main className="flex-grow container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Dependency Matrix</h2>
        <MatrixTable />
      </div>
    </main>
  );
}