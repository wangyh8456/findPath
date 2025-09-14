//导入wasm-bindgen库，用于Rust与JavaScript之间的互操作
use wasm_bindgen::prelude::*;
//导入serde序列化库，用于数据结构的序列化和反序列化
use serde::{Deserialize, Serialize};
//导入标准库的二叉堆和哈希映射数据结构
use std::collections::{HashSet, HashMap};
//导入web_sys库，用于在浏览器控制台输出调试信息
use web_sys::console;

// A* 节点
#[derive(Debug, Clone)]
struct AStarNode {
    x: i32,
    y: i32,
    g: f64,
    h: f64,
    f: f64,
    //必须使用Box,不然会出现循环错误
    parent: Option<Box<AStarNode>>,
}

// 为 AStarNode 实现方法
impl AStarNode {
    /// 创建新的 AStarNode
    /// 
    /// # 参数
    /// * `x` - 节点的 x 坐标
    /// * `y` - 节点的 y 坐标
    /// * `g` - 从起点到当前节点的实际距离
    /// * `parent` - 父节点的引用
    pub fn new(x: i32, y: i32) -> Self {
        AStarNode {
            x,
            y,
            g: 0.0,
            h: 0.0,
            f: f64::MAX,
            parent: None,
        }
    }

    /// 计算启发式距离 (h 值)
    /// 
    /// # 参数
    /// * `end_x` - 目标点的 x 坐标
    /// * `end_y` - 目标点的 y 坐标
    pub fn calculate_h(&mut self, end_x: i32, end_y: i32) {
        self.h = calculate_heuristic(self.x, self.y, end_x, end_y);
    }

    /// 更新 f 值 (f = g + h)
    /// f 值表示从起点经过当前节点到终点的估算总距离
    pub fn update_f(&mut self) {
        self.f = self.g + self.h;
    }

    /// 检查是否为目标节点
    /// 
    /// # 参数
    /// * `end_x` - 目标点的 x 坐标
    /// * `end_y` - 目标点的 y 坐标
    /// 
    /// # 返回值
    /// 如果当前节点是目标节点则返回 true
    pub fn is_goal(&self, end_x: i32, end_y: i32) -> bool {
        self.x == end_x && self.y == end_y
    }
}

// 路径点（用于返回结果）
#[derive(Serialize, Deserialize)]
pub struct PathPoint {
    pub x: i32,
    pub y: i32,
}

// A* 算法结果
#[derive(Serialize, Deserialize)]
pub struct AStarResult {
    pub path: Vec<PathPoint>,
    pub found: bool,
    pub executionTime: f64,
}


/**
 * 计算切比雪夫距离启发式函数
 * @param pos1 起始位置
 * @param pos2 目标位置
 * @return 距离
 */
fn calculate_heuristic(x: i32, y: i32, end_x: i32, end_y: i32) -> f64 {
    let dx = (x - end_x).abs() as f64;
    let dy = (y - end_y).abs() as f64;
    dx.max(dy)
}

/**
 * 获取相邻节点的移动方向和代价
 * @return 8个方向的移动向量和对应代价
 */
fn get_directions() -> Vec<(i32, i32, f64)> {
    vec![
        (0, 1, 1.0),   // 上
        (1, 0, 1.0),   // 右
        (0, -1, 1.0),  // 下
        (-1, 0, 1.0),  // 左
        (1, 1, 2.0_f64.sqrt()), // 右上
        (1, -1, 2.0_f64.sqrt()), // 右下
        (-1, 1, 2.0_f64.sqrt()), // 左上
        (-1, -1, 2.0_f64.sqrt()), // 左下
    ]
}

/**
 * 检查对角线移动是否被阻挡
 * @param grid 网格地图
 * @param x 当前x坐标
 * @param y 当前y坐标
 * @param dx x方向移动
 * @param dy y方向移动
 * @return 是否被阻挡
 */
fn is_diagonal_blocked(grid: &Vec<Vec<bool>>, x: i32, y: i32, dx: i32, dy: i32) -> bool {
    if dx != 0 && dy != 0 {

        if grid[(y+dy) as usize][x as usize] {
            return true;
        }
        
     
        if grid[y as usize][(x+dx) as usize] {
            return true;
        }
    }
    false
}

/**
 * 重建路径
 * @param came_from 父节点映射
 * @param current 当前节点位置
 * @return 路径点列表
 */
/**
 * 重建路径函数
 * 从目标节点开始，通过父节点链向上追溯到起始节点
 * @param current 目标节点
 * @return 从起点到终点的路径点集合
 */
