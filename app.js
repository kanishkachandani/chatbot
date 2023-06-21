const express = require("express");
const app = express();
const bodyParser = require("body-parser");
let ejs = require("ejs");
const { response } = require("express");
var connection = require("./database");
const _ = require("lodash");
app.use(express.static("styles"));

var question_chat = [];
var reply_chat = [];
var check;
var lowerCaseQuestionChat;
var lowerCaseResultQuestion;
var value = 0;
var lastId;
var noReplyQuestion;
var text;
var reply1;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("chatbox", {
    question_chat: question_chat,
    reply_chat: reply_chat,
    value: value,
    check: check,
  });
});

app.post("/", function (req, res) {
  question_chat.push(req.body.text);
  lowerCaseQuestionChat = _.lowerCase(question_chat[question_chat.length - 1]);

  let sql1 =
    "select reply from all_replies where question='" +
    lowerCaseQuestionChat +
    "'";
  let sql2 = "select * from all_replies";
  let sql3 = " SELECT * FROM replies.all_replies ORDER BY ID DESC LIMIT 1;";
  let sql4 =
    "insert into all_replies values(" +
    lastId +
    ",'" +
    noReplyQuestion +
    "','" +
    reply1 +
    "')";

  connection.query(sql2, function (err, result) {
    if (err) throw err;

    for (var i = 0; i < result.length; i++) {
      lowerCaseResultQuestion = _.lowerCase(result[i].question);

      if (lowerCaseResultQuestion == lowerCaseQuestionChat) {
        check = 1;
        break;
      } else {
        check = 0;
      }
    }

    if (check === 1) {
      connection.query(sql1, function (err, result) {
        if (err) throw err;

        reply_chat.push(result[result.length - 1].reply);

        console.log(result[result.length - 1].reply);
      });
    } else {
      //storing reply
      text = lowerCaseQuestionChat;
      const array = text.split(" ");

      if (array[0] === "reply") {
        reply_chat.push("Thank you!");
        array.shift();
        reply1 = array.join(" ");
        connection.query(
          "insert into all_replies values(" +
            lastId +
            ",'" +
            noReplyQuestion +
            "','" +
            array.join(" ") +
            "')",
          function (err, result) {
            if (err) throw err;
          }
        );
      } else if (lowerCaseQuestionChat === "yes") {
        //id,reply
        reply_chat.push(
          "PLease Provide me the reply in this FORMAT:-   reply = < your reply >"
        );

        connection.query(sql3, function (err, result) {
          if (err) throw err;
          lastId = result[0].id;
          lastId = lastId + 1;
        });
      } else {
        // question
        reply_chat.push(
          "Sorry, I dont have a reply to this, Do you have a reply to this?"
        );
        noReplyQuestion = lowerCaseQuestionChat;
      }
      console.log(lastId);
      console.log(noReplyQuestion);

      console.log("sorry");
    }
    console.log(reply1);
    return check;
  });

  res.redirect("/");
});

app.listen(3006, function () {
  console.log("the server has been started");
  connection.connect(function (err) {
    if (err) throw err;
    console.log("connected");
  });
});
