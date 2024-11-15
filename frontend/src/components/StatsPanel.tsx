import { Timer, Activity, Clock } from 'lucide-react'

interface StatsPanelProps {
  stats: {
    elapsedTime: number
    currentSpeed: number
    averageSpeed: number
    strokeCount: number
  }
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-center gap-8">
          <StatsBox
            icon={<Clock className="w-4 h-4" />}
            label="Time"
            value={`${stats.elapsedTime.toFixed(1)}s`}
          />
          <StatsBox
            icon={<Activity className="w-4 h-4" />}
            label="Current Speed"
            value={`${stats.currentSpeed.toFixed(1)} strokes/s`}
          />
          <StatsBox
            icon={<Timer className="w-4 h-4" />}
            label="Average Speed"
            value={`${stats.averageSpeed.toFixed(1)} strokes/s`}
          />
        </div>
      </div>
    </div>
  )
}

function StatsBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-full bg-gray-100">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}