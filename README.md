# GMA: a Generic Messaging App

GMA is a generic messaging app that implements end to end encryption.

## Running

You'll need Postgres and Node. To set up your database, execute the `scripts/db_setup.sql` script.

```sh
$ git clone https://github.com/mellamopablo-personal-tests/gma-server.git
$ cd gma-server
$ npm install
$ npm run build

Set up your postgres database credentials, and adjust the configuration to your liking:

$ vi config.js

Run the app with node:

$ node ./server/index.js

Or use a process manager (reccommended):

$ npm install -g pm2
$ pm2 start ./server/index.js
```

## API Reference

Check out the api reference [here](https://mellamopablo-personal-tests.github.io/gma-server/).
