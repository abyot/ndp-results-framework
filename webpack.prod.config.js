'use strict';
var webpack = require('webpack');

const HTMLWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var colors = require('colors');

const dhisConfigPath = process.env.DHIS2_HOME && `${process.env.DHIS2_HOME}/config.json`;
let dhisConfig;

try {
    dhisConfig = require(dhisConfigPath);
    console.log('\nLoaded DHIS config:');
} catch (e) {
    // Failed to load config file - use default config
    console.warn('\nWARNING! Failed to load DHIS config:', e.message);
    console.info('Using default config');
    dhisConfig = {
        baseUrl: 'http://localhost:8282',
        authorization: 'Basic YWRtaW46ZGlzdHJpY3Q=' // admin:district
    };
}

dhisConfig.apiRoot = '../../..';
dhisConfig.mode = 'PROD';

console.log(JSON.stringify(dhisConfig, null, 2), '\n');

function bypass(req, res, opt) {
    req.headers.Authorization = dhisConfig.authorization;
}

function makeLinkTags(stylesheets) {
    return function (hash) {
        return stylesheets
            .map(([url, attributes]) => {
                const attributeMap = Object.assign({ media: 'screen' }, attributes);

                const attributesString = Object
                    .keys(attributeMap)
                    .map(key => `${key}="${attributeMap[key]}"`)
                    .join(' ');

                return `<link type="text/css" rel="stylesheet" href="${url}?_=${hash}" ${attributesString} />`;
            })
            .join(`\n`);
    };
}

function makeScriptTags(scripts) {
    return function (hash) {
        return scripts
            .map(script => (`<script src="${script}?_=${hash}"></script>`))
            .join(`\n`);
    };
}

module.exports = {
    context: __dirname,
    entry: './scripts/index.js',
    output: {
        path: path.join(__dirname, '/build'),
        publicPath: '',
        filename: 'app-[hash].js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: [/(node_modules)/],
                loaders: ['ng-annotate-loader', 'babel-loader'],
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/,
                loader: 'file-loader',
                query: {
                    name: 'images/[name].[hash].[ext]',
                    publicPath: ''    // <-- emit relative URLs (no leading slash)
                }
            },
        ],
        noParse: /node_modules\/leaflet-control-geocoder\/dist\/Control.Geocoder.js/,
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'env':{
                'dhisConfig': JSON.stringify(dhisConfig),
            }
        }),
        new HTMLWebpackPlugin({
            template: './index.ejs',
            stylesheets: makeLinkTags([
                ['styles/style.css'],
                ['styles/print.css', { media: 'print' }],
            ]),
            scripts: makeScriptTags([
                'vendor/main/main.js',
            ]),
        })        
    ],
    devtool: 'sourcemap',
    devServer: {
        contentBase: '.',
        progress: true,
        colors: true,
        port: 8081,
        inline: false,
        compress: false,
        proxy: [
                { path: '/api/**', target: dhisConfig.apiRoot, bypass:bypass },
                { path: '/dhis/dhis-web-commons/**', target: dhisConfig.apiRoot, bypass:bypass},
                { path: '/dhis-web-commons-ajax-json/**', target: dhisConfig.apiRoot, bypass:bypass },
                { path: '/dhis-web-commons-stream/**', target: dhisConfig.apiRoot, bypass:bypass },
                { path: '/dhis-web-commons/***', target: dhisConfig.apiRoot, bypass:bypass, proxyTimeout: 1000 * 60 * 5 },
                { path: '/dhis-web-core-resource/**', target: dhisConfig.apiRoot, bypass:bypass },
                { path: '/icons/**', target: dhisConfig.apiRoot, bypass:bypass },
                { path: '/images/**', target: dhisConfig.apiRoot, bypass:bypass },
                { path: '/main.js', target: dhisConfig.apiRoot, bypass:bypass },
        ],
    },
    production: {
        proxy: [
            { path: '/api/**', target: dhisConfig.apiRoot, bypass:bypass },
            { path: '/dhis/dhis-web-commons/**', target: dhisConfig.apiRoot, bypass:bypass},
            { path: '/dhis-web-commons-ajax-json/**', target: dhisConfig.apiRoot, bypass:bypass },
            { path: '/dhis-web-commons-stream/**', target: dhisConfig.apiRoot, bypass:bypass },
            { path: '/dhis-web-commons/***', target: dhisConfig.apiRoot, bypass:bypass, proxyTimeout: 1000 * 60 * 5 },
            { path: '/dhis-web-core-resource/**', target: dhisConfig.apiRoot, bypass:bypass },
            { path: '/icons/**', target: dhisConfig.apiRoot, bypass:bypass },
            { path: '/images/**', target: dhisConfig.apiRoot, bypass:bypass },
            { path: '/main.js', target: dhisConfig.apiRoot, bypass:bypass },
        ]
    }
};