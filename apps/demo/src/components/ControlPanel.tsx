import React from 'react';
import './ControlPanel.css';

// 控制面板属性接口
interface ControlPanelProps {
    width: number;
    height: number;
    onWidthChange: (width: number) => void;
    onHeightChange: (height: number) => void;
    onClearGrid: () => void;
    onRunJSAlgorithm: () => void;
    onRunWASMAlgorithm: () => void;
    isRunning: boolean;
    jsTime?: number;
    wasmTime?: number;
}

/**
 * 控制面板组件
 * 提供网格尺寸设置、算法调用和性能显示功能
 */
const ControlPanel: React.FC<ControlPanelProps> = ({
    width,
    height,
    onWidthChange,
    onHeightChange,
    onClearGrid,
    onRunJSAlgorithm,
    onRunWASMAlgorithm,
    isRunning,
    jsTime,
    wasmTime
}) => {
    /**
     * 处理宽度输入变化
     */
    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newWidth = Math.max(5, Math.min(50, parseInt(e.target.value) || 10));
        onWidthChange(newWidth);
    };

    /**
     * 处理高度输入变化
     */
    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHeight = Math.max(5, Math.min(50, parseInt(e.target.value) || 10));
        onHeightChange(newHeight);
    };

    /**
     * 格式化时间显示
     */
    const formatTime = (time?: number): string => {
        if (time === undefined) return '-';
        return `${time.toFixed(3)}ms`;
    };

    return (
        <div className="control-panel">
            <div className="control-section">
                <h3>网格设置</h3>
                <div className="input-group">
                    <label>
                        宽度 (5-50):
                        <input
                            type="number"
                            min="5"
                            max="50"
                            value={width}
                            onChange={handleWidthChange}
                            disabled={isRunning}
                        />
                    </label>
                    <label>
                        高度 (5-50):
                        <input
                            type="number"
                            min="5"
                            max="50"
                            value={height}
                            onChange={handleHeightChange}
                            disabled={isRunning}
                        />
                    </label>
                </div>
                <button 
                    className="clear-button"
                    onClick={onClearGrid}
                    disabled={isRunning}
                >
                    清空网格
                </button>
            </div>

            <div className="control-section">
                <h3>算法比较</h3>
                <div className="algorithm-buttons">
                    <button
                        className="algorithm-button js-button"
                        onClick={onRunJSAlgorithm}
                        disabled={isRunning}
                    >
                        {isRunning ? '运行中...' : 'JavaScript A*'}
                    </button>
                    <button
                        className="algorithm-button wasm-button"
                        onClick={onRunWASMAlgorithm}
                        disabled={isRunning}
                    >
                        {isRunning ? '运行中...' : 'AssemblyScript A*'}
                    </button>
                </div>
            </div>

            <div className="control-section">
                <h3>性能结果</h3>
                <div className="performance-results">
                    <div className="result-item">
                        <span className="result-label">JavaScript:</span>
                        <span className="result-value js-time">{formatTime(jsTime)}</span>
                    </div>
                    <div className="result-item">
                        <span className="result-label">AssemblyScript:</span>
                        <span className="result-value wasm-time">{formatTime(wasmTime)}</span>
                    </div>
                    {jsTime !== undefined && wasmTime !== undefined && (
                        <div className="result-item comparison">
                            <span className="result-label">性能提升:</span>
                            <span className="result-value">
                                {((jsTime / wasmTime - 1) * 100).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="instructions">
                <h4>使用说明:</h4>
                <ul>
                    <li>点击网格设置起点（绿色）</li>
                    <li>再次点击设置终点（红色）</li>
                    <li>继续点击添加障碍物（黑色）</li>
                    <li>点击算法按钮开始寻路</li>
                    <li>路径将以蓝色显示</li>
                </ul>
            </div>
        </div>
    );
};

export default ControlPanel;