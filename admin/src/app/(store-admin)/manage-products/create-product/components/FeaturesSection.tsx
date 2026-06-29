"use client";
import { Button, Input } from "@mui/material";
import { useState } from "react";


export default function FeaturesSection() {
  const [features, setFeatures] = useState<string[]>([""]);

  return (
    <div className="p-4 border rounded-xl mb-6">
      <h3 className="text-lg font-semibold mb-2">Features</h3>
      {features.map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <Input
            placeholder={`Feature ${i + 1}`}
            value={item}
            onChange={(e) => {
              const updated = [...features];
              updated[i] = e.target.value;
              setFeatures(updated);
            }}
          />
          <Button onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}>Remove</Button>
        </div>
      ))}
      <Button onClick={() => setFeatures([...features, ""])}>+ Add Feature</Button>
    </div>
  );
}
