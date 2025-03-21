"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "../../../../../components/auth/authContext";
import AdminRoute from "../../../../../components/auth/adminRoute";
import { MatrixItem, StructuredMatrix } from "../../../../../types/matrix";
import { matrixService } from "../../../../../services/api";

export default function EditMatrixPage() {
  const [matrix, setMatrix] = useState<MatrixItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [rowTotals, setRowTotals] = useState<Record<number, number>>({});
  const [columnTotals, setColumnTotals] = useState<Record<number, number>>({});
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newSubAttribute, setNewSubAttribute] = useState("");
  const [newSubAttributeCategory, setNewSubAttributeCategory] = useState("Technical/Ops");
  const [newSubAttributeId, setNewSubAttributeId] = useState<number | null>(null);
  const [showAddSubAttributeForm, setShowAddSubAttributeForm] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const matrixId = params.id as string;
  const { isAdmin } = useAuth();

  useEffect(() => {
    // Load matrix from API instead of localStorage
    const fetchMatrix = async () => {
      try {
        const data = await matrixService.getMatrixById(matrixId);
        setMatrix(data);
        calculateTotals(data.data);
      } catch (error) {
        console.error("Error fetching matrix:", error);
        toast.error("Matrix not found");
        router.push("/admin/matrix");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin()) {
      fetchMatrix();
    }
  }, [matrixId, router, isAdmin]);

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

  const handleCellChange = (rowId: number, colId: number) => {
    if (!matrix) return;
    
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
    setHasUnsavedChanges(true);
  };

  const handleSubAttributeChange = (id: number, newName: string) => {
    if (!matrix) return;
    
    const updatedMatrix = {
      ...matrix,
      data: {
        ...matrix.data,
        rows: matrix.data.rows.map(row => 
          row.id === id ? { ...row, name: newName } : row
        )
      }
    };
    
    setMatrix(updatedMatrix);
    setHasUnsavedChanges(true);
  };

  const saveChanges = async () => {
    if (!matrix) return;
    
    try {
      // Save to API instead of localStorage
      await matrixService.updateMatrix(matrix.id, matrix);
      setHasUnsavedChanges(false);
      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    }
  };

  const updateMatrixInfo = (field: string, value: string) => {
    if (!matrix) return;
    
    setMatrix({
      ...matrix,
      [field]: value
    });
    
    setHasUnsavedChanges(true);
  };

  if (loading) {
    return (
      <AdminRoute>
        <div className="flex-grow container mx-auto p-4 text-center">
          Loading matrix data...
        </div>
      </AdminRoute>
    );
  }

  if (!matrix) {
    return (
      <AdminRoute>
        <div className="flex-grow container mx-auto p-4 text-center">
          Matrix not found
        </div>
      </AdminRoute>
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
    <AdminRoute>
      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Matrix</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push("/admin/matrix")}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Back to List
              </button>
              <button
                onClick={saveChanges}
                disabled={!hasUnsavedChanges}
                className={`px-4 py-2 ${
                  hasUnsavedChanges 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-gray-400 cursor-not-allowed"
                } text-white rounded`}
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className="mb-6 space-y-4 border-b pb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={matrix.title}
                onChange={(e) => updateMatrixInfo('title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={matrix.description}
                onChange={(e) => updateMatrixInfo('description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Keyword
              </label>
              <input
                type="text"
                value={matrix.keyword}
                onChange={(e) => updateMatrixInfo('keyword', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <button
              onClick={() => setShowAddSubAttributeForm(!showAddSubAttributeForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showAddSubAttributeForm ? "Cancel" : "Add New Sub-Attribute"}
            </button>
            
            {showAddSubAttributeForm && (
              <div className="w-full md:w-auto flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
                <select
                  value={newSubAttributeCategory}
                  onChange={(e) => setNewSubAttributeCategory(e.target.value)}
                  className="p-1.5 border border-gray-300 rounded text-sm"
                >
                  <option value="Technical/Ops">Technical/Ops</option>
                  <option value="Safety">Safety</option>
                  <option value="Economy">Economy</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  value={newSubAttribute}
                  onChange={(e) => setNewSubAttribute(e.target.value)}
                  placeholder="Enter new sub-attribute name"
                  className="p-1.5 border border-gray-300 rounded text-sm flex-grow"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="ID (optional)"
                  className="p-1.5 border border-gray-300 rounded text-sm w-24"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      setNewSubAttributeId(value);
                    } else {
                      setNewSubAttributeId(null);
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (!matrix) return;
                      
                      // Determine new ID
                      let newId;
                      if (newSubAttributeId) {
                        // Use user-provided ID
                        newId = newSubAttributeId;
                      } else {
                        // Use highest ID + 1 (default)
                        newId = Math.max(...matrix.data.rows.map(row => row.id)) + 1;
                      }
                      
                      // Check if ID already exists
                      const idExists = matrix.data.rows.some(row => row.id === newId);
                      if (idExists) {
                        toast.error(`ID ${newId} already exists. Please choose a different ID.`);
                        return;
                      }
                      
                      const newRow = {
                        id: newId,
                        name: newSubAttribute,
                        category: newSubAttributeCategory
                      };
                      
                      // Update matrix with new row
                      const updatedMatrix = {
                        ...matrix,
                        data: {
                          ...matrix.data,
                          rows: [...matrix.data.rows, newRow],
                          columns: [...matrix.data.columns, { id: newId, name: newId.toString() }]
                        }
                      };
                      
                      setMatrix(updatedMatrix);
                      calculateTotals(updatedMatrix.data);
                      setHasUnsavedChanges(true);
                      
                      // Reset form
                      setNewSubAttribute('');
                      setNewSubAttributeId(null);
                      setShowAddSubAttributeForm(false);
                      
                      toast.success(`New sub-attribute added with ID: ${newId}`);
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    disabled={!newSubAttribute.trim()}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddSubAttributeForm(false)}
                    className="px-3 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
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
                  <th className="border border-gray-300 p-1 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rowsByCategory).map(([category, rows]) => (
                  <Fragment key={category}>
                    {rows.map((row, rowIndex) => (
                      <tr key={row.id}>
                        <td className="border border-gray-300 p-1 text-center text-xs md:text-sm">{row.id}</td>
                        <td className="border border-gray-300 p-1 text-left text-xs md:text-sm">
                          <input 
                            type="text" 
                            value={row.name} 
                            onChange={(e) => handleSubAttributeChange(row.id, e.target.value)}
                            className="w-full p-1 border-b border-gray-300 focus:outline-none focus:border-green-500 text-xs md:text-sm"
                          />
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
                              onClick={() => !isDisabled && handleCellChange(row.id, column.id)}
                              style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', width: '20px', height: '20px', maxWidth: '30px' }}
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
                        <td className="border border-gray-300 p-1 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete sub-attribute "${row.name}"?`)) {
                                if (!matrix) return;
                                
                                // Remove row
                                const updatedRows = matrix.data.rows.filter(r => r.id !== row.id);
                                
                                // Remove column
                                const updatedColumns = matrix.data.columns.filter(c => c.id !== row.id);
                                
                                // Remove related dependencies
                                const updatedDependencies = { ...matrix.data.dependencies };
                                Object.keys(updatedDependencies).forEach(key => {
                                  const [r, c] = key.split('_').map(Number);
                                  if (r === row.id || c === row.id) {
                                    delete updatedDependencies[key];
                                  }
                                });
                                
                                // Update matrix
                                const updatedMatrix = {
                                  ...matrix,
                                  data: {
                                    ...matrix.data,
                                    rows: updatedRows,
                                    columns: updatedColumns,
                                    dependencies: updatedDependencies
                                  }
                                };
                                
                                // Update state
                                setMatrix(updatedMatrix);
                                calculateTotals(updatedMatrix.data);
                                setHasUnsavedChanges(true);
                                
                                toast.success(`Sub-attribute "${row.name}" deleted successfully`);
                              }
                            }}
                            className="px-2 py-0.5 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            title="Delete this sub-attribute"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AdminRoute>
  );
}