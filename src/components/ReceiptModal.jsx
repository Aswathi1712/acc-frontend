import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import {
  getCustomers,
  getNewReceiptNumber,
  getInvoicesByCustomer,
} from '../services/api';

const ReceiptModal = ({ show, handleClose, handleSave, receipt }) => {
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
    const loadCustomers = async () => {
      const res = await getCustomers();
      setCustomers(res.data);
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    const initialize = async () => {
      if (receipt) {
        setFormData({
          receiptNumber: receipt.receiptNumber || '',
          customer: receipt.customer?._id || '',
          date: receipt.date ? new Date(receipt.date).toISOString().split('T')[0] : '',
          amount: receipt.amount || '',
          paymentMethod: receipt.paymentMethod || 'Cash',
          notes: receipt.notes || '',
          invoiceId: receipt.invoiceId || '',
        });
        if (receipt.customer?._id) {
          await fetchInvoices(receipt.customer._id, receipt.invoiceId);
        }
      } else {
        try {
          const { data } = await getNewReceiptNumber();
          setFormData({
            receiptNumber: data.receiptNumber,
            customer: '',
            date: new Date().toISOString().split('T')[0],
            amount: '',
            paymentMethod: 'Cash',
            notes: '',
            invoiceId: '',
          });
          setInvoices([]);
          setNoInvoices(false);
        } catch (err) {
          console.error('Failed to get new receipt number', err);
        }
      }
    };

    if (show) initialize();
  }, [show, receipt]);

  const fetchInvoices = async (customerId, invoiceIdToSelect = '') => {
    try {
      const res = await getInvoicesByCustomer(customerId);
      let data = res.data;

      // If in edit mode and invoice is not in the list, add it manually
      if (receipt && invoiceIdToSelect) {
        const alreadyInList = data.some(inv => inv._id === invoiceIdToSelect);
        if (!alreadyInList && receipt.invoiceId && receipt.invoiceNumber) {
          data = [
            ...data,
            {
              _id: receipt.invoiceId,
              invoiceNumber: receipt.invoiceNumber,
              balance: receipt.amount,
            },
          ];
        }
      }

      setInvoices(data);
      setNoInvoices(data.length === 0 && !receipt);

      const invoiceToSelect = data.find(inv => inv._id === invoiceIdToSelect || data.length === 1);
      if (invoiceToSelect) {
        setFormData(prev => ({
          ...prev,
          invoiceId: invoiceToSelect._id,
          amount: invoiceToSelect.balance,
        }));
        setMaxBalance(invoiceToSelect.balance);
      }
    } catch (err) {
      console.error('Error loading invoices for customer', err);
      setNoInvoices(!receipt);
      setInvoices([]);
    }
  };

  const onChange = async (e) => {
    const { name, value } = e.target;
    setError('');

    if (name === 'amount' && Number(value) > maxBalance) {
      setError(`Amount cannot exceed invoice balance (₹${maxBalance})`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'customer') {
      setFormData(prev => ({ ...prev, invoiceId: '', amount: '' }));
      await fetchInvoices(value);
    }

    if (name === 'invoiceId') {
      const selected = invoices.find(i => i._id === value);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          amount: selected.balance,
        }));
        setMaxBalance(selected.balance);
      }
    }
  };

  const onSubmit = () => {
    if (Number(formData.amount) > maxBalance) {
      setError(`Amount cannot exceed invoice balance (₹${maxBalance})`);
      return;
    }
    handleSave(formData);
  };

  const selectedCustomerName = customers.find(c => c._id === formData.customer)?.name;
  const selectedInvoice = invoices.find(i => i._id === formData.invoiceId);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{receipt ? 'Edit Receipt' : 'New Receipt'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Receipt Number</Form.Label>
            <Form.Control name="receiptNumber" value={formData.receiptNumber} readOnly />
          </Form.Group>

          {receipt ? (
            <Form.Group className="mb-3">
              <Form.Label>Customer</Form.Label>
              <Form.Control readOnly value={selectedCustomerName || ''} />
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Customer</Form.Label>
              <Form.Select
                name="customer"
                value={formData.customer}
                onChange={onChange}
                required
              >
                <option value="">Select customer</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* Alert only for new receipts */}
          {!receipt && noInvoices && (
            <Alert variant="warning">
              No unpaid invoices found for this customer. Cannot create receipt.
            </Alert>
          )}

          {(!noInvoices || receipt) && (
            receipt ? (
              <Form.Group className="mb-3">
                <Form.Label>Invoice</Form.Label>
                <Form.Control
                  readOnly
                  value={`${selectedInvoice?.invoiceNumber || receipt.invoiceNumber} - ₹${selectedInvoice?.balance || formData.amount}`}
                />
              </Form.Group>
            ) : (
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
            )
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
};

export default ReceiptModal;
