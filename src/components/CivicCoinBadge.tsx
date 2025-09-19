import { Coins, Trophy, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CivicCoinBadgeProps {
  coins: number;
  rank?: "bronze" | "silver" | "gold" | "platinum";
  showRank?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CivicCoinBadge = ({ 
  coins, 
  rank, 
  showRank = false, 
  size = "md",
  className = "" 
}: CivicCoinBadgeProps) => {
  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  const getRankIcon = () => {
    switch (rank) {
      case "bronze": return <Trophy className={`${iconSizes[size]} text-amber-600`} />;
      case "silver": return <Trophy className={`${iconSizes[size]} text-gray-400`} />;
      case "gold": return <Trophy className={`${iconSizes[size]} text-yellow-500`} />;
      case "platinum": return <Star className={`${iconSizes[size]} text-purple-500`} />;
      default: return <Coins className={`${iconSizes[size]} text-accent-foreground`} />;
    }
  };

  const getRankColor = () => {
    switch (rank) {
      case "bronze": return "bg-gradient-to-r from-amber-500 to-amber-600";
      case "silver": return "bg-gradient-to-r from-gray-400 to-gray-500";
      case "gold": return "bg-gradient-to-r from-yellow-400 to-yellow-500";
      case "platinum": return "bg-gradient-to-r from-purple-500 to-purple-600";
      default: return "bg-gradient-gold";
    }
  };

  return (
    <div className={`inline-flex items-center space-x-1 ${getRankColor()} ${sizeStyles[size]} rounded-full font-semibold text-white shadow-soft ${className}`}>
      {getRankIcon()}
      <span>{coins.toLocaleString()}</span>
      {showRank && rank && (
        <Badge variant="secondary" className={`ml-1 ${size === 'sm' ? 'text-xs px-1' : 'text-xs px-2'} bg-white/20 text-white border-white/30`}>
          {rank.charAt(0).toUpperCase() + rank.slice(1)}
        </Badge>
      )}
    </div>
  );
};

export default CivicCoinBadge;