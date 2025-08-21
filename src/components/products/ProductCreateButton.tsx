import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createDraftProduct } from "./api";
import { useUserRole } from "@/hooks/useUserRole";

export function ProductCreateButton() {
  const navigate = useNavigate();
  const { user } = useUserRole();
  const [loading, setLoading] = React.useState(false);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    const draft = await createDraftProduct(user.id);
    setLoading(false);
    if (draft) {
      navigate(`/admin/${user.id}/products/edit/${draft.id}`);
    } else {
      alert("Errore nella creazione della bozza prodotto.");
    }
  };

  return (
    <Button onClick={handleCreate} disabled={loading} className="bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition flex-shrink-0">
      {loading ? "Creazione..." : "Nuovo prodotto"}
    </Button>
  );
}
