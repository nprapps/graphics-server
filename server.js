const path = require('path');
const fs = require('fs');
const express = require('express');
const nunjucks = require('nunjucks');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const context = require('./context');
const config = require('./config');

let activeMiddleware = null;
let activeSlug = null;

// setup templates
const app = express();
app.set('view engine', 'html');
nunjucks.configure('./', { 
  autoescape: true,
  express: app,
  watch: true
});

// routes
app.get('/graphics/:slug/', function(req, res) {
  const graphicsPath = `${config.GRAPHICS_FOLDER}/${req.params.slug}`;
  const templateContext = context.makeContext(req.params.slug, 'localhost');
  res.render(`${graphicsPath}/parent_template.html`, templateContext);
});

app.get('/graphics/:slug/child.html', function(req, res) {
  const graphicsPath = `${config.GRAPHICS_FOLDER}/${req.params.slug}`;

  const templateContext = context.makeContext(req.params.slug, 'localhost');

  if (activeMiddleware && activeSlug !== req.params.slug) {
    activeMiddleware.close();
    app._router.stack.pop();
    setupWebpackServer(graphicsPath);
  } else if (!activeMiddleware) {
    setupWebpackServer(graphicsPath);
  }
  
  activeMiddleware.waitUntilValid(function() {
    res.render(`${graphicsPath}/child_template.html`, templateContext);
  });

  activeSlug = req.params.slug;
});

const setupWebpackServer = function(graphicsPath) {
  const config = require(`./${graphicsPath}/${config.WEBPACK_CONFIG_FILENAME}`)
  const compiler = webpack(config);
  activeMiddleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    stats: {
      colors: true,
    },
  });
  app.use(activeMiddleware);
  app.use(webpackHotMiddleware(compiler));  
};

app.listen('8000', function() {
  console.log('app started on port 8000');
});