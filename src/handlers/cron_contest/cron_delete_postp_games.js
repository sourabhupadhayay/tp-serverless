// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import getSQLQuery from "../../libs/getSQLQuery";
import db from "../../libs/db";

async function cron_delete_postp_games(event, context) {
  try {
    const select_query = getSQLQuery(["1004"]);
    var seasons_data = await db.query(select_query, []);
    var seasons_id   = [];
    if(seasons_data.length != 0){
      for(var i = 0; i < seasons_data.length; i++){
        seasons_id.push(seasons_data[i].season_id)
      }
      console.log('Postp. games for remove ', seasons_id);
      const delete_query = `
        -- 0
        DELETE FROM contest_opt_matches WHERE season_id IN ( ${seasons_id.join()} );
        -- 1
        DELETE FROM contest_user_predictions WHERE season_id IN ( ${seasons_id.join()} );
        -- 2
        UPDATE seasons SET checked_postp = 1 WHERE season_id IN (${seasons_id.join()});`
        await db.query(delete_query, []);
        return returnSuccess(200, 'Removed postp. games');
    }else{
      return returnSuccess(200,'Dont have postp. game');
    }
  } catch (e) {
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(cron_delete_postp_games);