// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import db from "../../libs/db";
import moment from "moment";
const query_update_last_check = `UPDATE contests SET fam_last_check = ? WHERE contest_id = ?;`;
const query_contest_all_matches_finished = `UPDATE contests SET finished_all_matches = 1, fam_last_check = ? WHERE contest_id = ?;`;
async function cron_contest_finishedAllMatches(event, context) {
  try {
    const current_datetime = moment.utc().format("YYYY-MM-DD HH:mm:ss");
    let query = `SELECT contest_id, status
    FROM contests 
    where finished_all_matches = 0 
    order by fam_last_check
     LIMIT 2`;
    let contest_rows = await db.query(query);
    if (contest_rows && contest_rows.length > 0) {
      // check if this contest has all matches finished
      console.log("Check", contest_rows);
      for (let i = 0; i < contest_rows.length; i++) {
        const contest_row = contest_rows[i];
        const contest_id = contest_row.contest_id;
        const contest_status = contest_row.status;
        if (contest_status == "4") {
          await db.query(query_contest_all_matches_finished, [
            current_datetime,
            contest_id,
          ]);
          continue;
        }
        let query_seasons = `SELECT * 
        FROM contest_opt_matches COM
        RIGHT JOIN seasons S ON S.season_id = COM.season_id AND status NOT IN ('FT','Postp.')
        AND S.season_id IS NOT NULL
        WHERE COM.contest_id = ?`;
        let seasons_finished = await db.query(query_seasons, [contest_id]);
        if (seasons_finished.length == 0) {
          console.log("All matches finished", contest_id);
          await db.query(query_contest_all_matches_finished, [
            current_datetime,
            contest_id,
          ]);
        } else {
          console.log("Last update ", contest_id);
          await db.query(query_update_last_check, [
            current_datetime,
            contest_id,
          ]);
        }
      }
      db.quit();
      return returnSuccess(200, "Checked" + JSON.stringify(contest_rows));
    } else {
      db.quit();
      return returnSuccess(200, "No contests");
    }
  } catch (e) {
    db.quit();
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(cron_contest_finishedAllMatches);
