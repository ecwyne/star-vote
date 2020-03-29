import { Client, query } from 'faunadb';

export const client = new Client({
    secret: 'fnADoE13aLACATFpczpQwgg2UFtgKwFBG_8GWoit',
});

export const q = query;
