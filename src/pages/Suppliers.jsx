import { useState, useEffect } from 'react';
import { Table, Button, Container, Modal, Form } from 'react-bootstrap';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const res = await getSuppliers();
    setSuppliers(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    editId
      ? await updateSupplier(editId, form)
      : await createSupplier(form);
    setShow(false);
    setForm({});
    setEditId(null);
    load();
  };

  const handleEdit = (supplier) => {
    setForm(supplier);
    setEditId(supplier._id);
    setShow(true);
  };

  const handleDelete = async (id) => {
    await deleteSupplier(id);
    load();
  };

  return (
    <div>
      <Container className="mt-4">
        <div className="d-flex justify-content-between mb-3">
          <h3>Suppliers</h3>
          <Button onClick={() => { setForm({}); setEditId(null); setShow(true); }}>Add Supplier</Button>
        </div>

        <Table bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.contactPerson}</td>
                <td>{s.phone}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>
                  <Button size="sm" onClick={() => handleEdit(s)}>Edit</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(s._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? 'Edit' : 'New'} Supplier</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {['name', 'contactPerson', 'phone', 'email', 'address'].map(field => (
                <Form.Group className="mb-3" key={field}>
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control
                    value={form[field] || ''}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                </Form.Group>
              ))}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
