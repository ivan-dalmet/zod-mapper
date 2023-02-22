import { test, assert, expect } from "vitest"
import { z } from "zod"
import { createZodMapper } from "../src"

test("docs-basic-example", () => {
  const myMapper = createZodMapper({
    // Zod schema for EXTERNAL data
    schema: z.string(),

    // Transform Data from EXTERNAL to INTERNAL
    transformIn: (data) => Number(data),

    // Transform Data from INTERNAL to EXTERNAL
    transformOut: (data) => String(data),
  })

  // Pass EXTERNAL data to the `in()` method to get INTERNAL formatted data.
  const internal = myMapper.in("2") // 2

  // Pass INTERNAL data to the `out()` method to get the EXTERNAL formatted data.
  const external = myMapper.out(internal) // '2'

  assert.equal(internal, 2)
  assert.equal(external, "2")
})

test("docs-real-life", () => {
  /* Example data */
  const exampleFetchedUsersList = [
    {
      firstName: "John",
      lastName: "Doe",
      noSo_good_Label: "something",
    },
    {
      firstName: "Jeanne",
      lastName: "Doe",
    },
  ]

  /*  1. Create a mapper */
  const userMapper = createZodMapper({
    // Zod schema for EXTERNAL data
    schema: z.object({
      firstName: z.string(),
      lastName: z.string(),
      noSo_good_Label: z.string().optional(),
    }),

    // Transform Data from EXTERNAL to INTERNAL
    transformIn: ({ noSo_good_Label, ...data }) => ({
      ...data,
      fullName: `${data.firstName} ${data.lastName}`,
      goodLabel: noSo_good_Label,
    }),

    // Transform Data from INTERNAL to EXTERNAL
    transformOut: ({ goodLabel, ...data }) => ({
      ...data,
      noSo_good_Label: goodLabel,
    }),
  })

  /**
   *  2. Use the mapper to transform the data
   * from the  EXTERNAL format to the INTERNAL format.
   *
   * ℹ️ Each user will HAVE the `fullName` property and the `goodLabel`
   */
  const users = exampleFetchedUsersList.map(userMapper.in)

  /**
   *  3. Use the mapper to transform the data
   * from the INTERNAL format to the EXTERNAL format.
   *
   * ℹ️ Each user will NOT HAVE the `fullName` property and will HAVE the `noSo_good_Label`
   */
  const payload = users.map(userMapper.out)

  assert.deepEqual(users, [
    {
      firstName: "John",
      lastName: "Doe",
      goodLabel: "something",
      fullName: "John Doe",
    },
    {
      firstName: "Jeanne",
      lastName: "Doe",
      goodLabel: undefined,
      fullName: "Jeanne Doe",
    },
  ])
  assert.deepEqual(payload, [
    { firstName: "John", lastName: "Doe", noSo_good_Label: "something" },
    { firstName: "Jeanne", lastName: "Doe", noSo_good_Label: undefined },
  ])
})

test("schema-error", () => {
  const myMapper = createZodMapper({
    schema: z.string(),
    transformIn: (data) => Number(data),
    transformOut: (data) => String(data),
  })

  expect(() => {
    myMapper.in(2 as any)
  }).toThrowError(/Expected string, received number/)
})

test("safe-basic", () => {
  const myMapper = createZodMapper({
    schema: z.string(),
    transformIn: (data) => Number(data),
    transformOut: (data) => String(data),
  })

  const internal = myMapper.safeIn("2")
  if (!internal.success) {
    return
  }

  assert.equal(internal.data, 2)

  const external = myMapper.safeOut(internal.data)
  if (!external.success) {
    return
  }

  assert.equal(external.data, "2")
})

test("safe-error", () => {
  const myMapper = createZodMapper({
    schema: z.string(),
    transformIn: (data) => Number(data),
    transformOut: (data) => data,
  })

  const internal = myMapper.safeIn(2 as any)
  const external = myMapper.safeOut(false as any)

  assert.equal(internal.success, false)
  assert.equal(external.success, false)
})
