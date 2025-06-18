import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { getReceipts, createReceipt, updateReceipt, deleteReceipt } from '../services/api';
import CreateReceiptModal from '../components/CreateReceiptModal';
import EditReceiptModal from '../components/EditReceiptModal';
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [modalType, setModalType] = useState(null); // 'create' or 'edit'
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadReceipts = async () => {
    try {
      const res = await getReceipts();
      setReceipts(res.data || []);
    } catch (err) {
      console.error('Failed to load receipts:', err);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const handleCreate = async (data) => {
    await createReceipt(data);
    setModalType(null);
    loadReceipts();
  };

  const handleEdit = async (data) => {
    if (!selectedReceipt) return;
    await updateReceipt(selectedReceipt._id, data);
    setModalType(null);
    setSelectedReceipt(null);
    loadReceipts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      await deleteReceipt(id);
      loadReceipts();
    }
  };

  const columns = [
    {
      name: 'Receipt #',
      selector: (row) => row.receiptNumber,
      sortable: true,
    },
    {
      name: 'Customer',
      selector: (row) => row.customer?.name || 'N/A',
      sortable: true,
    },
    {
      name: 'Date',
      selector: (row) => new Date(row.date).toLocaleDateString(),
      sortable: true,
    },
    {
      name: 'Amount',
      selector: (row) => `$${row.amount?.toFixed(2) || '0.00'}`,
      sortable: true,
      right: true,
    },
    {
      name: 'Payment Method',
      selector: (row) => row.paymentMethod || 'N/A',
      sortable: true,
    },
    {
      name: 'Invoice',
      selector: (row) => row.invoiceId?.invoiceNumber || 'N/A',
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <Button
            size="sm"
            variant="info"
            onClick={() => {
              setSelectedReceipt(row);
              setModalType('edit');
            }}
          >
            <FaEdit />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrash />
          </Button>
        </div>
      ),
      width: '140px',
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    }
  ];

  return (
    <div>
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Receipts</h3>
          <div className="d-flex gap-2">
            <CSVLink
              data={receipts}
              filename="receipts.csv"
              className="btn btn-success"
            >
              Export CSV
            </CSVLink>
            <Button onClick={() => { setSelectedReceipt(null); setModalType('create'); }}>
              New Receipt
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={receipts}
          expandableRows
          expandableRowsComponent={({ data }) => (
            <div className="p-3">
              <h6>Invoice Details</h6>
              {data.invoiceId ? (
                <>
                  <p>Invoice #: {data.invoiceId.invoiceNumber}</p>
                  <p>Invoice Date: {new Date(data.invoiceId.date).toLocaleDateString()}</p>
                  <p>Total: ${data.invoiceId.total?.toFixed(2) || '0.00'}</p>
                </>
              ) : (
                <p>No linked invoice</p>
              )}
              {data.notes && (
                <>
                  <h6 className="mt-3">Notes</h6>
                  <p>{data.notes}</p>
                </>
              )}
            </div>
          )}
          pagination
          highlightOnHover
          dense
          striped
          persistTableHead
        />

        {/* Modal switch */}
        {modalType === 'create' && (
          <CreateReceiptModal
            show
            handleClose={() => setModalType(null)}
            handleSave={handleCreate}
          />
        )}

        {modalType === 'edit' && selectedReceipt && (
          <EditReceiptModal
            show
            handleClose={() => {
              setModalType(null);
              setSelectedReceipt(null);
            }}
            handleSave={handleEdit}
            receipt={selectedReceipt}
          />
        )}
      </Container>
    </div>
  );
};

export default Receipts;
