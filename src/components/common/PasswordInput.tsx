"use client";
import { useState } from "react";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showLabel?: string;
  hideLabel?: string;
}

export default function PasswordInput({
  showLabel = "👁️",
  hideLabel = "🙈",
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
      >
        {show ? hideLabel : showLabel}
      </button>
    </div>
  );
}
