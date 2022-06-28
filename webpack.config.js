const path = require('path')
const tsImportPluginFactory = require('ts-import-plugin')
const rxjsExternals = require('webpack-rxjs-externals')
const CopyWebpackPlugin = require('copy-webpack-plugin')

/* Dependencies from package.json that ship in ES2015 module format */
const es2015modules = [
    'marked'
].map((item) => path.resolve(__dirname, 'node_modules', item))

module.exports = (_env, options) => {
    return  {
        entry: {
            'tesler-ui-core': './src/index.ts',
            'interfaces/widget': './src/interfaces/widget.ts',
            'interfaces/filters': './src/interfaces/filters.ts',
            'interfaces/objectMap': './src/interfaces/objectMap.ts',
            'interfaces/operation': './src/interfaces/operation.ts',
            'interfaces/router': './src/interfaces/router.ts',
            'interfaces/view': './src/interfaces/view.ts'
        },
        mode: options.mode || 'development',
        devServer: {
            writeToDisk: false,
            port: 8081
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            library: '',
            libraryTarget: 'commonjs'
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ],
            modules: ['src', 'node_modules'],
        },
        externals: [
            rxjsExternals(),
            {
            axios: {
                root: 'axios',
                commonjs2: 'axios',
                commonjs: 'axios',
                amd: 'axios'
            },
            react: {
                root: 'React',
                commonjs2: 'react',
                commonjs: 'react',
                amd: 'react'
            },
            'react-dom': {
                root: 'ReactDOM',
                commonjs2: 'react-dom',
                commonjs: 'react-dom',
                amd: 'react-dom'
            },
            'react-redux': {
                root: 'ReactRedux',
                commonjs2: 'react-redux',
                commonjs: 'react-redux',
                amd: 'react-redux'
            },
            'redux-observable': {
                root: 'ReduxObservable',
                commonjs2: 'redux-observable',
                commonjs: 'redux-observable',
                amd: 'redux-observable'
            },
            'rxjs': {
                root: 'RxJs',
                commonjs2: 'rxjs',
                commonjs: 'rxjs',
                amd: 'rxjs'
            },
            'moment': {
                root: 'moment',
                commonjs2: 'moment',
                commonjs: 'moment',
                amd: 'moment'
            }
        }],
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    include: [path.resolve(__dirname, 'src')],
                    exclude: [/(\.test.tsx?$)/, path.resolve(__dirname, 'src', 'tests')],
                    use: {
                        loader: 'ts-loader',
                        options: {
                            getCustomTransformers: function() {
                                return {
                                    before: [
                                        tsImportPluginFactory({
                                            libraryName: 'antd',
                                            libraryDirectory: 'es',
                                            style: false
                                        })
                                    ]
                                }
                            },
                            happyPackMode: false,
                            experimentalWatchApi: false,
                            compilerOptions: {
                                sourceMap: true
                            }
                        }
                    }
                },
                // Translating ES2015 modules from npm to support IE11
                {
                    test: /\.jsx?$/,
                    include: es2015modules,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true
                            }
                        }
                    ]
                },
            ]
        },
        plugins: [
            new CopyWebpackPlugin([
                { from: 'package.json' },
                { from: 'README.md' },
                { from: 'LICENSE' },
                { from: 'CHANGELOG.md' },
                { from: 'CONTRIBUTING.md' }
            ])
        ]
    }
}
