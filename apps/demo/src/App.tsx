import { useState, useCallback, useEffect } from 'react';
import Grid from './components/Grid';
import type { Cell } from './components/Grid';
import { CellType } from './components/Grid';
import ControlPanel from './components/ControlPanel';
import { findPathAStar } from './algorithms/astar';
import { findPathAstar as  findPathAstarWasm} from 'a-star';
import type { AStarResult, AStarResultWasm } from './algorithms/astar';
import './App.css';

// 网格交互模式
enum InteractionMode {
    SET_START = 'start',
    SET_END = 'end',
    SET_OBSTACLE = 'obstacle',
}

/**
 * A*算法性能比较应用
 */
function App() {
    const [width, setWidth] = useState(20);
    const [height, setHeight] = useState(20);
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [startPoint, setStartPoint] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(
        null
    );
    const [interactionMode, setInteractionMode] = useState<InteractionMode>(
        InteractionMode.SET_START
    );
    const [isRunning, setIsRunning] = useState(false);
    const [jsTime, setJsTime] = useState<number | undefined>(undefined);
    const [wasmTime, setWasmTime] = useState<number | undefined>(undefined);

    /**
     * 初始化网格
     */
    const initializeGrid = useCallback(() => {
        const newGrid: Cell[][] = [];
        for (let y = 0; y < height; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < width; x++) {
                row.push({ x, y, type: CellType.EMPTY });
            }
            newGrid.push(row);
        }
        setGrid(newGrid);
        setStartPoint(null);
        setEndPoint(null);
        setInteractionMode(InteractionMode.SET_START);
        setJsTime(undefined);
        setWasmTime(undefined);
    }, [width, height]);

    /**
     * 处理网格单元格点击
     */
    const handleCellClick = useCallback(
        (x: number, y: number) => {
            if (isRunning) return;
            console.log(interactionMode);
            setGrid(prevGrid => {
                const newGrid = prevGrid.map(row => [...row]);
                const cell = newGrid[y][x];

                // 清除路径
                for (let row of newGrid) {
                    for (let cell of row) {
                        if (cell.type === CellType.PATH) {
                            cell.type = CellType.EMPTY;
                        }
                    }
                }

                switch (interactionMode) {
                    case InteractionMode.SET_START:
                        // 清除之前的起点
                        if (startPoint) {
                            newGrid[startPoint.y][startPoint.x].type =
                                CellType.EMPTY;
                        }
                        cell.type = CellType.START;
                        setStartPoint({ x, y });
                        setInteractionMode(InteractionMode.SET_END);
                        break;

                    case InteractionMode.SET_END:
                        // 清除之前的终点
                        if (endPoint) {
                            newGrid[endPoint.y][endPoint.x].type =
                                CellType.EMPTY;
                        }
                        cell.type = CellType.END;
                        setEndPoint({ x, y });
                        setInteractionMode(InteractionMode.SET_OBSTACLE);
                        break;

                    case InteractionMode.SET_OBSTACLE:
                        if (cell.type === CellType.OBSTACLE) {
                            cell.type = CellType.EMPTY;
                        } else if (cell.type === CellType.EMPTY) {
                            cell.type = CellType.OBSTACLE;
                        }
                        console.log(cell);
                        break;
                }

                return newGrid;
            });
        },
        [interactionMode, startPoint, endPoint, isRunning]
    );

    /**
     * 清空网格
     */
    const handleClearGrid = useCallback(() => {
        initializeGrid();
    }, [initializeGrid]);

    /**
     * 将网格转换为算法所需的布尔数组
     */
    const gridToBooleanArray = useCallback((): boolean[][] => {
        // return grid.map(row =>
        //     row.map(cell => cell.type === CellType.OBSTACLE)
        // );
        const width = grid[0].length;
        const height = grid.length;
        const boolGrid: boolean[][] = new Array(height).fill(0).map(() => {
            return new Array(width).fill(false);
        });
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (grid[i][j].type === CellType.OBSTACLE) {
                    boolGrid[i][j] = true;
                }
            }
        }
        return boolGrid;
    }, [grid]);

    /**
     * 在网格上显示路径
     */
    const displayPath = useCallback((path: { x: number; y: number }[]) => {
        setGrid(prevGrid => {
            const newGrid = prevGrid.map(row => [...row]);

            // 清除之前的路径
            for (let row of newGrid) {
                for (let cell of row) {
                    if (cell.type === CellType.PATH) {
                        cell.type = CellType.EMPTY;
                    }
                }
            }

            // 显示新路径（跳过起点和终点）
            for (let i = 1; i < path.length - 1; i++) {
                const point = path[i];
                if (newGrid[point.y] && newGrid[point.y][point.x]) {
                    newGrid[point.y][point.x].type = CellType.PATH;
                }
            }

            return newGrid;
        });
    }, []);

    /**
     * 运行JavaScript A*算法
     */
    const handleRunJSAlgorithm = useCallback(async () => {
        if (!startPoint || !endPoint || isRunning) return;

        setIsRunning(true);

        try {
            const boolGrid = gridToBooleanArray();
            const result: AStarResult = findPathAStar(
                boolGrid,
                startPoint.x,
                startPoint.y,
                endPoint.x,
                endPoint.y
            );

            setJsTime(result.executionTime);

            if (result.found && result.path.length > 0) {
                console.log(result.path)
                displayPath(result.path);
            } else {
                alert('未找到路径！');
            }
        } catch (error) {
            console.error('JavaScript A*算法执行错误:', error);
            alert('算法执行出错！');
        } finally {
            setIsRunning(false);
        }
    }, [startPoint, endPoint, isRunning, gridToBooleanArray, displayPath]);

    /**
     * 运行AssemblyScript A*算法（暂时使用JavaScript实现）
     */
    const handleRunWASMAlgorithm = useCallback(async () => {
        if (!startPoint || !endPoint || isRunning) return;

        setIsRunning(true);

        try {
            // TODO: 这里将来会替换为真正的AssemblyScript实现
            const boolGrid = gridToBooleanArray();
            const result: Array<string> = findPathAstarWasm(
                boolGrid,
                startPoint.x,
                startPoint.y,
                endPoint.x,
                endPoint.y
            );
            // 模拟AssemblyScript的性能优势
            // const simulatedTime = result.executionTime * 0.7;

            const finalRes=result;
            if (finalRes) {
                const time=result.pop() as string;
                setWasmTime(parseFloat(time));
                const finalPath: { x: number; y: number }[] = result.map(item=>{
                    const arr=item.split('-')
                    return {
                        x:parseInt(arr[0]),
                        y:parseInt(arr[1])
                    }
                })
                console.log(finalPath)
                displayPath(finalPath);
            } else {
                alert('未找到路径！');
            }
        } catch (error) {
            console.error('AssemblyScript A*算法执行错误:', error);
            alert('算法执行出错！');
        } finally {
            setIsRunning(false);
        }
    }, [startPoint, endPoint, isRunning, gridToBooleanArray, displayPath]);

    // 初始化网格
    useEffect(() => {
        initializeGrid();
    }, [initializeGrid]);

    return (
        <div className='app'>
            <header className='app-header'>
                <h1>A*算法性能比较</h1>
                <p>JavaScript vs AssemblyScript 寻路算法性能对比</p>
            </header>

            <main className='app-main'>
                <Grid
                    width={width}
                    height={height}
                    grid={grid}
                    onCellClick={handleCellClick}
                />

                <ControlPanel
                    width={width}
                    height={height}
                    onWidthChange={setWidth}
                    onHeightChange={setHeight}
                    onClearGrid={handleClearGrid}
                    onRunJSAlgorithm={handleRunJSAlgorithm}
                    onRunWASMAlgorithm={handleRunWASMAlgorithm}
                    isRunning={isRunning}
                    jsTime={jsTime}
                    wasmTime={wasmTime}
                />
            </main>
        </div>
    );
}

export default App;
