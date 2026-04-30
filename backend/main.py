from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from db import carregar, criar_tabela, salvar
from etl import baixar_todas

app = FastAPI(title="Painel Crédito Brasil", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    """Garante que o banco existe e está populado ao iniciar."""
    criar_tabela()
    df = carregar()
    if df.empty:
        print("Banco vazio — carregando dados do BCB...")
        salvar(baixar_todas())


@app.get("/series")
def listar_series():
    """Lista as séries disponíveis."""
    df = carregar()
    return {"series": df["serie"].unique().tolist()}


@app.get("/kpis")
def kpis():
    df = carregar()
    resultado = {}
    for serie in df["serie"].unique():
        serie_df = df[df["serie"] == serie].sort_values("data")
        ultimo = serie_df.iloc[-1]
        penultimo = serie_df.iloc[-2] if len(serie_df) >= 2 else None
        variacao = round(float(ultimo["valor"]) - float(penultimo["valor"]), 2) if penultimo is not None else None
        resultado[serie] = {
            "valor": ultimo["valor"],
            "data": ultimo["data"],
            "variacao": variacao,
        }
    return resultado


@app.get("/serie/{nome}")
def serie(nome: str):
    """Retorna o histórico completo de uma série."""
    df = carregar(serie=nome)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"Série '{nome}' não encontrada.")
    return df[["data", "valor"]].to_dict(orient="records")