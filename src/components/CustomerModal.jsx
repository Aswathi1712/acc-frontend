import { useState, useEffect } from 'react';
import { Modal, Button, Form, Image } from 'react-bootstrap';

export default function CustomerModal({ show, handleClose, handleSave, customer }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    photo: '',
  });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        photo: customer.photo || '',
      });
      setPreview(customer.photo || '');
    } else {
      setFormData({ name: '', email: '', phone: '', address: '', photo: '' });
      setPreview('');
    }
  }, [customer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = () => {
    handleSave({ ...formData });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{customer ? 'Edit Customer' : 'Add Customer'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Address</Form.Label>
            <Form.Control
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Photo</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handlePhotoChange} />
          </Form.Group>
          {preview && (
            <div className="text-center mt-3">
              <Image src={preview} alt="Preview" thumbnail width={100} height={100} />
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={submit}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}
