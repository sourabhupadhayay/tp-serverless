// Local Libs
import commonMiddelware from "../../libs/commonMiddleware";
import { returnError, returnSuccess } from "../../libs/returnHandler";

async function hexapay_iframe(event, context) {
  try {
    console.log(event.body);
    console.log(event.headers);
    const { token } = event.pathParameters;
    let html =
      `<!DOCTYPE html>
      <html>
        <head>
          <title> Hexapay for Top Predictor </title>
          <script type="text/javascript" src="https://js.hexopay.com/begateway-1-latest.min.js"></script>
          <style>
            .payment-page {
              padding-top:10px;
            }
          </style>
        </head>
        <body style="width: 70%; margin: 10px auto;">
          <!-- <h1> Test shop</h1>
          <p> Product Name of something ...  </p>
          <a href="#" id="paymentLink">Buy it</a> -->
          <script type="text/javascript">
            var options = {
              type: "inline",
              id: "paymentForm",
              url: "https://paymentpage.hexopay.com/v2/checkout?token=` +
      token +
      `",
                style: "",
                size: { width: 320, height: 650 }
              };
              var pf = new BeGateway(options);
              pf.buildForm();
            </script>
            
            </body>
      </html>`;
    let headers = {
      "Content-Type": "text/html",
    };
    return returnSuccess(200, html, headers);
  } catch (e) {
    return returnError(400, e, "m");
  }
}
export const handler = commonMiddelware(hexapay_iframe);
