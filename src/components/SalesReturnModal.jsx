import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import {
  getCustomers,
  getInvoices,
  getNewReturnNumber,
} from '../services/api';

export default function SalesReturnModal({ show, handleClose, handleSave, salesReturn }) {
  const [formData, setFormData] = useState({
    returnNumber: '',
    customer: '',
    date: '',
    items: [],
    totalAmount: 0,
  });

  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Fetch customers and invoices once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, invoiceRes] = await Promise.all([getCustomers(), getInvoices()]);

        const allCustomers = customerRes.data || [];
        const invoiceData = invoiceRes.data || [];

        setInvoices(invoiceData);

        const invoiceCustomerIds = invoiceData.map(inv =>
          typeof inv.customer === 'string' ? inv.customer : inv.customer._id
        );
        const uniqueCustomerIds = [...new Set(invoiceCustomerIds)];
        const filtered = allCustomers.filter(c => uniqueCustomerIds.includes(c._id));

        setCustomers(filtered);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  // Fetch new return number if creating new return
  useEffect(() => {
    const initialize = async () => {
      if (salesReturn) {
        setFormData(salesReturn);
      } else {
        try {
          const { data } = await getNewReturnNumber();
          setFormData({
            returnNumber: data.returnNumber,
            customer: '',
            date: '',
            items: [],
            totalAmount: 0,
          });
        } catch (err) {
          console.error('Error getting new return number', err);
        }
      }
    };

    if (show) {
      initialize();
    }
  }, [show, salesReturn]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCustomerChange = (selected) => {
    setFormData({ ...formData, customer: selected ? selected.value : '' });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0, total: 0 }],
    });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    items[index][field] = field === 'description' ? value : parseFloat(value) || 0;
    items[index].total = items[index].quantity * items[index].price;
    const totalAmount = items.reduce((sum, i) => sum + i.total, 0);
    setFormData({ ...formData, items, totalAmount });
  };

  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  const selectedCustomer = customerOptions.find(opt => opt.value === formData.customer);

  const submit = () => handleSave(formData);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{salesReturn ? 'Edit' : 'New'} Sales Return</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Return #</Form.Label>
            <Form.Control value={formData.returnNumber} readOnly />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Customer</Form.Label>
            <Select
              options={customerOptions}
              value={selectedCustomer}
              onChange={handleCustomerChange}
              isClearable
              placeholder="Select a customer..."
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </Form.Group>

          <hr />
          <h6>Items</h6>
          <Row className="fw-bold text-muted mb-2">
            <Col>Description</Col>
            <Col>Qty</Col>
            <Col>Price</Col>
            <Col>Total</Col>
          </Row>

          {formData.items.map((item, i) => (
            <Row key={i} className="mb-2">
              <Col>
                <Form.Control
                  value={item.description}
                  onChange={e => handleItemChange(i, 'description', e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  value={item.quantity}
                  onChange={e => handleItemChange(i, 'quantity', e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  value={item.price}
                  onChange={e => handleItemChange(i, 'price', e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control value={item.total.toFixed(2)} readOnly />
              </Col>
            </Row>
          ))}

          <Button variant="secondary" onClick={addItem}>
            Add Item
          </Button>
        </Form>
        <hr />
        <h5>Total: ${formData.totalAmount.toFixed(2)}</h5>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
