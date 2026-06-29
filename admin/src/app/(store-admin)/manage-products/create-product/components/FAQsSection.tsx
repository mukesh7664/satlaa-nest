"use client";
import { Button, Input, TextareaAutosize } from "@mui/material";
import { useState } from "react";


export default function FAQsSection() {
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);

  const handleChange = (i: number, field: string, value: string) => {
    const updated = [...faqs];
    updated[i][field as "question" | "answer"] = value;
    setFaqs(updated);
  };

  return (
    <div className="p-4 border rounded-xl mb-6">
      <h3 className="text-lg font-semibold mb-2">FAQs</h3>
      {faqs.map((f, i) => (
        <div key={i} className="mb-3">
          <Input
            placeholder="Question"
            value={f.question}
            onChange={(e) => handleChange(i, "question", e.target.value)}
          />
          <TextareaAutosize
            placeholder="Answer"
            value={f.answer}
            onChange={(e) => handleChange(i, "answer", e.target.value)}
            className="mt-1"
          />
        </div>
      ))}
      <Button onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}>+ Add FAQ</Button>
    </div>
  );
}
