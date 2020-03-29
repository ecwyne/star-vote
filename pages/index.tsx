import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    IconButton,
    InputAdornment,
    Button,
} from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import { useList } from 'react-use';
import fetch from 'isomorphic-unfetch';
import Router from 'next/router';

export default () => {
    const [options, { push, removeAt, updateAt }] = useList<string>(['']);
    return (
        <Container maxWidth="xs">
            <Box mt={4} mb={4}>
                <Typography component="h1" variant="h4" align="center">
                    Star Voting
                </Typography>
            </Box>
            <Paper>
                <Box padding={3}>
                    <Typography component="h1" variant="body1" align="center">
                        Add options to your new ballot
                    </Typography>
                    {options.map((e, i) => (
                        <Box mt={2} key={i}>
                            <TextField
                                value={e}
                                autoFocus
                                fullWidth
                                variant="outlined"
                                label={`Option ${i + 1}`}
                                onChange={e => updateAt(i, e.target.value)}
                                onBlur={() => {
                                    if (
                                        options.filter(e => e).length ===
                                        options.length
                                    ) {
                                        push('');
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => removeAt(i)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    ))}

                    <Box mt={2} textAlign="center">
                        <IconButton color="primary" onClick={() => push('')}>
                            <Add />
                        </IconButton>
                    </Box>
                    <Box mt={2} textAlign="center">
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={options.filter(e => e).length < 2}
                            onClick={async () => {
                                const id = await fetch('/api/create', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(
                                        options.filter(e => e),
                                    ),
                                }).then(r => r.text());

                                Router.push(`/${id}`);
                            }}
                        >
                            Create Ballot
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};
