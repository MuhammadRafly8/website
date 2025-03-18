"use client";

import { useState, useEffect, Fragment } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from '../auth/authContext';

// Import untuk modal
import { Dialog, Transition } from '@headlessui/react';

interface StructuredMatrix {
  rows: { id: number; name: string; category: string }[];
  columns: { id: number; name: string }[];
  dependencies: Record<string, boolean>;
}

const MatrixTable = () => {
  const [matrix, setMatrix] = useState<StructuredMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");
  const [rowTotals, setRowTotals] = useState<Record<number, number>>({});
  const [columnTotals, setColumnTotals] = useState<Record<number, number>>({});
  const [categoryTotals, setcategoryTotals] = useState<Record<string, number>>({});
  const { isAdmin } = useAuth();
  
  // Tambahkan state untuk modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionTime, setSubmissionTime] = useState("");
  // Tambahkan state untuk melacak perubahan yang belum disimpan
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<unknown[]>([]);
  
  // Tambahkan state untuk mengelola penambahan sub-atribut baru
  const [newSubAttribute, setNewSubAttribute] = useState("");
  const [newSubAttributeCategory, setNewSubAttributeCategory] = useState("Technical/Ops");
  const [newSubAttributeId, setNewSubAttributeId] = useState<number | null>(null);
  const [showAddSubAttributeForm, setShowAddSubAttributeForm] = useState(false);

  useEffect(() => {
    // For demo purposes, we'll use hardcoded data to match the image
    const demoData: StructuredMatrix = {
      rows: [
        { id: 1, name: "Availability", category: "Technical/Ops" },
        { id: 2, name: "Preference for long term strategy", category: "Technical/Ops" },
        { id: 3, name: "Logistic", category: "Technical/Ops" },
        { id: 4, name: "Maintainability", category: "Technical/Ops" },
        { id: 5, name: "Durability", category: "Technical/Ops" },
        { id: 6, name: "Service Readiness", category: "Technical/Ops" },
        { id: 7, name: "Safety operation of tugboat", category: "Safety" },
        { id: 8, name: "Avoidance of Tank Top", category: "Safety" },
        { id: 9, name: "Safety to Crew", category: "Safety" },
        { id: 10, name: "Commercial & Org. Frame", category: "Economy" },
        { id: 11, name: "Operational Cost", category: "Economy" },
        { id: 12, name: "M/R Cost", category: "Economy" },
        { id: 13, name: "Penalty Cost", category: "Economy" },
        { id: 14, name: "Cost benefit Analysis", category: "Economy" },
        { id: 15, name: "Preference of SKKMIGAS", category: "other" },
        { id: 16, name: "Local Content", category: "other" },
      ],
      columns: [
        { id: 1, name: "1" },
        { id: 2, name: "2" },
        { id: 3, name: "3" },
        { id: 4, name: "4" },
        { id: 5, name: "5" },
        { id: 6, name: "6" },
        { id: 7, name: "7" },
        { id: 8, name: "8" },
        { id: 9, name: "9" },
        { id: 10, name: "10" },
        { id: 11, name: "11" },
        { id: 12, name: "12" },
        { id: 13, name: "13" },
        { id: 14, name: "14" },
        { id: 15, name: "15" },
        { id: 16, name: "16" },
      ],
      dependencies: {
        "1_3": true, "1_4": true, "1_7": true, "1_8": true, "1_10": true, "1_11": true, "1_12": true, "1_13": true, "1_14": true, "1_15": true, "1_16": true,
        "2_5": true, "2_10": true, "2_11": true, "2_12": true, "2_13": true, "2_14": true, "2_15": true,
        "3_4": true, "3_10": true, "3_11": true, "3_12": true, "3_14": true,
        "4_5": true, "4_6": true, "4_7": true, "4_10": true, "4_11": true, "4_12": true, "4_13": true, "4_14": true, "4_16": true,
        "5_6": true, "5_7": true, "5_11": true, "5_12": true, "5_13": true, "5_16": true,
        "6_8": true, "6_11": true, "6_12": true, "6_13": true, "6_16": true,
        "7_8": true, "7_10": true, "7_16": true,
        "8_11": true, "8_12": true, "8_13": true, "8_16": true,
        "9_11": true, "9_12": true, "9_16": true,
        "10_11": true, "10_12": true, "10_13": true, "10_14": true, "10_16": true,
        "11_12": true, "11_13": true, "11_14": true, "11_15": true,
        "12_13": true, "12_14": true, "12_15": true,
        "13_14": true, "13_15": true,
        "14_15": true,
        "15_16": true,
      }
    };

    setMatrix(demoData);
    calculateTotals(demoData);
    setLoading(false);
  }, []);

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
        
        // Only count dependencies where rowId < colId (below diagonal)
        if (rowId < colId) {
          rowTotals[rowId] = (rowTotals[rowId] || 0) + 1;
          columnTotals[colId] = (columnTotals[colId] || 0) + 1;
          
          const rowCategory = data.rows.find(r => r.id === rowId)?.category;
          if (rowCategory) {
            categoryTotals[rowCategory] = (categoryTotals[rowCategory] || 0) + 1;
          }
        }
      }
    });

    setRowTotals(rowTotals);
    setColumnTotals(columnTotals);
    setcategoryTotals(categoryTotals);
  };

  const handleSubAttributeChange = (rowId: number, newName: string) => {
    if (!matrix) return;
    
    setMatrix(prev => {
      if (!prev) return prev;
      
      const updatedRows = prev.rows.map(row => 
        row.id === rowId ? { ...row, name: newName } : row
      );
      
      return {
        ...prev,
        rows: updatedRows
      };
    });
  };

  const handleCellChange = async (rowId: number, columnId: number) => {
    if (!matrix) return;
    
    const key = `${rowId}_${columnId}`;
    const newValue = !matrix.dependencies[key];
    const rowName = matrix.rows.find(r => r.id === rowId)?.name || '';
    const columnName = matrix.columns.find(c => c.id === columnId)?.name || '';
    
    try {
      // Update local state immediately for better UX
      setMatrix(prev => {
        if (!prev) return prev;
        
        const newDependencies = {
          ...prev.dependencies,
          [key]: newValue
        };
        
        const newMatrix = {
          ...prev,
          dependencies: newDependencies
        };
        
        // Recalculate totals
        calculateTotals(newMatrix);
        
        return newMatrix;
      });
      
      // Simpan perubahan ke dalam pendingChanges, bukan langsung ke history
      const changeEntry = {
        userId: localStorage.getItem('userId') || 'unknown',
        userRole: localStorage.getItem('userRole') || 'user',
        timestamp: new Date().toISOString(),
        action: newValue ? 'add' : 'remove',
        rowId,
        columnId,
        rowName,
        columnName,
        cellKey: key
      };
      
      // Tambahkan perubahan ke daftar perubahan yang belum disimpan
      setPendingChanges(prev => [...prev, changeEntry]);
      setHasUnsavedChanges(true);
      
      // Update shared matrix di localStorage tanpa mencatat di history
      localStorage.setItem('sharedMatrix', JSON.stringify(matrix));
      
    } catch (error) {
      console.error("Error updating matrix:", error);
      toast.error("Failed to update matrix");
    }
  };

  const handleSubmitMatrix = async () => {
    if (!matrix) return;
    
    try {
      // Create a snapshot of the current matrix state
      const matrixSnapshot = JSON.stringify(matrix);
      
      // Get current timestamp
      const timestamp = new Date().toISOString();
      setSubmissionTime(new Date(timestamp).toLocaleString());
      
      // Record the submission in history
      const historyEntry = {
        userId: localStorage.getItem('userId') || 'unknown',
        userRole: localStorage.getItem('userRole') || 'user',
        timestamp: timestamp,
        action: 'submit_matrix',
        details: `${localStorage.getItem('userId') || 'User'} submitted their matrix`,
        matrixSnapshot: matrixSnapshot
      };
      
      // Ambil history yang ada
      const history = JSON.parse(localStorage.getItem('matrixHistory') || '[]');
      
      // Hanya tambahkan entri submit ke history
      history.push(historyEntry);
      
      // Simpan history yang diperbarui
      localStorage.setItem('matrixHistory', JSON.stringify(history));
      
      // Reset perubahan yang tertunda
      setPendingChanges([]);
      setHasUnsavedChanges(false);
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting matrix:", error);
      toast.error("Failed to submit matrix");
    }
  };

  const handleSaveMatrix = async () => {
    if (!matrix) return;
    
    try {
      // Create a snapshot of the current matrix state
      const matrixSnapshot = JSON.stringify(matrix);
      
      // Record the admin's edit in history
      const historyEntry = {
        userId: localStorage.getItem('userId') || 'unknown',
        userRole: 'admin',
        timestamp: new Date().toISOString(),
        action: 'edit_matrix',
        details: 'Admin edited and saved the matrix',
        matrixSnapshot: matrixSnapshot
      };
      
      // Ambil history yang ada
      const history = JSON.parse(localStorage.getItem('matrixHistory') || '[]');
      
      
      // Hanya tambahkan entri edit ke history
      history.push(historyEntry);
      
      // Simpan history yang diperbarui
      localStorage.setItem('matrixHistory', JSON.stringify(history));
      
      // Update the shared matrix in localStorage
      localStorage.setItem('sharedMatrix', JSON.stringify(matrix));
      
      // Reset perubahan yang tertunda
      setPendingChanges([]);
      setHasUnsavedChanges(false);
      
      toast.success("Matrix saved successfully");
    } catch (error) {
      console.error("Error saving matrix:", error);
      toast.error("Failed to save matrix");
    }
  };

  // Add function to load shared matrix if available
  useEffect(() => {
    const loadMatrix = () => {
      try {
        const sharedMatrixString = localStorage.getItem('sharedMatrix');
        if (sharedMatrixString) {
          const sharedMatrix = JSON.parse(sharedMatrixString);
          setMatrix(sharedMatrix);
          calculateTotals(sharedMatrix);
          setLoading(false);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error loading shared matrix:", error);
        return false;
      }
    };

    // First try to load shared matrix, if not available use demo data
    if (!loadMatrix()) {
      // For demo purposes, we'll use hardcoded data to match the image
      const demoData: StructuredMatrix = {
        rows: [
          { id: 1, name: "Availability", category: "Technical/Ops" },
          { id: 2, name: "Preference for long term strategy", category: "Technical/Ops" },
          { id: 3, name: "Logistic", category: "Technical/Ops" },
          { id: 4, name: "Maintainability", category: "Technical/Ops" },
          { id: 5, name: "Durability", category: "Technical/Ops" },
          { id: 6, name: "Service Readiness", category: "Technical/Ops" },
          { id: 7, name: "Safety operation of tugboat", category: "Safety" },
          { id: 8, name: "Avoidance of Tank Top", category: "Safety" },
          { id: 9, name: "Safety to Crew", category: "Safety" },
          { id: 10, name: "Commercial & Org. Frame", category: "Economy" },
          { id: 11, name: "Operational Cost", category: "Economy" },
          { id: 12, name: "M/R Cost", category: "Economy" },
          { id: 13, name: "Penalty Cost", category: "Economy" },
          { id: 14, name: "Cost benefit Analysis", category: "Economy" },
          { id: 15, name: "Preference of SKKMIGAS", category: "other" },
          { id: 16, name: "Local Content", category: "other" },
        ],
        columns: [
          { id: 1, name: "1" },
          { id: 2, name: "2" },
          { id: 3, name: "3" },
          { id: 4, name: "4" },
          { id: 5, name: "5" },
          { id: 6, name: "6" },
          { id: 7, name: "7" },
          { id: 8, name: "8" },
          { id: 9, name: "9" },
          { id: 10, name: "10" },
          { id: 11, name: "11" },
          { id: 12, name: "12" },
          { id: 13, name: "13" },
          { id: 14, name: "14" },
          { id: 15, name: "15" },
          { id: 16, name: "16" },
        ],
        dependencies: {
          "1_3": true, "1_4": true, "1_7": true, "1_8": true, "1_10": true, "1_11": true, "1_12": true, "1_13": true, "1_14": true, "1_15": true, "1_16": true,
          "2_5": true, "2_10": true, "2_11": true, "2_12": true, "2_13": true, "2_14": true, "2_15": true,
          "3_4": true, "3_10": true, "3_11": true, "3_12": true, "3_14": true,
          "4_5": true, "4_6": true, "4_7": true, "4_10": true, "4_11": true, "4_12": true, "4_13": true, "4_14": true, "4_16": true,
          "5_6": true, "5_7": true, "5_11": true, "5_12": true, "5_13": true, "5_16": true,
          "6_8": true, "6_11": true, "6_12": true, "6_13": true, "6_16": true,
          "7_8": true, "7_10": true, "7_16": true,
          "8_11": true, "8_12": true, "8_13": true, "8_16": true,
          "9_11": true, "9_12": true, "9_16": true,
          "10_11": true, "10_12": true, "10_13": true, "10_14": true, "10_16": true,
          "11_12": true, "11_13": true, "11_14": true, "11_15": true,
          "12_13": true, "12_14": true, "12_15": true,
          "13_14": true, "13_15": true,
          "14_15": true,
          "15_16": true,
        }
      };
  
      setMatrix(demoData);
      calculateTotals(demoData);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">Loading matrix data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  if (!matrix) {
    return <div className="p-8">No matrix data available</div>;
  }

  // Group rows by category
  const rowsByCategory: Record<string, typeof matrix.rows> = {};
  matrix.rows.forEach(row => {
    if (!rowsByCategory[row.category]) {
      rowsByCategory[row.category] = [];
    }
    rowsByCategory[row.category].push(row);
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
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      {isAdmin() && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h3 className="text-lg font-medium mb-2 md:mb-0">Matrix Management</h3>
            
            {!showAddSubAttributeForm ? (
              <button 
                onClick={() => setShowAddSubAttributeForm(true)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Add New Sub-Attribute
              </button>
            ) : (
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
                  placeholder="ID (opsional)"
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
                      
                      // Tentukan ID baru
                      let newId;
                      if (newSubAttributeId) {
                        // Gunakan ID yang dimasukkan pengguna
                        newId = newSubAttributeId;
                      } else {
                        // Gunakan ID tertinggi + 1 (default)
                        newId = Math.max(...matrix.rows.map(row => row.id)) + 1;
                      }
                      
                      // Periksa apakah ID sudah ada
                      const idExists = matrix.rows.some(row => row.id === newId);
                      if (idExists) {
                        toast.error(`ID ${newId} sudah digunakan. Silakan pilih ID lain.`);
                        return;
                      }
                      
                      const newRow = {
                        id: newId,
                        name: newSubAttribute,
                        category: newSubAttributeCategory
                      };
                      
                      // Update matrix with new row
                      setMatrix(prev => {
                        if (!prev) return prev;
                        
                        // Tambahkan row dan column baru
                        const updatedRows = [...prev.rows, newRow];
                        const updatedColumns = [...prev.columns, { id: newId, name: newId.toString() }];
                        
                        // Urutkan rows dan columns berdasarkan ID
                        updatedRows.sort((a, b) => a.id - b.id);
                        updatedColumns.sort((a, b) => a.id - b.id);
                        
                        const newMatrix = {
                          ...prev,
                          rows: updatedRows,
                          columns: updatedColumns
                        };
                        
                        // Recalculate totals
                        calculateTotals(newMatrix);
                        
                        // Set unsaved changes
                        setHasUnsavedChanges(true);
                        
                        return newMatrix;
                      });
                      
                      // Reset form
                      setNewSubAttribute('');
                      setNewSubAttributeId(null);
                      setShowAddSubAttributeForm(false);
                      
                      toast.success(`Sub-atribut baru berhasil ditambahkan dengan ID: ${newId}`);
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    disabled={!newSubAttribute.trim()}
                  >
                    Add
                  </button>
                  <button 
                    onClick={() => {
                      setShowAddSubAttributeForm(false);
                      setNewSubAttribute("");
                    }}
                    className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden md:rounded-lg shadow">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-1 bg-gray-100 text-center w-8 md:w-10 text-xs md:text-sm">No</th>
                <th className="border border-gray-300 p-1 bg-gray-100 text-left text-xs md:text-sm">Sub-Attribut</th>
                <th className="border border-gray-300 p-1 bg-gray-100 text-xs md:text-sm"></th>
                {matrix.columns.map((column) => (
                  <th key={column.id} className="border border-gray-300 p-1 bg-gray-100 text-center w-6 md:w-8 text-xs md:text-sm">
                    {column.name}
                  </th>
                ))}
                <th className="border border-gray-300 p-1 bg-gray-100 text-center text-xs md:text-sm">Relation to</th>
                <th className="border border-gray-300 p-1 bg-gray-100 text-center text-xs md:text-sm">Sub Total</th>
                {isAdmin() && (
                  <th className="border border-gray-300 p-1 bg-gray-100 text-center text-xs md:text-sm">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {Object.entries(rowsByCategory).map(([category, rows], categoryIndex) => (
                <Fragment key={category}>
                  {rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                      <td className="border border-gray-300 p-1 text-center text-xs md:text-sm">{row.id}</td>
                      <td className="border border-gray-300 p-1 text-left text-xs md:text-sm">
                        {isAdmin() ? (
                          <input 
                            type="text" 
                            value={row.name} 
                            onChange={(e) => handleSubAttributeChange(row.id, e.target.value)}
                            className="w-full p-1 border-b border-gray-300 focus:outline-none focus:border-green-500 text-xs md:text-sm"
                          />
                        ) : (
                          row.name
                        )}
                      </td>
                      {rowIndex === 0 ? (
                        <td 
                          className="border border-gray-300 p-1 text-center font-bold text-xs md:text-sm" 
                          rowSpan={rows.length}
                        >
                          {category}
                        </td>
                      ) : null}
                      {matrix.columns.map((column) => {
                        const key = `${row.id}_${column.id}`;
                        const value = matrix.dependencies[key] || false;
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
                      
                      {/* Tambahkan kolom Action untuk admin */}
                      {isAdmin() && (
                        <td className="border border-gray-300 p-1 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus sub-atribut "${row.name}"?`)) {
                                if (!matrix) return;
                                
                                // Hapus row
                                const updatedRows = matrix.rows.filter(r => r.id !== row.id);
                                
                                // Hapus column
                                const updatedColumns = matrix.columns.filter(c => c.id !== row.id);
                                
                                // Hapus dependencies yang terkait
                                const updatedDependencies = { ...matrix.dependencies };
                                Object.keys(updatedDependencies).forEach(key => {
                                  const [r, c] = key.split('_').map(Number);
                                  if (r === row.id || c === row.id) {
                                    delete updatedDependencies[key];
                                  }
                                });
                                
                                // Update matrix
                                const newMatrix = {
                                  ...matrix,
                                  rows: updatedRows,
                                  columns: updatedColumns,
                                  dependencies: updatedDependencies
                                };
                                
                                // Update state
                                setMatrix(newMatrix);
                                calculateTotals(newMatrix);
                                setHasUnsavedChanges(true);
                                
                                toast.success(`Sub-atribut "${row.name}" berhasil dihapus`);
                              }
                            }}
                            className="px-2 py-0.5 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            title="Hapus sub-atribut ini"
                          >
                            Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                ))}
              </Fragment>
            ))}
            <tr>
              <td colSpan={3} className="border border-gray-300 p-1 text-right font-bold text-xs md:text-sm">
                Relation From
              </td>
              {matrix.columns.map((column) => (
                <td key={column.id} className="border border-gray-300 p-1 text-center font-bold text-xs md:text-sm">
                  {columnTotals[column.id] || 0}
                </td>
              ))}
              <td className="border border-gray-300 p-1"></td>
              <td className="border border-gray-300 p-1"></td>
            </tr>
            <tr className="hidden md:table-row">
              <td colSpan={3} className="border border-gray-300 p-1 text-right font-bold text-xs md:text-sm">
                Sub Total
              </td>
              <td colSpan={6} className="border border-gray-300 p-1 text-center font-bold text-xs md:text-sm">
                {calculateGroupTotal(1, 6)}
              </td>
              <td colSpan={3} className="border border-gray-300 p-1 text-center font-bold text-xs md:text-sm">
                {calculateGroupTotal(7, 9)}
              </td>
              <td colSpan={5} className="border border-gray-300 p-1 text-center font-bold text-xs md:text-sm">
                {calculateGroupTotal(10, 14)}
              </td>
              <td colSpan={2} className="border border-gray-300 p-1 text-center font-bold text-xs md:text-sm">
                {calculateGroupTotal(15, 16)}
              </td>
            </tr>
            {/* Mobile version of Sub Total row */}
            <tr className="md:hidden">
              <td colSpan={3} className="border border-gray-300 p-1 text-right font-bold text-xs">
                Sub Total
              </td>
              <td colSpan={16} className="border border-gray-300 p-1 text-center font-bold text-xs">
                {calculateGroupTotal(1, 16)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    {isAdmin() ? (
      <div className="mt-4 flex justify-end px-4 sm:px-0">
        <button 
          className={`px-3 py-1.5 md:px-4 md:py-2 bg-green-800 text-white text-sm rounded hover:bg-green-700 ${hasUnsavedChanges ? 'animate-pulse' : ''}`}
          onClick={handleSaveMatrix}
        >
          Save Changes {hasUnsavedChanges && '(*)'}
        </button>
      </div>
    ) : (
      <div className="mt-4 flex justify-end px-4 sm:px-0">
        <button 
          className={`px-3 py-1.5 md:px-4 md:py-2 bg-green-800 text-white text-sm rounded hover:bg-green-700 ${hasUnsavedChanges ? 'animate-pulse' : ''}`}
          onClick={handleSubmitMatrix}
        >
          Submit Matrix {hasUnsavedChanges && '(*)'}
        </button>
      </div>
    )}
    
    {/* Success Modal */}
    <Transition appear show={showSuccessModal} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setShowSuccessModal(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Matrix Submitted Successfully
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Your matrix has been submitted successfully and will be reviewed by the admin.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Submitted at: {submissionTime}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    User: {localStorage.getItem('userId') || 'Unknown'}
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    Got it, thanks!
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  </div>
);
};

export default MatrixTable;