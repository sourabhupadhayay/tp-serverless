var mysql = require("mysql");
var moment = require("moment");
// Local
var db_prod_old, db_prod_new;
var host = "top-predictor-rd.ckdx4emier8u.eu-west-2.rds.amazonaws.com";
var host_new = "toppredictor-prod.covxq2xvjlzp.eu-west-1.rds.amazonaws.com";
var database = "toppredictorrd";
var database_new = "toppredictor_prod";
var username = "admin";
var username_new = "admin";
var password = "CQ6QJbfHz1RGpp8SvdHp";
var password_new = "QghsVnWv6BJCn4HMBwSAQKkVYyNQ5Z";

function formatDate(date) {
  if (date) {
    return moment(date).format("YYYY-MM-DD");
  } else {
    return "0000-00-00";
  }
}
function formatDateTime(date) {
  if (date) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
  } else {
    return "0000-00-00 00:00:00";
  }
}

function check_null(data) {
  if (data == null || data == "null") {
    return null;
  } else {
    return `'${data}'`;
  }
}

try {
  db_prod_old = mysql.createConnection({
    host: host,
    user: username,
    password: password,
    database: database,
    multipleStatements: true,
  });

  db_prod_new = mysql.createConnection({
    host: host_new,
    user: username_new,
    password: password_new,
    database: database_new,
    multipleStatements: true,
  });

  setInterval(insert_users, 5000);
} catch (error) {
  console.log(error);
}

function insert_users() {
  let var_last_user_id = 0;
  db_prod_new.query(
    "SELECT user_id FROM users ORDER BY user_id DESC LIMIT 1",
    (err, result) => {
      if (err) {
        console.log(err);
        return false;
      }
      if (result && result.length > 0) {
        var_last_user_id = result[0].user_id;
      }
      db_prod_old.query(
        "SELECT * FROM users WHERE user_id > ? LIMIT 10",
        [var_last_user_id],
        (err, result_old_users) => {
          if (err) {
            console.log(err);
            return false;
          }
          console.log("Next User", var_last_user_id);
          let insert_users_to_new_db = "";
          if (result_old_users && result_old_users.length) {
            for (let i = 0; i < result_old_users.length; i++) {
              const row_element = result_old_users[i];
              console.log("Insert user", row_element.user_id);
              insert_users_to_new_db += `INSERT INTO users VALUES (
                  ${row_element.user_id},
                  '${row_element.user_unique_id}',
                  '${row_element.first_name}',
                  '${row_element.last_name}',
                  ${check_null(row_element.user_name)},
                  ${check_null(row_element.email)},
                  ${check_null(row_element.password)},
                  ${row_element.balance},
                  ${row_element.winning_balance},
                  '${formatDate(row_element.dob)}',
                  '${row_element.gender}',
                  ${check_null(row_element.facebook_id)},
                  ${check_null(row_element.twitter_id)},
                  ${check_null(row_element.google_id)},
                  ${check_null(row_element.phone_no)},
                  ${row_element.master_country_id},
                  ${row_element.master_state_id},
                  ${check_null(row_element.address1)},
                  ${check_null(row_element.address2)},
                  ${check_null(row_element.city)},
                  ${check_null(row_element.zip_code)},
                  ${check_null(row_element.image)},
                  '${row_element.language}',
                  ${row_element.status},
                  ${row_element.kyc_status},
                  '${row_element.status_reason}',
                  '${formatDateTime(row_element.revoke_time)}',
                  ${check_null(row_element.new_password_key)},
                  '${formatDateTime(row_element.new_password_requested)}',
                  '${formatDateTime(row_element.last_login)}',
                  '${row_element.last_ip}',
                  '${formatDateTime(row_element.added_date)}',
                  '${formatDateTime(row_element.modified_date)}',
                  ${row_element.opt_in_email},
                  ${row_element.free_game_points},
                  ${row_element.paid_game_points},
                    -- document_image, passport_image, utility_bills, bank_statment_image
                    null,null,null,null,
                    -- otp_code_attempts
                    0,
                    -- otp_code_request
                    '0000-00-00',
                    -- otp_code
                    '',
                    -- is_clubadmin
                    0,
                    -- organisation_name
                    '',
                    -- bankaccount_name
                    '',
                    -- bankaccount_sortcode
                    '',
                    -- bankaccount_number
                    ''
                );
                `;
            }
            // console.log(insert_users_to_new_db);
          }
          if (insert_users_to_new_db) {
            db_prod_new.query(insert_users_to_new_db, (err, result) => {
              if (err) {
                console.log(err);
                return false;
              } else {
                console.log("New userns insedted");
              }
            });
          }
        }
      );
    }
  );
}
// db_prod_new.quit();
// db_prod_old.quit();
