import { cn } from "@/lib/utils";

interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color: 'health' | 'strength' | 'mind' | 'work' | 'spirit';
}

const colorMap = {
  health: 'bg-green-500',
  strength: 'bg-yellow-500',
  mind: 'bg-purple-500',
  work: 'bg-blue-500',
  spirit: 'bg-red-500'
};

const StatBar = ({ label, current, max, color }: StatBarProps) => {
  const percentage = (current / max) * 100;

  return (
    <div className="flex items-center gap-4">
      <span className={`w-3 h-3 rounded-full mt-1 ${colorMap[color]} flex-shrink-0`} />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="font-medium text-base">{label}</span>
          <span className="font-semibold text-violet-500 text-sm">{Math.round(percentage)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full mt-1">
          <div 
            className={`h-3 rounded-full ${colorMap[color]} transition-all`} 
            style={{ width: `${percentage}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

export default StatBar;