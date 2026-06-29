const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export const paymentService = {
  verifyStripeSession: async (sessionId: string) => {
    const response = await fetch(`${API_URL}/payment/stripe-verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to verify payment");
    }

    return response.json();
  },
};
