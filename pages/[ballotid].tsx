import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Box, Typography, Paper, Button } from '@material-ui/core';
import hash from '../lib/hashids';
import { client, q } from '../lib/fauna';
import Rating from '@material-ui/lab/Rating';
import { useList, useTitle } from 'react-use';
import fetch from 'isomorphic-unfetch';
import { parse } from 'cookie';
import Router from 'next/router';
import CopyToClipboard from 'react-copy-to-clipboard';

type BallotProps = { id: string; options: string[]; votes: number[][] };
const Ballot: React.FC<BallotProps> = ({ id, options, votes }) => {
    useTitle(`Star Voting${votes.length ? ` | ${votes.length} votes` : ''}`);
    const [ratings, { updateAt }] = useList<number>();
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState(30);
    useEffect(() => {
        if (copied) {
            const i = setTimeout(() => {
                setCopied(false);
            }, 10_000);
            return () => clearTimeout(i);
        }
    }, [copied]);
    useEffect(() => {
        const i = setInterval(() => {
            setCountdown(n => (n === 0 ? 0 : n - 1));
        }, 1000);
        return () => clearInterval(i);
    }, []);
    useEffect(() => {
        if (votes.length && countdown === 0) {
            Router.replace(Router.asPath).then(() => setCountdown(30));
        }
    }, [countdown]);
    const sorted = options
        .map((key, i) => ({
            key,
            value:
                votes.map(e => e[i]).reduce((a, b) => a + b, 0) / votes.length,
        }))
        .sort((a, b) => (a.value > b.value ? -1 : 1));
    const firstIdx = options.findIndex(e => e === sorted[0].key);
    const secondIdx = options.findIndex(e => e === sorted[1].key);
    return (
        <Container maxWidth="xs">
            <Box mt={4} mb={4}>
                <Typography component="h1" variant="h4" align="center">
                    Star Voting
                </Typography>
                <Box textAlign="center">
                    <CopyToClipboard
                        text={
                            typeof document === 'undefined'
                                ? ''
                                : document.location.href
                        }
                        onCopy={() => setCopied(true)}
                    >
                        <Button variant={copied ? 'text' : 'contained'}>
                            {copied ? 'Copied!' : 'Copy Link'}
                        </Button>
                    </CopyToClipboard>
                </Box>
            </Box>
            <Paper>
                {votes.length ? (
                    <Box padding={3}>
                        <Typography
                            component="h1"
                            variant="body1"
                            align="center"
                        >
                            Average based on {votes.length} vote
                            {votes.length > 1 ? 's' : ''}
                        </Typography>
                        {sorted.map(({ key, value }, i, arr) => (
                            <Box
                                mt={2}
                                component="fieldset"
                                key={key}
                                borderColor="transparent"
                                textAlign="center"
                            >
                                <Typography component="legend">
                                    {key}{' '}
                                    {i === 0
                                        ? `(preferred by ${
                                              votes.filter(
                                                  e =>
                                                      e[firstIdx] >
                                                      e[secondIdx],
                                              ).length
                                          })`
                                        : i === 1
                                        ? `(preferred by ${
                                              votes.filter(
                                                  e =>
                                                      e[firstIdx] <
                                                      e[secondIdx],
                                              ).length
                                          })`
                                        : null}
                                </Typography>
                                <Rating
                                    readOnly
                                    value={value}
                                    precision={0.1}
                                />
                            </Box>
                        ))}
                        <Typography
                            component="div"
                            variant="caption"
                            align="center"
                        >
                            Refreshing results in {countdown} seconds...
                        </Typography>
                    </Box>
                ) : (
                    <Box padding={3}>
                        <Typography
                            component="h1"
                            variant="body1"
                            align="center"
                        >
                            Rank each option on a scale from 1-5
                        </Typography>
                        {options.map((e, i) => (
                            <Box
                                mt={2}
                                component="fieldset"
                                key={i}
                                borderColor="transparent"
                                textAlign="center"
                            >
                                <Typography component="legend">{e}</Typography>
                                <Rating
                                    name={e}
                                    value={ratings[i] || 0}
                                    precision={0.5}
                                    onChange={(_ev, val) => {
                                        updateAt(i, val!);
                                    }}
                                />
                            </Box>
                        ))}

                        <Box mt={2} textAlign="center">
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={
                                    ratings.filter(e => e > 0).length !==
                                    options.length
                                }
                                onClick={async () => {
                                    await fetch('/api/vote', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            id,
                                            ratings,
                                        }),
                                    });
                                    Router.replace(Router.asPath);
                                }}
                            >
                                Submit Responses
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default Ballot;

export const getServerSideProps: GetServerSideProps<BallotProps> = async ({
    params,
    req,
}) => {
    const [id] = hash.decode(params?.ballotid as string);
    if (!id) {
        console.log({ params });
    }
    const { options, ratings } = await client.query<{
        options: string[];
        ratings: number[][];
    }>(q.Select('data', q.Get(q.Ref(q.Collection('ballots'), id?.toString()))));

    const voted = parse(req.headers.cookie || '')[id?.toString()];

    return {
        props: { id: id?.toString(), options, votes: voted ? ratings : [] },
    };
};
