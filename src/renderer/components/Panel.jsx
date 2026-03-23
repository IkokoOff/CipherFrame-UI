export default function Panel({ title, badge, badgeRef, children, className = '', style = {} }) {
  return (
    <div className={`relative border border-cyber-cyan/15 bg-cyber-panel/85 flex flex-col overflow-hidden ${className}`}
      style={{height:'100%',...style}}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-40 pointer-events-none"/>
      {['corner-tl','corner-tr','corner-bl','corner-br'].map(c=>(
        <div key={c} className={`absolute w-3 h-3 pointer-events-none z-10 ${c}`}/>
      ))}
      {title && (
        <div className="flex items-center justify-between px-3 py-[6px] border-b border-cyber-cyan/12 bg-cyber-cyan/[0.03] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-cyber-magenta text-[11px]">◈</span>
            <span className="font-orb text-[8px] tracking-[3px] text-cyber-cyan">{title}</span>
          </div>
          {(badge !== undefined || badgeRef) && (
            <span ref={badgeRef}
              className="text-[7px] px-[5px] py-px border border-cyber-cyan/20 text-cyber-cyan/40 tracking-wide">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
