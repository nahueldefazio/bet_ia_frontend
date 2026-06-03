export interface Match {
  id: number;
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  matchDate: string;
  status: string;
  homeGoals: number | null;
  awayGoals: number | null;
}

export interface Prediction {
  id: number;
  matchId: number;
  market: string;
  outcome: string;
  trueProbability: number;
  impliedProbability: number;
  expectedValue: number;
  bestOdd: number;
  bookmaker: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  aiAnalysis: string | null;
  aiModel: string | null;
  createdAt: string;
  match?: Match;
}

export interface Alert {
  id: number;
  sentAt: string;
  chatId: string;
  match: Match;
  prediction: Prediction;
}

export interface DashboardStats {
  totalMatches: number;
  totalPredictions: number;
  totalAlerts: number;
  topBets: Prediction[];
}
