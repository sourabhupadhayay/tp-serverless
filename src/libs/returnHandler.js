import db from "../libs/db";
import getSQLQuery from "../libs/getSQLQuery";
import sendGrid from "@sendgrid/mail";
import crypto from "crypto";
const algorithm = "aes-128-cbc";
const secretKey = "e5d284b6015067eaa11e06b809fe6f13";

const activity_log = async (vars) => {
  const { event, context } = vars;
  if (event) {
    console.log("headers", event.headers);
    console.log("body", event.body);
    console.log("queryStringParameters", event.queryStringParameters);
    console.log("pathParameters", event.pathParameters);
  }
  if (context) {
    console.log(context);
  }
};

const errorGetMessage = async (code, language = "en") => {
  //DB
  return "No Message - not implemented";
  var message = await db.query(getSQLQuery([1059]), [code]);
  if (message && message.length > 0) {
    // console.log(message);
    return message[0]["message_" + language];
  } else {
    return "No message";
  }
};

const successGetMessage = async (code, language = "en") => {
  //DB
  var message = await db.query(getSQLQuery([1060]), [code]);
  if (message && message.length > 0) {
    return message[0]["message_" + language];
  } else {
    return "No message";
  }
};

const returnError = async (
  statusCode,
  messageCode,
  mode,
  language = "en",
  headers = null
) => {
  var message = "";
  if (mode == "c") {
    message = await errorGetMessage(messageCode, language);
  } else {
    let errorrawmessage = messageCode;
    console.error("Error Message ", messageCode);
    messageCode = JSON.stringify(messageCode);
    messageCode = 1035;
    message = await errorGetMessage(messageCode, language);
    message += errorrawmessage;
  }
  return {
    statusCode,
    body: JSON.stringify({
      error: {
        code: messageCode,
        message,
      },
    }),
    headers,
  };
};

const returnSuccess = (statusCode, data = null, headers = null) => {
  try {
    let body = "";
    if (headers && headers["Content-Type"] == "text/html") {
      body = data;
    } else {
      body = data == null ? null : JSON.stringify(data);
    }
    let headers1 = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Credentials": "*",
      "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
      // "Access-Control-Allow-Methods": "*",
    };
    let headers_3 = Object.assign(headers1, headers);
    console.log(statusCode, body, headers_3);
    return { statusCode, headers: headers_3, body };
  } catch (e) {
    console.error(e);
    return returnError(400, e.message, "m");
  }
};

const sendMmail = async (vars) => {
  sendGrid.setApiKey(process.env.send_grid_secret_key);
  const msg = {
    to: vars.to,
    from: "info@toppredictor.com",
    subject: "TOP PREDICTOR - " + vars.subject,
    html: vars.message,
  };

  (async () => {
    try {
      await sendGrid.send(msg);
    } catch (error) {
      console.error(error);
    }
  })();
};

const encrypt_decrypt_data = async (vars) => {
  var data = vars.data;
  var to_encrypt = vars.to_encrypt;

  var encrypted_keys = [
    "first_name",
    "last_name",
    "user_name",
    "city",
    "zip_code",
    "address1",
    "address2",
    "phone_no",
    "email",
  ];
  for (const [key, value] of Object.entries(data)) {
    if (encrypted_keys.includes(key)) {
      if (to_encrypt) {
        data[key] = value ? encrypt(value) : value;
      } else {
        data[key] = value ? decrypt(value) : value;
      }
    }
  }
  return data;
};

const encrypt = async (value) => {
  const iv = hex2bin(secretKey);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);

  return encrypted.toString("hex");
};
const decrypt = async (value) => {
  const iv = secretKey;
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, "hex")
  );
  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(value, "hex")),
    decipher.final(),
  ]);
  return decrpyted.toString();
};
const hex2bin = (hex) => {
  return parseInt(hex, 16).toString(2).padStart(8, "0");
};

export {
  errorGetMessage,
  successGetMessage,
  returnError,
  returnSuccess,
  sendMmail,
  encrypt_decrypt_data,
  activity_log,
};
