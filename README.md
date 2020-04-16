# star-vote

### Local Setup
1. Create a new database on https://dashboard.fauna.com
2. Create a collection named `ballots`
3. Create a new server key on the security tab
4. Copy the generated key and paste it into a `.env` file in the root directory of the project

```
# .env example
FAUNA_SECRET=YOUR_COPIED_SECRET
```

### To Run Locally
```bash
yarn start
```

### Deploy to Zeit Now
```bash
yarn global add now # if you don't have it installed
now
```
Paste your server secret in project's [environment variables](https://zeit.co/docs/v2/build-step#environment-variables) section

