"use client";

import { UseStates } from "@/api/get-player-states";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from 'next-intl';

interface StatisticsProps {
  userId: number | undefined;
}

export default function Statistics({ userId }: StatisticsProps ) {
  const t = useTranslations('dashboard.statistics');
  const {data : statistics} = UseStates(userId)
  
  if (!statistics){
    return (
      <div className="div">{t('loading')}</div>
    );
  }
  
  console.log("stattes L",statistics)
  // Calculate win rate
  const winRate = statistics.matches_played && statistics.matches_played > 0
    ? Math.round((statistics.matches_won) / statistics.matches_played * 100)
    : 0;

  // Prepare data for the chart
  const statsData = [
    {
      name: t('wins'),
      value: statistics.matches_won || 0,
      color: "#40CFB7",
    },
    {
      name: t('losses'),
      value: statistics.matches_lost || 0,
      color: "#c75b37",
    },
    {
      name: t('total'),
      value: statistics.matches_played || 0,
      color: "#ffffff",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 p-4 rounded-lg">
          <div className="text-sm text-gray-400">{t('winRate')}</div>
          <div className="text-2xl font-bold text-[#40CFB7]">{winRate}%</div>
        </div>
        <div className="bg-black/30 p-4 rounded-lg">
          <div className="text-sm text-gray-400">{t('experience')}</div>
          <div className="text-2xl font-bold text-[#40CFB7]">{statistics.experience}</div>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis
              dataKey="name"
              stroke="#ffffff"
              tick={{ fill: "#ffffff" }}
            />
            <YAxis stroke="#ffffff" tick={{ fill: "#ffffff" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
              }}
            />
            <Bar
              dataKey="value"
              fill="#c75b37"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            >
              {statsData.map((entry, index) => (
                <rect
                  key={`bar-${index}`}
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 