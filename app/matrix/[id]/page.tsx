"use client";

import { useState, useEffect, Fragment } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { MatrixItem, StructuredMatrix } from "../../../types/matrix";
import { useAuth } from "../../../components/auth/authContext";
import { matrixService } from "../../../services/api";

export default function MatrixDetailPage() {
  const [matrix, setMatrix] = useState<MatrixItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [rowTotals, setRowTotals] = useState<Record<number, number>>({});
  const [columnTotals, setColumnTotals] = useState<Record<number, number>>({});
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [showKeywordModal, setShowKeywordModal] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const params = useParams();
  const matrixId = params.id as string;
  const { isAuthenticated, userId, isAdmin } = useAuth();

  useEffect(() => {
    // Load matrix from API instead of localStorage
    const fetchMatrix = async () => {
      try {
        const data = await matrixService.getMatrixById(matrixId);
        setMatrix(data);
        calculateTotals(data.data);
        
        // Check if user is admin or already authorized via backend
        if (isAdmin() || data.createdBy === userId || data.authorized === true) {
          setIsAuthorized(true);
          setShowKeywordModal(false);
        }
      } catch (error) {
        console.error("Error fetching matrix:", error);
        toast.error("Failed to load matrix");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchMatrix();
    }
  }, [matrixId, isAdmin, userId, isAuthenticated]);

  const handleCellChange = async (rowId: number, colId: number) => {
    if (!matrix || !isAuthenticated || !isAuthorized) return;
    
    const key = `${rowId}_${colId}`;
    const newValue = !matrix.data.dependencies[key];
    
    const updatedMatrix = {
      ...matrix,
      data: {
        ...matrix.data,
        dependencies: {
          ...matrix.data.dependencies,
          [key]: newValue
        }
      }
    };
    
    setMatrix(updatedMatrix);
    calculateTotals(updatedMatrix.data);
    
    try {
      // Save changes to API
      await matrixService.updateMatrix(matrix.id, updatedMatrix);
      toast.success("Cell updated successfully");
    } catch (error) {
      console.error("Error updating matrix:", error);
      toast.error("Failed to update matrix");
    }
  };

  const calculateTotals = (data: StructuredMatrix) => {
    const rowTotals: Record<number, number> = {};
    const columnTotals: Record<number, number> = {};
    const categoryTotals: Record<string, number> = {};

    // Initialize totals
    data.rows.forEach(row => {
      rowTotals[row.id] = 0;
      if (!categoryTotals[row.category]) {
        categoryTotals[row.category] = 0;
      }
    });
    
    data.columns.forEach(col => {
      columnTotals[col.id] = 0;
    });

    // Calculate totals
    Object.entries(data.dependencies).forEach(([key, value]) => {
      if (value) {
        const [rowId, colId] = key.split('_').map(Number);
        rowTotals[rowId] = (rowTotals[rowId] || 0) + 1;
        columnTotals[colId] = (columnTotals[colId] || 0) + 1;
        
        // Find the category for this row
        const row = data.rows.find(r => r.id === rowId);
        if (row) {
          categoryTotals[row.category] = (categoryTotals[row.category] || 0) + 1;
        }
      }
    });

    setRowTotals(rowTotals);
    setColumnTotals(columnTotals);
    setCategoryTotals(categoryTotals);
  };

  const verifyKeyword = async () => {
    if (!matrix) return;
    
    try {
      // Verify keyword through backend API
      const response = await matrixService.verifyMatrixAccess(matrixId, keyword);
      
      if (response.authorized) {
        setIsAuthorized(true);
        setShowKeywordModal(false);
        toast.success("Access granted!");
      } else {
        setKeywordError("Invalid keyword. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying keyword:", error);
      setKeywordError("Failed to verify keyword. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex-grow container mx-auto p-4 text-center">
        Loading matrix data...
      </div>
    );
  }

  if (!matrix) {
    return (
      <div className="flex-grow container mx-auto p-4 text-center">
        Matrix not found
      </div>
    );
  }

  // Group rows by category
  const rowsByCategory = matrix.data.rows.reduce((acc, row) => {
    if (!acc[row.category]) {
      acc[row.category] = [];
    }
    acc[row.category].push(row);
    return acc;
  }, {} as Record<string, typeof matrix.data.rows>);

  return (
    <main className="flex-grow container mx-auto p-4">
      {showKeywordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Enter Access Keyword</h3>
            <p className="mb-4 text-gray-600">
              This matrix is protected. Please enter the access keyword to continue.
            </p>
            
            {keywordError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {keywordError}
              </div>
            )}
            
            <div className="mb-4">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter keyword"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={verifyKeyword}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{matrix.title}</h2>
          {matrix.description && (
            <p className="text-gray-600 mt-2">{matrix.description}</p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-1 text-center">ID</th>
                <th className="border border-gray-300 p-1 text-left">Sub-Attribute</th>
                <th className="border border-gray-300 p-1 text-center">Category</th>
                {matrix.data.columns.map((column) => (
                  <th key={column.id} className="border border-gray-300 p-1 text-center">
                    {column.id}
                  </th>
                ))}
                <th className="border border-gray-300 p-1 text-center">Total</th>
                <th className="border border-gray-300 p-1 text-center">Category Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rowsByCategory).map(([category, rows], categoryIndex) => (
                <Fragment key={category}>
                  {rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                      <td className="border border-gray-300 p-1 text-center text-xs md:text-sm">{row.id}</td>
                      <td className="border border-gray-300 p-1 text-left text-xs md:text-sm">
                        {row.name}
                      </td>
                      {rowIndex === 0 ? (
                        <td 
                          className="border border-gray-300 p-1 text-center font-bold text-xs md:text-sm" 
                          rowSpan={rows.length}
                        >
                          {category}
                        </td>
                      ) : null}
                      {matrix.data.columns.map((column) => {
                        const key = `${row.id}_${column.id}`;
                        const value = matrix.data.dependencies[key] || false;
                        const isDisabled = row.id === column.id || row.id > column.id;
                        const isGreen = row.id > column.id;
                        
                        return (
                          <td 
                            key={key} 
                            className={`border border-gray-300 p-0 text-center ${
                              isDisabled ? (isGreen ? 'bg-green-800' : 'bg-gray-200') : (value ? 'bg-green-800' : 'bg-white')
                            }`}
                            onClick={() => isAuthorized && !isDisabled && handleCellChange(row.id, column.id)}
                            style={{ cursor: isAuthorized && !isDisabled ? 'pointer' : 'not-allowed', width: '20px', height: '20px', maxWidth: '30px' }}
                          >
                            {value && !isDisabled ? 'x' : ''}
                          </td>
                        );
                      })}
                      <td className="border border-gray-300 p-1 text-center font-bold text-xs md:text-sm">
                        {rowTotals[row.id] || 0}
                      </td>
                      {rowIndex === 0 ? (
                        <td 
                          className="border border-gray-300 p-1 text-center font-bold text-xs md:text-sm" 
                          rowSpan={rows.length}
                        >
                          {categoryTotals[category] || 0}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}