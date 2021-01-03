import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";
import clean from "rollup-plugin-delete";
import copy from "rollup-plugin-copy";
import replace from '@rollup/plugin-replace';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require("child_process").spawn("yarn", ["start", "--dev"], {
				stdio: ["ignore", "inherit", "inherit"],
				shell: true
			});

			process.on("SIGTERM", toExit);
			process.on("exit", toExit);
		}
	};
}

export default {
	input: "src/Entry.ts",
	output: {
		sourcemap: true,
		format: "esm",
		name: "app",
		dir: "web"
	},
	plugins: [
		clean({
			targets: ["web"]
		}),
		copy({
			targets: [
				{
					src: "src/Template.html",
					dest: "web",
					rename: "Index.html"
				},
				{
					src: "src/Global.css",
					dest: "web"
				},
				{
					src: "src/Icon.png",
					dest: "web"
				}
			]
		}),
		replace({
			"process.env.NODE_ENV": !production ? "'development'" : "'production'"
		}),

		svelte({
			preprocess: sveltePreprocess(),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we"ll extract any component CSS out into
		// a separate file - better for performance
		css({ output: "bundle.css" }),

		// If you have external dependencies installed from
		// yarn, you"ll most likely need these plugins. In
		// some cases you"ll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ["svelte"]
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),

		// In dev mode, call `yarn run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `web` directory and refresh the
		// browser on changes when not in production
		!production && livereload("web"),

		// If we"re building for production (yarn run build
		// instead of yarn run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
