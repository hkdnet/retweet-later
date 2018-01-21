import * as moment from "moment";
import * as express from "express";
import * as dotenv from "dotenv";
dotenv.config();
const app = express();
import * as bodyParser from "body-parser";
import { Booking } from "../common/types";
import * as mysql from "mysql";
const connection = mysql.createConnection({
  host: "db",
  user: "root",
  password: "password",
  database: "retweet_later"
});
connection.connect();
import Twitter from './twitter'

const status = {
  FAILED: -1,
  WAITING: 0,
  COMPLETE: 1
};
Object.freeze(status);

interface BookingRecord {
  id: number;
  url: string;
  scheduled_at: Date;
  status: number;
}

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/bookings", function(req, res) {
  const query = "INSERT INTO bookings SET ?";
  const options = {
    url: req.body.url,
    scheduled_at: req.body.scheduled_at,
    status: status.WAITING
  };
  connection.query(query, options, function(error, results, fields) {
    if (error) throw error;
    res.redirect("/success.html");
  });
});

const formatBooking = function(booking: BookingRecord): Booking {
  const statusIdx = Object.values(status).indexOf(booking.status);
  return {
    id: booking.id,
    url: booking.url,
    scheduled_at: moment(booking.scheduled_at).format("YYYY/MM/DD HH:mm:SS"),
    status: Object.keys(status)[statusIdx]
  };
};

app.get("/bookings", function(req, res) {
  const query = "SELECT * FROM bookings ORDER BY `scheduled_at` ASC LIMIT 100;";
  connection.query(query, function(error, results, fields) {
    if (error) throw error;
    res.json(results.map(formatBooking));
  });
});

app.post("/retweet/:id", function(req, res) {
  const t = new Twitter({
    consumer_key: process.env.CONSUMER_KEY || '',
    consumer_secret: process.env.CONSUMER_SECRET || '',
    access_token: process.env.ACCESS_TOKEN || '',
    access_token_secret: process.env.ACCESS_TOKEN_SECRET || '',
  });
  t.retweet(req.params.id, function(err, data, response) {
    if (err) {
      // TODO: 400?
      return res.status(500).json(err)
    }
    return res.json({message: 'success'})
  })
});

app.listen(3000, function() {
  console.log("Example app listening on port 3000!");
});
