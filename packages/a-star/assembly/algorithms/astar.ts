class AStarNode {
    x: i32;
    y: i32;
    g: f64;
    h: f64;
    f: f64;
    parent: AStarNode | null;

    constructor(x: i32, y: i32) {
        this.x = x;
        this.y = y;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.parent = null;
    }

    calculateH(endX: i32, endY: i32): void {
        // 欧几里得距离;
        // this.h = <f64>(
        //     Math.sqrt(Math.pow(this.x - endX, 2) + Math.pow(this.y - endY, 2))
        // );
        //曼哈顿距离
        // this.h = <f64>(Math.abs(this.x - endX) + Math.abs(this.y - endY));
        //切比雪夫距离
        this.h = <f64>(
            (Math.abs(this.x - endX) >= Math.abs(this.y - endY)
                ? Math.abs(this.x - endX)
                : Math.abs(this.y - endY))
        );
    }

    updateF(): void {
        this.f = this.g + this.h;
    }
}

class PathPoint {
    x: i32;
    y: i32;

    constructor(x: i32, y: i32) {
        this.x = x;
        this.y = y;
    }
}

// A*算法结果类
export class AStarResult {
    path: PathPoint[];
    found: bool;
    time: f64;

    constructor(path: PathPoint[], found: bool, time: f64) {
        this.path = path;
        this.found = found;
        this.time = time;
    }
}

class Direction {
    dx: i32;
    dy: i32;
    cost: f64;

    constructor(dx: i32, dy: i32, cost: f64) {
        this.dx = dx;
        this.dy = dy;
        this.cost = cost;
    }
}

// 判断斜对角是否被障碍物阻挡
const isDiagonalBlocked = (
    grid: bool[][],
    x: i32,
    y: i32,
    dx: i32,
    dy: i32
): bool => {
    if (dx == 0 || dy == 0) {
        return false;
    }
    const checkX: bool = grid[y][x + dx];
    const checkY: bool = grid[y + dy][x];
    return checkX || checkY;
};

export function getAStarResultByPtr(result: usize): Array<String> | null {
    let found = changetype<AStarResult>(result).found;
    if (found) {
        let path = changetype<AStarResult>(result).path;
        let pathStr: Array<String> = [];
        for (let i = 0; i < path.length; i++) {
            pathStr.push(`${path[i].x}-${path[i].y}`);
        }
        pathStr.push(`${changetype<AStarResult>(result).time}`);
        return pathStr;
    } else {
        return null;
    }
}

// A*算法
export function findPathAstar(
    grid: bool[][],
    startX: i32,
    startY: i32,
    endX: i32,
    endY: i32
): AStarResult {
    //  return;
    const width: i32 = grid[0].length as i32;
    const height: i32 = grid.length as i32;
    let startTime: f64 = performance.now();

    // 检查起点和终点是否有效
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
        return new AStarResult([], false, performance.now() - startTime);
    }

    // 如果起点等于终点
    if (startX == endX && startY == endY) {
        return new AStarResult(
            [new PathPoint(startX, startY)],
            true,
            performance.now() - startTime
        );
    }

    const openList: AStarNode[] = [];
    const nodeMap = new Map<String, AStarNode>();
    const closedList = new Set<String>();

    const startNode: AStarNode = new AStarNode(startX, startY);
    startNode.calculateH(endX, endY);
    startNode.updateF();
    openList.push(startNode);
    nodeMap.set(`${startX},${startY}`, startNode);

    while (openList.length > 0) {
        let currentIndex: i32 = 0;
        let currentNode: AStarNode = openList[0];

        // 找到最小f值的节点
        for (let i: i32 = 1; i < openList.length; i++) {
            if (openList[i].f < currentNode.f) {
                currentIndex = i;
                currentNode = openList[i];
            }
        }

        openList.splice(currentIndex, 1);
        closedList.add(`${currentNode.x},${currentNode.y}`); // 存储节点位置避免重复

        // 到达目标点
        if (currentNode.x === endX && currentNode.y === endY) {
            const path: PathPoint[] = [];
            let node: AStarNode | null = currentNode;

            while (node !== null) {
                path.unshift(new PathPoint(node.x, node.y));
                node = node.parent;
            }

            return new AStarResult(path, true, performance.now() - startTime);
        }

        // 方向数组
        const directions: Direction[] = [
            new Direction(0, 1, 1),
            new Direction(0, -1, 1),
            new Direction(1, 0, 1),
            new Direction(-1, 0, 1),
            new Direction(1, 1, Math.SQRT2),
            new Direction(1, -1, Math.SQRT2),
            new Direction(-1, 1, Math.SQRT2),
            new Direction(-1, -1, Math.SQRT2),
        ];

        // 遍历8个方向
        for (let i: i32 = 0; i < directions.length; i++) {
            const dx: i32 = directions[i].dx;
            const dy: i32 = directions[i].dy;
            const cost: f64 = directions[i].cost;

            const newX: i32 = currentNode.x + dx;
            const newY: i32 = currentNode.y + dy;
            const newKey: String = `${newX},${newY}`;

            // 如果超出边界或是障碍物或在closedList中，则跳过
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

            // 检查斜对角是否被阻挡
            if (isDiagonalBlocked(grid, currentNode.x, currentNode.y, dx, dy)) {
                continue;
            }

            // let neighborNodeIndex: i32 = nodeMap.findIndex(node => node.x === newX && node.y === newY);
            let neighborNode: AStarNode | null = null;
            if (nodeMap.has(newKey)) {
                neighborNode = nodeMap.get(newKey);
            } else {
                neighborNode = new AStarNode(newX, newY);
                neighborNode.calculateH(endX, endY);
                nodeMap.set(newKey, neighborNode);
                openList.push(neighborNode);
            }

            const tentativeG: f64 = currentNode.g + cost;

            if (tentativeG < neighborNode.g || neighborNode.g === 0) {
                neighborNode.g = tentativeG;
                neighborNode.updateF();
                neighborNode.parent = currentNode;
            }
        }
    }

    return new AStarResult([], false, performance.now() - startTime);
}
