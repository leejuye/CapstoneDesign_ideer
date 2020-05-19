"use strict";
const NodeHelper = require("node_helper");
const dbHelper = require("../../db_helper");
let express = require("express");
let app = express();
let sessionParser = require("express-session");
let router = express.Router();

app.use(sessionParser({
	secret: "yunjin0925",
	resave: true,
	saveUninitialized: true
}));

app.use("/", router);

router.route("/confirmSession").get(function (req, res) {
	console.log("세션을 확인해보자!!");
	let msg = "세션이 존재하지 않습니다.";
	if (req.session.user) {
		msg = `${req.session.user.name}님의 나이는 ${req.session.user.age}살 입니다. 세션의 생성된 시간 : ${req.session.user.createCurTime}`;
	}

	res.send(msg);

});

module.exports = NodeHelper.create({
	dbConn: async function(qry) {
		var conn, results;
		try{
			conn = await dbHelper.getConnection();
			results = await conn.query(qry);
		} catch(err) {
			throw err;
		} finally {
			if(conn) {conn.end();}
			return new Promise(function(resolve, reject){
				resolve(results[0]);
			});
		}
	},

	getUser: async function(payload) {
		const user = await this.dbConn("select * from users where name = '"+payload+"'");
		return user;
	},

	createUser: async function(payload) {
		await this.dbConn("insert into users (name) value ('"+payload+"')");
	},

	signInUser: function(userId) {
		router.route("/").get(function (req, res) {
			console.log("루트접속");

			if(req.session.user){
				console.log("세션이 이미 존재합니다.");
			}else{
				req.session.user = {
					"id" : userId,
				};
				console.log("세션 저장 완료! ");
			}
			res.redirect("/confirmSession");
		});
	},
	logoutUser: function() {
		router.route("/destroySession").get(function(req,res){
			req.session.destroy();
			console.log("session을 삭제하였습니다.");
			res.redirect("/confirmSession");
		});
	},

	socketNotificationReceived: function(notification, payload) {
		if(notification === "CHECK_USER") {
			var user = this.getUser(payload);
			if(user) {
				this.sendSocketNotification("ALREADY_EXIST");
			} else {
				this.createUser(payload);
				user = this.getUser(payload);
				this.signInUser(user.id);
			}
		} else if (notification === "SIGN_IN") {
			user = this.getUser(payload);
			this.signInUser(user.id);
		}
	}

});
