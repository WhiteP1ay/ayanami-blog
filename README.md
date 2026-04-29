# 🌸 ayanami-blog

一个安静写东西的地方。基于 Markdown 的个人博客，粉色少女心风格。

## 技术栈

- **前端**: React 18 + Vite + React Router
- **Markdown 渲染**: marked + highlight.js
- **部署**: Docker + Nginx（多阶段构建）
- **CI/CD**: GitHub Actions（推 `deploy` 分支自动构建镜像并发布到 Docker Hub）

## 项目结构

```
ayanami-blog/
├── src/
│   ├── api/client.js        # API 客户端（Bearer token 鉴权）
│   ├── components/Navbar.jsx
│   ├── pages/
│   │   ├── Home.jsx         # 文章列表
│   │   ├── PostView.jsx     # 文章阅读
│   │   └── PostEdit.jsx     # 文章编辑/新建
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css            # 全局样式（樱花粉配色）
├── nginx.conf               # Nginx 配置（SPA + API 代理）
├── Dockerfile               # 多阶段构建
├── .github/workflows/deploy.yml
└── package.json
```

## 本地开发

```bash
npm install
npm run dev
```

## 后端 API 契约

前端需要以下接口（Base URL 通过 `VITE_API_BASE` 环境变量配置）：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 文章列表 |
| GET | `/api/posts/:id` | 文章详情 |
| POST | `/api/posts` | 新建文章 |
| PUT | `/api/posts/:id` | 更新文章 |
| DELETE | `/api/posts/:id` | 删除文章 |
| POST | `/api/upload` | 上传图片（multipart/form-data） |

所有接口需 `Authorization: Bearer <token>` 请求头。

## 部署

推 `deploy` 分支触发 GitHub Actions，自动构建 Docker 镜像并推送至 Docker Hub：

```
whiteplay/ayanami-blog:latest
```

### GitHub Secrets 配置

在仓库 Settings → Secrets and variables → Actions 中添加：

- `DOCKER_USERNAME`: Docker Hub 用户名
- `DOCKER_TOKEN`: Docker Hub Access Token

## License

MIT
