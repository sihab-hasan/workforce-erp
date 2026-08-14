import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { UserStatusBadge } from "../components/UserStatusBadge"

describe("UserStatusBadge Component", () => {
  it("renders Active badge with correct text", () => {
    render(<UserStatusBadge status="active" />)
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("renders Invited badge with correct text", () => {
    render(<UserStatusBadge status="invited" />)
    expect(screen.getByText("Invited")).toBeInTheDocument()
  })

  it("renders Inactive badge with correct text", () => {
    render(<UserStatusBadge status="inactive" />)
    expect(screen.getByText("Inactive")).toBeInTheDocument()
  })

  it("renders Suspended badge with correct text", () => {
    render(<UserStatusBadge status="suspended" />)
    expect(screen.getByText("Suspended")).toBeInTheDocument()
  })
})
