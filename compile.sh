#!/bin/bash
# 示例代码，按需配置

set -e

npm cache clear --force
npm install -g pnpm --registry=https://nexus.51y5.net/npm-public/

case $1 in
"main")
   pnpm install --registry=https://nexus.51y5.net/npm-public/ && pnpm build
   ;;

"develop")
   pnpm install --registry=https://nexus.51y5.net/npm-public/ && pnpm build:uat
   ;;

"feature/offline")
   pnpm install --registry=https://nexus.51y5.net/npm-public/ && pnpm build
   ;;

*)
   echo "未知参数"
   exit 87
   ;;
esac
cp -rp dist/* $CACHE_PATH
