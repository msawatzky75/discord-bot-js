import path from 'path';
import {IgnorePlugin} from 'webpack';
import Dotenv from 'dotenv-webpack';

module.exports = {
	mode: 'development',
	entry: './src/index.ts',
	target: 'node',
	plugins: [
		new Dotenv(),
		new IgnorePlugin(/\.\/native/, /\/pg\//),
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js', '.json' ],
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
};