fn reconstruct_path(mut current: AStarNode) -> Vec<PathPoint> {
    
    let mut path = vec![PathPoint { x: current.x, y: current.y }];
    
    while let Some(parent) = current.parent {
        current = *parent;
        path.push(PathPoint { x: current.x, y: current.y });
    }
    
    path.reverse();
    path
}

/**
 * A* 寻路算法主函数
 * @param grid 二维布尔网格，true表示可通行，false表示障碍物
 * @param start_x 起点x坐标
 * @param start_y 起点y坐标
 * @param end_x 终点x坐标
 * @param end_y 终点y坐标
 * @return A*算法结果，包含路径、是否找到和执行时间
 */
#[wasm_bindgen]
pub fn find_path_astar(
    grid: &JsValue,
    start_x: i32,
    start_y: i32,
    end_x: i32,
    end_y: i32,
) -> JsValue {
    let start_time = js_sys::Date::now();
    
    // 解析网格数据
    let grid: Vec<Vec<bool>> = serde_wasm_bindgen::from_value(grid.clone()).unwrap();
    
    let height = grid.len() as i32;
    let width = grid[0].len() as i32;
    
    // 边界检查
    if start_x < 0 || start_x >= width || start_y < 0 || start_y >= height ||
       end_x < 0 || end_x >= width || end_y < 0 || end_y >= height|| grid[start_y as usize][start_x as usize] || grid[end_y as usize][end_x as usize] {
        let result = AStarResult {
            path: vec![],
            found: false,
            executionTime: js_sys::Date::now() - start_time,
        };
        return serde_wasm_bindgen::to_value(&result).unwrap();
    }
    
    // 检查是否起点和终点重合
    if start_x == end_x && start_y == end_y {
        let result = AStarResult {
            path: vec![PathPoint { x: start_x, y: start_y }],
            found: true,
            executionTime: js_sys::Date::now() - start_time,
        };
        return serde_wasm_bindgen::to_value(&result).unwrap();
    }
    
    let mut openList=vec![];
    let mut closedList=HashSet::<String>::new();
    let mut nodeMap=HashMap::<String,AStarNode>::new();
    let directions=get_directions();

    let mut startNode=AStarNode::new(start_x,start_y);
    startNode.calculate_h(end_x, end_y);
    startNode.update_f();
    nodeMap.insert(format!("{}:{}",start_x,start_y),startNode.clone());
    openList.push(startNode);

    while openList.len()>0 {
        let mut currentIndex=0;
        let mut currentNode=openList[0].clone();
        //iter()迭代器，遍历元素，enumerate()方法返回元素的索引和值
        for(i,node) in openList.iter().enumerate(){
            if node.f<currentNode.f{
                currentIndex=i;
                currentNode=node.clone();
            }
        }

        openList.remove(currentIndex);
        closedList.insert(format!("{}:{}",currentNode.x,currentNode.y));
        if currentNode.is_goal(end_x, end_y){
            let path=reconstruct_path(currentNode);
            let result = AStarResult {
                path,
                found: true,
                executionTime: js_sys::Date::now() - start_time,
            };
            return serde_wasm_bindgen::to_value(&result).unwrap();
        }

        for(dir_x,dir_y,cost) in directions.iter(){
            let newX=currentNode.x+dir_x;
            let newY=currentNode.y+dir_y;
            let newKey=format!("{}:{}",newX,newY);
            if newX<0 || newX>=width || newY<0 || newY>=height || grid[newY as usize][newX as usize] || closedList.contains(&newKey) {
                continue;
            }
            if is_diagonal_blocked(&grid,currentNode.x,currentNode.y,*dir_x,*dir_y){
                continue;
            }

            let tentativeG=currentNode.g+cost;
            let mut neighborNode:AStarNode;
            if let Some(existNode)=nodeMap.get_mut(&newKey) {
                if tentativeG<existNode.g {
                    existNode.g=tentativeG;
                    existNode.parent=Some(Box::new(currentNode.clone()));
                    existNode.update_f();
                    let existNodeIndex=openList.iter().position(|node| node.x == existNode.x && node.y == existNode.y).unwrap();
                    openList.remove(existNodeIndex);
                    openList.push(existNode.clone());
                }
            }else{
                neighborNode=AStarNode::new(newX,newY);
                neighborNode.calculate_h(end_x, end_y);
                neighborNode.g=tentativeG;
                neighborNode.parent=Some(Box::new(currentNode.clone()));
                neighborNode.update_f();
                nodeMap.insert(newKey,neighborNode.clone());
                openList.push(neighborNode.clone());
            }
        }
    }
    
    // 未找到路径
    let result = AStarResult {
        path: vec![],
        found: false,
        executionTime: js_sys::Date::now() - start_time,
    };
    serde_wasm_bindgen::to_value(&result).unwrap()
}
