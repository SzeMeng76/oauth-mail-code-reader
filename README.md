# OAuth Mail Code Reader

一个只依赖微软官方 OAuth2 / Microsoft Graph API 的邮箱验证码读取小工具。填入自己账号的 `refresh_token` 和 `client_id`，即可自动换取 `access_token` 并从最新邮件中提取验证码（Facebook、Instagram、Twitter、Apple、TikTok、Amazon、Lazada、KakaoTalk、Google、Shopee、Telegram、WeChat 等）。

> ⚠️ 仅用于读取你自己拥有的邮箱账号。所有请求只发往 `login.microsoftonline.com` 和 `graph.microsoft.com`，不经过任何第三方服务，凭证不会被转发或落库。

## 功能

- 输入 `refresh_token` + `client_id`，换取 `access_token`（微软官方端点）
- 拉取最近 20 封邮件，按平台关键词匹配并提取验证码
- 纯本地运行，无数据库，不持久化任何凭证

## 本地运行

```bash
npm install
npm start
```

默认监听 `http://localhost:4173`，打开浏览器填表单即可使用。

## Docker 运行

```bash
docker compose up -d
```

或直接拉取镜像：

```bash
docker run -d -p 4173:4173 --name oauth-mail-code-reader ghcr.io/szemeng76/oauth-mail-code-reader:main
```

## API

```
POST /api/get-code
Content-Type: application/json

{
  "email": "you@hotmail.com",
  "refresh_token": "M.C5...",
  "client_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "type": "facebook"
}
```

`type` 支持：`all` / `facebook` / `instagram` / `twitter` / `apple` / `tiktok` / `amazon` / `lazada` / `kakaotalk` / `google` / `shopee` / `telegram` / `wechat`

响应示例：

```json
{
  "email": "you@hotmail.com",
  "status": true,
  "code": "37589",
  "subject": "Your Facebook confirmation code",
  "content": "37589 is your Facebook confirmation code",
  "date": "2026-07-24T14:23:00Z",
  "from": "security@facebookmail.com"
}
```
