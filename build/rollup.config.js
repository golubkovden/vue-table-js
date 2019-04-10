import path from 'path';
import buble from 'rollup-plugin-buble';
import cjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import vue from 'rollup-plugin-vue';

const resolve = p => path.resolve(__dirname, '../', p);

function generate(config) {
    return {
        input: resolve('src/components/Table.vue'),
        output: {
            name: 'VueTableJs',
            file: config.file,
            format: config.format,
        },
        plugins: [
            cjs(),
            vue(),
            buble({
                objectAssign: 'Object.assign',
            }),
            (config.format === 'iife' && terser({ sourcemap: false })),
        ],
    };
}

const configs = [
    {
        file: resolve('dist/vue-table-js.umd.js'),
        format: 'umd',
    },
    {
        file: resolve('dist/vue-table-js.common.js'),
        format: 'cjs',
    },
    {
        file: resolve('dist/vue-table-js.esm.js'),
        format: 'esm',
    },
    {
        file: resolve('dist/vue-table-js.iife.js'),
        format: 'iife',
    },
];

export default configs.map(generate);
