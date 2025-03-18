"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/auth/authContext';
import HistoryTable from '../../components/history/historyTable';

export default function HistoryPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!isAdmin()) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin()) {
    return null;
  }

  return (
    <main className="flex-grow container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Change History</h2>
        <div className="mb-4">
          <p className="text-gray-600">
            This page shows the history of all changes made to the dependency matrix.
            Each entry includes the user who made the change, the affected cell, and the action taken.
          </p>
        </div>
        <HistoryTable />
      </div>
    </main>
  );
}