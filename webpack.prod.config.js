const merge = require('webpack-merge');
const base = require('./webpack.config.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(base, {
	mode: "production",
	devtool: false,
	output: {
		filename: 'app.bundle.js',
		path: __dirname
	},
	performance: {
		maxEntrypointSize: 900000,
		maxAssetSize: 900000
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					output: {
						comments: false
					}
				}
			})
		]
	}
});
