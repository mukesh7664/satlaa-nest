"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useRouter } from "next/navigation";

const mockMessage = {
  id: "MSG2000",
  name: "John Doe",
  email: "john.doe@example.com",
  subject: "Inquiry about Bulk Orders",
  date: "2025-06-01 10:30 AM",
  message: `Hello,

I hope this message finds you well.

I am writing to inquire about the possibility of placing a bulk order for your products. We are a retail company based in New York and are very interested in carrying your items in our stores.

Could you please provide us with your wholesale catalog and any information regarding bulk pricing, minimum order quantities, and shipping options?

We are looking forward to the possibility of working together.

Thank you for your time and consideration.

Best regards,
John Doe
Procurement Manager
ABC Retail Inc.`,
  status: "Unread",
};

export default function MessageDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const messageId = params.messageid; // from `[messageid]`

  // In a real app, you'd fetch the message by ID
  const message = mockMessage;

  return (
    <Box sx={{ bgcolor: '#f9f6fb', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 3, boxShadow: 2, position: 'relative' }}>
          <IconButton onClick={() => router.back()} sx={{ position: 'absolute', top: 16, left: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ bgcolor: '#a020f0', color: 'white', px: 3, py: 2, borderTopLeftRadius: 12, borderTopRightRadius: 12, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700}>Message Details</Typography>
          </Box>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                {message.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>{message.name}</Typography>
                <Typography variant="body2" color="text.secondary">{message.email}</Typography>
                <Typography variant="caption" color="text.secondary">{message.date}</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }}/>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Subject: {message.subject}
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              <Typography variant="body1">
                {message.message}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 