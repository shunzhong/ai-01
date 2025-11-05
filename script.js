// 游戏常量
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 5;
const MAX_SPEED = 50;

// DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const currentScoreElement = document.getElementById('current-score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('finalScore');

// 游戏状态
let snake = [];
let food = {};
let direction = '';
let nextDirection = '';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval = null;
let gameSpeed = INITIAL_SPEED;
let isGameOver = false;

// 更新最高分显示
highScoreElement.textContent = highScore;

// 设置canvas大小
function setupCanvas() {
    const containerWidth = canvas.parentElement.clientWidth;
    const containerHeight = canvas.parentElement.clientHeight;
    const size = Math.min(containerWidth - 40, containerHeight - 40);
    
    canvas.width = size - (size % GRID_SIZE);
    canvas.height = size - (size % GRID_SIZE);
}

// 初始化游戏
function initGame() {
    // 重置游戏状态
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = INITIAL_SPEED;
    isGameOver = false;
    
    // 更新分数显示
    currentScoreElement.textContent = score;
    
    // 生成食物
    generateFood();
    
    // 隐藏游戏结束屏幕
    gameOverScreen.classList.add('hidden');
    
    // 开始游戏循环
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// 生成食物
function generateFood() {
    const canvasWidth = canvas.width / GRID_SIZE;
    const canvasHeight = canvas.height / GRID_SIZE;
    
    let newFood;
    let onSnake;
    
    // 确保食物不会生成在蛇身上
    do {
        onSnake = false;
        newFood = {
            x: Math.floor(Math.random() * canvasWidth),
            y: Math.floor(Math.random() * canvasHeight)
        };
        
        // 检查是否与蛇身重叠
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                onSnake = true;
                break;
            }
        }
    } while (onSnake);
    
    food = newFood;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cellWidth = canvas.width / GRID_SIZE;
    const cellHeight = canvas.height / GRID_SIZE;
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#4CAF50';
        } else {
            // 蛇身渐变颜色
            const colorIntensity = Math.max(0.3, 1 - (index / snake.length) * 0.5);
            ctx.fillStyle = `rgba(76, 175, 80, ${colorIntensity})`;
        }
        
        ctx.fillRect(
            segment.x * cellWidth,
            segment.y * cellHeight,
            cellWidth - 1,
            cellHeight - 1
        );
        
        // 添加边框
        ctx.strokeStyle = '#388E3C';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            segment.x * cellWidth,
            segment.y * cellHeight,
            cellWidth - 1,
            cellHeight - 1
        );
    });
    
    // 绘制食物
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(
        food.x * cellWidth + cellWidth / 2,
        food.y * cellHeight + cellHeight / 2,
        cellWidth / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 食物边框
    ctx.strokeStyle = '#E64A19';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// 移动蛇
function moveSnake() {
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头位置
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 将新的头部添加到蛇的前面
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        currentScoreElement.textContent = score;
        
        // 生成新的食物
        generateFood();
        
        // 增加游戏难度（加快速度）
        if (gameSpeed > MAX_SPEED) {
            gameSpeed -= SPEED_INCREASE;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    const canvasWidth = canvas.width / GRID_SIZE;
    const canvasHeight = canvas.height / GRID_SIZE;
    
    // 检查是否撞墙
    if (
        head.x < 0 ||
        head.x >= canvasWidth ||
        head.y < 0 ||
        head.y >= canvasHeight
    ) {
        return true;
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 游戏循环
function gameLoop() {
    moveSnake();
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    drawGame();
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    // 显示游戏结束屏幕
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// 处理键盘输入
function handleKeyPress(e) {
    // 如果游戏未开始，忽略输入
    if (startScreen.classList.contains('hidden') === false) {
        return;
    }
    
    const key = e.key;
    
    // 阻止默认行为（如页面滚动）
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(key)) {
        e.preventDefault();
    }
    
    // 根据按键更新下一个方向
    switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            break;
        case ' ': // 空格键暂停/继续游戏
            if (!isGameOver) {
                if (gameInterval) {
                    clearInterval(gameInterval);
                    gameInterval = null;
                } else {
                    gameInterval = setInterval(gameLoop, gameSpeed);
                }
            }
            break;
    }
}

// 事件监听器
startButton.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    initGame();
});

restartButton.addEventListener('click', () => {
    initGame();
});

window.addEventListener('keydown', handleKeyPress);

// 响应窗口大小变化
window.addEventListener('resize', () => {
    setupCanvas();
    if (!startScreen.classList.contains('hidden') && !isGameOver) {
        drawGame();
    }
});

// 初始化画布
setupCanvas();