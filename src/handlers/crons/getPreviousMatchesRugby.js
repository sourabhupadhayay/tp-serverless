// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import getSQLQuery from "../../libs/getSQLQuery";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import db from "../../libs/db";
import moment from "moment";

async function getPreviousMatchesRugby(event, context) {
  try {
    var select_query = getSQLQuery([1009]);
    var result = await db.query(select_query, []);
    var created_date = moment().format('YYYY-MM-DD HH:mm:ss');
    if(result.length != 0){
      var season_id     = result[0].season_id
      var query         = getSQLQuery([1010, 4000, 4001])
      var result        = await db.query(query, [season_id, season_id, season_id]);

      var league_id = result[0][0].league_id;
      var home_team = result[0][0].home;
      var away_team = result[0][0].away;
      var select_query = getSQLQuery([1011, 1011, 1012, 1012]);

      var result  = await db.query(select_query, [
          league_id, home_team, season_id,
          league_id, away_team, season_id,
          league_id, home_team, season_id,
          league_id, away_team, season_id,
        ]
      );
      var arr = [];
      if(result.length != 0){
        for(var i = 0; i < result.length; i++){
          for(var j = 0; j < result[i].length; j++){
            var row           = result[i][j];
            var match_result  = JSON.parse(row.match_result);
            var home_score    = match_result.home_score != undefined ? match_result.home_score : 0;
            var away_score    = match_result.away_score != undefined ? match_result.away_score : 0;
            
            if(i == 0 || i == 1){
              var type = 'home';
              var target_team_id = row.home;
            }else{
              var type = 'away';
              var target_team_id = row.away;
            }
            var array = [season_id, type, target_team_id, row.league_feed_id, 'REG', moment(row.scheduled_date_time).format('YYYY-MM-DD'), row.home, row.home_name, home_score, row.away, row.away_name, away_score, created_date]
            arr.push(array);
          }
        }
        if(arr.length != 0){
          var insert_query = `INSERT INTO season_previous_matches (season_id, home_away, target_team_id, league_feed_id, match_type, match_date, team1_id, team1_name, team1_score, team2_id, team2_name, team2_score, created_date) VALUES ?`;
          var result = await db.query(insert_query, [arr]);
          return returnSuccess(200, { });
        }
      }
    }else{
      return returnSuccess(200, { });
    }
  } catch (e) {
    console.log(e);
    db.quit();
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(getPreviousMatchesRugby);