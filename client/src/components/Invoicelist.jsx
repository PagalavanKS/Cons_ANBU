import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getinvoice, deletedinvoice, genpdf } from "../services/api";

const Invoicelist = () => {
  const [invoicedata, setInvoice] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");

  const navigate = useNavigate();

  const fetchinvoice = async () => {
    try {
      const { data } = await getinvoice();
      setInvoice(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deletedinvoice(id);
        fetchinvoice();
        alert("Invoice deleted successfully.");
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete invoice. Please try again.");
      }
    }
  };

  const handleEdit = (id) => {
    const selectedInvoice = invoicedata.find((invoice) => invoice._id === id);
    if (selectedInvoice) {
      navigate(`/form/${id}`, { state: selectedInvoice });
    }
  };

  const handlePreview = async (id) => {
    try {
      const { data } = await genpdf(id);
      const pdfUrl = `${import.meta.env.VITE_API || 'http://localhost:5000'}${data.pdfPath}`;
      
      setPdfPreviewUrl(pdfUrl);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    }
  };

  useEffect(() => {
    fetchinvoice();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 p-8">
        {/* Add Invoice Button */}
        <Link to="/form">
          <div className="flex items-center justify-center w-[12vw] py-3 px-5 rounded-lg bg-gradient-to-r from-blue-800 to-indigo-900 text-white font-semibold shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105">
            + Add Invoice
          </div>
        </Link>

        {/* Invoice Table */}
        <div className="bg-white shadow-lg rounded-lg mt-6 overflow-hidden">
          <table className="w-full">
            <thead className="bg-indigo-900 text-white">
              <tr>
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Customer Name</th>
                <th className="p-4 text-left">Grand Total</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoicedata.map((value, index) => (
                <tr key={value._id} className="border-b hover:bg-gray-50 transition-all duration-200">
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4">{value.date}</td>
                  <td className="p-4 font-medium text-gray-800">{value.customername}</td>
                  <td className="p-4 text-green-600 font-semibold">₹{value.grandtotal.toFixed(2)}</td>
                  <td className="p-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(value._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(value._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition-all"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handlePreview(value._id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition-all"
                    >
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PDF Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-[80%] h-[90%] relative p-6 flex flex-col">
              
              {/* Close Button */}
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 text-white bg-red-500 px-3 py-2 rounded-full shadow-md hover:bg-red-600 transition-all"
              >
                ✕
              </button>
              
              {/* PDF Preview */}
              <iframe
                src={pdfPreviewUrl}
                title="PDF Preview"
                className="w-full h-full border rounded-lg"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoicelist;
