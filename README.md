# 概要  
[Zenn | 【AWS】EventBridgeを使って毎日の課金額をSlackに通知する](https://zenn.dev/nekoniki/articles/47d41bf2f9f81d)で紹介したコードです。
`Slack`の`Bot`を用いて特定のチャンネルに任意の`AWS`の日次の利用料金を投稿します。

# 必要なもの
- `Slack Bot`のトークン、送信対象のチャンネルID
- `aws-sdk`と`axios`が利用できる`Layers`

# 使い方　
詳細な内容については↑に記事リンクを参照。
以下、ざっくりとした使い方

- `index.js`を`Lambda`にコピー
   - 当該`Lambda`のポリシーには`ce:GetCostAndUsage`を追加する
   - `Slack Bot`のトークンとチャンネルIDを`Lambda`の環境変数に格納する
- `EventBridge`で上記の`Lambda`を任意の時間に動作するように設定する