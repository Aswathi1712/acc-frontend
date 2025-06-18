import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { getCustomers } from '../services/api';

const PdcModal = ({ show, handleClose, handleSave, pdc }) => {
  const [formData, setFormData] = useState({
    chequeNumber: '',
    customer: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    amount: '',
    bank: '',
  });
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const res = await getCustomers();
      setCustomers(res.data || []);
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (pdc) {
      setFormData({
        chequeNumber: pdc.chequeNumber || '',
        customer: pdc.party?._id || '',
        issueDate: pdc.issueDate ? new Date(pdc.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: pdc.dueDate ? new Date(pdc.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        amount: pdc.amount || '',
        bank: pdc.bankAccount || '',
      });
    } else {
      setFormData({
        chequeNumber: '',
        customer: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        amount: '',
        bank: '',
      });
    }
  }, [pdc]);

  const onChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = () => {
    // Map front-end form fields to backend expected keys
    const payload = {
      chequeNumber: formData.chequeNumber,
      party: formData.customer,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      amount: Number(formData.amount),
      bankAccount: formData.bank,
    };
    handleSave(payload);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{pdc ? 'Edit PDC' : 'New PDC'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Cheque Number</Form.Label>
            <Form.Control
              name="chequeNumber"
              value={formData.chequeNumber}
              onChange={onChange}
              required
            />
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

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Issue Date</Form.Label>
                <Form.Control type="date" name="issueDate" value={formData.issueDate} onChange={onChange} required />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control type="date" name="dueDate" value={formData.dueDate} onChange={onChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={onChange}
                  required
                  min="0"
                  step="0.01"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Bank</Form.Label>
                <Form.Control
                  name="bank"
                  value={formData.bank}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>
          </Row>

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={onSubmit}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PdcModal;
