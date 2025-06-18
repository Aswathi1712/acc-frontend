import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

export default function EditReceiptModal({ show, handleClose, handleSave, receipt }) {
  const [formData, setFormData] = useState(null);
  const [maxBalance, setMaxBalance] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (receipt && show) {
        console.log(receipt);
      setFormData({
        receiptNumber: receipt.receiptNumber,
        customer: receipt.customer?._id || '',  // ✅ send ID instead of name
        invoiceId: receipt.invoiceId?._id || '',
        customername: receipt.customer?.name || '',
        invoiceNumber: receipt.invoiceId?.invoiceNumber || '',
        date: receipt.date ? new Date(receipt.date).toISOString().split('T')[0] : '',
        amount: receipt.amount || '',
        paymentMethod: receipt.paymentMethod || 'Cash',
        notes: receipt.notes || '',
      });
      setMaxBalance(receipt.amount); // Original amount as max
    }
  }, [show, receipt]);

  const onChange = e => {
    const { name, value } = e.target;
    setError('');

    if (name === 'amount' && Number(value) > maxBalance) {
      setError(`Amount cannot exceed ₹${maxBalance}`);
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = () => {
    if (Number(formData.amount) > maxBalance) {
      setError(`Amount cannot exceed ₹${maxBalance}`);
      return;
    }

    handleSave(formData);
  };

  if (!formData) return null;

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          Edit Receipt – {formData.customername} | {formData.invoiceNumber}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Receipt Number</Form.Label>
            <Form.Control name="receiptNumber" value={formData.receiptNumber} readOnly />
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
        <Button variant="primary" onClick={onSubmit}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}
