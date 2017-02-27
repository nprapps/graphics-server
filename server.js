const path = require('path');
const fs = require('fs');
const express = require('express');
const nunjucks = require('nunjucks');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const context = require('./context');

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
  const graphicsPath = `graphics/${req.params.slug}`;
  const templateContext = context.makeContext(req.params.slug, 'localhost');
  res.render(`${graphicsPath}/parent_template.html`, templateContext);
});

app.get('/graphics/:slug/child.html', function(req, res) {
  const graphicsPath = `graphics/${req.params.slug}`;

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
  const config = require(`./${graphicsPath}/webpack.config.js`)
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

app.get('/render/', function(req, res) {
  const data = context.makeContext('staging');
  const prodCompiler = webpack(prodConfig);
  app.use(middleware)

  prodCompiler.run(function(err, stats) {
    if (err) {
      console.error(`webpack failed: ${err}`);
      return;
    }

    app.render('parent_template.html', data, function(err, html) {
      if (err) {
        console.error(`parent_template.html failed: ${err}`);
        return;
      }
      fs.writeFile('./dist/index.html', html);
    }) 
    app.render('child_template.html', data, function(err, html) {
      if (err) {
        console.error(`child_template.html failed: ${err}`);
        return;
      }
      fs.writeFile('./dist/child.html', html);
    })
    res.status(201).send('Rendered graphic!');
  })
}); 

app.listen('8000', function() {
  console.log('app started on port 8000');
});