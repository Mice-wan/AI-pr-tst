# GitHub 上传说明

## 当前状态

✅ Git 仓库已初始化
✅ 所有文件已提交到本地仓库
✅ 远程仓库已配置：https://github.com/Mice-wan/AI-pr-tst.git
✅ 分支已重命名为 `main`

## 推送到 GitHub 的步骤

### 方法一：使用 Personal Access Token（推荐）

1. **生成 Personal Access Token**：
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 生成并复制 token

2. **推送代码**：
   ```bash
   git push -u origin main
   ```
   
3. **输入认证信息**：
   - Username: 输入你的 GitHub 用户名
   - Password: 输入刚才生成的 Personal Access Token（不是密码）

### 方法二：使用 GitHub CLI

如果你安装了 GitHub CLI：
```bash
gh auth login
git push -u origin main
```

### 方法三：使用 SSH（需要配置 SSH 密钥）

1. **检查是否已有 SSH 密钥**：
   ```bash
   ls ~/.ssh
   ```

2. **如果没有，生成 SSH 密钥**：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

3. **添加 SSH 密钥到 GitHub**：
   - 复制公钥内容：`cat ~/.ssh/id_ed25519.pub`
   - 访问：https://github.com/settings/keys
   - 点击 "New SSH key"，粘贴公钥

4. **使用 SSH 推送**：
   ```bash
   git remote set-url origin git@github.com:Mice-wan/AI-pr-tst.git
   git push -u origin main
   ```

## 如果遇到网络问题

如果无法连接到 GitHub，可以尝试：

1. **检查网络连接**
2. **配置代理**（如果使用代理）：
   ```bash
   git config --global http.proxy http://proxy.example.com:8080
   git config --global https.proxy https://proxy.example.com:8080
   ```

3. **使用镜像站点**（如果在中国大陆）：
   - 考虑使用 Gitee 或其他 Git 托管服务

## 验证上传

推送成功后，访问以下地址查看你的代码：
https://github.com/Mice-wan/AI-pr-tst

