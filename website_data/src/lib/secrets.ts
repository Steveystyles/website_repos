import fs from "fs"

export function readSecret(name: string): string {
  // Docker secrets path
  const secretPath = `/run/secrets/${name}`

  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, "utf8").trim()
  }

  // Fallback to env (local dev)
  const value = process.env[name]
  if (!value) {
    throw new Error(`Secret ${name} not found`)
  }

  return value
}