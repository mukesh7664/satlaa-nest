"use client";
import { Button, Input } from "@mui/material";
import { useState } from "react";


export default function SpecificationsSection() {
  const [specs, setSpecs] = useState([{ key: "", value: "" }]);

  const updateSpec = (i: number, field: string, value: string) => {
    const updated = [...specs];
    updated[i][field as "key" | "value"] = value;
    setSpecs(updated);
  };

  return (
    <div className="p-4 border rounded-xl mb-6">
      <h3 className="text-lg font-semibold mb-2">Specifications</h3>
      {specs.map((s, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 mb-2">
          <Input placeholder="Specification Name" value={s.key} onChange={(e) => updateSpec(i, "key", e.target.value)} />
          <Input placeholder="Specification Value" value={s.value} onChange={(e) => updateSpec(i, "value", e.target.value)} />
        </div>
      ))}
      <Button onClick={() => setSpecs([...specs, { key: "", value: "" }])}>+ Add Row</Button>
    </div>
  );
}
