const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const { Pool } = require("pg");
const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "studenti",
  password: "admin",
  port: 5432,
});

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const addStudents = () => {
  fs.readFile("mailovi.txt", "utf8", (err, data) => {
    data = data
      .split(",")
      .map(
        (name) =>
          `('${name.split("@")[0]}', ${Math.floor(Math.random() * 100 + 1)})`
      )
      .join(",\n");
    const sql = "INSERT INTO STUDENTI (username, broj) VALUES " + data;
    pool.query(sql);
  });
};

app.post("/pokusaj", async (req, res) => {
  const username = req.query.username;
  const number = req.body.broj;

  if (!username || !number) res.status(400).send("Neki parametri nedostaju!");
  else if (typeof number !== "number")
    res.status(400).send("Broj nije adekvatnog tipa!");
  else if (number < 1 || number > 100)
    res.status(400).send("Broj nije u ispravnom intervalu!");
  else {
    const { rows }  = await pool.query("SELECT * FROM studenti WHERE username = $1", [
      username,
    ]);
   
    let poruka = "";
    if (!rows || rows.length === 0) res.status(400).send("Neispravan username!");
    else if (rows[0].broj > number) poruka = "Broj je veći od pokušaja.";
    else if (rows[0].broj < number) poruka = "Broj je manji od pokušaja.";
    else {
      const res = await pool.query(
        "UPDATE studenti SET broj = $2 WHERE username = $1",
        [username, Math.floor(Math.random() * 100 + 1)]
      );
      console.log(res);
      poruka = "Pogodak! Novi broj je generisan.";
    }

    res.send({
      poruka,
      vasPokusaj: number,
      vrijemePokusaja: {
        sat: new Date().getHours(),
        minut: new Date().getMinutes(),
        sekund: new Date().getSeconds(),
      },
    });
  }
});

app.listen(PORT, async () => {
  // ako je potrebno generisati is txt fajla
  // addStudents();
  console.log(`Listening on port: ${PORT}`);
});
