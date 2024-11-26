// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import axios from "axios";
import { url_cron_cricket_team } from "../../libs/consts";

async function cron_cricket_teams(event, context) {
  try {
    var res = await axios.get(url_cron_cricket_team);
    console.log(res.data);
    return returnSuccess(200, res.data);
  } catch (e) {
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(cron_cricket_teams);
