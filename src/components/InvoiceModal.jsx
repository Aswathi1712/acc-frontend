import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { getCustomers, getNewInvoiceNumber } from '../services/api';

export default function InvoiceModal({ show, handleClose, handleSave, invoice }) {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customer: '',
    date: '',
    items: [],
    totalAmount: 0,
    amountPaid: 0,
    balance: 0,
  });

  const [customers, setCustomers] = useState([]);

  // Clear form when modal is closed
useEffect(() => {
  if (!show && !invoice) {
    setFormData({
      invoiceNumber: '',
      customer: '',
      date: '',
      items: [],
      totalAmount: 0,
      amountPaid: 0,
      balance: 0,
    });
  }
}, [show, invoice]);


  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomers();
        setCustomers(res.data || []);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const initializeForm = async () => {
      if (invoice) {
        setFormData(invoice);
      } else {
        try {
          const res = await getNewInvoiceNumber();
          setFormData({
            invoiceNumber: res.data.invoiceNumber || '',
            customer: '',
            date: '',
            items: [],
            totalAmount: 0,
            amountPaid: 0,
            balance: 0,
          });
        } catch (err) {
          console.error('Failed to fetch new invoice number', err);
        }
      }
    };

    if (show) {
      initializeForm();
    }
  }, [invoice, show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomerChange = (selectedOption) => {
    setFormData({ ...formData, customer: selectedOption ? selectedOption.value : '' });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, price: 0, total: 0 }] });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    items[index][field] = field === 'description' ? value : parseFloat(value);
    items[index].total = items[index].quantity * items[index].price;
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const balance = totalAmount - formData.amountPaid;
    setFormData({ ...formData, items, totalAmount, balance });
  };

  const handleAmountPaidChange = (e) => {
    const amountPaid = parseFloat(e.target.value) || 0;
    const balance = formData.totalAmount - amountPaid;
    setFormData({ ...formData, amountPaid, balance });
  };

  const submit = () => handleSave(formData);

  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  const selectedCustomer = customerOptions.find(opt => opt.value === formData.customer);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{invoice ? 'Edit' : 'New'} Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Invoice #</Form.Label>
            <Form.Control
              name="invoiceNumber"
              value={formData.invoiceNumber}
              readOnly
              disabled
            />
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
                  placeholder="Description"
                  value={item.description}
                  onChange={e => handleItemChange(i, 'description', e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={e => handleItemChange(i, 'quantity', e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  placeholder="Price"
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

          <hr />

          <Form.Group className="mb-2">
            <Form.Label>Amount Paid</Form.Label>
            <Form.Control
              type="number"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleAmountPaidChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Balance</Form.Label>
            <Form.Control value={formData.balance.toFixed(2)} readOnly />
          </Form.Group>

          <h5>Total: ${formData.totalAmount.toFixed(2)}</h5>
        </Form>
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
