import { useState, useEffect } from 'react';
import { Button, Container, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../services/api';
import CreateInvoiceModal from '../components/CreateInvoiceModal';
import EditInvoiceModal from '../components/EditInvoiceModal';
import DataTable from 'react-data-table-component';
import { FaEdit, FaTrash, FaPrint } from 'react-icons/fa';
import { exportToCsv } from '../utils/exportToCsv';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [show, setShow] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getInvoices();
    setInvoices(res.data || []);
  };

  const handleDelete = async (id) => {
    await deleteInvoice(id);
    load();
  };

  const handleCreate = async (data) => {
    await createInvoice(data);
    setShow(false);
    load();
  };

  const handleUpdate = async (data) => {
    if (editInvoice) {
      await updateInvoice(editInvoice._id, data);
      setEditInvoice(null);
      setShow(false);
      load();
    }
  };

  const handlePrint = (invoice) => {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head><title>Invoice ${invoice.invoiceNumber}</title></head>
        <body>
          <h2>Invoice #${invoice.invoiceNumber}</h2>
          <p><strong>Customer:</strong> ${invoice.customer?.name || 'N/A'}</p>
          <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
          <table border="1" cellpadding="8" cellspacing="0">
            <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p><strong>Total Amount:</strong> $${invoice.totalAmount.toFixed(2)}</p>
        </body>
      </html>`;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const columns = [
    {
      name: 'Invoice #',
      selector: (row) => row.invoiceNumber,
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
      name: 'Total',
      selector: (row) => `$${row.totalAmount?.toFixed(2) || '0.00'}`,
      sortable: true,
      right: true,
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span className={`badge bg-${getStatusColor(row.status)}`}>
          {row.status?.toUpperCase()}
        </span>
      ),
    },
    {
      name: 'Paid',
      selector: (row) => `$${(row.amountPaid || 0).toFixed(2)}`,
      sortable: true,
      right: true,
    },
    {
      name: 'Balance',
      selector: (row) => `$${(row.balance || 0).toFixed(2)}`,
      sortable: true,
      right: true,
      cell: (row) => (
        <span className={row.balance > 0 ? 'text-danger' : 'text-success'}>
          ${row.balance?.toFixed(2) || '0.00'}
        </span>
      ),
    },
    {
      name: 'Actions',
      width: '160px',
      cell: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>} placement="top">
            <Button
              size="sm"
              variant="info"
              onClick={() => {
                setEditInvoice(row);
                setShow(true);
              }}
            >
              <FaEdit />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>} placement="top">
            <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
              <FaTrash />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>Print</Tooltip>} placement="top">
            <Button size="sm" variant="secondary" onClick={() => handlePrint(row)}>
              <FaPrint />
            </Button>
          </OverlayTrigger>
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
          <h3>Sales Invoices</h3>
          <div className="d-flex gap-2">
            <Button variant="success" onClick={() => exportToCsv(invoices, 'invoices')}>
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setEditInvoice(null);
                setShow(true);
              }}
            >
              New Invoice
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={invoices}
          pagination
          highlightOnHover
          responsive
          dense
        />

        {/* Show the correct modal */}
        {!editInvoice && (
          <CreateInvoiceModal
            show={show}
            handleClose={() => setShow(false)}
            handleSave={handleCreate}
          />
        )}
        {editInvoice && (
          <EditInvoiceModal
            show={show}
            handleClose={() => {
              setEditInvoice(null);
              setShow(false);
            }}
            handleSave={handleUpdate}
            invoice={editInvoice}
          />
        )}
      </Container>
    </div>
  );
}
