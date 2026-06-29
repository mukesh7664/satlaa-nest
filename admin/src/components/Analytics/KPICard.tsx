import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { TrendingUp, TrendingDown, HorizontalRule } from "@mui/icons-material";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  period?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  period = "vs last period",
  icon,
  loading = false,
}) => {
  const isUp = change !== undefined && change > 0;
  const isDown = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <Card className="hover:shadow-md transition-shadow duration-300 border border-slate-100/60 overflow-hidden relative rounded-xl bg-white">
      <CardContent className="p-5 flex flex-col gap-2">
        <Box className="flex justify-between items-center">
          <Typography className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">
            {title}
          </Typography>
          {icon && (
            <Box className="p-2.5 bg-slate-50 rounded-xl text-slate-600 border border-slate-100 flex items-center justify-center">
              {icon}
            </Box>
          )}
        </Box>

        <Box className="flex flex-col gap-1 mt-1">
          {loading ? (
            <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <Typography variant="h4" className="font-extrabold text-slate-800 tracking-tight">
              {value}
            </Typography>
          )}

          {!loading && change !== undefined && (
            <Box className="flex items-center gap-1.5 mt-1">
              <Box
                className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isUp
                    ? "bg-emerald-50 text-emerald-600"
                    : isDown
                    ? "bg-rose-50 text-rose-600"
                    : "bg-slate-50 text-slate-500"
                }`}
              >
                {isUp && <TrendingUp sx={{ fontSize: 14 }} />}
                {isDown && <TrendingDown sx={{ fontSize: 14 }} />}
                {isNeutral && <HorizontalRule sx={{ fontSize: 14 }} />}
                <span>
                  {change !== undefined
                    ? `${isUp ? "+" : ""}${change.toFixed(1)}%`
                    : "0.0%"}
                </span>
              </Box>
              <Typography className="text-xs text-slate-400 font-normal">
                {period}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;
