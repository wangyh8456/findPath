// Dijkstra算法的节点类
class DijkstraNode {
    x: number;
    y: number;
    f: number; // 从起点到当前节点的最短距离
    parent: DijkstraNode | null;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.f = Infinity;
        this.parent = null;
    }
}

// 路径点接口
export interface PathPoint {
    x: number;
    y: number;
}

// Dijkstra算法结果接口
export interface DijkstraResult {
    path: PathPoint[];
    found: boolean;
    executionTime: number;
}

/**
 * JavaScript实现的Dijkstra寻路算法
 * @param grid 网格数组，true表示障碍物，false表示可通行
 * @param startX 起点X坐标
 * @param startY 起点Y坐标
 * @param endX 终点X坐标
 * @param endY 终点Y坐标
 * @returns Dijkstra算法结果
 */
export function findPathDijkstra(
    grid: boolean[][],
    startX: number,
    startY: number,
    endX: number,
    endY: number
): DijkstraResult {
    const startTime = performance.now();
    const width = grid[0].length;
    const height = grid.length;

    if (
        startX < 0 ||
        startX >= width ||
        startY < 0 ||
        startY >= height ||
        endX < 0 ||
        endX >= width ||
        endY < 0 ||
        endY >= height ||
        grid[startY][startX] ||
        grid[endY][endX]
    ) {
        return {
            path: [],
            found: false,
            executionTime: performance.now() - startTime,
        };
    }
    if (startX === endX && startY === endY) {
        return {
            path: [{ x: startX, y: startY }],
            found: true,
            executionTime: performance.now() - startTime,
        };
    }

    const openList: DijkstraNode[] = [];
    const closedList: Set<string> = new Set();
    const nodeMap: Map<string, DijkstraNode> = new Map();

    const startNode = new DijkstraNode(startX, startY);
    startNode.f = 0;
    openList.push(startNode);
    nodeMap.set(`${startX},${startY}`, startNode);

    const directions = [
        { dx: -1, dy: -1, cost: Math.SQRT2 }, // 左上
        { dx: 0, dy: -1, cost: 1 }, // 上
        { dx: 1, dy: -1, cost: Math.SQRT2 }, // 右上
        { dx: -1, dy: 0, cost: 1 }, // 左
        { dx: 1, dy: 0, cost: 1 }, // 右
        { dx: -1, dy: 1, cost: Math.SQRT2 }, // 左下
        { dx: 0, dy: 1, cost: 1 }, // 下
        { dx: 1, dy: 1, cost: Math.SQRT2 }, // 右下
    ];

    /**
     * 检查对角线移动是否被阻挡
     */
    const isDiagonalBlocked = (
        x: number,
        y: number,
        dx: number,
        dy: number
    ): boolean => {
        if (dx === 0 || dy === 0) return false; // 不是对角线移动

        // 检查两个相邻的直线方向是否都被阻挡
        const horizontalBlocked =
            x + dx < 0 || x + dx >= width || grid[y][x + dx];
        const verticalBlocked =
            y + dy < 0 || y + dy >= height || grid[y + dy][x];

        return horizontalBlocked || verticalBlocked;
    };

    while (openList.length > 0) {
        let currentNodeIndex = 0;
        let currentNode = openList[currentNodeIndex];
        for (let i = 1; i < openList.length; i++) {
            if (openList[i].f < currentNode.f) {
                currentNodeIndex = i;
                currentNode = openList[currentNodeIndex];
            }
        }
        openList.splice(currentNodeIndex, 1);
        closedList.add(`${currentNode.x},${currentNode.y}`);

        if (currentNode.x === endX && currentNode.y === endY) {
            const path: PathPoint[] = [];
            let current: DijkstraNode | null = currentNode;
            while (current) {
                path.unshift({ x: current.x, y: current.y });
                current = current.parent;
            }
            return {
                path,
                found: true,
                executionTime: performance.now() - startTime,
            };
        }

        for (const direction of directions) {
            const newX = currentNode.x + direction.dx;
            const newY = currentNode.y + direction.dy;
            const newKey = `${newX},${newY}`;
            if (
                newX < 0 ||
                newX >= width ||
                newY < 0 ||
                newY >= height ||
                grid[newY][newX] ||
                closedList.has(newKey)
            ) {
                continue;
            }
            if (
                isDiagonalBlocked(
                    currentNode.x,
                    currentNode.y,
                    direction.dx,
                    direction.dy
                )
            ) {
                continue;
            }
            let neighborNode = nodeMap.get(newKey);
            if (!neighborNode) {
                neighborNode = new DijkstraNode(newX, newY);
                nodeMap.set(newKey, neighborNode);
                openList.push(neighborNode);
            }
            const tentativeG = currentNode.f + direction.cost;
            if (tentativeG < neighborNode.f) {
                neighborNode.parent = currentNode;
                neighborNode.f = tentativeG;
            }
        }
    }
    return {
        path: [],
        found: false,
        executionTime: performance.now() - startTime,
    };
}
