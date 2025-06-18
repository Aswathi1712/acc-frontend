import axios from 'axios';
// const API = axios.create({ baseURL: 'http://localhost:5000/api' });
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});


// Users
export const getUsers = () => API.get('/users');
export const createUser = (data) => API.post('/users', data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// Customers
export const getCustomers = () => API.get('/customers');
export const createCustomer = (data) => API.post('/customers', data);
export const updateCustomer = (id, data) => API.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);

// Sales Invoices
export const getInvoices = () => API.get('/invoices');
export const createInvoice = (data) => API.post('/invoices', data);
export const updateInvoice = (id, data) => API.put(`/invoices/${id}`, data);
export const deleteInvoice = (id) => API.delete(`/invoices/${id}`);

// Sales Returns
export const getSalesReturns = () => API.get('/sales-returns');
export const createSalesReturn = (data) => API.post('/sales-returns', data);
export const updateSalesReturn = (id, data) => API.put(`/sales-returns/${id}`, data);
export const deleteSalesReturn = (id) => API.delete(`/sales-returns/${id}`);

// Purchase Invoices
export const getPurchaseInvoices = () => API.get('/purchase-invoices');
export const createPurchaseInvoice = (data) => API.post('/purchase-invoices', data);
export const updatePurchaseInvoice = (id, data) => API.put(`/purchase-invoices/${id}`, data);
export const deletePurchaseInvoice = (id) => API.delete(`/purchase-invoices/${id}`);

// Suppliers
export const getSuppliers = () => API.get('/suppliers');
export const createSupplier = (data) => API.post('/suppliers', data);
export const updateSupplier = (id, data) => API.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

// Receipts
export const getReceipts = () => API.get('/receipts');
export const createReceipt = (data) => API.post('/receipts', data);
export const updateReceipt = (id, data) => API.put(`/receipts/${id}`, data);
export const deleteReceipt = (id) => API.delete(`/receipts/${id}`);

// Payments
export const getPayments = () => API.get('/payments');
export const createPayment = (data) => API.post('/payments', data);
export const updatePayment = (id, data) => API.put(`/payments/${id}`, data);
export const deletePayment = (id) => API.delete(`/payments/${id}`);

// ✅ Post Dated Cheques (PDC)
export const getPDCs = () => API.get('/pdcs');
export const createPDC = (data) => API.post('/pdcs', data);
export const markPDCRealised = (id) => API.patch(`/pdcs/${id}/realise`);
export const markPDCBounced = (id) => API.patch(`/pdcs/${id}/bounce`);
export const deletePDC = (id) => API.delete(`/pdcs/${id}`);


// Journal Vouchers
export const getJournalVouchers = () => API.get('/journal-vouchers');
export const createJournalVoucher = (data) => API.post('/journal-vouchers', data);
export const updateJournalVoucher = (id, data) => API.put(`/journal-vouchers/${id}`, data);
export const deleteJournalVoucher = (id) => API.delete(`/journal-vouchers/${id}`);

export const getNewInvoiceNumber = () => API.get('/invoices/new-number');
export const getNewReturnNumber = () => API.get('/sales-returns/new-number');

export const getNewReceiptNumber = () => API.get('/receipts/new-number');
export const saveReceipt = (data) => API.post('/receipts', data);
export const getInvoicesByCustomer = (customerId) =>  API.get(`/invoices/by-customer/${customerId}`);

export const getNewPurchaseInvoiceNumber = () => API.get('/purchase-invoices/new-number');


