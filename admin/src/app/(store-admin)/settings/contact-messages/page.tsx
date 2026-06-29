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
import IconButton from "@mui/material/IconButton";
import TablePagination from "@mui/material/TablePagination";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from "next/navigation";

const mockMessages = Array.from({ length: 25 }).map((_, i) => ({
  id: `MSG${2000 + i}`,
  name: `Visitor ${i + 1}`,
  email: `visitor${i + 1}@example.com`,
  subject: `Question about service #${i + 1}`,
  date: `2025-06-${(i % 30 + 1).toString().padStart(2, '0')}`,
  status: i % 4 === 0 ? "Read" : "Unread",
}));

export default function ContactMessagesPage() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [messages, setMessages] = React.useState(mockMessages);
  const router = useRouter();

  const paginated = messages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      <div>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{ bgcolor: '#a020f0', color: 'white', px: 3, py: 2, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
            <Typography variant="h5" fontWeight={700}>Contact Messages</Typography>
          </Box>
          <CardContent>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((msg) => (
                    <TableRow key={msg.id} hover>
                      <TableCell>{msg.name}</TableCell>
                      <TableCell>{msg.email}</TableCell>
                      <TableCell>{msg.subject}</TableCell>
                      <TableCell>{msg.date}</TableCell>
                      <TableCell>
                        <Chip label={msg.status} color={msg.status === 'Read' ? 'default' : 'success'} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Message">
                          <IconButton onClick={() => router.push(`/contact-messages/${msg.id}`)} sx={{ color: '#a020f0' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton sx={{ color: '#ff2222' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={messages.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </CardContent>
        </Card>
      </div>
    </Box>
  );
} 