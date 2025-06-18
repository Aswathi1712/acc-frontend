import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { getSuppliers, getNewPurchaseInvoiceNumber } from '../services/api';

export default function PurchaseInvoiceModal({ show, handleClose, handleSave, invoice }) {
  const [form, setForm] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const loadSuppliers = async () => {
      const res = await getSuppliers();
      setSuppliers(res.data);
    };
    loadSuppliers();
  }, []);

  useEffect(() => {
    const initForm = async () => {
      if (invoice) {
        setForm(invoice);
      } else {
        const res = await getNewPurchaseInvoiceNumber();
        setForm({
          invoiceNumber: res.data.invoiceNumber,
          supplier: '',
          date: new Date().toISOString().slice(0, 10),
          items: [{ description: '', quantity: 1, cost: 0, total: 0 }],
        });
      }
    };

    if (show) initForm();
  }, [invoice, show]);

  const handleItemChange = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = field === 'quantity' || field === 'cost' ? parseFloat(value) : value;
    updated[index].total = updated[index].quantity * updated[index].cost;
    setForm({ ...form, items: updated });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { description: '', quantity: 1, cost: 0, total: 0 }] });
  };

  const removeItem = (index) => {
    const updated = [...form.items];
    updated.splice(index, 1);
    setForm({ ...form, items: updated });
  };

  const handleSubmit = () => {
    const totalAmount = form.items.reduce((sum, item) => sum + item.total, 0);
    handleSave({ ...form, totalAmount });
  };

  if (!form) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{invoice ? 'Edit' : 'New'} Purchase Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Invoice Number</Form.Label>
                <Form.Control value={form.invoiceNumber} readOnly disabled />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Supplier</Form.Label>
                <Form.Select
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                >
                  <option value="">Select</option>
                  {suppliers.map((s) => (
                    <option value={s._id} key={s._id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          {form.items.map((item, idx) => (
            <Row key={idx} className="mb-2 align-items-end">
              <Col>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Qty</Form.Label>
                  <Form.Control
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Cost</Form.Label>
                  <Form.Control
                    type="number"
                    value={item.cost}
                    onChange={(e) => handleItemChange(idx, 'cost', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Label>Total</Form.Label>
                <Form.Control value={item.total.toFixed(2)} disabled />
              </Col>
              <Col xs="auto">
                <Button
                  variant="danger"
                  onClick={() => removeItem(idx)}
                  disabled={form.items.length === 1}
                >
                  ✖
                </Button>
              </Col>
            </Row>
          ))}

          <Button variant="secondary" onClick={addItem}>
            + Add Item
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
