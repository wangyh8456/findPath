// The entry file of your WebAssembly module.
import { findPathAstar as func,getAStarResultByPtr } from "./algorithms/astar";
export function add(a: i32, b: i32): i32 {
    return a + b; 
}

//导出a*算法
export function findPathAstar(grid: bool[][],startX: i32,startY: i32,endX: i32,endY: i32): Array<String>|null{
    const result = func(grid,startX,startY,endX,endY);
    const arr=getAStarResultByPtr(changetype<usize>(result));
    return arr;
}
