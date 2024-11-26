import moment from "moment";
// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import getSQLQuery from "../../libs/getSQLQuery";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import db from "../../libs/db";

async function insertPreviousMatchesTask(event, context) {
  try {
    var current_date = moment().unix();
    var currentDt = moment().format('YYYY-MM-DD HH:mm');
    var plus15days = moment().add(15, 'days').format('YYYY-MM-DD HH:mm');
    var query = `
      SELECT          * 
      FROM            seasons S
      LEFT JOIN       leagues L
        ON            L.league_id = S.league_id
      WHERE           (L.sport_id = 18 OR L.sport_id = 5)
      AND             S.status <> 'FT'
      AND             S.status <> 'Postp.'
      AND				      S.status <> 'Finished'
      AND				      S.status <> 'After Extra Time'
      AND				      scheduled_date_time >= '${currentDt}'
      AND				      scheduled_date_time <= '${plus15days}' `

    var result = await db.query(query, []);
    var inserted_array = [];
    if(result.length != 0){
      for(var i = 0; i < result.length; i++){
        var row = result[i]
        inserted_array.push([row.season_id, current_date])
      }

      var insert_query = `INSERT INTO background_process_previous_matches (season_id, created_dt) VALUES ?`
      var result = await db.query(insert_query, [inserted_array]);
      return returnSuccess(200, { });
    }
  } catch (e) {
    console.log(e);
    db.quit();
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(insertPreviousMatchesTask);
