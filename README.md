## Usage


### Locally

Start the server locally

```
npm start
```

Send data to the server

```
npm run gen-data
```

### Triton

Provision and start the container

```
triton-compose up -d
```

Send data to the remote server

```
URL=http://some.remote.triton.zone ./gen-data
```
