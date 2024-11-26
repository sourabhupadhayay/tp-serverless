// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import getSQLQuery from "../../libs/getSQLQuery";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import db from "../../libs/db";
import moment from "moment";

async function cron_check_contest(event, context) {
  try {
    var current_date = moment().format('YYYY-MM-DD HH:mm:ss');
    const select_query  = `
    SELECT 				C.contest_uid, T.joined_user, C.contest_id, C.start_at, C.entry_fee, T.user_id, C.contest_name
    FROM 				  toppredictor_test.contests C
    LEFT JOIN			(
      SELECT COUNT(contest_user_id) AS joined_user, contest_id, user_id
        FROM contest_users
        GROUP BY contest_id
    ) AS T ON T.contest_id = C.contest_id
    WHERE				(C.status = 2 OR C.status = 1)
    AND					T.joined_user = 1
    AND					C.entry_fee <> 0
    AND					C.start_at < '`+current_date+`';`
    var contest_data    = await db.query(select_query, []);
    var query = '';
    var data  = [];
    for(var i = 0; i < contest_data.length; i++){
      var row         = contest_data[i];
      var user_id     = row.user_id;
      var entry_fee   = Number(row.entry_fee);
      var contest_id  = row.contest_id
      var description = 'Money returned on cancellation of the contest '+ row.contest_name;
      query   += getSQLQuery([3008, 3002, 2001]);
      data.push(4, contest_id, entry_fee, user_id, 4, user_id, contest_id, description, 2, entry_fee, entry_fee, current_date, 1)
    }
    if(contest_data.length){
      var result = await db.query(query, data);
    }
    return returnSuccess(200, { });
  } catch (e) {
    console.log(e);
    db.quit();
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(cron_check_contest);
