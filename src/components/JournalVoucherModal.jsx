import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const JournalVoucherModal = ({ show, handleClose, handleSave, voucher }) => {
  const [formData, setFormData] = useState({
    voucherNumber: '',
    date: '',
    description: '',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    if (voucher) {
      setFormData({
        voucherNumber: voucher.voucherNumber || '',
        date: voucher.date ? new Date(voucher.date).toISOString().split('T')[0] : '',
        description: voucher.description || '',
        amount: voucher.amount || '',
        notes: voucher.notes || '',
      });
    } else {
      setFormData({
        voucherNumber: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        notes: '',
      });
    }
  }, [voucher]);

  const onChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = () => {
    handleSave(formData);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{voucher ? 'Edit Journal Voucher' : 'New Journal Voucher'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Voucher Number</Form.Label>
            <Form.Control name="voucherNumber" value={formData.voucherNumber} onChange={onChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control type="date" name="date" value={formData.date} onChange={onChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control name="description" value={formData.description} onChange={onChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control type="number" name="amount" value={formData.amount} onChange={onChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={2} name="notes" value={formData.notes} onChange={onChange} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={onSubmit}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default JournalVoucherModal;
