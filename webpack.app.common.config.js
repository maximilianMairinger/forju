const InjectPlugin = require("webpack-inject-plugin")
const path = require("path")



module.exports = () => {
    return {
        entry: './app/app.ts',
        output: {
            filename: 'dist/forju.js',
            chunkFilename: 'dist/[name].js',
            path: path.resolve(path.dirname(''), "public"),
            publicPath: "/",
        },
        resolve: {
            extensions: ['.ts', '.js'],
            fallback: {
                fs: false,
                path: false
            }
        },
        // stats: {
        //     errorDetails: true
        // },
        module: {
            rules: [
                {
                    test: /\.scss$/i,
                    use: ["to-string-loader", "css-loader", "sass-loader"],
                },
                {
                    test: /\.less$/i,
                    use: ["to-string-loader", "css-loader", "less-loader"],
                },
                {
                    test: /([a-zA-Z0-9\s_\\.\-\(\):])+\.static\.([a-zA-Z0-9])+$/,
                    use: 'raw-loader',
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: "tsconfig.app.json"
                        }
                    },
                },
                {
                    test: /\.css$/,
                    use: ['to-string-loader', 'css-loader'],
                },
                {
                    test: /\.pug$/,
                    use: ['raw-loader', 'pug-html-loader']
                }
            ]
        }
    }
};
