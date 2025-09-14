import React, { useEffect, useMemo, useState, useLayoutEffect } from 'react';
import './ControlPanel.css';
import ReactECharts from 'echarts-for-react'; // or var ReactECharts = require('echarts-for-react');

const MAX_SIZE = 100;

// 控制面板属性接口
interface ControlPanelProps {
    width: number;
    height: number;
    allTimes: {
        jsTime?: number;
        bfsTime?: number;
        dijkstraTime?: number;
        wasmTime?: number;
        rustTime?: number;
    }[];
    isAllRuning: boolean;
    obstacleProbability: number;
    onObstacleProbabilityChange: (probability: number) => void;
    onWidthChange: (width: number) => void;
    onHeightChange: (height: number) => void;
    onClearGrid: () => void;
    onRunJSAlgorithm: () => void;
    onRunBFSAlgorithm: () => void;
    onRunWASMAlgorithm: () => void;
    onRunDijkstraAlgorithm: () => void;
    onRunRustAstarAlgorithm: () => void;
    onRunAllAlgorithm: () => void;
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
    obstacleProbability,
    allTimes,
    isAllRuning,
    onObstacleProbabilityChange,
    onWidthChange,
    onHeightChange,
    onClearGrid,
    onRunJSAlgorithm,
    onRunBFSAlgorithm,
    onRunWASMAlgorithm,
    onRunDijkstraAlgorithm,
    onRunRustAstarAlgorithm,
    onRunAllAlgorithm,
    isRunning,
    jsTime,
    wasmTime,
}) => {
    /**
     * 处理宽度输入变化
     */
    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newWidth = Math.max(
            5,
            Math.min(MAX_SIZE, parseInt(e.target.value) || 10)
        );
        onWidthChange(newWidth);
    };

    /**
     * 处理高度输入变化
     */
    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHeight = Math.max(
            5,
            Math.min(MAX_SIZE, parseInt(e.target.value) || 10)
        );
        onHeightChange(newHeight);
    };

    useEffect(() => {
        console.log('isAllRuning', isAllRuning);
        console.log('running', isRunning);
    }, [isAllRuning, isRunning]);

    const [chartData, setChartData] = useState({});

    useLayoutEffect(() => {
        handleChartData();
    }, [allTimes]);

    const handleChartData = () => {
        const temp = {
            title: {
                text: '算法性能对比 - 10次测试结果',
                left: 'center',
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    let result = params[0].axisValueLabel + '<br/>';
                    params.forEach(param => {
                        result +=
                            param.marker +
                            param.seriesName +
                            ': ' +
                            param.value +
                            'ms<br/>';
                    });
                    return result;
                },
            },
            legend: {
                data: [
                    'JavaScript A*',
                    'BFS',
                    'Dijkstra',
                    'AssemblyScript A*',
                    'Rust A*',
                ],
                top: 30,
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
            },
            yAxis: {
                type: 'log',
                logBase: 10,
                name: '执行时间 (ms)',
            },
            xAxis: {
                type: 'category',
                data: allTimes.map((_, index) => `测试${index + 1}`),
            },
            series: [
                {
                    name: 'JavaScript A*',
                    type: 'line',
                    data: [],
                },
                {
                    name: 'BFS',
                    type: 'line',
                    data: [],
                },
                {
                    name: 'Dijkstra',
                    type: 'line',
                    data: [],
                },
                {
                    name: 'AssemblyScript A*',
                    type: 'line',
                    data: [],
                },
                {
                    name: 'Rust A*',
                    type: 'line',
                    data: [],
                },
            ],
        };
        allTimes.forEach(times => {
            temp.series[0].data.push(times.jsTime);
            temp.series[1].data.push(times.bfsTime);
            temp.series[2].data.push(times.dijkstraTime);
            temp.series[3].data.push(times.wasmTime);
            temp.series[4].data.push(times.rustTime);
        });
        setChartData(temp);
        return temp;
    };

    /**
     * 格式化时间显示
     */
    const formatTime = (time?: number): string => {
        if (time === undefined) return '-';
        return `${time.toFixed(3)}ms`;
    };

    return (
        <div className='control-panel'>
            <div className='control-section'>
                <h3>网格设置</h3>
                <div className='input-group'>
                    <label>
                        宽度 (5-{MAX_SIZE}):
                        <input
                            type='number'
                            min='5'
                            max={MAX_SIZE}
                            value={width}
                            onChange={handleWidthChange}
                            disabled={isRunning}
                        />
                    </label>
                    <label>
                        高度 (5-{MAX_SIZE}):
                        <input
                            type='number'
                            min='5'
                            max={MAX_SIZE}
                            value={height}
                            onChange={handleHeightChange}
                            disabled={isRunning}
                        />
                    </label>
                </div>
                <button
                    className='clear-button'
                    onClick={onClearGrid}
                    disabled={isRunning}
                >
                    清空网格
                </button>
            </div>
            <div className='control-section'>
                <h3>初始障碍物密度</h3>
                <div className='input-group'>
                    <label>
                        障碍物密度 (0-1):
                        <input
                            type='number'
                            min='0'
                            max='1'
                            step='0.01'
                            value={obstacleProbability}
                            onChange={e =>
                                onObstacleProbabilityChange(
                                    parseFloat(e.target.value)
                                )
                            }
                            disabled={isRunning}
                        />
                    </label>
                </div>
            </div>

            <div className='control-section'>
                <h3>算法比较</h3>
                <div className='algorithm-buttons'>
                    <button
                        className='algorithm-button js-button'
                        onClick={() => onRunJSAlgorithm()}
                        disabled={isRunning}
                    >
                        {isRunning || isAllRuning
                            ? '运行中...'
                            : 'JavaScript A*'}
                    </button>
                    <button
                        className='algorithm-button bfs-button'
                        onClick={() => onRunBFSAlgorithm()}
                        disabled={isRunning}
                    >
                        {isRunning || isAllRuning ? '运行中...' : 'BFS'}
                    </button>
                    <button
                        className='algorithm-button dijkstra-button'
                        onClick={() => onRunDijkstraAlgorithm()}
                        disabled={isRunning}
                    >
                        {isRunning || isAllRuning ? '运行中...' : 'Dijkstra'}
                    </button>
                    <button
                        className='algorithm-button wasm-button'
                        onClick={() => onRunWASMAlgorithm()}
                        disabled={isRunning}
                    >
                        {isRunning || isAllRuning
                            ? '运行中...'
                            : 'AssemblyScript A*'}
                    </button>
                    <button
                        className='algorithm-button rust-button'
                        onClick={() => onRunRustAstarAlgorithm()}
                        disabled={isRunning}
                    >
                        {isRunning || isAllRuning ? '运行中...' : 'Rust A*'}
                    </button>
                </div>
            </div>

            <div className='control-section'>
                <h3>性能结果</h3>
                <div className='performance-results'>
                    <div className='result-item'>
                        <span className='result-label'>JavaScript:</span>
                        <span className='result-value js-time'>
                            {formatTime(jsTime)}
                        </span>
                    </div>
                    <div className='result-item'>
                        <span className='result-label'>AssemblyScript:</span>
                        <span className='result-value wasm-time'>
                            {formatTime(wasmTime)}
                        </span>
                    </div>
                    {jsTime !== undefined && wasmTime !== undefined && (
                        <div className='result-item comparison'>
                            <span className='result-label'>性能提升:</span>
                            <span className='result-value'>
                                {((jsTime / wasmTime - 1) * 100).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className='control-section'>
                <h3>性能对比</h3>
                <div className='algorithm-buttons'>
                    <button
                        className='algorithm-button rust-button'
                        onClick={onRunAllAlgorithm}
                        disabled={isAllRuning}
                    >
                        {isAllRuning || isRunning ? '运行中...' : '综合测试'}
                    </button>
                </div>
                {allTimes.length > 0 ? (
                    <ReactECharts option={chartData} />
                ) : null}
            </div>

            <div className='instructions'>
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
