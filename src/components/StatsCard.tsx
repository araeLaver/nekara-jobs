import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: number | string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  }

  return (
    <motion.div 
      className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2, scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClasses[color]} backdrop-blur-sm`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}