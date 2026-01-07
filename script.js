// 检查 Tesseract.js 是否加载
function checkTesseractLoaded() {
    if (typeof Tesseract === 'undefined') {
        throw new Error('Tesseract.js 库未加载，请检查网络连接或刷新页面重试');
    }
    return true;
}

// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const controlSection = document.getElementById('controlSection');
const recognizeBtn = document.getElementById('recognizeBtn');
const clearBtn = document.getElementById('clearBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultSection = document.getElementById('resultSection');
const resultText = document.getElementById('resultText');
const copyBtn = document.getElementById('copyBtn');

let currentFile = null;
let currentImageUrl = null;
let worker = null;
let isInitializing = false;

// 初始化Tesseract worker
async function initWorker() {
    // 检查 Tesseract 是否加载
    checkTesseractLoaded();
    
    if (!worker && !isInitializing) {
        isInitializing = true;
        try {
            progressText.textContent = '正在加载 OCR 引擎...';
            console.log('开始创建 Tesseract Worker...');
            
            // 检查 Tesseract.createWorker 是否存在
            if (typeof Tesseract.createWorker !== 'function') {
                throw new Error('Tesseract.createWorker 方法不可用，请检查 Tesseract.js 版本');
            }
            
            worker = await Tesseract.createWorker('chi_sim+eng', 1, {
                logger: m => {
                    console.log('Tesseract 日志:', m);
                    if (m.status === 'loading tesseract core') {
                        progressText.textContent = '加载核心引擎...';
                        progressFill.style.width = '20%';
                    } else if (m.status === 'initializing tesseract') {
                        progressText.textContent = '初始化 Tesseract...';
                        progressFill.style.width = '40%';
                    } else if (m.status === 'loading language traineddata') {
                        progressText.textContent = '加载语言模型（首次使用需要下载，请耐心等待）...';
                        progressFill.style.width = '60%';
                    } else if (m.status === 'initializing api') {
                        progressText.textContent = '初始化 API...';
                        progressFill.style.width = '80%';
                    } else if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        progressFill.style.width = progress + '%';
                        progressText.textContent = `识别中... ${progress}%`;
                    }
                }
            });
            
            console.log('Worker 创建成功:', worker);
            
            // 设置 OCR 参数以提高识别率
            if (worker && typeof worker.setParameters === 'function') {
                await worker.setParameters({
                    tessedit_pageseg_mode: '1', // 自动页面分割
                    tessedit_char_whitelist: '', // 允许所有字符
                });
            }
            
            progressText.textContent = 'OCR 引擎就绪';
            progressFill.style.width = '100%';
            isInitializing = false;
        } catch (error) {
            isInitializing = false;
            console.error('初始化 Worker 失败详情:', error);
            console.error('错误堆栈:', error.stack);
            console.error('Tesseract 对象:', typeof Tesseract, Tesseract);
            
            let errorMessage = 'OCR 引擎初始化失败';
            if (error.message) {
                errorMessage += ': ' + error.message;
            } else if (error.toString) {
                errorMessage += ': ' + error.toString();
            }
            
            if (error.stack) {
                console.error('完整错误堆栈:', error.stack);
            }
            
            throw new Error(errorMessage);
        }
    } else if (isInitializing) {
        // 如果正在初始化，等待完成
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    if (!worker) {
        throw new Error('Worker 创建失败，请刷新页面重试');
    }
    
    return worker;
}

// 点击上传区域
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 文件选择
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

// 拖拽上传
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

// 处理文件
function handleFile(file) {
    currentFile = file;
    const reader = new FileReader();
    
    reader.onload = (e) => {
        currentImageUrl = e.target.result;
        previewImage.src = currentImageUrl;
        previewSection.style.display = 'block';
        controlSection.style.display = 'flex';
        resultSection.style.display = 'none';
        progressSection.style.display = 'none';
    };
    
    reader.readAsDataURL(file);
}

// 识别文字
recognizeBtn.addEventListener('click', async () => {
    if (!currentFile || !currentImageUrl) {
        alert('请先上传图片');
        return;
    }
    
    // 禁用按钮
    recognizeBtn.disabled = true;
    recognizeBtn.querySelector('.btn-text').style.display = 'none';
    recognizeBtn.querySelector('.btn-loading').style.display = 'inline';
    
    // 显示进度条
    progressSection.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = '准备中...';
    resultSection.style.display = 'none';
    
    try {
        // 初始化worker
        progressFill.style.width = '10%';
        await initWorker();
        
        // 执行OCR识别 - 使用图片 URL 而不是文件对象
        progressFill.style.width = '20%';
        progressText.textContent = '正在识别图片中的文字...';
        
        console.log('开始识别，图片 URL:', currentImageUrl.substring(0, 50) + '...');
        
        const result = await worker.recognize(currentImageUrl);
        
        console.log('识别结果:', result);
        
        // 显示结果
        const recognizedText = result.data.text.trim();
        resultText.value = recognizedText || '未识别到文字内容\n\n提示：\n- 请确保图片清晰，文字对比度高\n- 尝试使用更高分辨率的图片\n- 确保图片中的文字方向正确';
        resultSection.style.display = 'block';
        progressFill.style.width = '100%';
        progressText.textContent = recognizedText ? '识别完成！' : '识别完成，但未检测到文字';
        
        // 显示识别置信度信息
        if (result.data.words && result.data.words.length > 0) {
            const avgConfidence = result.data.words.reduce((sum, word) => sum + (word.confidence || 0), 0) / result.data.words.length;
            console.log('平均置信度:', avgConfidence);
            if (avgConfidence < 30) {
                resultText.value += `\n\n⚠️ 识别置信度较低 (${Math.round(avgConfidence)}%)，结果可能不准确`;
            }
        }
        
    } catch (error) {
        console.error('识别错误详情:', error);
        console.error('错误类型:', typeof error);
        console.error('错误对象:', error);
        
        progressText.textContent = '识别失败';
        
        let errorMsg = '识别过程中出现错误：\n\n';
        if (error && error.message) {
            errorMsg += error.message;
        } else if (error && error.toString) {
            errorMsg += error.toString();
        } else {
            errorMsg += String(error);
        }
        
        errorMsg += '\n\n请检查：\n';
        errorMsg += '1. 图片格式是否支持（JPG、PNG、GIF）\n';
        errorMsg += '2. 网络连接是否正常（首次使用需要下载模型）\n';
        errorMsg += '3. 浏览器控制台（F12）是否有更多错误信息\n';
        errorMsg += '4. 尝试刷新页面后重试\n';
        errorMsg += '5. 如果问题持续，可能是 CDN 访问问题，请稍后重试';
        
        resultText.value = errorMsg;
        resultSection.style.display = 'block';
        progressFill.style.width = '0%';
    } finally {
        // 恢复按钮
        recognizeBtn.disabled = false;
        recognizeBtn.querySelector('.btn-text').style.display = 'inline';
        recognizeBtn.querySelector('.btn-loading').style.display = 'none';
    }
});

// 清除
clearBtn.addEventListener('click', () => {
    currentFile = null;
    currentImageUrl = null;
    fileInput.value = '';
    previewSection.style.display = 'none';
    controlSection.style.display = 'none';
    resultSection.style.display = 'none';
    progressSection.style.display = 'none';
    previewImage.src = '';
    resultText.value = '';
    
    // 可选：终止 worker 以释放资源
    // if (worker) {
    //     worker.terminate();
    //     worker = null;
    // }
});

// 复制文字
copyBtn.addEventListener('click', () => {
    resultText.select();
    document.execCommand('copy');
    
    // 临时改变按钮文字
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ 已复制！';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
});

// 页面卸载时终止worker
window.addEventListener('beforeunload', () => {
    if (worker) {
        worker.terminate();
    }
});

