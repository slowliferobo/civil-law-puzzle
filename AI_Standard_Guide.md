# AIゲーム開発標準ガイド（民法パズル版）

本ガイドは、「民法パズル」の開発経験に基づき、AIを活用してブラウザゲームを開発する際の標準プロセスと注意点をまとめたものです。

> [!IMPORTANT]
> **より包括的な最新ガイドとテンプレートが作成されました。** 新規開発の際は以下を参照してください：
> - **[AI Game Development Master Guide](AI_Game_Dev_Master_Guide.md)**: ゲーム開発の全体的な哲学と標準
> - **[Prompt Template: Game Design](Prompt_Template_GameDesign.md)**: 企画・設計用プロンプト
> - **[Prompt Template: Technical](Prompt_Template_Technical.md)**: 実装・コーディング用プロンプト
> - **[Prompt Template: Creative](Prompt_Template_Creative.md)**: UI・サウンド・エフェクト用プロンプト

## 1. 基本構成とセットアップ

### リポジトリの作成（重要）
**原則として「1ゲームにつき1リポジトリ」を作成します。**
- **理由**: GitHub Pagesはリポジトリ単位で公開されるため、複数のゲームを1つのリポジトリに入れると管理や公開設定が複雑になるためです。
- 新しいゲームを作る際は、新規にフォルダを作り、`git init` から始めてください。

### フォルダ構成
```
project_root/
├── index.html      # ゲームのメイン画面
├── style.css       # デザイン・レイアウト
├── script.js       # ゲームロジック
├── assets/         # 画像・音声など（必要に応じて）
└── README.md       # プロジェクト説明
```

### HTMLテンプレート（推奨）
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <!-- モバイル対応必須設定 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>ゲームタイトル</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="game-container">
        <!-- 画面回転警告（モバイル横画面ゲームの場合） -->
        <div id="rotate-message" style="display: none;">
            <div class="icon">↻</div>
            <p>スマホの<strong>自動回転</strong>をONにして<br>画面を横にしてください</p>
            <button id="ignore-rotate-btn">そのまま遊ぶ</button>
        </div>
        
        <!-- ゲーム画面 -->
        <div id="game-screen"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

## 2. モバイル・レスポンシブ対応の標準

### 画面回転のハンドリング
モバイルブラウザゲーム（特に横画面推奨）では、ユーザーへの案内が不可欠です。

1.  **CSSメディアクエリ**: 画面比率に応じて警告を表示。
    ```css
    /* 縦画面（ポートレート）の場合 */
    @media (orientation: portrait) {
        #rotate-message { display: flex; }
        #game-screen { display: none; }
    }
    ```
2.  **明確な指示**: 「横にしてください」だけでなく、「自動回転をONにする」ことや、PCユーザー向けに「ウィンドウを広げる」ことを明記する。
3.  **回避策（Escape Hatch）**: 誤検知やPCでのプレイ用に「そのまま遊ぶ」ボタンを必ず設置する。

### タッチイベントとクリック
- `click` イベントはモバイルでも動作するが、ドラッグ操作などを実装する場合は `touchstart`, `touchmove`, `touchend` も考慮する。
- **重要**: `e.preventDefault()` を適切に使用して、スクロールやズームを防ぐ（ただし `passive: false` オプションが必要）。

## 3. ロバスト性（堅牢性）の確保

### レイアウト依存ロジックの遅延実行
要素のサイズ（`offsetWidth`, `offsetHeight`）を取得して配置を決める処理は、画面描画が完了していないと `0` になりバグの原因となります。

**対策コード例:**
```javascript
// requestAnimationFrameを2回ネストすることで、
// 次の描画フレームまで確実に待機する
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        initializeGameElements();
    });
});
```

### フォールバック値の設定
サイズ取得が失敗した場合に備え、必ずデフォルト値を設定します。

```javascript
const width = element.offsetWidth || 100; // 取得できなければ100とする
const height = element.offsetHeight || 50;
```

### キャッシュ対策と安全性
ブラウザのキャッシュにより、HTMLとJSのバージョンが食い違うことがあります（例：HTMLにはないボタンをJSが参照しようとする）。
`document.getElementById` の結果は必ず `null` チェックを行ってください。

```javascript
const btn = document.getElementById('my-btn');
if (btn) {
    btn.addEventListener('click', handler);
}
```

## 4. デプロイと確認

### Google Analyticsの導入（任意）
効果測定を行いたい場合は、Google Analytics (GA4) を導入します。
- **測定IDの公開について**: `G-` から始まる測定IDは、WebサイトのHTML内に記述されるため、**公開してもセキュリティ上の問題はありません**（このIDだけで管理画面にログインされたり、データを閲覧されたりすることはありません）。
- ただし、他人が勝手にこのIDを使って偽のアクセスデータを送る「リファラースパム」のリスクはゼロではありませんが、個人開発のゲームでは許容範囲とされることが一般的です。

### GitHub Pages
1.  `main` ブランチにプッシュ。
2.  Settings > Pages で `main` / `root` を指定してSave。
3.  **反映待ち**: 数分かかる場合があるため、即座に反映されなくても焦らない。
4.  **キャッシュクリア**: 修正確認時は、ブラウザのスーパーリロード（Ctrl+F5など）やシークレットウィンドウを使用する。

## 5. AIへの指示出しテンプレート

新しくゲームを作る際は、以下の要件を最初に伝えるとスムーズです。

> **プロンプト例:**
> 「モバイルブラウザでも動作する[ゲームジャンル]を作ってください。
> 以下の要件を満たすように実装してください：
> 1. レスポンシブ対応（スマホ横画面推奨の場合は回転指示を入れる）
> 2. レイアウト依存の処理は描画完了を待つようにする（requestAnimationFrame等）
> 4. HTML/CSS/JSは分離する」

## 6. バージョン管理について

開発において「バージョン管理」は非常に重要です。Gitを使うことで自動的に履歴は残りますが、リリース時には明確な区切りをつけることを推奨します。

### 推奨する運用ルール
1.  **コミットメッセージ**: 何をしたか具体的に書く（例: `Fix: スタートボタンが反応しないバグを修正`）。
2.  **リリース時のタグ付け**: ゲームを公開・更新したタイミングで、Gitの「タグ」機能やリリースノートを使うと管理しやすくなります。
    - 例: `v1.0.0` (初回リリース)
    - 例: `v1.0.1` (バグ修正)
3.  **ファイル内への記載**: `README.md` や `index.html` のフッターなどに `Ver 1.0.1` のように記載しておくと、ユーザーも確認しやすくなります。

### Gitへのアップロード範囲
- **必須**: `index.html`, `style.css`, `script.js`, 画像などのアセット類。これらはゲームの動作に必要です。
- **任意**: このガイドファイルや、企画書などのドキュメント類。
    - GitHub Pagesで公開するだけなら、ドキュメント類はアップロードしなくても問題ありません（ローカルで管理）。
    - チーム開発やバックアップ目的であれば、アップロードすることを推奨します。
