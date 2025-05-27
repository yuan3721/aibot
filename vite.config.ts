import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import { visualizer } from 'rollup-plugin-visualizer';
import { VantResolver } from '@vant/auto-import-resolver';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { readFileSync } from 'fs';
// ARMS 插件 https://fe.lianwifi.com/docs/doc-center/start/vite-plugin.html#%E6%8F%92%E4%BB%B6%E7%94%A8%E6%B3%95
import path from 'path';

// 公共路径
const PUBLIC_PATH = '/wifi-bot/';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// 通用配置
const config = ({ command, mode }) => {
  const lifecycle = process.env.npm_lifecycle_event;
  //mock服务
  return {
    define: {
      __PKG_VERSION__: JSON.stringify(packageJson.version),
    },
    build: {
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // 移除 console.*
          drop_debugger: mode === 'production', // 移除 debugger
        },
      },
      outDir: path.resolve(__dirname, 'dist'),
      rollupOptions: {
        input: {
          index: 'index.html',
          // native: 'native-template.html',
          // map_index: 'map_index.html',
          // 可以添加更多页面
        },

      },
      chunkSizeWarningLimit: 500,
      assetsInlineLimit: 10240,
      sourcemap: true,
    },
    presets: [
      '@vue/cli-plugin-babel/preset',
      {
        targets: '> 0.25%, not dead',  
        modules: 'commonjs',  
      },
    ],
    plugins: [
      vue(),
      createSvgIconsPlugin(
        {
          iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
          symbolId: 'icon-[name]',
        }
      ),
      AutoImport({
        resolvers: [VantResolver()],
      }),
      Components({
        resolvers: [VantResolver()],
      }),
      legacy({
        targets: ['android >= 4.0', 'chromeAndroid >= 60', "chrome >= 60"],
        // additionalLegacyPolyfills: ['regenerator-runtime/runtime'], // 面向IE11时需要此插件
      }),
      lifecycle === 'report'
        ? visualizer({ open: true, brotliSize: true, filename: 'report.html' })
        : null,
    ],
    base: (mode === 'development' || mode === 'mock') ? '/' : PUBLIC_PATH,
    css: {
      //配置 CSS modules 的行为。选项将被传递给 postcss-modules。
      modules: {},
      //指定传递给 CSS 预处理器的选项
    },
    // 别名
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // 'vue': 'vue/dist/vue.esm-bundler.js' // 指定 Vue 完整版
      },
    },
  }
}

// https://vitejs.dev/config/
export default ({ command, mode }) => {
  return config({ command, mode });
}
