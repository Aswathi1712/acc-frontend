import { useEffect, useState } from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';
import CustomerModal from '../components/CustomerModal';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [show, setShow] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  const loadCustomers = async () => {
    try {
      const res = await getCustomers();
      console.log('Customer API Response:', res.data);
      // Make sure it’s always an array
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setCustomers([]); // fallback
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDelete = async (id) => {
    await deleteCustomer(id);
    loadCustomers();
  };

  const handleSave = async (customerData) => {
    if (editCustomer) {
      await updateCustomer(editCustomer._id, customerData);
    } else {
      await createCustomer(customerData);
    }
    setShow(false);
    setEditCustomer(null);
    loadCustomers();
  };

  return (
    <div>
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Customers</h3>
          <Button onClick={() => { setEditCustomer(null); setShow(true); }}>Add Customer</Button>
        </div>
        <Table bordered hover responsive>
          <thead className="table-primary">
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(customers) && customers.map((c) => (
              <tr key={c._id}>
                <td>
                  <img src={c.photo} alt="profile" width="40" height="40" className="rounded-circle" />
                </td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.type}</td>
                <td>
                  <Button size="sm" variant="info" onClick={() => { setEditCustomer(c); setShow(true); }}>Edit</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(c._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <CustomerModal
        show={show}
        handleClose={() => setShow(false)}
        handleSave={handleSave}
        customer={editCustomer}
      />
    </div>
  );
}
