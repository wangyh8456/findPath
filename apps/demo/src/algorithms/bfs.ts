class Node {
    x: number;
    y: number;
    parent: Node | null;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.parent = null;
    }
}

// 路径点接口
export interface PathPoint {
    x: number;
    y: number;
}

export interface BFSResult {
    path: PathPoint[];
    found: boolean;
    executionTime: number;
    timeout?: boolean;
}

/**
 * JavaScript实现的BFS寻路算法
 * @param grid 网格数组，true表示障碍物，false表示可通行
 * @param startX 起点X坐标
 * @param startY 起点Y坐标
 * @param endX 终点X坐标
 * @param endY 终点Y坐标
 * @returns BFS算法结果
 */
export function findPathBFS(
    grid: boolean[][],
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    timeout: number = 0
): BFSResult {
    const startTime = performance.now();

    const width = grid[0].length;
    const height = grid.length;

    // 验证起点和终点是否有效
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

    // 如果起点就是终点
    if (startX === endX && startY === endY) {
        return {
            path: [{ x: startX, y: startY }],
            found: true,
            executionTime: performance.now() - startTime,
        };
    }

    const openList = [new Node(startX, startY)];
    const closedList = new Set<string>();
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);
    //定义移动方向
    const directions = [
        { dx: -1, dy: -1 },
        { dx: 0, dy: -1 },
        { dx: 1, dy: -1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: -1, dy: 1 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 1 },
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
    /**
     * 检查节点是否有效（未访问过且不是障碍物）
     */
    const isNodeValid = (x: number, y: number): boolean => {
        return (
            x >= 0 &&
            x < width &&
            y >= 0 &&
            y < height &&
            !grid[y][x] &&
            !visited.has(`${x},${y}`)
        );
    };
    /**
     * 检查节点是否为终点
     */
    const isEndNode = (x: number, y: number): boolean => {
        return x === endX && y === endY;
    };
    /**
     * 构建路径
     */
    const buildPath = (node: Node): PathPoint[] => {
        const path: PathPoint[] = [];
        let current: Node | null = node;
        while (current !== null) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }
        return path;
    };

    while (openList.length > 0) {
        // 检查是否超时（3000ms）
        const currentTime = performance.now();
        if (timeout && currentTime - startTime > timeout) {
            return {
                path: [],
                found: false,
                executionTime: currentTime - startTime,
                timeout: true,
            };
        }

        const currentNode = openList.shift()!;
        const currentKey = `${currentNode.x},${currentNode.y}`;
        closedList.add(currentKey);
        // 检查是否到达终点
        if (isEndNode(currentNode.x, currentNode.y)) {
            return {
                path: buildPath(currentNode),
                found: true,
                executionTime: performance.now() - startTime,
            };
        }

        // 遍历所有方向
        for (const dir of directions) {
            const newX = currentNode.x + dir.dx;
            const newY = currentNode.y + dir.dy;
            if (
                isNodeValid(newX, newY) &&
                !isDiagonalBlocked(currentNode.x, currentNode.y, dir.dx, dir.dy)
            ) {
                const newNode = new Node(newX, newY);
                newNode.parent = currentNode;
                openList.push(newNode);
                visited.add(`${newX},${newY}`); // 标记为已访问，防止重复添加
            }
        }
    }
    return {
        path: [],
        found: false,
        executionTime: performance.now() - startTime,
    };
}
