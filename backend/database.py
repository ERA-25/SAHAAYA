import mysql.connector


def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Era@MYSQL123",
        database="sahaaya",
        port=3306
    )


print("Database module ready!")