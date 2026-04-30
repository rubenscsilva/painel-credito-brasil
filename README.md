# Painel de Crédito Brasil

Dashboard analítico de indicadores de crédito e inadimplência do Brasil, com dados reais do Banco Central (SGS/BCB).

🔗 **[Acesse o painel ao vivo](https://painel-credito-brasil.vercel.app)**

---

## O que este projeto monitora

| Indicador                     | Fonte             | Última atualização |
| ----------------------------- | ----------------- | ------------------ |
| Inadimplência PF (%)          | BCB — série 21082 | mar/2026           |
| Inadimplência PJ (%)          | BCB — série 21083 | mar/2026           |
| Juros médio PF (% a.a.)       | BCB — série 20714 | mar/2026           |
| Concessões de crédito (R$ mi) | BCB — série 20631 | mar/2026           |

---

## Arquitetura

API BCB (REST) → ETL Python → SQLite → FastAPI → React + Recharts

- **ETL** — coleta e transforma séries históricas via `api.bcb.gov.br`
- **Backend** — FastAPI servindo endpoints REST com dados persistidos em SQLite
- **Frontend** — React + Recharts com KPI cards, variação mensal e gráfico histórico
- **CI/CD** — GitHub Actions atualiza os dados automaticamente todo dia 1 do mês

---

## Stack

| Camada          | Tecnologia              |
| --------------- | ----------------------- |
| Coleta          | Python + requests       |
| Transformação   | pandas                  |
| Banco           | SQLite                  |
| API             | FastAPI + uvicorn       |
| Frontend        | React + Vite + Recharts |
| Deploy backend  | Render                  |
| Deploy frontend | Vercel                  |
| Automação       | GitHub Actions          |

---

## Como rodar localmente

```bash
# Backend
cd backend
pip install -r requirements.txt
python db.py        # popula o banco
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Autor

**Rubens Cristovão** — Analytics Engineer  
[LinkedIn](https://linkedin.com/in/rubenscsilva) · [GitHub](https://github.com/rubenscsilva)
