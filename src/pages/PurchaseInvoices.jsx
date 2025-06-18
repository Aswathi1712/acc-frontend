import { useState, useEffect } from 'react';
import { Button, Container, Modal } from 'react-bootstrap';
import {
  getPurchaseInvoices,
  createPurchaseInvoice,
  updatePurchaseInvoice,
  deletePurchaseInvoice,
} from '../services/api';
import PurchaseInvoiceModal from '../components/PurchaseInvoiceModal';
import { Pencil, Trash2, Eye, FileText, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DataTable from 'react-data-table-component';

export default function PurchaseInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [show, setShow] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getPurchaseInvoices();
    setInvoices(res.data || []);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await deletePurchaseInvoice(id);
      load();
    }
  };

  const handleSave = async (data) => {
    if (editInvoice) await updatePurchaseInvoice(editInvoice._id, data);
    else await createPurchaseInvoice(data);
    setShow(false);
    setEditInvoice(null);
    load();
  };

  const exportToExcel = () => {
    const wsData = invoices.map(inv => ({
      InvoiceNumber: inv.invoiceNumber,
      Supplier: inv.supplier?.name || 'N/A',
      Date: new Date(inv.date).toLocaleDateString(),
      TotalAmount: inv.totalAmount?.toFixed(2) || '0.00',
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PurchaseInvoices');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'PurchaseInvoices.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Purchase Invoices', 14, 16);
    doc.autoTable({
      head: [['Invoice #', 'Supplier', 'Date', 'Total']],
      body: invoices.map(inv => [
        inv.invoiceNumber,
        inv.supplier?.name || 'N/A',
        new Date(inv.date).toLocaleDateString(),
        `$${inv.totalAmount?.toFixed(2) || '0.00'}`
      ]),
      startY: 20
    });
    doc.save('PurchaseInvoices.pdf');
  };

  const columns = [
    {
      name: 'Invoice #',
      selector: row => row.invoiceNumber,
      sortable: true,
    },
    {
      name: 'Supplier',
      selector: row => row.supplier?.name || 'N/A',
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => new Date(row.date).toLocaleDateString(),
      sortable: true,
    },
    {
      name: 'Total',
      selector: row => `$${row.totalAmount?.toFixed(2) || '0.00'}`,
      sortable: true,
      right: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2 justify-content-center">
          <Button size="sm" variant="light" onClick={() => setPrintInvoice(row)}>
            <Eye size={14} />
          </Button>
          <Button size="sm" variant="primary" onClick={() => { setEditInvoice(row); setShow(true); }}>
            <Pencil size={14} />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
      width: '150px',
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div>
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Purchase Invoices</h3>
          <div className="d-flex gap-2">
            <Button variant="success" onClick={exportToExcel}><FileDown size={16} className="me-1" /> Export Excel</Button>
            <Button variant="danger" onClick={exportToPDF}><FileText size={16} className="me-1" /> Export PDF</Button>
            <Button variant="primary" onClick={() => { setEditInvoice(null); setShow(true); }}>New</Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={invoices}
          pagination
          highlightOnHover
          dense
          striped
          persistTableHead
        />

        <PurchaseInvoiceModal
          show={show}
          handleClose={() => setShow(false)}
          handleSave={handleSave}
          invoice={editInvoice}
        />

        <Modal show={!!printInvoice} onHide={() => setPrintInvoice(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Purchase Invoice</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {printInvoice && (
              <>
                <p><strong>Invoice #:</strong> {printInvoice.invoiceNumber}</p>
                <p><strong>Supplier:</strong> {printInvoice.supplier?.name || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date(printInvoice.date).toLocaleDateString()}</p>
                <table className="table table-bordered mt-3">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price?.toFixed(2) || '0.00'}</td>
                        <td>${(item.total ?? item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h5 className="text-end">Total: ${printInvoice.totalAmount?.toFixed(2) || '0.00'}</h5>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setPrintInvoice(null)}>Close</Button>
            <Button variant="success" onClick={() => window.print()}>Print</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
