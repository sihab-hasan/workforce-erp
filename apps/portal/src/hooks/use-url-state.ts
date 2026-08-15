import { useSearchParams } from "react-router-dom"
import { useMemo, useCallback } from "react"

export function useUrlState<T extends Record<string, string | number | undefined>>(
  defaultState: T
): [T, (nextState: Partial<T>) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(() => {
    const currentState = { ...defaultState } as Record<string, unknown>
    
    for (const key in defaultState) {
      if (Object.prototype.hasOwnProperty.call(defaultState, key)) {
        const paramValue = searchParams.get(key)
        if (paramValue !== null) {
          // Attempt to preserve types
          if (typeof defaultState[key] === "number") {
            currentState[key] = Number(paramValue)
          } else {
            currentState[key] = paramValue
          }
        }
      }
    }
    
    return currentState as T
  }, [searchParams, defaultState])

  const setUrlState = useCallback(
    (nextState: Partial<T>) => {
      setSearchParams(
        (prevParams) => {
          const newParams = new URLSearchParams(prevParams)
          
          for (const key in nextState) {
            if (Object.prototype.hasOwnProperty.call(nextState, key)) {
              const value = nextState[key]
              if (value === undefined || value === null || value === "") {
                newParams.delete(key)
              } else {
                newParams.set(key, String(value))
              }
            }
          }
          
          return newParams
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  return [state, setUrlState]
}
