import { MapPin, Sun, Moon } from "lucide-react";

export interface SehriIftarCardProps {
  type: "sehri" | "iftar";
  time: string;
  location?: string | null;
  description?: string;
}

/**
 * Sehri/Iftar Card Component
 * 
 * A reusable card component for displaying Sehri or Iftar times with icons.
 * 
 * @param type - Either "sehri" or "iftar"
 * @param time - The time to display
 * @param location - Optional location to display
 * @param description - Optional description text
 */
export function SehriIftarCard({ type, time, location, description }: SehriIftarCardProps) {
  const isSehri = type === "sehri";
  
  return (
    <div className={`relative overflow-hidden rounded-2xl card-${type} p-6 shadow-sm`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        {isSehri ? (
          <Sun className="h-32 w-32 text-amber-500" />
        ) : (
          <Moon className="h-32 w-32 text-violet-500" />
        )}
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl ${isSehri ? 'bg-amber-500/15' : 'bg-violet-500/15'} shadow-inner`}>
          {isSehri ? (
            <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          )}
        </div>
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest ${isSehri ? 'text-amber-700 dark:text-amber-400' : 'text-violet-700 dark:text-violet-400'}`}>
            {isSehri ? 'Sehri' : 'Iftar'}
          </p>
          {description && (
            <p className={`text-xs ${isSehri ? 'text-amber-600/60 dark:text-amber-500/60' : 'text-violet-600/60 dark:text-violet-500/60'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div className={`text-5xl font-bold ${isSehri ? 'text-amber-900 dark:text-amber-100' : 'text-violet-900 dark:text-violet-100'} tracking-tight`}>
        {time}
      </div>
      {location && (
        <p className={`text-xs ${isSehri ? 'text-amber-700/60 dark:text-amber-400/60' : 'text-violet-700/60 dark:text-violet-400/60'} mt-3 flex items-center gap-1`}>
          <MapPin className="h-3 w-3" />{location}
        </p>
      )}
    </div>
  );
}
