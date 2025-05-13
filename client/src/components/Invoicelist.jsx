import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getinvoice, deletedinvoice, genpdf } from "../services/api";

const Invoicelist = () => {
  const [invoicedata, setInvoice] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

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
      setLoading(true); // Add loading state to show user something is happening
      
      const { data } = await genpdf(id);
      
      if (!data || !data.pdfPath) {
        throw new Error('Invalid response from server');
      }
      
      const pdfUrl = `${import.meta.env.VITE_API || 'http://localhost:5000'}${data.pdfPath}`;
      
      // Verify that URL is valid
      console.log('PDF URL:', pdfUrl);
      
      setPdfPreviewUrl(pdfUrl);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // More descriptive error message
      let errorMessage = "An error occurred while generating the PDF.";
      
      if (error.response) {
        // Server returned an error response
        errorMessage += ` Server says: ${error.response.data.error || 'Unknown server error'}`;
      } else if (error.request) {
        // Server didn't respond
        errorMessage += " Server is not responding. Please try again later.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false); // Ensure loading state is cleared
    }
  };

  useEffect(() => {
    fetchinvoice();
  }, []);

  return (
    <div className="invoice-container">
      <Sidebar />
      
      <div className="invoice-content">
        {/* Add Invoice Button */}
        <Link to="/form" className="add-invoice-button">
          + Add Invoice
        </Link>

        {/* Invoice Table */}
        <div className="invoice-table-container">
          <table className="invoice-table">
            <thead className="invoice-table-header">
              <tr>
                <th className="invoice-table-cell">#</th>
                <th className="invoice-table-cell">Date</th>
                <th className="invoice-table-cell">Customer Name</th>
                <th className="invoice-table-cell">Grand Total</th>
                <th className="invoice-table-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(invoicedata) ? invoicedata.map((value, index) => (
                <tr key={value._id} className="invoice-table-row">
                  <td className="invoice-table-cell">{index + 1}</td>
                  <td className="invoice-table-cell">{value.date}</td>
                  <td className="invoice-table-cell invoice-customer">{value.customername}</td>
                  <td className="invoice-table-cell invoice-amount">₹{value.grandtotal.toFixed(2)}</td>
                  <td className="invoice-table-cell">
                    <div className="invoice-actions">
                      <button
                        onClick={() => handleEdit(value._id)}
                        className="invoice-action-button invoice-action-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(value._id)}
                        className="invoice-action-button invoice-action-delete"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handlePreview(value._id)}
                        className="invoice-action-button invoice-action-print"
                      >
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="5" className="invoice-table-cell">No data available</td></tr>}
            </tbody>
          </table>
        </div>

        {/* PDF Preview Modal */}
        {showPreview && (
          <div className="modal-overlay">
            <div className="modal-container">
              {/* Close Button */}
              <button
                onClick={() => setShowPreview(false)}
                className="modal-close-button"
              >
                ✕
              </button>
              
              {/* PDF Preview */}
              <iframe
                src={pdfPreviewUrl}
                title="PDF Preview"
                className="modal-iframe"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoicelist;
