import { NextApiHandler } from 'next';
import hash from '../../lib/hashids';
import { client, q } from '../../lib/fauna';
import int from 'random-int';

const handler: NextApiHandler = async (req, res) => {
    const n = int(100_000, 999_999);
    const id = await client.query<string>(
        q.Select(
            ['ref', 'id'],
            q.Create(q.Ref(q.Collection('ballots'), n.toString()), {
                data: { options: req.body, ratings: [] },
            }),
        ),
    );

    if (id !== n.toString()) {
        throw new Error('ids do not match');
    }

    res.send(hash.encode(n));
};

export default handler;
