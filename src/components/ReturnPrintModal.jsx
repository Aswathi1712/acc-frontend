import { Modal, Button, Table } from 'react-bootstrap';

export default function ReturnPrintModal({ show, handleClose, returnData }) {
  if (!returnData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Sales Return #{returnData.returnNumber}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Customer:</strong> {returnData.customer?.name || 'N/A'}</p>
        <p><strong>Date:</strong> {new Date(returnData.date).toLocaleDateString()}</p>
        <Table bordered>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {returnData.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <h5 className="text-end">Total: ${returnData.totalAmount.toFixed(2)}</h5>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handlePrint}>Print</Button>
        <Button variant="primary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
