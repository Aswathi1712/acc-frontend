import { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import SalesReturnModal from '../components/SalesReturnModal';
import ReturnPrintModal from '../components/ReturnPrintModal';
import { FaEdit, FaTrash, FaPrint } from 'react-icons/fa';
import {
  getSalesReturns,
  createSalesReturn,
  updateSalesReturn,
  deleteSalesReturn
} from '../services/api';
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';

export default function SalesReturns() {
  const [returns, setReturns] = useState([]);
  const [show, setShow] = useState(false);
  const [editReturn, setEditReturn] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printReturn, setPrintReturn] = useState(null);

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const res = await getSalesReturns();
      setReturns(res.data || []);
    } catch (err) {
      console.error('Failed to load returns:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this return?')) {
      await deleteSalesReturn(id);
      loadReturns();
    }
  };

  const handleSave = async (data) => {
    if (editReturn) {
      await updateSalesReturn(editReturn._id, data);
    } else {
      await createSalesReturn(data);
    }
    setShow(false);
    setEditReturn(null);
    loadReturns();
  };

  const handlePrint = (returnData) => {
    setPrintReturn(returnData);
    setShowPrintModal(true);
  };

  const columns = [
    {
      name: 'Return #',
      selector: (row) => row.returnNumber,
      sortable: true,
    },
    {
      name: 'Customer',
      selector: (row) => row.customer?.name || row.customer || 'N/A',
      sortable: true,
    },
    {
      name: 'Date',
      selector: (row) => new Date(row.date).toLocaleDateString(),
      sortable: true,
    },
    {
      name: 'Total',
      selector: (row) => `$${row.totalAmount.toFixed(2)}`,
      sortable: true,
      right: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <Button
            size="sm"
            variant="info"
            onClick={() => {
              setEditReturn(row);
              setShow(true);
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
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handlePrint(row)}
          >
            <FaPrint />
          </Button>
        </div>
      ),
      width: '150px',
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    }

  ];

  return (
    <div>
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Sales Returns</h3>
          <div className="d-flex gap-2">
            <CSVLink data={returns} filename="sales_returns.csv" className="btn btn-success">
              Export CSV
            </CSVLink>
            <Button
              onClick={() => {
                setEditReturn(null);
                setShow(true);
              }}
            >
              New Return
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={returns}
          pagination
          highlightOnHover
          dense
          striped
          persistTableHead
        />

        <SalesReturnModal
          show={show}
          handleClose={() => setShow(false)}
          handleSave={handleSave}
          salesReturn={editReturn}
        />

        <ReturnPrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          returnData={printReturn}
        />
      </Container>
    </div>
  );
}
