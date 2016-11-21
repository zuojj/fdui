/**
 * babel-loader
 * babel-core
 * babel-preset-es2015 > support es6/es2015
 * babel-plugin-transform-runtime > 对es6语法进行转换，对于新的API，使用babel-ployfill
 *
 *
 * webpack -p 内部使用的就是UglifyJsPlugin
 *
 *
 * ```
 *      ifBooleanArg("optimize-minimize", function() {
            ensureArray(options, "plugins");
            var UglifyJsPlugin = require("../lib/optimize/UglifyJsPlugin");
            options.plugins.push(new UglifyJsPlugin());
        });
 * ```
 *
 * 
 * CommonsChunkPlugin 公共依赖打包
 * HtmlWebpackPlugin  引用资源路径自动替换
 *
 * Extract-text-webpack-plugin 使每一个entry chunk 的 style 分离成 style 文件
 *
 *
 * Webpack AMD
 * 
 */
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    cache: true,
    // 此处使用Array, helper.js会在index.js后执行
    entry: {
        datepicker: './src/example/datepicker/index.js',
        slider: './src/example/slider/index.js',
        index: './src/example/index/index.js'
    },
    output: {
        path: './output',
        // CDN 使用
        //publicPath: 'https://imgcdn.xx.com',
        filename: 'static/js/[name].js'
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel',
            query: {
                plugins: ['transform-runtime'],
                presets: ['es2015']
            }
        },{
            test: /\.s?css$/,
            exclude: /(node_modules|bower_components)/,
            loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader!sass-loader") 
        },{
            test: /\.(jpg|png|jpeg)$/,
            loader: 'url?limit=2000&name=/static/images/[name].[ext]'
        }, {
            test: /\.html$/,
            loader: 'html?attrs=img:src'
        }]
    },
    plugins: [
        new CommonsChunkPlugin({
            name: 'common',
            minChunks: 2
        }),
        new HtmlWebpackPlugin({
            inject: 'body',
            template: './src/example/datepicker/template.html',
            chunks: ['common', 'datepicker'],
            filename: 'datepicker.html',
        }),
        new HtmlWebpackPlugin({
            inject: 'body',
            template: './src/example/slider/template.html',
            chunks: ['common', 'slider'],
            filename: 'slider.html',
        }),
        new HtmlWebpackPlugin({
            inject: 'body',
            template: './src/example/index/template.html',
            chunks: ['common', 'index'],
            filename: 'index.html',
        }),
        new ExtractTextPlugin('static/css/[name].css')
    ]
}