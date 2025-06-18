import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import { getSuppliers, getPurchaseInvoices, getPayments } from '../services/api';

export default function PaymentModal({ show, handleClose, handleSave, payment }) {
  const [formData, setFormData] = useState({
    paymentNumber: '',
    party: '',
    method: 'Cash',
    amount: 0,
    date: '',
    appliedInvoices: [],
  });

  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [allPayments, setAllPayments] = useState([]);

  // Auto-generate payment number like PAY00001
  const generatePaymentNumber = () => {
    const numbers = allPayments
      .map((p) => parseInt(p.paymentNumber?.replace('PAY', '')))
      .filter((n) => !isNaN(n));
    const max = numbers.length ? Math.max(...numbers) : 0;
    return `PAY${String(max + 1).padStart(5, '0')}`;
  };

  useEffect(() => {
    async function fetchData() {
      const [supRes, invRes, payRes] = await Promise.all([
        getSuppliers(),
        getPurchaseInvoices(),
        getPayments(),
      ]);
      setSuppliers(supRes.data);
      setInvoices(invRes.data);
      setAllPayments(payRes.data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (payment) {
      setFormData(payment);
    } else {
      setFormData({
        paymentNumber: generatePaymentNumber(),
        party: '',
        method: 'Cash',
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
        appliedInvoices: [],
      });
    }
  }, [payment, allPayments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePartyChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      party: selected ? selected.value : '',
      appliedInvoices: [],
    }));
  };

  const handleInvoiceToggle = (invoiceId) => {
    const exists = formData.appliedInvoices.find((item) => item.invoice === invoiceId);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        appliedInvoices: prev.appliedInvoices.filter((i) => i.invoice !== invoiceId),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        appliedInvoices: [...prev.appliedInvoices, { invoice: invoiceId, amount: 0 }],
      }));
    }
  };

  const handleInvoiceAmountChange = (invoiceId, value) => {
    setFormData((prev) => ({
      ...prev,
      appliedInvoices: prev.appliedInvoices.map((item) =>
        item.invoice === invoiceId
          ? { ...item, amount: parseFloat(value) || 0 }
          : item
      ),
    }));
  };

  const supplierOptions = suppliers.map((s) => ({
    value: s._id,
    label: s.name,
  }));

  const filteredInvoices = invoices
    .filter((inv) => inv.supplier?._id === formData.party)
    .filter((inv) => {
      const paid = inv.appliedPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      return paid < inv.totalAmount;
    });

  const calculateTotalApplied = () =>
    formData.appliedInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);

  const preparePaymentForSave = () => {
    const appliedInvoices = formData.appliedInvoices.map((item) => {
      const invoice = invoices.find((inv) => inv._id === item.invoice);
      const alreadyPaid =
        invoice.appliedPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const remaining = invoice.totalAmount - alreadyPaid;

      if (item.amount > remaining) {
        throw new Error(
          `Amount exceeds remaining for invoice ${invoice.invoiceNumber}`
        );
      }

      return item;
    });

    return {
      paymentNumber: formData.paymentNumber,
      type: 'outgoing',
      party: formData.party,
      partyModel: 'Supplier',
      date: formData.date,
      amount: calculateTotalApplied(),
      method: formData.method,
      appliedInvoices,
    };
  };

  const handleSaveClick = () => {
    try {
      if (!formData.paymentNumber) return alert('Payment number is required');
      if (!formData.party) return alert('Please select a supplier');
      if (calculateTotalApplied() <= 0) return alert('Total applied amount must be > 0');

      const prepared = preparePaymentForSave();
      handleSave(prepared);
      alert('Payment successfully recorded');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{payment ? 'Edit' : 'New'} Supplier Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Payment #</Form.Label>
                <Form.Control
                  name="paymentNumber"
                  value={formData.paymentNumber}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Supplier</Form.Label>
                <Select
                  options={supplierOptions}
                  value={supplierOptions.find((opt) => opt.value === formData.party)}
                  onChange={handlePartyChange}
                  isClearable
                  placeholder="Select supplier..."
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Method</Form.Label>
                <Form.Select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                >
                  <option>Cash</option>
                  <option>Bank</option>
                  <option>Card</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-2">
            <Form.Label>Apply to Invoices</Form.Label>
            {filteredInvoices.length === 0 ? (
              <p className="text-muted">No unpaid purchase invoices.</p>
            ) : (
              filteredInvoices.map((inv) => {
                const paid =
                  inv.appliedPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                const remaining = inv.totalAmount - paid;
                const applied = formData.appliedInvoices.find(
                  (i) => i.invoice === inv._id
                );
                return (
                  <div key={inv._id} className="d-flex align-items-center mb-2">
                    <Form.Check
                      className="me-2"
                      type="checkbox"
                      label={`${inv.invoiceNumber} - $${inv.totalAmount.toFixed(
                        2
                      )} (Remaining: $${remaining.toFixed(2)})`}
                      checked={!!applied}
                      onChange={() => handleInvoiceToggle(inv._id)}
                    />
                    {applied && (
                      <InputGroup style={{ maxWidth: 200 }}>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          value={applied.amount}
                          min={0}
                          step="0.01"
                          onChange={(e) =>
                            handleInvoiceAmountChange(inv._id, e.target.value)
                          }
                        />
                      </InputGroup>
                    )}
                  </div>
                );
              })
            )}
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>Total Applied Amount: </Form.Label>
            <p className="fw-bold">${calculateTotalApplied().toFixed(2)}</p>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveClick}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
