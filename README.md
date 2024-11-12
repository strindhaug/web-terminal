# web-terminal
A silly hobby project of simulating an terminal OS with apps in a browser

You can now see it here:
https://strindhaug.github.io/web-terminal/

## How to run locally:

Clone this repo locally

```sh
pnpm i
```

then run the dev server:

```sh
pnpm dev
```
Will start the server at

http://localhost:5173/

It's a simulation of a retro terminal interface.
Just try typing stuff. If you type an invalid command it will hint about the
`help` command.

Currently the most complete application is the `matrix` and the man page for
said command.

## Development:

TODO write more stuff here

Fix lint errors
```sh
pnpm lint
```

Build a prod build
```sh
pnpm build
```
