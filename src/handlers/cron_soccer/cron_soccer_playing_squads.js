// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import axios from "axios";
import { url_cron_soccer_playing_squads } from "../../libs/consts";

async function cron_soccer_playing_squads(event, context) {
  try {
    var res = await axios.get(url_cron_soccer_playing_squads);
    console.log(res.data);
    return returnSuccess(200, res.data);
  } catch (e) {
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(cron_soccer_playing_squads);