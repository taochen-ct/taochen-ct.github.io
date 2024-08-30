```python
from pandas.io.sql import SQLiteDatabase, _wrap_result, _convert_params

# 继承pandas read_sql_query类，重载read_query方法
class SnbDatabase(SQLiteDatabase):

    def __enter__(self):
        return self

    def __exit__(self, *args) -> None:
        pass

    @staticmethod
    def cala_count(ls):
        column_count = {}
        new_columns = []

        for column in ls:
            if column in column_count:
                column_count[column] += 1
                new_column = f"{column}_{column_count[column]}"
            else:
                column_count[column] = 0
                new_column = column
            new_columns.append(new_column)

        return new_columns

    def read_query(
        self,
        sql,
        index_col=None,
        coerce_float = True,
        params=None,
        parse_dates=None,
        chunksize = None,
        dtype = None,
    ):

        args = _convert_params(sql, params)
        cursor = self.execute(*args)
        columns = self.cala_count([col_desc[0] for col_desc in cursor.description])

        if chunksize is not None:
            return self._query_iterator(
                cursor,
                chunksize,
                columns,
                index_col=index_col,
                coerce_float=coerce_float,
                parse_dates=parse_dates,
                dtype=dtype,
            )
        else:
            data = self._fetchall_as_list(cursor)
            cursor.close()

            frame = _wrap_result(
                data,
                columns,
                index_col=index_col,
                coerce_float=coerce_float,
                parse_dates=parse_dates,
                dtype=dtype,
            )
            return frame

          
import pymysql
import pandas as pd
from dbutils.pooled_db import PooledDB

# 创建连接池
pool = PooledDB(
    creator=pymysql,  # 使用的数据库连接库
    maxconnections=5,  # 连接池允许的最大连接数，0和None表示没有限制
    mincached=2,  # 初始化时连接池中至少创建的空闲连接，0表示不创建
    maxcached=5,  # 连接池中最多闲置的连接，0和None表示没有限制
    maxusage=None,  # 一个连接最多被重复使用的次数，None表示无限制
    ping=0,  # 检查到死连接时，是否需要重新连接
    host='172.30.21.157',  # 连接数据库的地址
    port=3306,  # 连接数据库的端口号
    user='test',  # 数据库的用户名
    password='QWEfyc0831',  # 数据库的密码
    database='test',  # 连接的数据库名
    charset='utf8mb4'  # 连接使用的字符集
)


# 从连接池获取连接，并使用连接执行SQL语句
def execute_sql(sql):
        conn = pool.connection()
        with SnbDatabase(conn) as snb_sql:
            print(snb_sql.read_query(sql))
        conn.close()
        # return df
```

