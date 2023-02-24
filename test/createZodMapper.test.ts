import { test, assert, expect } from 'vitest';
import { z } from 'zod';
import { createZodMapper } from '../src';

test('docs-basic-example', () => {
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

  assert.equal(internal, 2);
  assert.equal(external, '2');
});

test('docs-real-life', () => {
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

  assert.deepEqual(users, [
    {
      firstName: 'John',
      lastName: 'Doe',
      goodLabel: 'something',
      fullName: 'John Doe',
    },
    {
      firstName: 'Jeanne',
      lastName: 'Doe',
      goodLabel: undefined,
      fullName: 'Jeanne Doe',
    },
  ]);
  assert.deepEqual(payload, [
    { firstName: 'John', lastName: 'Doe', noSo_good_Label: 'something' },
    { firstName: 'Jeanne', lastName: 'Doe', noSo_good_Label: undefined },
  ]);
});

test('schema-error', () => {
  const myMapper = createZodMapper({
    schema: z.string(),
    transformIn: (data) => Number(data),
    transformOut: (data) => String(data),
  });

  expect(() => {
    myMapper.in(2 as any);
  }).toThrowError(/Expected string, received number/);
});

test('safe-basic', () => {
  const myMapper = createZodMapper({
    schema: z.string(),
    transformIn: (data) => Number(data),
    transformOut: (data) => String(data),
  });

  const internal = myMapper.safeIn('2');
  if (!internal.success) {
    return;
  }

  assert.equal(internal.data, 2);

  const external = myMapper.safeOut(internal.data);
  if (!external.success) {
    return;
  }

  assert.equal(external.data, '2');
});

test('safe-error', () => {
  const myMapper = createZodMapper({
    schema: z.string(),
    transformIn: (data) => Number(data),
    transformOut: (data) => data as any,
  });

  const internal = myMapper.safeIn(2 as any);
  const external = myMapper.safeOut(false as any);

  assert.equal(internal.success, false);
  assert.equal(external.success, false);
});

test('basic-diff-output', () => {
  const myMapper = createZodMapper({
    schema: z.string(),
    schemaOut: z.boolean(),
    transformIn: (data) => Number(data),
    transformOut: (data) => Boolean(data),
  });
  const internal = myMapper.in('2');
  const external = myMapper.out(internal);
  assert.equal(internal, 2);
  assert.equal(external, true);
});
