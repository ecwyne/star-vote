import { NextApiHandler } from 'next';
import { client, q } from '../../lib/fauna';
import { serialize } from 'cookie';

const handler: NextApiHandler = async (req, res) => {
    console.log(req.body);
    const { id, ratings } = req.body as { id: string; ratings: number[][] };

    const ref = q.Ref(q.Collection('ballots'), id.toString());
    await client.query(
        q.Update(ref, {
            data: {
                ratings: q.Append(
                    [ratings],
                    q.Select(['data', 'ratings'], q.Get(ref)),
                ),
            },
        }),
    );

    res.setHeader(
        'Set-Cookie',
        serialize(id, '1', {
            path: '/',
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        }),
    );
    res.end();
};

export default handler;
