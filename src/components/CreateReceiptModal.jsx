import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import {
  getCustomers,
  getNewReceiptNumber,
  getInvoicesByCustomer,
} from '../services/api';

export default function CreateReceiptModal({ show, handleClose, handleSave }) {
  const [formData, setFormData] = useState({
    receiptNumber: '',
    customer: '',
    date: '',
    amount: '',
    paymentMethod: 'Cash',
    notes: '',
    invoiceId: '',
  });

  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [noInvoices, setNoInvoices] = useState(false);
  const [maxBalance, setMaxBalance] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const res = await getCustomers();
      setCustomers(res.data || []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data } = await getNewReceiptNumber();
      setFormData(prev => ({
        ...prev,
        receiptNumber: data.receiptNumber,
        date: new Date().toISOString().split('T')[0],
      }));
      setInvoices([]);
      setNoInvoices(false);
    };

    if (show) init();
  }, [show]);

  const fetchInvoices = async (customerId) => {
    try {
      const res = await getInvoicesByCustomer(customerId);
      const data = res.data;
      setInvoices(data);
      setNoInvoices(data.length === 0);

      if (data.length === 1) {
        setFormData(prev => ({
          ...prev,
          invoiceId: data[0]._id,
          amount: data[0].balance,
        }));
        setMaxBalance(data[0].balance);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setInvoices([]);
      setNoInvoices(true);
    }
  };

  const onChange = async (e) => {
    const { name, value } = e.target;
    setError('');

    if (name === 'amount' && Number(value) > maxBalance) {
      setError(`Amount cannot exceed invoice balance (₹${maxBalance})`);
      return;
    }

    if (name === 'customer') {
      setFormData({ ...formData, customer: value, invoiceId: '', amount: '' });
      await fetchInvoices(value);
      return;
    }

    if (name === 'invoiceId') {
      const selected = invoices.find(i => i._id === value);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          invoiceId: value,
          amount: selected.balance,
        }));
        setMaxBalance(selected.balance);
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = () => {
    if (Number(formData.amount) > maxBalance) {
      setError(`Amount cannot exceed invoice balance (₹${maxBalance})`);
      return;
    }

    handleSave(formData);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>New Receipt</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Receipt Number</Form.Label>
            <Form.Control name="receiptNumber" value={formData.receiptNumber} readOnly />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Customer</Form.Label>
            <Form.Select name="customer" value={formData.customer} onChange={onChange} required>
              <option value="">Select customer</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {!formData.customer && (
            <Alert variant="info">Select a customer to load invoices</Alert>
          )}

          {noInvoices && (
            <Alert variant="warning">
              No unpaid invoices found for this customer.
            </Alert>
          )}

          {!noInvoices && invoices.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Select Invoice</Form.Label>
              <Form.Select
                name="invoiceId"
                value={formData.invoiceId}
                onChange={onChange}
                required
              >
                <option value="">Choose invoice</option>
                {invoices.map(inv => (
                  <option key={inv._id} value={inv._id}>
                    {inv.invoiceNumber} - Balance: ₹{inv.balance}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={onChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={onChange}
                  required
                  min={1}
                  max={maxBalance}
                />
              </Form.Group>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select name="paymentMethod" value={formData.paymentMethod} onChange={onChange}>
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={onChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={!formData.customer || !formData.invoiceId || error}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
