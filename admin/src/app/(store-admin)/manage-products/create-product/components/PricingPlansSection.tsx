"use client";
import { Button, Input } from "@mui/material";
import { useState } from "react";


export default function PricingPlansSection() {
  const [plans, setPlans] = useState([{ name: "", price: "", duration: "" }]);

  return (
    <div className="p-4 border rounded-xl mb-6">
      <h3 className="text-lg font-semibold mb-2">Pricing Plans</h3>
      {plans.map((p, i) => (
        <div key={i} className="grid grid-cols-3 gap-2 mb-2">
          <Input placeholder="Plan Name" value={p.name} onChange={(e) => (plans[i].name = e.target.value)} />
          <Input placeholder="Price" value={p.price} onChange={(e) => (plans[i].price = e.target.value)} />
          <Input placeholder="Duration (e.g., /month)" value={p.duration} onChange={(e) => (plans[i].duration = e.target.value)} />
        </div>
      ))}
      <Button onClick={() => setPlans([...plans, { name: "", price: "", duration: "" }])}>+ Add Plan</Button>
    </div>
  );
}
