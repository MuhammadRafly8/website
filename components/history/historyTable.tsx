"use client";

import { useState, useEffect, Fragment } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";

interface StructuredMatrix {
  rows: { id: number; name: string; category: string }[];
  columns: { id: number; name: string }[];
  dependencies: Record<string, boolean>;
}

interface HistoryEntry {
  userId: string;
  userRole: string;
  timestamp: string;
  action: string;
  rowId?: number;
  columnId?: number;
  rowName?: string;
  columnName?: string;
  cellKey?: string;
  details?: string;
  matrixSnapshot?: string;
}

const HistoryTable = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatrix, setSelectedMatrix] = useState<StructuredMatrix | null>(null);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  useEffect(() => {
    // For demo purposes, load from localStorage
    try {
      const historyData = JSON.parse(localStorage.getItem('matrixHistory') || '[]');
      setHistory(historyData.sort((a: HistoryEntry, b: HistoryEntry) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const viewMatrix = (matrixSnapshot: string) => {
    try {
      const matrix = JSON.parse(matrixSnapshot);
      setSelectedMatrix(matrix);
      setShowMatrixModal(true);
    } catch (error) {
      console.error("Error parsing matrix snapshot:", error);
      toast.error("Failed to load matrix data. The format might be invalid.");
    }
  };

  const closeMatrixModal = () => {
    setShowMatrixModal(false);
    setSelectedMatrix(null);
  };

  const handleDeleteHistoryEntry = (index: number) => {
    try {
      // Buat salinan history tanpa entri yang akan dihapus
      const updatedHistory = [...history];
      updatedHistory.splice(index, 1);
      
      // Update state
      setHistory(updatedHistory);
      
      // Update localStorage
      localStorage.setItem('matrixHistory', JSON.stringify(updatedHistory));
      
      toast.success("History entry deleted successfully");
    } catch (error) {
      console.error("Error deleting history entry:", error);
      toast.error("Failed to delete history entry");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading history data...</div>;
  }

  if (history.length === 0) {
    return <div className="p-8 text-center text-gray-500">No history data available</div>;
  }

  return (
    <>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">Time</th>
              <th className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">User</th>
              <th className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">Role</th>
              <th className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">Action</th>
              <th className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">Details</th>
              <th className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">View</th>
              <th className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">
                  {format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                </td>
                <td className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">{entry.userId}</td>
                <td className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">
                  <span className={`px-1 md:px-2 py-0.5 md:py-1 rounded-full text-xs ${
                    entry.userRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {entry.userRole}
                  </span>
                </td>
                <td className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">
                  <span className={`px-1 md:px-2 py-0.5 md:py-1 rounded-full text-xs ${
                    entry.action === 'add' ? 'bg-green-100 text-green-800' : 
                    entry.action === 'remove' ? 'bg-red-100 text-red-800' : 
                    entry.action === 'submit_matrix' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {entry.action === 'add' ? 'Added dependency' : 
                     entry.action === 'remove' ? 'Removed dependency' : 
                     entry.action === 'submit_matrix' ? 'Submitted matrix' :
                     'Edited matrix'}
                  </span>
                </td>
                <td className="border border-gray-300 p-1 md:p-2 text-xs md:text-sm">
                  {entry.action === 'edit_matrix' ? (
                    entry.details
                  ) : entry.action === 'submit_matrix' ? (
                    entry.details
                  ) : (
                    <>
                      {entry.action === 'add' ? 'Added' : 'Removed'} dependency between 
                      <span className="font-semibold"> {entry.rowName} </span> 
                      and 
                      <span className="font-semibold"> {entry.columnName}</span>
                    </>
                  )}
                </td>
                <td className="border border-gray-300 p-1 md:p-2 text-center">
                  {entry.action === 'submit_matrix' && entry.matrixSnapshot && (
                    <button
                      onClick={() => entry.matrixSnapshot ? viewMatrix(entry.matrixSnapshot) : null}
                      className="px-2 py-0.5 md:px-3 md:py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500"
                    >
                      View
                    </button>
                  )}
                </td>
                <td className="border border-gray-300 p-1 md:p-2 text-center">
                  <button
                    onClick={() => handleDeleteHistoryEntry(index)}
                    className="px-2 py-0.5 md:px-3 md:py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Matrix Modal */}
      {showMatrixModal && selectedMatrix && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-0">
          <div className="bg-white rounded-lg p-3 md:p-6 w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h3 className="text-base md:text-xl font-bold">Submitted Matrix</h3>
              <button 
                onClick={closeMatrixModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-0.5 md:p-1 bg-gray-100 text-center w-6 md:w-10 text-xs md:text-sm">No</th>
                    <th className="border border-gray-300 p-0.5 md:p-1 bg-gray-100 text-left text-xs md:text-sm">Sub-Attribut</th>
                    <th className="border border-gray-300 p-0.5 md:p-1 bg-gray-100 text-xs md:text-sm"></th>
                    {selectedMatrix.columns.map((column) => (
                      <th key={column.id} className="border border-gray-300 p-0.5 md:p-1 bg-gray-100 text-center w-5 md:w-8 text-xs md:text-sm">
                        {column.name}
                      </th>
                    ))}
                    <th className="border border-gray-300 p-0.5 md:p-1 bg-gray-100 text-center text-xs md:text-sm">Relation to</th>
                    <th className="border border-gray-300 p-0.5 md:p-1 bg-gray-100 text-center text-xs md:text-sm">Sub Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const rowsByCategory: Record<string, typeof selectedMatrix.rows> = {};
                    selectedMatrix.rows.forEach(row => {
                      if (!rowsByCategory[row.category]) {
                        rowsByCategory[row.category] = [];
                      }
                      rowsByCategory[row.category].push(row);
                    });
                    
                    // Calculate row totals
                    const rowTotals: Record<number, number> = {};
                    const columnTotals: Record<number, number> = {};
                    const categoryTotals: Record<string, number> = {};
                    
                    // Initialize totals
                    selectedMatrix.rows.forEach(row => {
                      rowTotals[row.id] = 0;
                      if (!categoryTotals[row.category]) {
                        categoryTotals[row.category] = 0;
                      }
                    });
                    
                    selectedMatrix.columns.forEach(col => {
                      columnTotals[col.id] = 0;
                    });
                    
                    // Calculate totals
                    Object.entries(selectedMatrix.dependencies).forEach(([key, value]) => {
                      if (value) {
                        const [rowId, colId] = key.split('_').map(Number);
                        if (rowId < colId) {
                          rowTotals[rowId] = (rowTotals[rowId] || 0) + 1;
                          columnTotals[colId] = (columnTotals[colId] || 0) + 1;
                          
                          const rowCategory = selectedMatrix.rows.find(r => r.id === rowId)?.category;
                          if (rowCategory) {
                            categoryTotals[rowCategory] = (categoryTotals[rowCategory] || 0) + 1;
                          }
                        }
                      }
                    });
                    
                    // Calculate group totals for Sub Total row
                    const calculateGroupTotal = (start: number, end: number) => {
                      let total = 0;
                      for (let i = start; i <= end; i++) {
                        total += columnTotals[i] || 0;
                      }
                      return total;
                    };
                    
                    return (
                      <>
                        {Object.entries(rowsByCategory).map(([category, rows], categoryIndex) => (
                          <Fragment key={category}>
                            {rows.map((row, rowIndex) => (
                              <tr key={row.id}>
                                <td className="border border-gray-300 p-0.5 md:p-1 text-center text-xs md:text-sm">{row.id}</td>
                                <td className="border border-gray-300 p-0.5 md:p-1 text-left text-xs md:text-sm">{row.name}</td>
                                {rowIndex === 0 ? (
                                  <td 
                                    className="border border-gray-300 p-0.5 md:p-1 text-center font-bold text-xs md:text-sm" 
                                    rowSpan={rows.length}
                                  >
                                    {category}
                                  </td>
                                ) : null}
                                {selectedMatrix.columns.map((column) => {
                                  const key = `${row.id}_${column.id}`;
                                  const value = selectedMatrix.dependencies[key] || false;
                                  const isDisabled = row.id === column.id || row.id > column.id;
                                  const isGreen = row.id > column.id;
                                  
                                  return (
                                    <td 
                                      key={key} 
                                      className={`border border-gray-300 p-0 text-center ${
                                        isDisabled ? (isGreen ? 'bg-green-800' : 'bg-gray-200') : (value ? 'bg-green-800' : 'bg-white')
                                      }`}
                                      style={{ width: '20px', height: '20px', maxWidth: '30px' }}
                                    >
                                      {value && !isDisabled ? 'x' : ''}
                                    </td>
                                  );
                                })}
                                <td className="border border-gray-300 p-0.5 md:p-1 text-center font-bold text-xs md:text-sm">
                                  {rowTotals[row.id] || 0}
                                </td>
                                {rowIndex === 0 ? (
                                  <td 
                                    className="border border-gray-300 p-0.5 md:p-1 text-center font-bold text-xs md:text-sm" 
                                    rowSpan={rows.length}
                                  >
                                    {categoryTotals[category] || 0}
                                  </td>
                                ) : null}
                              </tr>
                            ))}
                          </Fragment>
                        ))}
                        <tr>
                          <td colSpan={3} className="border border-gray-300 p-0.5 md:p-1 text-right font-bold text-xs md:text-sm">
                            Relation From
                          </td>
                          {selectedMatrix.columns.map((column) => (
                            <td key={column.id} className="border border-gray-300 p-0.5 md:p-1 text-center font-bold text-xs md:text-sm">
                              {columnTotals[column.id] || 0}
                            </td>
                          ))}
                          <td className="border border-gray-300 p-0.5 md:p-1"></td>
                          <td className="border border-gray-300 p-0.5 md:p-1"></td>
                        </tr>
                        <tr className="hidden md:table-row">
                          <td colSpan={3} className="border border-gray-300 p-0.5 md:p-1 text-right font-bold text-xs md:text-sm">
                            Sub Total
                          </td>
                          <td colSpan={6} className="border border-gray-300 p-0.5 md:p-1 text-center font-bold text-xs md:text-sm">
                            {calculateGroupTotal(1, 6)}
                          </td>
                          <td colSpan={3} className="border border-gray-300 p-0.5 md:p-1 text-center font-bold text-xs md:text-sm">
                            {calculateGroupTotal(7, 9)}
                          </td>
                          <td colSpan={5} className="border border-gray-300 p-0.5 md:p-1 text-center font-bold text-xs md:text-sm">
                            {calculateGroupTotal(10, 14)}
                          </td>
                          <td colSpan={2} className="border border-gray-300 p-0.5 md:p-1 text-center font-bold text-xs md:text-sm">
                            {calculateGroupTotal(15, 16)}
                          </td>
                        </tr>
                        {/* Mobile version of Sub Total row */}
                        <tr className="md:hidden">
                          <td colSpan={3} className="border border-gray-300 p-0.5 text-right font-bold text-xs">
                            Sub Total
                          </td>
                          <td colSpan={16} className="border border-gray-300 p-0.5 text-center font-bold text-xs">
                            {calculateGroupTotal(1, 16)}
                          </td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
            
            <div className="mt-2 md:mt-4 flex justify-end">
              <button 
                onClick={closeMatrixModal}
                className="px-3 py-1 md:px-4 md:py-2 bg-gray-500 text-white text-xs md:text-sm rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HistoryTable;