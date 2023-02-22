import { test, expect } from "vitest"
import { safeTransform } from "../src"

test("basic-success", () => {
  const result = safeTransform((data) => Number(data), "2")

  expect(result.success).toBe(true)
  if (!result.success) return

  expect(result.data).toBe(2)
})

test("basic-error", () => {
  const result = safeTransform((data) => {
    throw new Error(data)
  }, "2")

  expect(result.success).toBe(false)
})
