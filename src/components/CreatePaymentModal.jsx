import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { getSuppliers, getPurchaseInvoices, getPayments } from '../services/api';

export default function CreatePaymentModal({ show, handleClose, handleSave }) {
  const [formData, setFormData] = useState({
    paymentNumber: '',
    party: '',
    method: 'Cash',
    date: new Date().toISOString().slice(0, 10),
    appliedInvoices: [],
  });

  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [error, setError] = useState('');

  const generatePaymentNumber = () => {
    const numbers = allPayments
      .map((p) => parseInt(p.paymentNumber?.replace('PAY', '')))
      .filter((n) => !isNaN(n));
    const max = numbers.length ? Math.max(...numbers) : 0;
    return `PAY${String(max + 1).padStart(5, '0')}`;
  };

  useEffect(() => {
    if (!show) return;

    async function fetchData() {
      try {
        const [supRes, invRes, payRes] = await Promise.all([
          getSuppliers(),
          getPurchaseInvoices(),
          getPayments(),
        ]);
        setSuppliers(supRes.data);
        setInvoices(invRes.data);
        setAllPayments(payRes.data);
        setFormData((prev) => ({
          ...prev,
          paymentNumber: generatePaymentNumber(),
        }));
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load data.');
      }
    }

    fetchData();
  }, [show]);

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
      const invoice = invoices.find((inv) => inv._id === invoiceId);
      const alreadyPaid = invoice.appliedPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const remaining = invoice.totalAmount - alreadyPaid;

      setFormData((prev) => ({
        ...prev,
        appliedInvoices: [...prev.appliedInvoices, { invoice: invoiceId, amount: remaining }],
      }));
    }
  };

  const handleInvoiceAmountChange = (invoiceId, value) => {
    const invoice = invoices.find((inv) => inv._id === invoiceId);
    const alreadyPaid = invoice.appliedPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const remaining = invoice.totalAmount - alreadyPaid;
    const amount = parseFloat(value);

    if (amount > remaining) {
      setError(`Amount exceeds remaining balance for invoice ${invoice.invoiceNumber}`);
      return;
    }

    setError('');
    setFormData((prev) => ({
      ...prev,
      appliedInvoices: prev.appliedInvoices.map((item) =>
        item.invoice === invoiceId
          ? { ...item, amount: isNaN(amount) ? 0 : amount }
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

  const validateBeforeSave = () => {
    if (!formData.party) return 'Please select a supplier.';
    if (formData.appliedInvoices.length === 0) return 'No invoices selected.';
    if (calculateTotalApplied() <= 0) return 'Total applied amount must be more than 0.';

    for (let item of formData.appliedInvoices) {
      const invoice = invoices.find((inv) => inv._id === item.invoice);
      const paid = invoice.appliedPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const remaining = invoice.totalAmount - paid;
      if (item.amount > remaining) {
        return `Amount exceeds remaining for invoice ${invoice.invoiceNumber}`;
      }
    }
    return null;
  };

  const handleSaveClick = () => {
    const validationError = validateBeforeSave();
    if (validationError) return setError(validationError);

    const prepared = {
      paymentNumber: formData.paymentNumber,
      type: 'outgoing',
      party: formData.party,
      partyModel: 'Supplier',
      date: formData.date,
      amount: calculateTotalApplied(),
      method: formData.method,
      appliedInvoices: formData.appliedInvoices,
    };

    handleSave(prepared);
    setError('');
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>New Supplier Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Payment #</Form.Label>
                <Form.Control
                  name="paymentNumber"
                  value={formData.paymentNumber}
                  readOnly
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
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Card">Card</option>
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
                const applied = formData.appliedInvoices.find((i) => i.invoice === inv._id);

                return (
                  <div key={inv._id} className="d-flex align-items-center mb-2">
                    <Form.Check
                      className="me-2"
                      type="checkbox"
                      label={`${inv.invoiceNumber} - AED ${inv.totalAmount.toFixed(
                        2
                      )} (Remaining: AED ${remaining.toFixed(2)})`}
                      checked={!!applied}
                      onChange={() => handleInvoiceToggle(inv._id)}
                    />
                    {applied && (
                      <InputGroup style={{ maxWidth: 200 }}>
                        <InputGroup.Text>AED</InputGroup.Text>
                        <Form.Control
                          type="number"
                          min={0}
                          step="0.01"
                          value={applied.amount}
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
            <Form.Label>Total Applied Amount:</Form.Label>
            <p className="fw-bold">AED {calculateTotalApplied().toFixed(2)}</p>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveClick}>
          Save Payment
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
