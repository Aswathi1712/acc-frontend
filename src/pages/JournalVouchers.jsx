import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { getJournalVouchers, createJournalVoucher, updateJournalVoucher, deleteJournalVoucher } from '../services/api';
import JournalVoucherModal from '../components/JournalVoucherModal';
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import { FaEdit, FaTrash } from 'react-icons/fa';

const JournalVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(null);

  const load = async () => {
    const res = await getJournalVouchers();
    setVouchers(res.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (edit) await updateJournalVoucher(edit._id, data);
    else await createJournalVoucher(data);
    setShow(false);
    setEdit(null);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      await deleteJournalVoucher(id);
      load();
    }
  };

  const columns = [
    { name: 'Voucher #', selector: row => row.voucherNumber, sortable: true },
    { name: 'Date', selector: row => new Date(row.date).toLocaleDateString(), sortable: true },
    { name: 'Description', selector: row => row.description, sortable: true },
    { name: 'Amount', selector: row => `$${row.amount?.toFixed(2) || '0.00'}`, sortable: true, right: true },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2 justify-content-center">
          <Button size="sm" variant="info" onClick={() => { setEdit(row); setShow(true); }}>
            <FaEdit />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
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
          <h3>Journal Vouchers</h3>
          <div className="d-flex gap-2">
            <CSVLink data={vouchers} filename="journal_vouchers.csv" className="btn btn-success">Export CSV</CSVLink>
            <Button onClick={() => { setEdit(null); setShow(true); }}>New Voucher</Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={vouchers}
          pagination
          highlightOnHover
          dense
          striped
          persistTableHead
        />

        <JournalVoucherModal
          show={show}
          handleClose={() => setShow(false)}
          handleSave={handleSave}
          voucher={edit}
        />
      </Container>
    </div>
  );
};

export default JournalVouchers;
