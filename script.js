document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const previewSection = document.getElementById('preview-section');
    const previewImage = document.getElementById('preview-image');
    const recognizeBtn = document.getElementById('recognize-btn');
    const resultText = document.getElementById('result-text');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const clearBtn = document.getElementById('clear-btn');
    const changeImageBtn = document.getElementById('change-image-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingProgress = document.getElementById('loading-progress');
    const btnText = recognizeBtn.querySelector('.btn-text');
    const btnLoader = recognizeBtn.querySelector('.btn-loader');

    let currentFile = null;
    let worker = null;

    // 初始化 Tesseract worker
    async function initWorker() {
        if (!worker) {
            worker = await Tesseract.createWorker('chi_sim+eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        loadingProgress.textContent = `识别进度: ${progress}%`;
                    }
                }
            });
        }
        return worker;
    }

    // 点击上传区域
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择
    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
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
        } else {
            alert('请上传图片文件！');
        }
    });

    // 处理文件
    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('请选择有效的图片文件！');
            return;
        }

        currentFile = file;
        const reader = new FileReader();
        
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadArea.style.display = 'none';
            previewSection.style.display = 'block';
            resultText.value = '';
        };

        reader.readAsDataURL(file);
    }

    // 更换图片
    changeImageBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // 开始识别
    recognizeBtn.addEventListener('click', async () => {
        if (!currentFile) {
            alert('请先选择图片！');
            return;
        }

        try {
            // 显示加载状态
            loadingOverlay.style.display = 'flex';
            recognizeBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';
            resultText.value = '';

            // 初始化 worker
            await initWorker();

            // 识别图片
            const { data: { text } } = await worker.recognize(previewImage);

            // 显示结果
            resultText.value = text.trim() || '未识别到文字内容';

            // 隐藏加载状态
            loadingOverlay.style.display = 'none';
            recognizeBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            loadingProgress.textContent = '';

            if (!text.trim()) {
                alert('未识别到文字内容，请尝试上传更清晰的图片。');
            }
        } catch (error) {
            console.error('识别错误:', error);
            alert('识别失败，请重试！错误信息: ' + error.message);
            loadingOverlay.style.display = 'none';
            recognizeBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
        }
    });

    // 复制文字
    copyBtn.addEventListener('click', () => {
        if (!resultText.value.trim()) {
            alert('没有可复制的内容！');
            return;
        }

        resultText.select();
        document.execCommand('copy');
        
        // 显示复制成功提示
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ 已复制';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    });

    // 下载为文本文件
    downloadBtn.addEventListener('click', () => {
        if (!resultText.value.trim()) {
            alert('没有可下载的内容！');
            return;
        }

        const blob = new Blob([resultText.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `识别结果_${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 清空
    clearBtn.addEventListener('click', () => {
        if (confirm('确定要清空识别结果吗？')) {
            resultText.value = '';
        }
    });

    // 页面卸载时终止 worker
    window.addEventListener('beforeunload', async () => {
        if (worker) {
            await worker.terminate();
            worker = null;
        }
    });
});
