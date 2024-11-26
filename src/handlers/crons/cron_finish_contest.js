// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import getSQLQuery from "../../libs/getSQLQuery";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import db from "../../libs/db";

async function cron_finish_contest(event, context) {
  try {
    const select_query  = getSQLQuery(["1007"]);
    var contest_data    = await db.query(select_query, []);
    var contest_ids = [];
    for(var i = 0; i < contest_data.length; i++){
      var row = contest_data[i];
      contest_ids.push(row.contest_id)
    }

    if(contest_ids.length != 0){
      var query = `UPDATE contests SET status = ? WHERE contest_id IN (`+contest_ids.join()+`)`
      await db.query(query, [5]);
      return returnSuccess(200, { });
    }else{
      return returnSuccess(200, { });
    }
  } catch (e) {
    console.log(e);
    db.quit();
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(cron_finish_contest);
