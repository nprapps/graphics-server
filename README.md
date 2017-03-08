# Graphics Server Prototype

This is a prototype of a centralized graphics server capable of serving graphics generated from the prototype [dailygraphics Yeoman generator](github.com/nprapps/generator-dailygraphic). You should follow the docs there to install that first.

Here, there are only two commands so far: 

- `npm start`, which will fire up your Express server.
- `npm run new`, which will invoke the Yeoman generator.

Make sure that, when you run the Yeoman generator, the graphics are installing to the graphics folder in here.

The server will fire up a Webpack instance for each graphic when you first request it. The server only runs one Webpack instance at a time now -- so Webpack will only be working for the most recent graphic you requested. Bad!

