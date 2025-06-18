import { useEffect, useState } from 'react';
import { Table, Button, Container, Modal } from 'react-bootstrap';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import UserModal from '../components/UserModal';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const loadUsers = async () => {
    const res = await getUsers();
    setUsers(res.data);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDelete = async (id) => {
    await deleteUser(id);
    loadUsers();
  };

  const handleSave = async (userData) => {
    if (editUser) {
      await updateUser(editUser._id, userData);
    } else {
      await createUser(userData);
    }
    setShow(false);
    setEditUser(null);
    loadUsers();
  };

  return (
    <div>
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Users</h3>
          <Button onClick={() => { setEditUser(null); setShow(true); }}>Add User</Button>
        </div>
        <Table bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td><img src={u.photo} alt="profile" width="40" height="40" className="rounded-circle" /></td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.role}</td>
                <td>
                  <Button size="sm" variant="info" onClick={() => { setEditUser(u); setShow(true); }}>Edit</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(u._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <UserModal show={show} handleClose={() => setShow(false)} handleSave={handleSave} user={editUser} />
    </div>
  );
}
