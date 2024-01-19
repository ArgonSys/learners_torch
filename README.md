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
| planed_time         | datetime |     | NOT NULL         |
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
| actual_time         | bigint |     | NOT NULL         |

### アソシエーション
time_log: ForeignKey
