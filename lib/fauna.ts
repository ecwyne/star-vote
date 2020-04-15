import { Client, query } from 'faunadb';

export const client = new Client({
    secret: process.env.FAUNA_SECRET as string,
});

export const q = query;
