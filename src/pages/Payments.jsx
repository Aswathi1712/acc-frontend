import { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '../services/api';
import PaymentCreateModal from '../components/CreatePaymentModal';
import PaymentEditModal from '../components/EditPaymentModal';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPayment, setEditPayment] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await getPayments();
      setPayments(res.data || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createPayment(data);
      setShowCreateModal(false);
      loadPayments();
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updatePayment(editPayment._id, data);
      setEditPayment(null);
      setShowEditModal(false);
      loadPayments();
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await deletePayment(id);
        loadPayments();
      } catch (error) {
        console.error('Failed to delete payment:', error);
      }
    }
  };

  const columns = [
    {
      name: 'Date',
      selector: (row) => new Date(row.date).toLocaleDateString(),
      sortable: true,
    },
    { name: 'Type', selector: (row) => row.type, sortable: true },
    {
      name: 'Party',
      selector: (row) => row.party?.name || 'N/A',
      sortable: true,
    },
    {
      name: 'Amount',
      selector: (row) => `$${row.amount.toFixed(2)}`,
      sortable: true,
      right: true,
    },
    {
      name: 'Applied To',
      selector: (row) => row.appliedInvoices?.length || 0,
      sortable: true,
      cell: (row) => (
        <span>
          {row.appliedInvoices?.length || 0} invoice(s)
        </span>
      ),
    },
    {
      name: 'Method',
      selector: (row) => row.method,
      sortable: true,
    },
    {
      name: 'Actions',
      width: '150px',
      cell: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <Button
            size="sm"
            variant="info"
            onClick={() => {
              setEditPayment(row);
              setShowEditModal(true);
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
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div>
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Payments</h3>
          <div className="d-flex gap-2">
            <CSVLink
              data={payments}
              filename="payments.csv"
              className="btn btn-success"
            >
              Export CSV
            </CSVLink>
            <Button
              onClick={() => {
                setShowCreateModal(true);
              }}
            >
              New Payment
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={payments}
          expandableRows
          expandableRowsComponent={({ data }) => (
            <div className="p-3">
              <h6>Applied Invoices</h6>
              {data.appliedInvoices?.length > 0 ? (
                <ul>
                  {data.appliedInvoices.map((inv, i) => (
                    <li key={i}>
                      Invoice #{inv.invoice?.invoiceNumber}: ${inv.amount.toFixed(2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No invoices applied</p>
              )}
            </div>
          )}
          pagination
          highlightOnHover
          defaultSortField="date"
          striped
          responsive
          dense
          persistTableHead
        />

        {/* CREATE MODAL */}
        <PaymentCreateModal
          show={showCreateModal}
          handleClose={() => setShowCreateModal(false)}
          handleSave={handleCreate}
        />

        {/* EDIT MODAL */}
        {editPayment && (
          <PaymentEditModal
            show={showEditModal}
            handleClose={() => {
              setEditPayment(null);
              setShowEditModal(false);
            }}
            handleSave={handleUpdate}
            payment={editPayment}
          />
        )}
      </Container>
    </div>
  );
}
