# 寻路算法项目 (Pathfinding Algorithms)

一个基于 TypeScript/JavaScript、AssemblyScript和rust实现的寻路算法演示项目，包含多种经典寻路算法的实现和可视化演示。

## Rust 实现

### Windows 上安装 Rust 和 Cargo 的步骤

- 1.下载 Rustup 安装程序

- 访问 https://rustup.rs/
- 点击 "Download rustup-init.exe" 下载安装程序

- 2.运行安装程序

- 双击下载的 rustup-init.exe
- 按照提示选择安装选项（通常选择默认选项即可）
- 安装程序会自动下载并安装 Rust 和 Cargo

- 3.验证安装

- 重新打开 PowerShell 或命令提示符
- 运行以下命令验证安装：
  rustc --version
  cargo --version

- 4.安装完成后的配置

- 更新 PATH 环境变量

    Rustup 会自动添加 ~/.cargo/bin 到 PATH
    如果没有自动添加，手动添加该路径到系统 PATH

- 安装 wasm-pack（用于 WebAssembly 开发）

    cargo install wasm-pack

### Rust WebAssembly A* 算法项目开发步骤

1.配置 Cargo.toml

    打开项目根目录下的 Cargo.toml 文件
    添加以下内容：

    ```toml
        [package]
        name = "a-star-rust"
        version = "0.1.0"
        edition = "2021"

        [lib]
        crate-type = ["cdylib"]

        [dependencies]
        wasm-bindgen = {version="0.2",features = ["serde-serialize"]}
        js-sys = "0.3"
        web-sys = { version = "0.3", features = ["console"] }
        serde = { version = "1.0", features = ["derive"] }
        serde-wasm-bindgen = "0.4"


        # 优化 WebAssembly 输出大小
        [profile.release]
        opt-level = "s"
        lto = true

        [package.metadata.wasm-pack.profile.release]
        wasm-opt = false
    ```

2.实现 A* 算法核心代码

    创建 src/lib.rs 文件
    实现 A* 算法核心代码

3.构建 WebAssembly 模块

    运行以下命令构建 WebAssembly 模块：
    wasm-pack build --target web --out-dir pkg

4.在 packages/a-star-rust 目录下创建 package.json

    ```JSON
    {
    "name": "a-star-rust",
    "version": "0.1.0",
    "description": "A* pathfinding algorithm implemented in Rust for WebAssembly",
    "main": "pkg/a_star_rust.js",
    "types": "pkg/a_star_rust.d.ts",
    "files": [
        "pkg"
    ],
    "scripts": {
        "build": "wasm-pack build --target web --out-dir pkg",
        "build:release": "wasm-pack build --target web --out-dir pkg --release"
    },
    "keywords": ["pathfinding", "astar", "rust", "webassembly"],
    "author": "",
    "license": "ISC"
    }
    ```

5.在根目录的 pnpm-workspace.yaml 中确保包含：
    ```yaml
    packages:
    - 'packages/*'
    - 'apps/*'
    ```

6.在你的 App.tsx 或其他 TypeScript 文件中：
    ```typescript
    import init, { find_path_astar } from 'a-star-rust';
    // 初始化 WebAssembly 模块
    await init();

    // 使用 A* 算法
    const grid = [
    [true, true, false],
    [true, true, true],
    [false, true, true]
    ];

    const result = find_path_astar(grid, 0, 0, 2, 2);
    console.log('路径:', result.path);
    console.log('是否找到:', result.found);
    console.log('执行时间:', result.time, 'ms');
    ```

7.在 apps/demo/package.json 中添加：
    ```json
    {
    "dependencies": {
        "a-star-rust": "workspace:*",
        // ... 其他依赖
    }
    }
    ```
8.测试
    # 回到根目录，安装依赖
    cd ../..
    pnpm install

    # 启动 demo 应用
    pnpm dev:demo



