import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

export default function EditPaymentModal({ show, handleClose, handleSave, payment }) {
  const [formData, setFormData] = useState(null);
  const [maxAmount, setMaxAmount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (payment && show) {
      setFormData({
        paymentNumber: payment.paymentNumber || '',
        party: payment.party?._id || '',
        partyName: payment.party?.name || '',
        date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : '',
        amount: payment.amount || '',
        method: payment.method || 'Cash',
        notes: payment.notes || '',
      });
      setMaxAmount(payment.amount);
    }
  }, [show, payment]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setError('');

    if (name === 'amount' && Number(value) > maxAmount) {
      setError(`Amount cannot exceed ₹${maxAmount}`);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = () => {
  if (Number(formData.amount) > maxAmount) {
    setError(`Amount cannot exceed ₹${maxAmount}`);
    return;
  }

  const { partyName, ...rest } = formData;

const updatedPayment = {
  ...rest,
  _id: payment._id,
  amount: Number(formData.amount),
  type: payment.type,
  partyModel: payment.partyModel,
  appliedInvoices: payment.appliedInvoices || [],
};

  handleSave(updatedPayment);
};


  if (!formData) return null;

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          Edit Payment – {formData.partyName} | {formData.paymentNumber}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Payment Number</Form.Label>
            <Form.Control name="paymentNumber" value={formData.paymentNumber} readOnly />
          </Form.Group>

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
                  max={maxAmount}
                />
              </Form.Group>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select name="method" value={formData.method} onChange={onChange}>
              <option>Cash</option>
              <option>Bank</option>
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
        <Button variant="primary" onClick={onSubmit}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}
