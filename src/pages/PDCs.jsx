// src/pages/PDCs.js
import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import {
  getPDCs,
  createPDC,
  markPDCRealised,
  markPDCBounced,
  deletePDC,
} from '../services/api';
import PdcModal from '../components/PdcModal';
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const PDCs = () => {
  const [pdcs, setPdcs] = useState([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(null);

  const load = async () => {
    const res = await getPDCs();
    setPdcs(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (data) => {
    await createPDC(data);
    setShow(false);
    setEdit(null);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this PDC?')) {
      await deletePDC(id);
      load();
    }
  };

  const handleRealise = async (id) => {
    await markPDCRealised(id);
    load();
  };

  const handleBounce = async (id) => {
    await markPDCBounced(id);
    load();
  };

  const columns = [
  { name: 'Cheque No', selector: row => row.chequeNumber, sortable: true },
  { name: 'Customer', selector: row => row.party?.name, sortable: true },
  { name: 'Issue Date', selector: row => new Date(row.issueDate).toLocaleDateString(), sortable: true },
  { name: 'Due Date', selector: row => new Date(row.dueDate).toLocaleDateString(), sortable: true },
  { name: 'Amount', selector: row => `$${row.amount.toFixed(2)}`, sortable: true, right: true },
  { name: 'Status', selector: row => row.status, sortable: true },
  {
    name: 'Actions',
    cell: row => (
      <div className="d-flex gap-2 justify-content-center">
        {row.status === 'New' && (
          <>
            <Button size="sm" variant="success" onClick={() => handleRealise(row._id)}><FaCheck /></Button>
            <Button size="sm" variant="warning" onClick={() => handleBounce(row._id)}><FaTimes /></Button>
          </>
        )}
        <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}><FaTrash /></Button>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: '200px'
  }
];


  return (
    <div>
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>PDC Realisation</h3>
          <div className="d-flex gap-2">
            <CSVLink data={pdcs} filename="pdc.csv" className="btn btn-success">Export CSV</CSVLink>
            <Button onClick={() => setShow(true)}>New PDC</Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={pdcs}
          pagination
          highlightOnHover
          dense
          striped
          persistTableHead
        />

        <PdcModal
          show={show}
          handleClose={() => setShow(false)}
          handleSave={handleSave}
          pdc={edit}
        />
      </Container>
    </div>
  );
};

export default PDCs;