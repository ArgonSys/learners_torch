# Learners' Torch
Learners' Torchは、プログラミング学習者向けの学習計画サポートWebサービスです。
学習プランごとにタスクとステージを設定でき、タスクごとに各ステージに対する目標時間が設定できます。
タスクのタイマーをスタートすると時間を計測し、タイマーのストップやページを離れると経過時間を保存し、時間を管理してくれます。マイページで学習記録や目標時間と実時間のグラフを確認でき、フィードバックを得てよりよい計画を立てられるようになります。


# アプリケーション
URL: https://learners-torch.onrender.com

Basic認証
ID：admin
PASS：fe889d7e600b6636bb0ca2c51fe89009


# 利用方法
- ユーザー名、メールアドレス、パスワードを入力して新規登録
- メールアドレス、パスワードを入力してログイン
- 新しいプランから新規プランを作成
- ステージ作成から新規ステージを作成
- タスク作成から新規タスクを作成、作成するとPendingステージに自動的に入る
- ステージやタスクはドラッグ＆ドロップで順番を変えられる
- タスクはドラッグ＆ドロップでステージを移動できる


# アプリケーションを作成した背景
どの教材がいいかやどれくらいかかるかが分からず、学習計画を立てることに困難を感じている人に向けて、教材のレコメンドや所要時間の目安を提示し、計画のフィードバックを与えることで、計画を立てることが得意になってもらえるようなWebアプリを考えています。


# 洗い出した要件
↳要件定義をまとめたスプレッドシートのリンクを記載。


# 実装した機能についての画像やGIFおよびその説明
↳実装した機能について、それぞれどのような特徴があるのかを列挙する形で記載。


# 実装予定の機能
- タスク名からタスク詳細ページへ移動できる
- タスク詳細ページでは、タスクの名前、説明、各ステージの予定時間と経過時間を確認でき、時間測定ページへ移動できる
- 時間測定ページではタイマーがあり、予定時間に対して残りの時間が表示される
- スタートボタンを押すと時間計測を開始する
- ストップボタンを押すと時間計測を終了し、データベースに開始時刻と経過時間を保存する
- 測定中にリセットボタンを押すと測定前の状態に戻る
- 測定外でリセットボタンを押すと直前の測定が削除される
- 教材のレコメンド機能、目安時間の提示


# データベース設計
## Usersテーブル

|    COLUMN    |   TYPE   | KEY |      OPTIONS     |
|--------------|----------|-----|------------------|
| id           | bigint   | PRI | PRIMARY_KEY      |
| username     | string   |     | NOT NULL         |
| email        | string   |     | NOT NULL, UNIQUE |
| password     | string   |     | NOT NULL         |
| date_joined  | datetime |     | NOT NULL         |
| last_login   | datetime |     | NOT NULL         |
| is_staff     | bool     |     | NOT NULL         |
| is_superuser | bool     |     | NOT NULL         |
| is_active    | bool     |     | NOT NULL         |

### アソシエーション
permitted_plan: ManyToManyField through plans_permittees


## Plans_permitteesテーブル

|       COLUMN        |   TYPE   | KEY |      OPTIONS     |
|---------------------|----------|-----|------------------|
| id                  | bigint   | PRI | PRIMARY_KEY      |
| permittee_id        | bigint   | MUL | FOREIGN_KEY      |
| permitted_plan_id             | bigint   | MUL | FOREIGN_KEY      |
| date_created        | datetime |     | NOT NULL         |

### アソシエーション
permittee: ForeignKey
permitted_plan: ForeignKey

## Plansテーブル

|       COLUMN        |   TYPE   | KEY |      OPTIONS     |
|---------------------|----------|-----|------------------|
| id                  | bigint   | PRI | PRIMARY_KEY      |
| name                | string   |     | NOT NULL         |
| description         | string   |     |                  |
| is_public           | bool     |     | NOT NULL         |
| owner_id            | bigint   | MUL | FOREIGN_KEY      |
| date_created        | datetime |     | NOT NULL         |
| date_updated        | datetime |     | NOT NULL         |

