#!/bin/sh

# 递归设置 .githooks 目录下所有文件为可执行
chmod +x .hooks/*

# 设置 Git 钩子路径为 .githooks/
git config --local core.hooksPath .hooks
