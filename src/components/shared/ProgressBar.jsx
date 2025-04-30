import { Progress } from "../ui/progress"
import { cn } from "../../lib/utils"

const ProgressBar = ({ value, total, className, showPercentage = true }) => {
  const percentage = Math.round((value / total) * 100) || 0

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Progression</span>
        {showPercentage && <span className="text-sm font-medium text-gray-700">{percentage}%</span>}
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}

export default ProgressBar

