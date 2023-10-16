# Forju

Forschende Jugend website.

## Contribute

The frontend / client is referred as app. The backend as server.

### Development env

#### Develop app

The source of the app can be found in `/app` and the serviceWorker's in `/serviceWorker`.

```
 $ npm run devApp
```

Builds the app on save & spins up a live (notifies client to reload on change) repl server, whose source can be found in `/replServer/src`.

#### Develop server

Source found in `/server/src`.

```
 $ npm run devServer
```

Builds the server & replApp on save. The source of the replApp can be found under `/replApp`. No live reloading available, since its the prod server.

#### Develop server & app

```
 $ npm run dev
```

Watches production server & app and builds them on save. No live reloading avalible, since its the prod server.

### Deploy

#### Build scripts

Build everything for production

```
 $ npm run build
```

#### Start

Start the server with default options

```
 $ npm start
```

Since this is a [npm-run-script](https://docs.npmjs.com/cli/run-script), cli options must be escaped in order to distinguish them from npm options. Simply prefix all options with **one** `--` like so: 

```
 $ npm start --  --port 1234 --outageReciliance strong
```

##### CLI options

Here is a list of all recognised cli options:

> TODO