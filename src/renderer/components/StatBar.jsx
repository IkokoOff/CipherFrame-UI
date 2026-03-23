export default function StatBar({ label, value, pct }) {
  const danger = pct > 85
  const warn   = pct > 65
  const color  = danger ? 'from-red-900 to-cyber-red' : warn ? 'from-yellow-900 to-cyber-yellow' : 'from-cyber-cyan3 to-cyber-cyan'
  const glow   = danger ? '#ff2050' : warn ? '#ffd700' : '#00f5ff'

  return (
    <div className="mb-[9px]">
      <div className="flex justify-between text-[8px] tracking-wide text-cyber-cyan/50 mb-[3px]">
        <span>{label}</span>
        <span className="text-cyber-cyan">{value}</span>
      </div>
      <div className="h-[3px] bg-cyber-cyan/7 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} relative transition-all duration-1000`}
          style={{ width: pct + '%', boxShadow: `0 0 6px ${glow}` }}
        >
          <div className="absolute right-0 top-0 w-[3px] h-full bg-white" style={{boxShadow:'0 0 4px white'}}/>
        </div>
      </div>
    </div>
  )
}
