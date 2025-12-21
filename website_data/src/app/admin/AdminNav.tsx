"use client";

import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/maintenance", label: "Maintenance" },
];

const linkStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  fontWeight: 600,
  color: "#0f172a",
  textDecoration: "none",
  transition: "background 0.2s ease, border-color 0.2s ease",
} as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "grid", gap: 10 }}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            style={{
              ...linkStyle,
              background: isActive ? "#e2e8f0" : "#ffffff",
              borderColor: isActive ? "#94a3b8" : "#e2e8f0",
            }}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
