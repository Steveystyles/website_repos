import type { CSSProperties, ReactNode } from "react"

type AdminPageHeaderProps = {
  title: string
  description: string
  eyebrow?: string
}

type AdminSectionHeaderProps = {
  title: string
  description: string
  size?: "md" | "lg"
  marginBottom?: number
}

type AdminCardProps = {
  children: ReactNode
  style?: CSSProperties
}

type AdminInfoCardProps = {
  title: string
  children: ReactNode
}

const baseCardStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 10px 30px -20px rgba(15, 23, 42, 0.35)",
}

export function AdminPageShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "32px 24px 64px",
        color: "#0f172a",
      }}
    >
      {children}
    </div>
  )
}

export function AdminPageHeader({
  title,
  description,
  eyebrow = "Admin Console",
}: AdminPageHeaderProps) {
  return (
    <header style={{ marginBottom: 24 }}>
      <p
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontSize: 12,
          fontWeight: 600,
          color: "#64748b",
          marginBottom: 8,
        }}
      >
        {eyebrow}
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{title}</h1>
      <p style={{ color: "#64748b", maxWidth: 520 }}>{description}</p>
    </header>
  )
}

export function AdminSectionHeader({
  title,
  description,
  size = "md",
  marginBottom = 16,
}: AdminSectionHeaderProps) {
  const titleStyle =
    size === "lg"
      ? { fontSize: 20, fontWeight: 700, marginBottom: 4 }
      : { fontSize: 18, fontWeight: 600, marginBottom: 4 }
  const descriptionStyle =
    size === "lg"
      ? { color: "#64748b", maxWidth: 520 }
      : { fontSize: 13, color: "#64748b" }

  return (
    <div style={{ marginBottom }}>
      <h2 style={titleStyle}>{title}</h2>
      <p style={descriptionStyle}>{description}</p>
    </div>
  )
}

export function AdminCard({ children, style }: AdminCardProps) {
  return <div style={{ ...baseCardStyle, ...style }}>{children}</div>
}

export function AdminInfoCard({ title, children }: AdminInfoCardProps) {
  return (
    <div
      style={{
        ...baseCardStyle,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontSize: 12,
          fontWeight: 700,
          color: "#475569",
        }}
      >
        {title}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  )
}

export function AdminStatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  )
}
