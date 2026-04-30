import requests
import pandas as pd
from pathlib import Path

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

# Séries do Banco Central
# https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados
SERIES = {
    "inadimplencia_pf": 21082,   # Inadimplência PF (%)
    "inadimplencia_pj": 21083,   # Inadimplência PJ (%)
    "concessao_credito": 20631,  # Concessões de crédito total (R$ mi)
    "juros_medio_pf":   20714,   # Taxa de juros média PF (% a.a.)
}


def buscar_serie(codigo: int, nome: str, inicio: str = "01/01/2020") -> pd.DataFrame:
    """Busca uma série temporal do BCB."""
    url = (
        f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados"
        f"?formato=json&dataInicial={inicio}"
    )
    print(f"  Buscando {nome} (série {codigo})...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()

    df = pd.DataFrame(response.json())
    df["data"] = pd.to_datetime(df["data"], format="%d/%m/%Y")
    df["valor"] = pd.to_numeric(df["valor"], errors="coerce")
    df["serie"] = nome
    return df[["data", "serie", "valor"]]


def baixar_todas() -> pd.DataFrame:
    """Baixa todas as séries e consolida em um único DataFrame."""
    frames = []
    for nome, codigo in SERIES.items():
        df = buscar_serie(codigo, nome)
        frames.append(df)
    return pd.concat(frames, ignore_index=True)


if __name__ == "__main__":
    print("Baixando séries do Banco Central...")
    df = baixar_todas()
    df.to_csv(DATA_DIR / "bcb_series.csv", index=False)
    print(f"\nOK — {len(df)} registros salvos em data/bcb_series.csv")
    print(df.groupby("serie").tail(1).to_string(index=False))