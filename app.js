const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("server running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDBAndServer();

//API 1: Returns a list of all the players in the player table
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `SELECT * FROM player_details;`;
  const allPlayersArray = await db.all(getAllPlayersQuery);
  response.send(
    allPlayersArray.map((eachPlayer) => {
      return {
        playerId: eachPlayer.player_id,
        playerName: eachPlayer.player_name,
      };
    })
  );
});

//API 2:Returns a specific player based on the player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const playerDetails = await db.get(getPlayerQuery);
  response.send({
    playerId: playerDetails.player_id,
    playerName: playerDetails.player_name,
  });
});
