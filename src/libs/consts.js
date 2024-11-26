// Contest
export const url_cron_contest_live = process.env.cron_url + "/crons/cron/contest_live";
export const url_cron_contest_cancellation = process.env.cron_url + "/crons/cron/contest_cancellation";
export const url_cron_contest_clear_user_blackout_time = process.env.cron_url + "/crons/cron/clear_user_blackout_time";
export const url_cron_contest_winner = process.env.cron_url + "/crons/cron/contest_winner";
export const url_cron_contest_predictions_results = process.env.cron_url + "/crons/contest_user_predictions/update_result";
export const url_cron_user_points = process.env.cron_url + "/crons/contest_user/update_result";
export const url_send_email = process.env.cron_url + "/api/feedback/send_email";
export const url_get_user = process.env.cron_url + "/api/my_profile/my_profile";
export const url_cron_golf_user_points = process.env.cron_url + "/crons/contest_user/golf_update_result";
export const url_cron_golf_contest_winner = process.env.cron_url + "/crons/cron/golf_contest_winner";
/* 
  Soccer
  */
export const url_cron_soccer_leagues =
  process.env.cron_url + "/crons/soccer/goalserve/get_all_leagues";
export const url_cron_soccer_leagues_results =
  process.env.cron_url +
  "/crons/general/goalserve/get_league_results?sport_slug=soccer";
export const url_cron_soccer_odds_settelments =
  process.env.cron_url + "/crons/odds_settelments/soccer";
export const url_cron_soccer_tasks =
  process.env.cron_url + "/crons/background_process_sports/get_soccer_task";
export const url_cron_soccer_h2h =
  process.env.cron_url + "/crons/soccer/goalserve/get_h2h_matches";
export const url_cron_soccer_news_injury =
  process.env.cron_url + "/crons/soccer/goalserve/get_injury_news_stats";
export const url_cron_soccer_playing_squads =
  process.env.cron_url + "/crons/soccer/goalserve/get_playing_squad";
/* 
  Cricket
  */
export const url_cron_cricket_leagues =
  process.env.cron_url + "/crons/cricket/goalserve/get_all_leagues";
export const url_cron_cricket_team =
  process.env.cron_url + "/crons/cricket/goalserve/get_league_teams";
export const url_cron_cricket_results =
  process.env.cron_url +
  "/crons/general/goalserve/get_league_results?sport_slug=cricket";
export const url_cron_cricket_tasks =
  process.env.cron_url + "/crons/background_process_sports/get_cricket_task";
export const url_cron_cricket_odds =
  process.env.cron_url + "/crons/odds_settelments/cricket";
// Ice Hockey
export const url_cron_icehockey_leagues =
  process.env.cron_url + "/crons/icehockey/goalserve/get_all_leagues";
export const url_cron_icehockey_results =
  process.env.cron_url +
  "/crons/general/goalserve/get_league_results?sport_slug=icehockey";
export const url_cron_icehockey_tasks =
  process.env.cron_url + "/crons/background_process_sports/get_icehockey_task";
export const url_cron_icehockey_tasks_v2 =
  process.env.cron_url +
  "/crons/background_process_sports/get_icehockey_task_v2";
export const url_cron_icehockey_odds =
  process.env.cron_url + "/crons/odds_settelments/icehockey";
export const url_cron_icehockey_injuries_proccess =
  process.env.cron_url +
  "/crons/icehockey/goalserve/add_teams_in_bacground_proccess";
export const url_cron_icehockey_get_injuries =
  process.env.cron_url + "/crons/icehockey/goalserve/get_injury_news_stats";
// Fotball
export const url_cron_football_leagues =
  process.env.cron_url + "/crons/nfl/goalserve/get_all_leagues";
export const url_cron_football_tasks =
  process.env.cron_url + "/crons/background_process_sports/get_nfl_task";
export const url_cron_football_results =
  process.env.cron_url +
  "/crons/general/goalserve/get_league_results?sport_slug=football";
export const url_cron_football_odds =
  process.env.cron_url + "/crons/odds_settelments/nfl";
// Basketball
export const url_cron_basketball_leagues =
  process.env.cron_url + "/crons/basketball/goalserve/get_all_leagues";
export const url_cron_basketball_results =
  process.env.cron_url +
  "/crons/general/goalserve/get_league_results?sport_slug=basketball";
export const url_cron_basketball_tasks =
  process.env.cron_url + "/crons/background_process_sports/get_basketball_task";
export const url_cron_basketball_set_odds =
  process.env.cron_url + "/crons/background_process_sports/set_odds_per_match";
export const url_cron_basketball_odds =
  process.env.cron_url + "/crons/odds_settelments/basketball";
export const url_cron_basketball_injuries_proccess =
  process.env.cron_url +
  "/crons/basketball/goalserve/add_teams_in_bacground_proccess";
export const url_cron_basketball_get_injuries =
  process.env.cron_url + "/crons/basketball/goalserve/get_injury_news_stats";
// Rugby
export const url_cron_rugby_leagues =
  process.env.cron_url + "/crons/rugbyleague/goalserve/get_all_leagues";
export const url_cron_rugby_results =
  process.env.cron_url +
  "/crons/general/goalserve/get_league_results?sport_slug=rugby";
export const url_cron_rugby_tasks =
  process.env.cron_url +
  "/crons/background_process_sports/get_rugbyleague_task";
export const url_cron_rugby_odds =
  process.env.cron_url + "/crons/odds_settelments/rugbyleague";
export const url_cron_rugby_tasks_v2 = process.env.cron_url + "/crons/background_process_sports/get_rugbyleague_task_v2";

/*  Australian Rules */
export const url_cron_australianrules_leagues = process.env.cron_url + "/crons/australianrules/goalserve/get_all_leagues";
export const url_cron_australianrules_leagues_results = process.env.cron_url +"/crons/general/goalserve/get_league_results?sport_slug=australianrules";
export const url_cron_australianrules_OS = process.env.cron_url + "/crons/odds_settelments/australianrules";
export const url_cron_australianrules_tasks = process.env.cron_url + "/crons/background_process_sports/get_australianrules_task";
/* Golf */
export const url_cron_golf_tour             = process.env.cron_url + "/crons/golf/goalserve/get_all_tour";
export const url_cron_golf_tasks            = process.env.cron_url + "/crons/background_process_sports/get_golf_task";
export const url_cron_golf_players          = process.env.cron_url + "/crons/background_process_sports/get_golf_players_by_tour";
export const url_cron_golf_live_tournaments = process.env.cron_url + "/crons/golf/goalserve/get_live_golf_tournaments";