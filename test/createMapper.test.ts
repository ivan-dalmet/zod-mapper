import { test, assert } from "vitest"

import { createMapper } from "../src"

test("basic-example", () => {
  const myMapper = createMapper<String>()({
    transformIn: (data) => Number(data),
    transformOut: (data) => String(data),
  })

  const internal = myMapper.in("2")
  const external = myMapper.out(internal)

  assert.equal(internal, 2)
  assert.equal(external, "2")
})
