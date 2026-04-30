import sqlite3
import pandas as pd
from pathlib import Path

DB_PATH = Path("data/bcb.db")


def get_connection():
    return sqlite3.connect(DB_PATH)


def criar_tabela():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS series_bcb (
                data  TEXT,
                serie TEXT,
                valor REAL,
                PRIMARY KEY (data, serie)
            )
        """)


def salvar(df: pd.DataFrame):
    with get_connection() as conn:
        df.to_sql(
            "series_bcb",
            conn,
            if_exists="replace",
            index=False,
        )
    print(f"OK — {len(df)} registros salvos em {DB_PATH}")


def carregar(serie: str = None) -> pd.DataFrame:
    query = "SELECT * FROM series_bcb"
    if serie:
        query += f" WHERE serie = '{serie}'"
    query += " ORDER BY data"
    with get_connection() as conn:
        return pd.read_sql(query, conn)


if __name__ == "__main__":
    from etl import baixar_todas
    criar_tabela()
    df = baixar_todas()
    salvar(df)
    print(carregar("inadimplencia_pf").tail(3).to_string(index=False))