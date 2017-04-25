const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

function isProd(env){
  return env === 'prod'
}

function isDev(env){
  return !isProd(env)
}

function getSassConfig(env) {
    return {
        use: [{
                loader: 'css-loader',
                options: {
                    minimize: isProd(env),
                    sourceMap: isDev(env)
                }
            },
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: isDev(env)
                }
            }
        ]
    }
}

function getPluginConfig(env){
  const plugins = [
      new HtmlWebpackPlugin({
          template: path.join(__dirname, 'src', 'index.html')
      }),
      new ExtractTextPlugin({ // define where to save the file
          filename: 'style.css',
          allChunks: true,
      })
  ];
  if(isProd(env)){
    plugins.push(new UglifyJSPlugin())
  }
  return plugins;
}

const config = function(env) {
    return {
        entry: path.join(__dirname, 'src', 'main.js'),
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'bundle.js'
        },
        devtool: isDev(env)?'source-map':false,
        module: {
            loaders: [{
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract(getSassConfig(env))
                }
            ]
        },
        resolve: {
            modules: [
                path.resolve('./src'),
                path.resolve('./node_modules')
            ]
        },
        plugins: getPluginConfig(env)
    }
};

module.exports = config;
