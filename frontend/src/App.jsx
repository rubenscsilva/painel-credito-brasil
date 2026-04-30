import { useEffect, useState } from "react"
import axios from "axios"
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts"

const API = "http://localhost:8000"

const SERIES_CONFIG = {
  inadimplencia_pf:  { label: "Inadimplência PF",      unidade: "%",      cor: "#E24B4A" },
  inadimplencia_pj:  { label: "Inadimplência PJ",      unidade: "%",      cor: "#378ADD" },
  juros_medio_pf:    { label: "Juros médio PF",        unidade: "% a.a.", cor: "#BA7517" },
  concessao_credito: { label: "Concessões de crédito", unidade: "R$ mi",  cor: "#1D9E75" },
}

const CORES_ACCENT = {
  inadimplencia_pf:  "#A32D2D",
  inadimplencia_pj:  "#0C447C",
  juros_medio_pf:    "#633806",
  concessao_credito: "#085041",
}

function formatarValor(key, valor) {
  if (!valor && valor !== 0) return "—"
  if (key === "concessao_credito") return `R$ ${(valor / 1000).toFixed(0)} bi`
  return `${Number(valor).toFixed(2)}%`
}

function formatarVariacao(kpiKey, variacao) {
  if (variacao === null || variacao === undefined) return null
  const sinal = variacao > 0 ? "+" : ""
  if (kpiKey === "concessao_credito") {
    return `${sinal}R$ ${Math.abs(variacao / 1000).toFixed(0)} bi`
  }
  return `${sinal}${Number(variacao).toFixed(2)} pp`
}

function KPICard({ kpiKey, cfg, valor, data, variacao }) {
  const delta = formatarVariacao(kpiKey, variacao)
  const corVariacao = variacao > 0 ? "#A32D2D" : "#085041"
  const bgVariacao  = variacao > 0 ? "#FCEBEB" : "#E1F5EE"

  return (
    <div style={{
      background: "#fff", border: "0.5px solid #e5e5e5",
      borderRadius: 12, padding: "16px 18px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: 3, height: "100%",
        background: cfg.cor, borderRadius: "3px 0 0 3px"
      }}/>
      <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        {cfg.label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 500, color: CORES_ACCENT[kpiKey], lineHeight: 1, marginBottom: 8 }}>
        {formatarValor(kpiKey, valor)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {delta && (
          <span style={{
            fontSize: 11, padding: "2px 7px", borderRadius: 4,
            background: bgVariacao, color: corVariacao, fontWeight: 500
          }}>
            {delta} vs mês ant.
          </span>
        )}
        <span style={{ fontSize: 11, color: "#bbb" }}>
          {data ? data.slice(0, 7) : "—"}
        </span>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "#fff", border: "0.5px solid #e5e5e5",
      borderRadius: 8, padding: "8px 12px", fontSize: 12
    }}>
      <div style={{ color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{Number(payload[0].value).toFixed(2)}</div>
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

  const cfg = SERIES_CONFIG[serieSelecionada]

  return (
    <div style={{
      maxWidth: "100%", padding: "32px 48px",
      fontFamily: "system-ui, sans-serif",
      background: "#f9f9f8", minHeight: "100vh"
    }}>

      {/* Header */}
      <div style={{ borderBottom: "0.5px solid #e5e5e5", paddingBottom: 16, marginBottom: 24 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "#E1F5EE", color: "#0F6E56",
          fontSize: 11, padding: "3px 10px", borderRadius: 20, marginBottom: 8
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", display: "inline-block" }}/>
          Banco Central do Brasil — SGS
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>
          Painel de Crédito Brasil
        </h1>
        <p style={{ fontSize: 13, color: "#888" }}>
          Monitoramento de inadimplência, juros e concessões · série histórica 2020–2026
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12, marginBottom: 28
      }}>
        {kpis && Object.entries(SERIES_CONFIG).map(([key, c]) => (
          <KPICard
            key={key}
            kpiKey={key}
            cfg={c}
            valor={kpis[key]?.valor}
            data={kpis[key]?.data}
            variacao={kpis[key]?.variacao}
          />
        ))}
      </div>

      {/* Gráfico */}
      <div style={{
        background: "#fff", border: "0.5px solid #e5e5e5",
        borderRadius: 12, padding: 20
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 16,
          flexWrap: "wrap", gap: 8
        }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Evolução histórica</span>
          <select
            value={serieSelecionada}
            onChange={e => setSerieSelecionada(e.target.value)}
            style={{
              fontSize: 12, padding: "5px 10px", borderRadius: 6,
              border: "0.5px solid #ddd", background: "#f9f9f8",
              color: "#333", outline: "none"
            }}
          >
            {Object.entries(SERIES_CONFIG).map(([key, c]) => (
              <option key={key} value={key}>{c.label} ({c.unidade})</option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={historico} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis
              dataKey="data" tick={{ fontSize: 11, fill: "#aaa" }}
              interval={11} tickLine={false} axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#aaa" }}
              tickLine={false} axisLine={false} width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="valor"
              stroke={cfg.cor}
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <p style={{ fontSize: 11, color: "#bbb", textAlign: "right", marginTop: 8 }}>
          Fonte: Banco Central do Brasil · api.bcb.gov.br
        </p>
      </div>
    </div>
  )
}