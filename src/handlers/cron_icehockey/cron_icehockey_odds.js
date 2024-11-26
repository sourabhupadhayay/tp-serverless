// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import { returnError, returnSuccess } from "../../libs/returnHandler";
import axios from "axios";
import { url_cron_icehockey_odds } from "../../libs/consts";

async function cron_icehockey_odds(event, context) {
  try {
    // return returnSuccess(200, {});
    var res = await axios.get(url_cron_icehockey_odds);
    console.log(res.data);
    return returnSuccess(200, res.data);
  } catch (e) {
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(cron_icehockey_odds);
