"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "../../../components/auth/authContext";
import AdminRoute from "../../../components/auth/adminRoute";
import { MatrixItem } from "../../../types/matrix";
import { matrixService } from "../../../services/api";

export default function AdminMatrixPage() {
  const [matrices, setMatrices] = useState<MatrixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMatrix, setNewMatrix] = useState({
    title: "",
    description: "",
    keyword: ""
  });
  const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    // Load matrices from API instead of localStorage
    const fetchMatrices = async () => {
      try {
        const data = await matrixService.getAllMatrices();
        setMatrices(data);
      } catch (error) {
        console.error("Error fetching matrices:", error);
        toast.error("Failed to load matrices");
      } finally {
        setLoading(false);
      }
    };

    fetchMatrices();
  }, []);

  const handleCreateMatrix = async () => {
    if (!newMatrix.title || !newMatrix.keyword) {
      toast.error("Title and keyword are required");
      return;
    }

    // Create a new matrix with default structure
    const defaultMatrix = {
      rows: [
        { id: 1, name: "Availability", category: "Technical/Ops" },
        { id: 2, name: "Preference for long term strategy", category: "Technical/Ops" },
        { id: 3, name: "Logistic", category: "Technical/Ops" },
      ],
      columns: [
        { id: 1, name: "1" },
        { id: 2, name: "2" },
        { id: 3, name: "3" },
      ],
      dependencies: {}
    };

    try {
      const newMatrixData = {
        title: newMatrix.title,
        description: newMatrix.description,
        keyword: newMatrix.keyword,
        data: defaultMatrix,
      };

      const createdMatrix = await matrixService.createMatrix(newMatrixData);
      
      setMatrices([...matrices, createdMatrix]);
      setShowCreateModal(false);
      setNewMatrix({ title: "", description: "", keyword: "" });
      toast.success("Matrix created successfully");
    } catch (error) {
      console.error("Error creating matrix:", error);
      toast.error("Failed to create matrix");
    }
  };

  const handleDeleteMatrix = async (id: string) => {
    if (confirm("Are you sure you want to delete this matrix?")) {
      try {
        await matrixService.deleteMatrix(id);
        const updatedMatrices = matrices.filter(matrix => matrix.id !== id);
        setMatrices(updatedMatrices);
        toast.success("Matrix deleted successfully");
      } catch (error) {
        console.error("Error deleting matrix:", error);
        toast.error("Failed to delete matrix");
      }
    }
  };

  const copyShareLink = (id: string, keyword: string) => {
    const link = `${window.location.origin}/matrix/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Share link copied to clipboard! Keyword: " + keyword);
  };

  const viewMatrix = (id: string) => {
    router.push(`/matrix/${id}`);
  };

  const editMatrix = (id: string) => {
    router.push(`/admin/matrix/edit/${id}`);
  };

  return (
    <AdminRoute>
      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Matrix Management</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create New Matrix
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading matrices...</div>
          ) : matrices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No matrices created yet. Click the button above to create your first matrix.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Title</th>
                    <th className="border border-gray-300 p-2 text-left">Description</th>
                    <th className="border border-gray-300 p-2 text-left">Keyword</th>
                    <th className="border border-gray-300 p-2 text-left">Created</th>
                    <th className="border border-gray-300 p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matrices.map((matrix) => (
                    <tr key={matrix.id}>
                      <td className="border border-gray-300 p-2">{matrix.title}</td>
                      <td className="border border-gray-300 p-2">{matrix.description}</td>
                      <td className="border border-gray-300 p-2">{matrix.keyword}</td>
                      <td className="border border-gray-300 p-2">
                        {new Date(matrix.createdAt).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => viewMatrix(matrix.id)}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            title="View this matrix"
                          >
                            View
                          </button>
                          <button
                            onClick={() => editMatrix(matrix.id)}
                            className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                            title="Edit this matrix"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => copyShareLink(matrix.id, matrix.keyword)}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            title="Copy share link"
                          >
                            Share
                          </button>
                          <button
                            onClick={() => handleDeleteMatrix(matrix.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            title="Delete this matrix"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Matrix Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Create New Matrix</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newMatrix.title}
                    onChange={(e) => setNewMatrix({...newMatrix, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter matrix title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newMatrix.description}
                    onChange={(e) => setNewMatrix({...newMatrix, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter matrix description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Keyword *
                  </label>
                  <input
                    type="text"
                    value={newMatrix.keyword}
                    onChange={(e) => setNewMatrix({...newMatrix, keyword: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter access keyword"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This keyword will be required for users to access the matrix
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMatrix}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminRoute>
  );
}