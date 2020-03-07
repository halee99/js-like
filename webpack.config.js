const path = require('path')//处理路径信息
const HtmlWebpackPlugin = require('html-webpack-plugin')//引入html-webpack-plugin

const config = {
  mode: 'development', // development || production
  entry: path.resolve(__dirname, 'src/index.ts'),//webpack 打包入口文件
  output: {
    path: path.resolve(__dirname, 'dist'),//打包完成放置位置
    filename: 'main.js'//打包后的文件名
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader"
      },

      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  //插件，用于生产模板和各项功能
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html', //模板地址
      filename: 'index.html',//生成的dist下的模板名称
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
  ],
  //配置webpack开发服务器功能
  devServer: {
    // 设置基本目录结构
    contentBase: path.resolve(__dirname, 'dist'),
    //服务器的ip地址 可以使用ip也可以使用localhost
    host: 'localhost',
    open: true,
    //服务器压缩是否开启
    compress: true,
    //配置服务端口号
    port: 9999
  }
}
module.exports = config
