
import * as React from "react";

const RUOLI = [
  "Cliente",
  "Moderato",
  "Amministratore",
  "Super Amministratore",
];

export function RoleSelector({
  userRole,
  onRoleChange,
}: {
  userRole: string;
  onRoleChange: (role: string) => void;
}) {
  return (
    <select
      value={userRole}
      onChange={(e) => onRoleChange(e.target.value)}
      className="bg-[#f5f5f7] border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#b43434] transition cursor-pointer"
      title="Cambia ruolo"
    >
      {RUOLI.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
