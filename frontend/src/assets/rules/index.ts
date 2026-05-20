import nfl from './nfl.json';
import ncaa from './ncaa.json';
import nba from './nba.json';
import mlb from './mlb.json';
import nhl from './nhl.json';
import soccer from './mls.json';

export const rulebooks: Record<string, any> = {
  nfl,
  ncaa,
  nba,
  mlb,
  nhl,
  soccer,
};

export type Sport = keyof typeof rulebooks;
