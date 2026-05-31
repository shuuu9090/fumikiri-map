# FUMIKIRI MAP

地名を入力すると、その周辺の踏切を地図とリストに表示するWebアプリPWA。
各踏切のストリートビュー/地図リンクをワンタップで開けます。

## 使い方

1. 駅名・地名(例:「東京駅」「千代田区」)を入力して **Search**
2. 地図の青いダイヤ=踏切。カードや半径スライダー(1〜5km)で絞り込み
3. **Locate** で現在地周辺を検索(https/localhost のみ)
4. 各踏切から Street View / 地図 を開く

## 特徴

- 地図:Leaflet + CartoDB dark タイル(ダークUI)
- 地名検索:Nominatim、踏切データ:Overpass API
  - 車道用(`railway=level_crossing`)+ 歩行者用(`railway=crossing`)
  - 通っている鉄道路線の**路線名**も表示
- **PWA**:ホーム画面に追加でアプリ風起動・オフライン枠あり
- 外部API保護:同時実行ガード/最小間隔スロットル/セッションキャッシュ/デバウンス
- **すべて無料・APIキー不要**

## ローカルで動かす

`file://` だと Safari がAPI通信をブロックし、現在地・PWAも動きません。**HTTPサーバ経由**で開いてください。

```bash
python3 -m http.server 8000
# → http://localhost:8000/
```

## アイコン再生成

```bash
python3 gen-icons.py   # icon-192.png / icon-512.png を生成(標準ライブラリのみ)
```

## 開発

`CLAUDE.md` に開発文脈・設計判断・タスクリストがあります。
Claude Code で `claude` を起動して続きを依頼できます。
