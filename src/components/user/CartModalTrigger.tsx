import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import CartModal from "./CartModal";

export default function CartModalTrigger({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className={`relative hover-scale ${className}`}
        title="Apri carrello"
        onClick={() => setOpen(true)}
      >
        <ShoppingCart size={22} />
      </button>
      <CartModal open={open} onOpenChange={setOpen} />
    </>
  );
}
