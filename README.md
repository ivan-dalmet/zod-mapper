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
const internal = myMapper.in('2'); // 2

// Pass INTERNAL data to the `out()` method to get the EXTERNAL formatted data.
const external = myMapper.out(internal); // '2'
```

## Safe transform

If you don't want your mapper to throw errors when transformation fails, use `.safeIn` and `.safeOut` instead of `in` and `out`. This method returns an object containing either the successfully parsed data or a error containing information about the transformation problems.

```ts
myMapper.safeIn('2');
myMapper.safeOut(2);
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

const internal = myMapper.safeIn('2');
if (!internal.success) {
  // handle error then return
  internal.error;
} else {
  // do something
  internal.data;
}
```

## Output schema

If the output schema is not same as the input, you can provide a `schemaOut`.

```ts
import { z } from 'zod';
import { createZodMapper } from 'zod-mapper';

const myMapper = createZodMapper({
  schema: z.string(),

  // Specify a different schema for the output
  schemaOut: z.boolean(),

  transformIn: (data) => Number(data),
  transformOut: (data) => Boolean(data),
});

const internal = myMapper.in('2'); // 2
const external = myMapper.out(internal); // true
```

## Real life example

```ts
import { z } from 'zod';
import { createZodMapper } from 'zod-mapper';

/* Example fetched users from API */
const exampleFetchedUserList = [
  {
    firstName: 'John',
    lastName: 'Doe',
    noSo_good_Label: 'something',
  },
  {
    firstName: 'Jeanne',
    lastName: 'Doe',
  },
];

/* 1. Create a Zod schema for a user */
const zUser = () =>
  z.object({
    firstName: z.string(),
    lastName: z.string(),
    noSo_good_Label: z.string().optional(),
  });

/* 2. Create a Zod schema for the users list */
const zUserList = () => z.array(zUser());

/* 3. Create a user mapper */
const userMapper = createZodMapper({
  // Zod schema for EXTERNAL data
  schema: zUser(),

  // Transform api user to internal user
  transformIn: ({ noSo_good_Label, ...data }) => ({
    ...data,
    fullName: `${data.firstName} ${data.lastName}`,
    goodLabel: noSo_good_Label,
  }),

  // Transform internal user to api user
  transformOut: ({ goodLabel, ...data }) => ({
    ...data,
    noSo_good_Label: goodLabel,
  }),
});

/* 4. Create a user list mapper */
const userListMapper = createZodMapper({
  // Zod schema for EXTERNAL data
  schema: zUserList(),

  // Transform api users list to internal users list
  transformIn: (data) => data.map(userMapper.in),

  // Transform internal users list to api users list
  transformOut: (data) => data.map(userMapper.out),
});

/**
 *  5. Use the mapper to transform the data
 * from the api format to the internal format.
 *
 * ℹ️ Each user will HAVE the `fullName` property and the `goodLabel`
 */
const users = userListMapper.in(exampleFetchedUserList);

/**
 *  6. Use the mapper to transform the data
 * back from the internal format to the api format.
 *
 * ℹ️ Each user will NOT HAVE the `fullName` property and will HAVE the `noSo_good_Label`
 */
const payload = userListMapper.out(users);
```

## License

MIT &copy; [ivan-dalmet](https://github.com/sponsors/ivan-dalmet)
