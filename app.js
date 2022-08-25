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
    console.log(process.env.PORT)
    app.listen(process.env.PORT || 3000, () =>
      console.log("server running at http://localhost:3001/")
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

//API 3: Updates the details of a specific player based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
UPDATE player_details
SET
player_name = "${playerName}"
WHERE player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 4: Returns the match details of a specific match
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const matchDetails = await db.get(getMatchDetailsQuery);
  const { match_id, match, year } = matchDetails;
  response.send({
    matchId: match_id,
    match: match,
    year: year,
  });
});

//API 5: Returns a list of all the matches of a player
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
  SELECT * FROM player_match_score 
  INNER JOIN match_details
ON player_match_score.match_id = match_details.match_id
WHERE player_id = ${playerId};`;
  const playerMatchesArray = await db.all(getPlayerMatchesQuery);
  response.send(
    playerMatchesArray.map((eachMatch) => ({
      matchId: eachMatch.match_id,
      match: eachMatch.match,
      year: eachMatch.year,
    }))
  );
});

//API 6: Returns a list of players of a specific match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
  SELECT * FROM player_match_score 
  INNER JOIN player_details
ON player_match_score.player_id = player_details.player_id
WHERE player_match_score.match_id = ${matchId};`;
  const matchPlayersArray = await db.all(getMatchPlayersQuery);
  response.send(
    matchPlayersArray.map((eachMatch) => ({
      playerId: eachMatch.player_id,
      playerName: eachMatch.player_name,
    }))
  );
});

//API 7: Returns the statistics of the total score, fours, sixes of a specific player based on the player ID
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playerStatsQuery = `SELECT player_details.player_id AS player_id, player_name, SUM(score) AS totalScore, sum(fours) AS totalFours,
SUM(sixes) AS totalSixes FROM player_details 
 INNER JOIN  player_match_score ON player_match_score.player_id = player_details.player_id
 WHERE player_details.player_id = ${playerId};`;
  const playerStats = await db.get(playerStatsQuery);
  response.send({
    playerId: playerStats.player_id,
    playerName: playerStats.player_name,
    totalScore: playerStats.totalScore,
    totalFours: playerStats.totalFours,
    totalSixes: playerStats.totalSixes,
  });
});
module.exports = app;
