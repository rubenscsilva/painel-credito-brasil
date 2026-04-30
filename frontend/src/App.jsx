import { useEffect, useState } from "react"
import axios from "axios"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

const API = "http://localhost:8000"

const SERIES_CONFIG = {
  inadimplencia_pf: { label: "Inadimplência PF (%)", cor: "#e05c3a" },
  inadimplencia_pj: { label: "Inadimplência PJ (%)", cor: "#3a7ae0" },
  juros_medio_pf:   { label: "Juros Médio PF (% a.a.)", cor: "#e0a83a" },
  concessao_credito:{ label: "Concessão de Crédito (R$ mi)", cor: "#3ac47a" },
}

function KPICard({ titulo, valor, data, cor }) {
  return (
    <div style={{
      border: `2px solid ${cor}`,
      borderRadius: 10,
      padding: "16px 20px",
      minWidth: 200,
      flex: 1,
    }}>
      <div style={{ fontSize: 13, color: "#888" }}>{titulo}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: cor }}>{valor}</div>
      <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{data}</div>
    </div>
  )
}

export default function App() {
  const [kpis, setKpis] = useState(null)
  const [serieSelecionada, setSerieSelecionada] = useState("inadimplencia_pf")
  const [historico, setHistorico] = useState([])

  useEffect(() => {
    axios.get(`${API}/kpis`).then(r => setKpis(r.data))
  }, [])

  useEffect(() => {
    axios.get(`${API}/serie/${serieSelecionada}`).then(r => {
      setHistorico(r.data.map(d => ({
        ...d,
        data: d.data.slice(0, 7),
      })))
    })
  }, [serieSelecionada])

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 32, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Painel de Crédito Brasil</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>
        Dados do Banco Central — atualizado até março/2026
      </p>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 40 }}>
        {kpis && Object.entries(SERIES_CONFIG).map(([key, cfg]) => (
          <KPICard
            key={key}
            titulo={cfg.label}
            valor={kpis[key]?.valor}
            data={kpis[key]?.data?.slice(0, 10)}
            cor={cfg.cor}
          />
        ))}
      </div>

      {/* Seletor de série */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8, fontWeight: 600 }}>Série:</label>
        <select
          value={serieSelecionada}
          onChange={e => setSerieSelecionada(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: 6, fontSize: 14 }}
        >
          {Object.entries(SERIES_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={historico}>
          <XAxis dataKey="data" tick={{ fontSize: 11 }} interval={11} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="valor"
            stroke={SERIES_CONFIG[serieSelecionada]?.cor}
            dot={false}
            strokeWidth={2}
            name={SERIES_CONFIG[serieSelecionada]?.label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}