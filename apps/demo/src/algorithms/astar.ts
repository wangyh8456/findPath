// A*算法的节点类
class AStarNode {
    x: number;
    y: number;
    g: number; // 从起点到当前节点的实际距离
    h: number; // 从当前节点到终点的启发式距离
    f: number; // f = g + h
    parent: AStarNode | null;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.parent = null;
    }

    /**
     * 计算启发式距离（曼哈顿距离）
     */
    calculateH(endX: number, endY: number): void {
        this.h = Math.abs(this.x - endX) + Math.abs(this.y - endY);
    }

    /**
     * 更新F值
     */
    updateF(): void {
        this.f = this.g + this.h;
    }
}

// 路径点接口
export interface PathPoint {
    x: number;
    y: number;
}

// A*算法结果接口
export interface AStarResult {
    path: PathPoint[];
    found: boolean;
    executionTime: number;
}

/**
 * JavaScript实现的A*寻路算法
 * @param grid 网格数组，true表示障碍物，false表示可通行
 * @param startX 起点X坐标
 * @param startY 起点Y坐标
 * @param endX 终点X坐标
 * @param endY 终点Y坐标
 * @returns A*算法结果
 */
export function findPathAStar(
    grid: boolean[][],
    startX: number,
    startY: number,
    endX: number,
    endY: number
): AStarResult {
    const startTime = performance.now();
    
    const width = grid[0].length;
    const height = grid.length;
    
    // 验证起点和终点是否有效
    if (startX < 0 || startX >= width || startY < 0 || startY >= height ||
        endX < 0 || endX >= width || endY < 0 || endY >= height ||
        grid[startY][startX] || grid[endY][endX]) {
        return {
            path: [],
            found: false,
            executionTime: performance.now() - startTime
        };
    }
    
    // 如果起点就是终点
    if (startX === endX && startY === endY) {
        return {
            path: [{ x: startX, y: startY }],
            found: true,
            executionTime: performance.now() - startTime
        };
    }
    
    const openList: AStarNode[] = [];
    const closedList: Set<string> = new Set();
    const nodeMap: Map<string, AStarNode> = new Map();
    
    // 创建起始节点
    const startNode = new AStarNode(startX, startY);
    startNode.calculateH(endX, endY);
    startNode.updateF();
    
    openList.push(startNode);
    nodeMap.set(`${startX},${startY}`, startNode);
    
    // 8个方向的移动（包括对角线）
    const directions = [
        { dx: -1, dy: -1, cost: Math.SQRT2 }, // 左上
        { dx: 0, dy: -1, cost: 1 },           // 上
        { dx: 1, dy: -1, cost: Math.SQRT2 },  // 右上
        { dx: -1, dy: 0, cost: 1 },           // 左
        { dx: 1, dy: 0, cost: 1 },            // 右
        { dx: -1, dy: 1, cost: Math.SQRT2 },  // 左下
        { dx: 0, dy: 1, cost: 1 },            // 下
        { dx: 1, dy: 1, cost: Math.SQRT2 }    // 右下
    ];
    
    /**
     * 检查对角线移动是否被阻挡
     */
    const isDiagonalBlocked = (x: number, y: number, dx: number, dy: number): boolean => {
        if (dx === 0 || dy === 0) return false; // 不是对角线移动
        
        // 检查两个相邻的直线方向是否都被阻挡
        const horizontalBlocked = x + dx < 0 || x + dx >= width || grid[y][x + dx];
        const verticalBlocked = y + dy < 0 || y + dy >= height || grid[y + dy][x];
        
        return horizontalBlocked || verticalBlocked;
    };
    
    while (openList.length > 0) {
        // 找到F值最小的节点
        let currentIndex = 0;
        for (let i = 1; i < openList.length; i++) {
            if (openList[i].f < openList[currentIndex].f) {
                currentIndex = i;
            }
        }
        
        const currentNode = openList.splice(currentIndex, 1)[0];
        const currentKey = `${currentNode.x},${currentNode.y}`;
        closedList.add(currentKey);
        
        // 检查是否到达终点
        if (currentNode.x === endX && currentNode.y === endY) {
            const path: PathPoint[] = [];
            let node: AStarNode | null = currentNode;
            
            while (node !== null) {
                path.unshift({ x: node.x, y: node.y });
                node = node.parent;
            }
            
            return {
                path,
                found: true,
                executionTime: performance.now() - startTime
            };
        }
        
        // 检查所有邻居节点
        for (const direction of directions) {
            const newX = currentNode.x + direction.dx;
            const newY = currentNode.y + direction.dy;
            const newKey = `${newX},${newY}`;
            
            // 检查边界和障碍物
            if (newX < 0 || newX >= width || newY < 0 || newY >= height ||
                grid[newY][newX] || closedList.has(newKey)) {
                continue;
            }
            
            // 检查对角线移动是否被阻挡
            if (isDiagonalBlocked(currentNode.x, currentNode.y, direction.dx, direction.dy)) {
                continue;
            }
            
            const tentativeG = currentNode.g + direction.cost;
            
            let neighborNode = nodeMap.get(newKey);
            if (!neighborNode) {
                neighborNode = new AStarNode(newX, newY);
                neighborNode.calculateH(endX, endY);
                nodeMap.set(newKey, neighborNode);
                openList.push(neighborNode);
            }
            
            // 如果找到了更好的路径
            if (tentativeG < neighborNode.g || neighborNode.g === 0) {
                neighborNode.parent = currentNode;
                neighborNode.g = tentativeG;
                neighborNode.updateF();
            }
        }
    }
    
    // 没有找到路径
    return {
        path: [],
        found: false,
        executionTime: performance.now() - startTime
    };
}