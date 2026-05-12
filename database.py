import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="viaduct.proxy.rlwy.net",
        port=55806,
        user="root",
        password="lsmETGzPVWxVNPhEHWxGpOtCUdpjjiWP",
        database="railway"
    )