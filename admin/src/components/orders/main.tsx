"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TablePagination from "@mui/material/TablePagination";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { Breadcrumbs, Link } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';


function exportToCSV(data: any[], filename: string) {
  const csvRows = [
    Object.keys(data[0]).join(","),
    ...data.map(row => Object.values(row).join(","))
  ];
  const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function getStatusChip(status: string) {
  const colorMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    Completed: 'success',
    Pending: 'warning',
    Cancelled: 'error',
    Paid: 'success',
    Refunded: 'info',
    PendingPayment: 'warning',
  };
  return <Chip label={status} color={colorMap[status] || 'default'} size="small" sx={{ fontWeight: 500 }} />;
}

export default function OrdersMain({ orders, setOrders }: { orders: any[], setOrders: (orders: any[]) => void }) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [detailsOrder, setDetailsOrder] = React.useState<any | null>(null);
  const [statusOrder, setStatusOrder] = React.useState<any | null>(null);
  const [newOrder, setNewOrder] = React.useState({ customer: '', category: '', product: '', status: 'Pending', amount: '' });
  const router = useRouter();

  const filteredOrders = orders.filter(
    (o) =>
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(paginatedOrders.map(o => o.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  const handleDeleteSelected = () => {
    setOrders(orders.filter(o => !selected.includes(o.id)));
    setSelected([]);
  };

  const handleAddOrder = () => {
    setOrders([
      ...orders,
      { id: `ORD${(orders.length + 1).toString().padStart(3, '0')}`, ...newOrder, date: new Date().toISOString().slice(0, 10) }
    ]);
    setAddOpen(false);
    setNewOrder({ customer: '', category: '', product: '', status: 'Pending', amount: '' });
  };

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
      <Breadcrumbs aria-label="breadcrumb">
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
          href="/"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        
        <Typography
          sx={{ color: 'text.primary', display: 'flex', alignItems: 'center' }}
        >
          <ShoppingCartIcon  sx={{ mr: 0.5 }} fontSize="inherit" />
         Order
        </Typography>
      </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between' }}>
          <Typography variant="h4" fontWeight={700}>Orders</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={() => setAddOpen(true)}>Add Order</Button>
            <Button variant="outlined" color="secondary" startIcon={<FileDownloadIcon />} onClick={() => exportToCSV(filteredOrders, 'orders.csv')}>Export CSV</Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 250, bgcolor: 'white', borderRadius: 2 }}
          />
          {selected.length > 0 && (
            <Button color="error" variant="outlined" onClick={handleDeleteSelected}>Delete Selected</Button>
          )}
        </Box>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selected.length > 0 && selected.length < paginatedOrders.length}
                        checked={paginatedOrders.length > 0 && selected.length === paginatedOrders.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.map((order, idx) => (
                    <TableRow key={order.id} hover selected={selected.includes(order.id)}>
                      <TableCell padding="checkbox" onClick={e => { e.stopPropagation(); handleSelect(order.id); }}>
                        <Checkbox checked={selected.includes(order.id)} />
                      </TableCell>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.category}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>{getStatusChip(order.status)}</TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => router.push(`/orders/${order.id}`)} sx={{ bgcolor: '#a020f0', color: 'white', '&:hover': { bgcolor: '#7c16b0' }, boxShadow: 2 }}>
                              <motion.span
                                whileHover={{ y: -8, scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{ display: 'flex', alignItems: 'center' }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </motion.span>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => setOrders(orders.filter(o => o.id !== order.id))} sx={{ bgcolor: '#ff2222', color: 'white', '&:hover': { bgcolor: '#c40000' }, boxShadow: 2 }}>
                              <motion.span
                                whileHover={{ y: -8, scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{ display: 'flex', alignItems: 'center' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </motion.span>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Update Status">
                            <IconButton onClick={() => setStatusOrder(order)} sx={{ bgcolor: '#ffa500', color: 'white', '&:hover': { bgcolor: '#cc8400' }, boxShadow: 2 }}>
                              <motion.span
                                whileHover={{ y: -8, scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{ display: 'flex', alignItems: 'center' }}
                              >
                                <LocalShippingIcon fontSize="small" />
                              </motion.span>
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredOrders.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </CardContent>
        </Card>

        {/* Add Order Modal */}
        <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
          <DialogTitle>Add Order</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
            <TextField label="Customer" value={newOrder.customer} onChange={e => setNewOrder({ ...newOrder, customer: e.target.value })} fullWidth />
            <TextField label="Category" value={newOrder.category} onChange={e => setNewOrder({ ...newOrder, category: e.target.value })} fullWidth />
            <TextField label="Product" value={newOrder.product} onChange={e => setNewOrder({ ...newOrder, product: e.target.value })} fullWidth />
            <TextField label="Status" value={newOrder.status} onChange={e => setNewOrder({ ...newOrder, status: e.target.value })} fullWidth />
            <TextField label="Amount" value={newOrder.amount} onChange={e => setNewOrder({ ...newOrder, amount: e.target.value })} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddOrder} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>

        {/* Order Status Modal */}
        <AnimatePresence>
          {statusOrder && (
            <Dialog open={!!statusOrder} onClose={() => setStatusOrder(null)}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.3 }}
              >
                <DialogTitle>Order Status</DialogTitle>
                <DialogContent sx={{ minWidth: 400, bgcolor: '#fff0fa', borderRadius: 2, mt: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography fontWeight={600} mb={1}>Payment</Typography>
                      <TextField select fullWidth defaultValue="Success" SelectProps={{ native: true }} sx={{ bgcolor: '#fff6fa' }}>
                        <option value="Success">Success</option>
                        <option value="Failed">Failed</option>
                        <option value="Pending">Pending</option>
                      </TextField>
                    </Box>
                    <Box>
                      <Typography fontWeight={600} mb={1}>Order</Typography>
                      <TextField select fullWidth defaultValue={statusOrder.status} SelectProps={{ native: true }} sx={{ bgcolor: '#fff6fa' }}>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </TextField>
                    </Box>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-end', gap: 2, p: 3 }}>
                  <Button onClick={() => setStatusOrder(null)} sx={{ bgcolor: '#ff2222', color: 'white', '&:hover': { bgcolor: '#c40000' }, borderRadius: 2, px: 4, fontWeight: 700, boxShadow: 2 }}>Close</Button>
                  <Button onClick={() => setStatusOrder(null)} sx={{ bgcolor: '#a020f0', color: 'white', '&:hover': { bgcolor: '#7c16b0' }, borderRadius: 2, px: 4, fontWeight: 700, boxShadow: 2 }}>Update Status</Button>
                </DialogActions>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
} 