"use client";

import { Button, Input } from "@mui/material";
import { useState } from "react";


export default function WhyChooseSection({
  items,
  onChange,
}: {
  items: string[];
  onChange: (list: string[]) => void;
}) {
  const [newPoint, setNewPoint] = useState("");

  const handleAdd = () => {
    if (!newPoint.trim()) return;
    const updated = [...items, newPoint.trim()];
    onChange(updated);
    setNewPoint("");
  };

  const handleDelete = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="border p-4 rounded-lg">
      <div className="text-lg font-semibold">Why Choose (Points)</div>

      <div className="flex gap-2 mt-3">
        <Input
          placeholder="Enter a point"
          value={newPoint}
          onChange={(e) => setNewPoint(e.target.value)}
        />
        <Button type="button" onClick={handleAdd}>
          Add
        </Button>
      </div>

      <ul className="mt-3 list-disc pl-5">
        {items.map((point, i) => (
          <li key={i} className="flex justify-between items-center mb-1">
            <span>{point}</span>
            <Button
              type="button"
              
          
              onClick={() => handleDelete(i)}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
