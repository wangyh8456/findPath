import React from 'react';
import './Grid.css';

// 网格单元格类型
export enum CellType {
    EMPTY = 'empty',
    START = 'start',
    END = 'end',
    OBSTACLE = 'obstacle',
    PATH = 'path',
}

// 网格单元格接口
export interface Cell {
    x: number;
    y: number;
    type: CellType;
}

// 网格组件属性
interface GridProps {
    width: number;
    height: number;
    grid: Cell[][];
    onCellClick: (x: number, y: number) => void;
}

/**
 * 网格可视化组件
 * 支持显示网格并处理用户点击交互
 */
const Grid: React.FC<GridProps> = ({ width, height, grid, onCellClick }) => {
    /**
     * 获取单元格的CSS类名
     */
    const getCellClassName = (cell: Cell): string => {
        const baseClass = 'grid-cell';
        return `${baseClass} ${baseClass}--${cell.type}`;
    };

    /**
     * 处理单元格点击事件
     */
    const handleCellClick = (x: number, y: number) => {
        onCellClick(x, y);
    };

    return (
        <div className='grid-container'>
            <div
                className='grid'
                style={{
                    gridTemplateColumns: `repeat(${width}, 1fr)`,
                    gridTemplateRows: `repeat(${height}, 1fr)`,
                }}
            >
                {grid.map((row, y) =>
                    row.map((cell, x) => (
                        <div
                            key={`${x}-${y}`}
                            className={getCellClassName(cell)}
                            onClick={() => handleCellClick(x, y)}
                            title={`(${x}, ${y}) - ${cell.type}`}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Grid;
