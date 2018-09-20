var webpack = require('webpack');
var path = require('path');

module.exports = {
   devtool: 'source-map',               // the dev-server should create JS source-map files.
   entry: [
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      './src/index.js'
   ],
   module: {
      loaders: [
          {
            test: /\.jsx?$/,                                                // for every file that ends with '.js' or '.jsx'
            exclude: /node_modules/,                                        // except for npm modules in the 'node_modules' directory
            loader: 'react-hot/webpack!babel-loader?'+JSON.stringify({      // process the file first with Babel, then with the React Hot Loader
                presets: [
                    'es2015'
                ],
                plugins: [
                    ["import", [{ "libraryName": "antd", "style": "css" }]]
                ]
            })
         },
         { test: /\.svg$/, loader: 'icon-maker', include: path.join(__dirname, 'icons')},
         { test: /\.less$/, loader: "style-loader!css-loader!less-loader" },
         { test: /\.css$/, loader: "style-loader!css-loader" },
         { test: /\.styl$/, loader: "style-loader!css-loader!stylus-loader" },
         { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
         { test: /\.json$/, loader: 'json-loader'}
      ]
   },
   resolve: {
      extensions: ['', '.js', '.jsx']
   },
   output: {
      path: __dirname + '/dist',         // The bundle must be stored in 'dist' directory,
      publicPath: '/',                   // but http request should find them in the root of the site.
      filename: 'bundle.js'              // The file containing the combined modules (the bundle) should be called 'bundle.js'
   },
   devServer: {
      contentBase: './dist',             // Dev Server serves from 'dist' directory. Both generated bundles and
                                         // static files (html,css, images) must live in this directory.
      hot: true                          // Use the hot module replacement plugin (used by React Hot Loader).
   },
   plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /enUS/)
   ]
 };
