// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import axios from "axios";
import { url_cron_football_leagues } from "../../libs/consts";

async function cron_football_leagues(event, context) {
  try {
    var res = await axios.get(url_cron_football_leagues);
    console.log(res.data);
    return returnSuccess(200, res.data);
  } catch (e) {
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(cron_football_leagues);
