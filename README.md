# ↔️ Zod Mapper

[![npm version](https://badgen.net/npm/v/zod-mapper)](https://npm.im/zod-mapper) [![npm downloads](https://badgen.net/npm/dm/zod-mapper)](https://npm.im/zod-mapper)
[![License](https://img.shields.io/github/license/ivan-dalmet/zod-mapper)](https://opensource.org/licenses/MIT)

### Tiny library to easily create Zod based data mappers.

Declare the following to get a **full typed** data with **runtime validations** 🤩
- 🛡 [Zod](https://zod.dev/) schema
- ➡️ Transform function to map data from EXTERNAL to INTERNAL
- ⬅️ Transform function to map data from INTERNAL to EXTERNAL

## Install

```bash
npm i zod-mapper zod
```

## Usage

```ts
import { z } from 'zod';
import { createZodMapper } from 'zod-mapper';

const myMapper = createZodMapper({
  // Zod schema for EXTERNAL data
  schema: z.string(),

  // Transform Data from EXTERNAL to INTERNAL
  transformIn: (data) => Number(data),

  // Transform Data from INTERNAL to EXTERNAL
  transformOut: (data) => String(data),
});

// Pass EXTERNAL data to the `in()` method to get INTERNAL formatted data.
const internal = myMapper.in('2') // 2

// Pass INTERNAL data to the `out()` method to get the EXTERNAL formatted data.
const external = myMapper.out(internal) // '2'
```

## Safe transform

If you don't want your mapper to throw errors when transformation fails, use `.safeIn` and `.safeOut` instead of `in` and `out`. This method returns an object containing either the successfully parsed data or a error containing information about the transformation problems.

```ts
myMapper.safeIn('2')
myMapper.safeOut(2)
```

The result is a discriminated union, so you can handle errors very conveniently


```ts
import { z } from 'zod';
import { createZodMapper } from 'zod-mapper';

const myMapper = createZodMapper({
  schema: z.string(),
  transformIn: (data) => Number(data),
  transformOut: (data) => String(data),
});

const internal = myMapper.safeIn('2')
if (!internal.success) {
  // handle error then return
  internal.error
} else {
  // do something
  internal.data
}
```

## Real life example

```ts
import { z } from 'zod';
import { createZodMapper } from 'zod-mapper';

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
```

## License

MIT &copy; [ivan-dalmet](https://github.com/sponsors/ivan-dalmet)