### アソシエーション
owner: ForeignKey <br>
permittees: ManyToManyField through plans_permittees


## Stagesテーブル

|       COLUMN        |   TYPE   | KEY |      OPTIONS     |
|---------------------|----------|-----|------------------|
| id                  | bigint   | PRI | PRIMARY_KEY      |
| name                | string   |     | NOT NULL         |
| description         | string   |     |                  |
| plan_id             | bigint   | MUL | FOREIGN_KEY      |
| order               | bigint   |     | NOT NULL         |
| date_created        | datetime |     | NOT NULL         |
| date_updated        | datetime |     | NOT NULL         |

### アソシエーション
plan: ForeignKey


## Tasksテーブル

|       COLUMN        |   TYPE   | KEY |      OPTIONS     |
|---------------------|----------|-----|------------------|
| id                  | bigint   | PRI | PRIMARY_KEY      |
| name                | string   |     | NOT NULL         |
| description         | string   |     |                  |
| stage_id            | bigint   | MUL | FOREIGN_KEY      |
| order               | bigint   |     | NOT NULL         |
| is_done             | bool     |     | NOT NULL         |
| date_created        | datetime |     | NOT NULL         |
| date_updated        | datetime |     | NOT NULL         |

### アソシエーション
stage: ForeignKey


## Time_logsテーブル

|       COLUMN        |   TYPE   | KEY |      OPTIONS     |
|---------------------|----------|-----|------------------|
| id                  | bigint   | PRI | PRIMARY_KEY      |
| stage_id            | bigint   | MUL | FOREIGN_KEY      |
| task_id             | bigint   | MUL | FOREIGN_KEY      |
| planed_time         | bigint   |     | NOT NULL         |
| date_created        | datetime |     | NOT NULL         |
| date_updated        | datetime |     | NOT NULL         |

### アソシエーション
stage: ForeignKey
task: ForeignKey


## Actual_timesテーブル

|       COLUMN        |   TYPE   | KEY |      OPTIONS     |
|---------------------|----------|-----|------------------|
| id                  | bigint   | PRI | PRIMARY_KEY      |
| time_log_id         | bigint   | MUL | FOREIGN_KEY      |
| date_started        | datetime |     | NOT NULL         |
| measured_time        | bigint   |     | NOT NULL         |

### アソシエーション
time_log: ForeignKey


# 画面遷移図
↳画面遷移図を添付。

# 開発環境
Python 3.12.1
Django 5.0.1

↳使用した言語・サービスを記載。


# ローカルでの動作方法

以下の環境変数が必要です
```
DJANGO_SECRET_KEY
DJANGO_DATABASE="default"
WSGI_AUTH_CREDENTIAL (Basic認証が必要な場合)
SUPERUSER_NAME     (superuserが必要な場合)
SUPERUSER_EMAIL    (superuserが必要な場合)
SUPERUSER_PASSWORD (superuserが必要な場合)
APP_ENV (データベース名のポストフィックス)
MYSQL_USER
MYSQL_PASSWORD
MYSQL_HOST
MYSQL_PORT
```

また、MySQLでデータベースを作成する必要があります
```
$ mysql
mysql> CREATE DATABASE learners_torch_(APP_ENV)
```

環境変数とデータベースが用意出来たら以下のコマンドを実行します
```
$ git clone
$ cd learners_torch
$ python -m venv .venv
$ pip install --upgrade pip
$ pip install requirements.txt
$ . .venv/bin/activate
$ python manage.py migrate
$ python manage.py newsuperuser  (superuserが必要な場合)
$ gunicorn learners_torch.wsgi:application
```


# 工夫したポイント
↳制作背景・使用技術・開発方法・タスク管理など、企業へＰＲしたい事柄を記載。

★gifの挿入：人事担当によってはREADMEの記載内容だけでアプリの良し悪しを判断している可能性があるため、機能別の動作をgifで埋め込んでおきましょう！
