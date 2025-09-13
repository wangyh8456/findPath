# 寻路算法项目 (Pathfinding Algorithms)

一个基于 TypeScript/JavaScript 和 AssemblyScript 实现的寻路算法演示项目，包含多种经典寻路算法的实现和可视化演示。

## 🚀 项目特性

- **多算法支持**: 实现了 A*、Dijkstra 和 BFS 三种经典寻路算法
- **双语言实现**: 提供 JavaScript/TypeScript 和 AssemblyScript 两种实现
- **可视化演示**: 基于 React 的交互式网格演示界面
- **性能对比**: 支持不同算法和实现方式的性能对比
- **现代工具链**: 使用 Vite、TypeScript、pnpm workspace 等现代开发工具

## 📁 项目结构

```
pathfinding/
├── apps/
│   └── demo/                 # React 演示应用
│       ├── src/
│       │   ├── algorithms/    # JavaScript 算法实现
│       │   │   ├── astar.ts   # A* 算法
│       │   │   ├── Dijkstra.ts # Dijkstra 算法
│       │   │   └── bfs.ts     # 广度优先搜索
│       │   └── components/    # React 组件
│       │       ├── Grid.tsx   # 网格可视化组件
│       │       └── ControlPanel.tsx # 控制面板
│       └── package.json
├── packages/
│   └── a-star/               # AssemblyScript A* 实现
│       ├── assembly/
│       │   └── algorithms/
│       │       └── astar.ts  # AssemblyScript A* 算法
│       └── package.json
└── package.json
```

## 🧮 A* 算法核心公式

### f = g + h

A* 算法的核心是评估函数 `f(n) = g(n) + h(n)`，其中：

- **f(n)**: 节点 n 的总评估值
- **g(n)**: 从起点到节点 n 的实际代价
- **h(n)**: 从节点 n 到终点的启发式估计代价

### 各部分详解

#### G 值 (实际代价)
- 表示从起点到当前节点的**实际最短距离**
- 在网格中，直线移动代价为 1，对角线移动代价为 √2 ≈ 1.414
- 计算方式：`g(新节点) = g(当前节点) + 移动代价`

#### H 值 (启发式函数)
启发式函数用于估计从当前节点到目标的距离，不同的启发式函数会影响算法的性能和结果：

**1. 欧几里得距离 (推荐)**
```typescript
h = Math.sqrt((x1 - x2)² + (y1 - y2)²)
```
- ✅ **可接受性**: 永远不会高估真实距离
- ✅ **最优性**: 保证找到最短路径
- ✅ **精确性**: 在连续空间中给出精确估计

**2. 曼哈顿距离 (不推荐用于8方向网格)**
```typescript
h = Math.abs(x1 - x2) + Math.abs(y1 - y2)
```
- ❌ **高估**: 在允许对角线移动的网格中会高估距离
- ❌ **次优解**: 违反可接受性条件，可能找不到最优路径
- ✅ **计算快**: 只需要加法运算

**3. 切比雪夫距离 (8方向网格的好选择)**
```typescript
h = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2))
```
- ✅ **可接受性**: 在8方向网格中不会高估
- ✅ **效率**: 计算比欧几里得距离更快
- ⚠️ **略保守**: 可能比欧几里得距离探索更多节点

**4. 欧几里得距离平方 (错误示例)**
```typescript
h = (x1 - x2)² + (y1 - y2)²  // 错误！
```
- ❌ **严重高估**: 违反可接受性条件
- ❌ **次优解**: 经常找不到最优路径
- ❌ **搜索偏向**: 导致算法选择错误的搜索方向

### 可接受性条件

启发式函数必须满足**可接受性条件**：`h(n) ≤ h*(n)`

其中 `h*(n)` 是从节点 n 到目标的真实最短距离。

- **可接受的启发式函数**: 保证 A* 找到最优解
- **不可接受的启发式函数**: 可能导致次优解，但搜索速度可能更快

## 🔧 安装和使用

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd pathfinding

# 安装所有依赖
pnpm install:packages
```

### 构建 AssemblyScript 包

```bash
# 构建 a-star AssemblyScript 包
pnpm build:lib
```

### 运行演示应用

```bash
# 启动开发服务器
pnpm dev:demo

# 构建生产版本
pnpm build:demo
```

### 代码格式化

```bash
# 格式化所有代码
pnpm format

# 检查代码格式
pnpm format:check
```

## 🎮 使用说明

1. **设置网格**: 在控制面板中设置网格的宽度和高度
2. **设置起点**: 点击网格中的任意位置设置起点（绿色）
3. **设置终点**: 再次点击设置终点（红色）
4. **添加障碍物**: 继续点击添加障碍物（黑色）
5. **选择算法**: 点击相应按钮运行不同的寻路算法
6. **查看结果**: 观察找到的路径（蓝色）和性能数据

## 🔍 算法对比

| 算法 | 时间复杂度 | 空间复杂度 | 最优性 | 适用场景 |
|------|------------|------------|--------|----------|
| **A*** | O(b^d) | O(b^d) | ✅ (启发式可接受时) | 已知目标位置的最短路径 |
| **Dijkstra** | O((V+E)logV) | O(V) | ✅ | 单源最短路径，权重非负 |
| **BFS** | O(V+E) | O(V) | ✅ (无权图) | 无权图最短路径 |

## 🚀 性能优化

### JavaScript vs AssemblyScript

- **JavaScript**: 开发便捷，调试容易
- **AssemblyScript**: 接近原生性能，适合计算密集型任务

### 启发式函数选择建议

1. **追求最优解**: 使用欧几里得距离
2. **追求性能**: 使用切比雪夫距离
3. **4方向网格**: 可以使用曼哈顿距离
4. **避免使用**: 欧几里得距离平方等高估函数

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关资源

- [A* 算法详解](https://en.wikipedia.org/wiki/A*_search_algorithm)
- [AssemblyScript 官方文档](https://www.assemblyscript.org/)
- [React 官方文档](https://react.dev/)
- [Vite 构建工具](https://vitejs.dev/)