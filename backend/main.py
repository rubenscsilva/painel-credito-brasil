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
    """Retorna o último valor de cada série."""
    df = carregar()
    resultado = {}
    for serie in df["serie"].unique():
        ultimo = (
            df[df["serie"] == serie]
            .sort_values("data")
            .iloc[-1]
        )
        resultado[serie] = {
            "valor": ultimo["valor"],
            "data": ultimo["data"],
        }
    return resultado


@app.get("/serie/{nome}")
def serie(nome: str):
    """Retorna o histórico completo de uma série."""
    df = carregar(serie=nome)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"Série '{nome}' não encontrada.")
    return df[["data", "valor"]].to_dict(orient="records")