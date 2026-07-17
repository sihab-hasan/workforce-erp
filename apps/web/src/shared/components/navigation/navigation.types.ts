export type NavigationItem = {
  label: string
  to: string
  end?: boolean
}

export type NavigationDropdownItem = NavigationItem & {
  description?: string
}

export type NavigationOrientation = "horizontal" | "vertical"
