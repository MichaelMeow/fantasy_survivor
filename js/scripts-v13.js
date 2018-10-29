
// Initialize Firebase
var config = {
  apiKey: "AIzaSyASafyCDojawq0tQ-9fb82F0gEFKfg-230",
  authDomain: "fantasy-survivor-83532.firebaseapp.com",
  databaseURL: "https://fantasy-survivor-83532.firebaseio.com",
  projectId: "fantasy-survivor-83532",
  storageBucket: "fantasy-survivor-83532.appspot.com",
  messagingSenderId: "730360439609"
};
firebase.initializeApp(config);
const database = firebase.database()

// Initialize session
var sessionUser = sessionStorage.getItem('user');

// FIREBASE REFERENCE CALL

database.ref().once("value", function(snapshot) {

  // declaring useful variables

  var userData = snapshot.child("users").val();
  var users = Object.keys(snapshot.child("users").val());
  var contestantData = snapshot.child("contestants").val();
  var episodeData = snapshot.child("episodes").val();
  var contestants = Object.keys(snapshot.child("contestants").val());
  var validContestants = []
  var votedOffContestants = [];
  var tribes = Object.keys(snapshot.child("tribes").val())
  var episodeNumber = Object.keys(snapshot.child("episodes").val()).length - 1;
  for (var i = 1; i < (episodeNumber+1); i++) {
    if(Array.isArray(snapshot.child("episodes").child(i).child("votedOff").val())){
      var offArray = snapshot.child("episodes").child(i).child("votedOff").val();
      if(offArray[0]){
        votedOffContestants.push(offArray[0])
      }
      if(offArray[1]){
        votedOffContestants.push(offArray[1])
      }
      if(offArray[2]){
        votedOffContestants.push(offArray[2])
      }
    } else {
      votedOffContestants.push(snapshot.child("episodes").child(i).child("votedOff").val());
    }
  }
  for (var i = 0; i < contestants.length; i++) {
    if(votedOffContestants.indexOf(contestants[i])== -1){
      validContestants.push(contestants[i]);
    }
  }
  var voteOffPool = 0
  var multiplierTwoPool = 0
  var multiplierOnePool = 0

  if (validContestants.length > 15){
    voteOffPool = 4
    multiplierTwoPool = 4
    multiplierOnePool = 4
  }else if (validContestants.length > 11 && validContestants.length < 16){
    voteOffPool = 3
    multiplierTwoPool = 3
    multiplierOnePool = 3
  }else if (validContestants.length > 6  && validContestants.length < 12){
    voteOffPool = 2
    multiplierTwoPool = 2
    multiplierOnePool = 2
  }else {
    voteOffPool = 3
    multiplierTwoPool = 1
    multiplierOnePool = 1
  }
  var overallRank = calculateOverallRank();



  // Object Constructors

  function contestant (first, last, photo, averagePoints, collectiveStock, idol, advantage, currentTribe, originalTribe) {
    this.firstName = first;
    this.lastName = last;
    this.photo = photo;
    this.averagePoints = averagePoints;
    this.collectiveStock = collectiveStock;
    this.idol = idol;
    this.advantage = advantage;
    this.episodeScore = [];
    this.playerStock = [];
    this.currentTribe = currentTribe;
    this.originalTribe = originalTribe;
  }

  function episode(number,name, votedOff, message){
    this.number = number;
    this.name = name;
    this.votedOff = votedoff;
    this.message = message;
  }

  function user(username){
    this.name = username;
    this.ranks = [];
  }

  // Functions

  function calculateAveragePoints(contestant){
    var totalForAverage = 0;
    for (var i = 0; i < episodeNumber; i++) {
      totalForAverage = totalForAverage + parseInt(snapshot.child("episodes").child(i+1).child(contestant).child('0').val());
    }
    var average = (totalForAverage/episodeNumber).toFixed(1);
    return average;
  }

  function calculateYourStock(contestant, user){

    if (snapshot.child("users").child(user).child(2).child("moveSubmit").val()){
      var yourStock = 0;
      for (var i = 0; i < episodeNumber; i++) {
        var rankArray = snapshot.child("users").child(user).child(i+1).child("moveSubmit").val();
        if (rankArray){
          var rank = rankArray.indexOf(contestant) + 1;
          if (rank != 0){
            var totalValid = rankArray.length;
            if (rank < (totalValid + 1 - voteOffPool)){
              yourStock = yourStock + (1 - ((rank-1) * (1/(totalValid-voteOffPool))))
            }
          }
        }
      }
      return yourStock;

    } else {
      return 0.0
    }
  }

  function calculateThisWeekStock(currentRank){
    var totalValid = validContestants.length
    var addedStock = 0
    if (currentRank < (validContestants.length + 1 - voteOffPool)){

      addedStock = 1 - ((currentRank-1) * (1/(totalValid-voteOffPool)));
      return addedStock.toFixed(1);
    } else {return 0.0}
  }

  function calculateOverallRank(){
    if (episodeNumber > 1){
      var stockRank = [];
      var stockArray = [];
      for (var i = 0; i < contestants.length; i++) {
        var contestantTotalStock = 0
        for (var j = 0; j < users.length; j++) {
          var stock = parseFloat(calculateYourStock(contestants[i], users[j]));
          contestantTotalStock += stock;
          // if (contestantTotalStock == 0){
          //   contestantTotalStock = ".0000"
          // }
        }
        contestantTotalStock = contestantTotalStock.toFixed(1);
        contestantTotalStock = contestantTotalStock*10;
        contestantTotalStock = contestantTotalStock.toString();
        var addZeroes = 5 - contestantTotalStock.length;
        if (addZeroes == 1){
          contestantTotalStock = "0" + contestantTotalStock;
        }
        if (addZeroes == 2){
          contestantTotalStock = "00" + contestantTotalStock;
        }
        if (addZeroes == 3){
          contestantTotalStock = "000" + contestantTotalStock;
        }
        if (addZeroes == 4){
          contestantTotalStock = "0000" + contestantTotalStock;
        }
        stockArray.push(contestantTotalStock+contestants[i])
      }
      stockArray.sort();
      stockArray.reverse();
      for (var k = 0; k < stockArray.length; k++) {
        for (var l = 0; l < contestants.length; l++) {
          if (stockArray[k].includes(contestants[l])){
            stockRank.push(contestants[l]);
          }
        }
      }

      return stockRank;
    } else {
      return []
    }
  }


  function idolCount(contestant){
    return snapshot.child("episodes").child(episodeNumber).child(contestant).child("11").val();
  }
  function advantageCount(contestant){
    return snapshot.child("episodes").child(episodeNumber).child(contestant).child("12").val();
  }

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function updateRank() {
    var i = 1;
    $('.rank').children().each(function () {
      var newRank = i;
      var previousRank = $(this).find(".previousRankHidden").text();
      $(this).find(".yourRank").html(newRank);
      var newStock = calculateThisWeekStock(newRank)
      $(this).find(".addedStock").html('(+' + newStock + ')');
      var rankChange = previousRank - newRank;

      if (rankChange > 0){
        rankChange = "+" + rankChange
        $(this).find(".previousRank").css({
          background: 'lightgreen'
        });
      }
      else if (rankChange < 0){
        $(this).find(".previousRank").css({
          background: 'lightcoral'
        });
      }
      else if (rankChange == 0){
        rankChange = " "
        $(this).find(".previousRank").css({
          background: 'none'
        });
      }
      $(this).find(".previousRank").html(rankChange);
      i++;
    });
    $('.deadZone').children().each(function () {
      var newRank = i;
      var previousRank = $(this).find(".previousRankHidden").text();
      if (previousRank != " "){
        var rankChange = previousRank - newRank;
        $(this).find(".previousRank").css({
          background: 'lightcoral'
        });
        $(this).find(".previousRank").html(rankChange);
      }
      i++;
    });
  }




  function populateRank() {
    var previousRank = []
    var populateArray = [];
    var moveSubmitData = "moveSubmit"
    var nextEpisode = episodeNumber + 1;
    if (snapshot.child("users").child(sessionUser).child(nextEpisode).child(moveSubmitData).val()){
      previousRank = snapshot.child("users").child(sessionUser).child(nextEpisode).child(moveSubmitData).val();
    } else if (episodeNumber == 1){
      previousRank = validContestants;
    } else {
      previousRank = snapshot.child("users").child(sessionUser).child(episodeNumber).child(moveSubmitData).val();
    }
    for (var i = 0; i < previousRank.length; i++) {
      if(votedOffContestants.indexOf(previousRank[i])== -1){
        populateArray.push(previousRank[i]);
      }
    }
    $(".rank").empty();
    var j = 0

    populateArray.forEach(function(contestant){
      var contestantObject = snapshot.child("contestants").child(contestant).val();
      var first = contestantObject.firstName;
      var last = contestantObject.lastName;
      var tribe = contestantObject.currentTribe;
      var photo = contestantObject.photoURL;
      var epPoints = snapshot.child("episodes").child(episodeNumber).child(contestant).child('0').val();
      var average = calculateAveragePoints(contestant);

      var yourStock = calculateYourStock(contestant, sessionUser).toFixed(1);
      var addedStock = calculateThisWeekStock(j+1);
      var idol = idolCount(contestant);
      var advantage = advantageCount(contestant);

      var ovrlRank = parseInt(overallRank.indexOf(contestant)) + 1;


      var newContestantBar = $(".contestantBarMain:first").clone();
      newContestantBar.addClass(first)
      newContestantBar.find(".contestantPhoto").html('<img src="' + photo + '" >');
      newContestantBar.find(".contestantName").html(first + " " + last);
      newContestantBar.find(".currentTribe").html(tribe);
      newContestantBar.find(".originalTribe").html(contestantObject.originalTribe);
      newContestantBar.find(".yourRank").html(j+1);
      var prvRankArray = snapshot.child("users").child(sessionUser).child(episodeNumber).child("moveSubmit").val();
      var prvRank = prvRankArray.indexOf(contestant) + 1
      newContestantBar.find(".previousRankHidden").html(prvRank);
      newContestantBar.find(".epPoints").html(epPoints);
      newContestantBar.find(".averagePoints").html(average);
      newContestantBar.find(".yourStock").html(yourStock + ' <span class="addedStock">(+' + addedStock + ')</span>');
      newContestantBar.find(".overallRank").html(ovrlRank);
      newContestantBar.find(".idol>svg").hide();
      if (idol == 1){
        newContestantBar.find(".idol>svg").show();
      }
      if (idol > 1){
        newContestantBar.find(".idol>svg").show();
        newContestantBar.find(".idol").append("x" + idol);
      }
      newContestantBar.find(".advantage").css("visibility", "hidden");
      if (advantage){
        newContestantBar.find(".advantage").css("visibility", "visible");
        if (advantage > 1){
          newContestantBar.find(".advantage").html("x" + advantage);
        }
      }
      var color = snapshot.child("tribes").child(tribe).child("color").val();
      newContestantBar.find(".contestantPhoto").css('box-shadow', '0px 0px 1px 3px ' + color)

      $(".rank").append(newContestantBar);
      newContestantBar.css('display', 'flex');
      j++;
      // populateDeadZone
    })
    for (var k = 0; k < votedOffContestants.length; k++) {
      outContestant = votedOffContestants[k]
      var contestantObject = snapshot.child("contestants").child(outContestant).val();
      var first = contestantObject.firstName;
      var last = contestantObject.lastName;
      var tribe = contestantObject.currentTribe;
      var photo = contestantObject.photoURL;
      var epPoints = snapshot.child("episodes").child(episodeNumber).child(outContestant).child('0').val();
      var average = calculateAveragePoints(outContestant);

      var yourStock = calculateYourStock(outContestant, sessionUser).toFixed(1);
      // var addedStock = calculateThisWeekStock(k+1);
      var idol = idolCount(outContestant);
      var advantage = advantageCount(outContestant);

      var ovrlRank = parseInt(overallRank.indexOf(outContestant)) + 1;


      newContestantBar = $(".contestantBarDead:first").clone();
      // newContestantBar.addClass(first)
      newContestantBar.find(".contestantPhoto").html('<img src="' + photo + '" >');
      newContestantBar.find(".contestantName").html(first + " " + last);
      newContestantBar.find(".currentTribe").html(tribe);
      newContestantBar.find(".originalTribe").html(tribe);
      var prvRankArray = snapshot.child("users").child(sessionUser).child(episodeNumber).child("moveSubmit").val();
      var prvRank = prvRankArray.indexOf(outContestant) + 1
      if (prvRank != 0){
        newContestantBar.find(".previousRankHidden").html(prvRank);
      } else{
        newContestantBar.find(".previousRankHidden").html(" ");
      }
      newContestantBar.find(".overallRank").html(ovrlRank);
      newContestantBar.find(".yourStock").html(yourStock);
      newContestantBar.find(".contestantPhoto").css('box-shadow', '0px 0px 1px 3px ' + 'gray')

      $(".deadZone").prepend(newContestantBar);
      newContestantBar.css('display', 'flex');
    }
    updateRank();
  }

  function multiplierGraveyardStyling(){
    // timestwo
    var barPosition = 189;
    $(".multiplierContainer").html('<div class="timesTwo"></div>');
    for (var i = 1; i <= multiplierTwoPool; i++) {
      barPosition += 55;
      $(".timesTwo").append('<div class="barBackground timesTwoBackground" style="top:' + barPosition + 'px;"></div>');
    }
    var twoMultiplierHeight = multiplierTwoPool*55
    $(".timesTwo").append('<div class="multiplierDiv tooltipmeowalt" style="height:' + twoMultiplierHeight + 'px; top:' + 243 + 'px;"><strong>x2 </strong> PTS.<span class="tooltiptext">Score double points for these contestants</span></div>');

    // timesOne
    $(".multiplierContainer").append('<div class="timesOne"></div>');
    for (var i = 1; i <= multiplierOnePool; i++) {
      barPosition += 55;
      $(".timesOne").append('<div class="barBackground timesOneBackground" style="top:' + barPosition + 'px;"></div>');
    }
    var oneMultiplierHeight = multiplierOnePool*55
    var oneMultiplierPosition = barPosition - oneMultiplierHeight + 55;
    $(".timesOne").append('<div class="multiplierDiv timesOneBackground tooltipmeowalt" style="height:' + oneMultiplierHeight + 'px; top:' + oneMultiplierPosition + 'px;"><strong>x1 </strong> PTS.<span class="tooltiptext">Score x 1 points for these contestants</span></div>');

    //graveyard
    barPosition = (validContestants.length * 55) - (voteOffPool*55) + 189
    $(".multiplierContainer").append('<div class="graveyard"></div>');
    for (var i = 1; i <= voteOffPool; i++) {
      var graveyardOpacity = i/voteOffPool;
      barPosition += 55;
      $(".graveyard").append('<div class="barBackground graveyardBackground" style="top:' + barPosition + 'px; opacity:' + graveyardOpacity + ';"></div>');
    }
    var voteOffHeight = voteOffPool*55
    var voteOffPosition = (validContestants.length * 55) - voteOffHeight + 244;
    var outBonus = "";
    if (voteOffPool == 4){
      outBonus = "+25<br>+50<br>+75<br>+100"
    }
    if (voteOffPool == 3){
      outBonus = "+33<br>+67<br>+100"
    }
    if (voteOffPool == 2){
      outBonus = "+50<br>+100"
    }
    if (voteOffPool == 1){
      outBonus = "+100"
    }
    $(".graveyard").append('<div class="multiplierDiv graveyardBackground tooltipmeowalt" style="height:' + voteOffHeight + 'px; top:' + voteOffPosition + 'px;"><strong>PREDICT<br>OUT<br>' + outBonus + '</strong><span class="tooltiptext">If one of these contestants goes home you score points in the Out Prediction category equal to 1 or less depending on their rank in this field</span></div>');
  }



  function populateScoreboards(){
    var pointScoreArray = []
    var outScoreArray = []
    var bracketScoreArray = []
    for (var i = 0; i < users.length; i++) {
      var numberName = []
      var userTotalScore = 0;
      var userOutScore = 0;
      var userBracketScore = 0;
      for (var j = 1; j < episodeNumber+1; j++) {
        var episodeUserRankArray = snapshot.child("users").child(users[i]).child(j).child("moveSubmit").val();
        if (episodeUserRankArray){
          // points ranking
          for (var l = 0; l < multiplierTwoPool; l++) {
            userTotalScore += 2 * snapshot.child("episodes").child(j).child(episodeUserRankArray[l]).child("0").val();
          }
          for (var m = 0; m < multiplierOnePool; m++) {

            userTotalScore += 2 * snapshot.child("episodes").child(j).child(episodeUserRankArray[multiplierTwoPool + m]).child("0").val();
          }
        }
      }
          numberName.push(userTotalScore)
          numberName.push(users[i])
          pointScoreArray.push(numberName);
          numberName = [];
          // Out ranking
          var votedOffContestantsOutScore = [];
          for (var j = 1; j < episodeNumber+1; j++) {
            var episodeUserRankArray = snapshot.child("users").child(users[i]).child(j).child("moveSubmit").val();
            if (episodeUserRankArray){
              var validContestantsOutScore = [];
              if(Array.isArray(snapshot.child("episodes").child(j).child("votedOff").val())){
                var offArray = snapshot.child("episodes").child(j).child("votedOff").val();
                if(offArray[0]){
                  votedOffContestantsOutScore.push(offArray[0])
                }
                if(offArray[1]){
                  votedOffContestantsOutScore.push(offArray[1])
                }
                if(offArray[2]){
                  votedOffContestantsOutScore.push(offArray[2])
                }
              } else {
                votedOffContestantsOutScore.push(snapshot.child("episodes").child(j).child("votedOff").val());
              }
            for (var z = 0; z < contestants.length; z++) {
              if(votedOffContestantsOutScore.indexOf(contestants[z])== -1){
                validContestantsOutScore.push(contestants[z]);
              }
            }
            if (validContestantsOutScore.length > 15){
              voteOffPoolOutScore = 4;
            }else if (validContestantsOutScore.length > 11 && validContestantsOutScore.length < 16){
              voteOffPoolOutScore = 3;
            }else if (validContestantsOutScore.length > 6  && validContestantsOutScore.length < 12){
              voteOffPoolOutScore = 2;
            }else {
              voteOffPoolOutScore = 3;
            }

          for (var n = 1; n < voteOffPoolOutScore+1; n++) {
            var endPosition = episodeUserRankArray.length - n;
            // it's not voted off contestants, it's only the one voted off that episode
            var currentContestantOut = [snapshot.child("episodes").child(j).child("votedOff").val()];
            if (currentContestantOut.indexOf(episodeUserRankArray[endPosition]) > -1){
              // change to vote off pool number at specific ep
              userOutScore += ((voteOffPoolOutScore-n + 1)/voteOffPoolOutScore) * 100;

            }
            var currentContestantOut = [snapshot.child("episodes").child(j).child("votedOff").child("0").val()];
            if (currentContestantOut.indexOf(episodeUserRankArray[endPosition]) > -1){
              // change to vote off pool number at specific ep
              userOutScore += ((voteOffPoolOutScore-n + 1)/voteOffPoolOutScore) * 100;

            }
            var currentContestantOut = [snapshot.child("episodes").child(j).child("votedOff").child("1").val()];
            if (currentContestantOut.indexOf(episodeUserRankArray[endPosition]) > -1){
              // change to vote off pool number at specific ep
              userOutScore += ((voteOffPoolOutScore-n + 1)/voteOffPoolOutScore) * 100;

            }
            var currentContestantOut = [snapshot.child("episodes").child(j).child("votedOff").child("2").val()];
            if (currentContestantOut.indexOf(episodeUserRankArray[endPosition]) > -1){
              // change to vote off pool number at specific ep
              userOutScore += ((voteOffPoolOutScore-n + 1)/voteOffPoolOutScore) * 100;

            }
          }
        }
      }
          numberName.push(Math.round(userOutScore))
          numberName.push(users[i])
          outScoreArray.push(numberName);
          numberName = [];
          // Bracket Ranking

          for (var j = 1; j < episodeNumber+1; j++) {
            var episodeUserRankArray = snapshot.child("users").child(users[i]).child(j).child("moveSubmit").val();
            if (episodeUserRankArray){

          for (var p = 0; p < episodeUserRankArray.length; p++) {
            var outIndex = votedOffContestants.indexOf(episodeUserRankArray[p]);
            var userStockMultiplier = calculateYourStock(episodeUserRankArray[p], users[i])
            if (outIndex > -1){
              userBracketScore += (outIndex/20)* userStockMultiplier
            } else {
              userBracketScore += ((validContestants.length/20)/2)* userStockMultiplier
            }
          }
        }
      }
          numberName.push(userBracketScore)
          numberName.push(users[i])
          bracketScoreArray.push(numberName);
          numberName = [];
        }


    pointScoreArray.sort(function(a, b){return b[0] - a[0]});
    outScoreArray.sort(function(a, b){return b[0] - a[0]});
    bracketScoreArray.sort(function(a, b){return b[0] - a[0]});
    var rank = 1;
    var tie = 0;
    var pointLeaderboardArray = []
    var bracketLeaderboardArray = []
    var outLeaderboardArray = []
    for (var q = 0; q < pointScoreArray.length; q++) {
      // points populate
      var scoreUserName = snapshot.child("users").child(pointScoreArray[q][1]).child("userName").val();
      var newScoreboardCell = $(".hidden > .rankingsPlayers").clone().appendTo($(".pointsRanking > .rankingScoreboard"));
      newScoreboardCell.find(".playerName").html(scoreUserName);
      newScoreboardCell.find(".pointsScore").html(pointScoreArray[q][0]);
      if(q+1 == 1){
      } else if (pointScoreArray[q-1][0] > pointScoreArray[q][0]) {
        rank = rank + 1 + tie;
        tie = 0;
      } else if (pointScoreArray[q-1][0] == pointScoreArray[q][0]) {
        tie ++;
      }
      pointLeaderboardArray.push([rank, scoreUserName]);
      newScoreboardCell.find(".whiteCircle").html(rank);
      if (pointScoreArray[q][1] == sessionUser){
        newScoreboardCell.css("border", "2px solid #8EE7EC")
      }
    }
    var highestPointRank = rank
    rank = 1;
    for (var q = 0; q < pointScoreArray.length; q++) {
      // bracket Populate
      scoreUserName = snapshot.child("users").child(bracketScoreArray[q][1]).child("userName").val();
      newScoreboardCell = $(".hidden > .rankingsPlayers").clone().appendTo($(".stockRanking > .rankingScoreboard"));
      newScoreboardCell.find(".playerName").html(scoreUserName);
      newScoreboardCell.find(".pointsScore").html(bracketScoreArray[q][0].toFixed(2));
      if(q+1 == 1){
      } else if (bracketScoreArray[q-1][0] > bracketScoreArray[q][0]) {
        rank = rank + 1 + tie;
        tie = 0;
      } else if (bracketScoreArray[q-1][0] == bracketScoreArray[q][0]) {
        tie ++;
      }
      bracketLeaderboardArray.push([rank, scoreUserName]);
      newScoreboardCell.find(".whiteCircle").html(rank);
      if (bracketScoreArray[q][1] == sessionUser){
        newScoreboardCell.css("border", "2px solid #8EE7EC")
      }
    }
    var highestBracketRank = rank
    rank = 1;
    for (var q = 0; q < pointScoreArray.length; q++) {
      // outPopulate
      scoreUserName = snapshot.child("users").child(outScoreArray[q][1]).child("userName").val();
      newScoreboardCell = $(".hidden > .rankingsPlayers").clone().appendTo($(".OutPredictionRanking > .rankingScoreboard"));
      newScoreboardCell.find(".playerName").html(scoreUserName);
      newScoreboardCell.find(".pointsScore").html(outScoreArray[q][0]);
      if(q+1 == 1){
      } else if (outScoreArray[q-1][0] > outScoreArray[q][0]) {
        rank = rank + 1 + tie;
        tie = 0;
      } else if (outScoreArray[q-1][0] == outScoreArray[q][0]) {
        tie ++;
      }
      outLeaderboardArray.push([rank, scoreUserName])
      newScoreboardCell.find(".whiteCircle").html(rank);
      if (outScoreArray[q][1] == sessionUser){
        newScoreboardCell.css("border", "2px solid #8EE7EC")
      }
    }
    var highestOutRank = rank


    // overall ranking
    var overallRankArray = []
    for (var r = 0; r < pointScoreArray.length; r++) {
      var outRank = 0
      var bracketRank = 0
      scoreUserName = snapshot.child("users").child(pointScoreArray[r][1]).child("userName").val();
      var pointRank = pointLeaderboardArray[r][0];
      for (var s = 0; s < outLeaderboardArray.length; s++) {
        if (outLeaderboardArray[s][1] == scoreUserName){
          outRank = outLeaderboardArray[s][0]
        }
      }
      for (var t = 0; t < bracketLeaderboardArray.length; t++) {
        if (bracketLeaderboardArray[t][1] == scoreUserName){
          bracketRank = bracketLeaderboardArray[t][0]
        }
      }

      overallRankTotal = (pointRank/highestPointRank) + (outRank/highestOutRank) + (bracketRank/highestBracketRank)
      overallRankArray.push([overallRankTotal, scoreUserName])
      overallRankArray.sort(function(a, b){return a[0] - b[0]});
    }

    // overall Populate
    rank = 1;
    tie = 0
    for (var u = 0; u < overallRankArray.length; u++) {
      scoreUserName = overallRankArray[u][1];
      newScoreboardCell = $(".hidden > .rankingsPlayers").clone().appendTo($(".overallRanking > .rankingScoreboard"));
      newScoreboardCell.find(".playerName").html(scoreUserName);
      // newScoreboardCell.find(".pointsScore").html(overallRankArray[u][0].toFixed(2));
      if(u+1 == 1){
      } else if (overallRankArray[u-1][0] < overallRankArray[u][0]) {
        rank = rank + 1 + tie;
        tie = 0;
      } else if (overallRankArray[u-1][0] == overallRankArray[u][0]) {
        tie ++;
      }
      newScoreboardCell.find(".whiteCircle").html(rank);
      if (overallRankArray[u][1] == snapshot.child("users").child(sessionUser).child("userName").val()){
        newScoreboardCell.css("border", "2px solid #8EE7EC")
      }
    }
  }

  function randomMove(episode){
    var randomInvalid = [];
    for (var i = 1; i < (episode); i++) {
      randomInvalid.push(snapshot.child("episodes").child(i).child("votedOff").val());
    }
    var randomArray = shuffle(contestants);
    var randomMoveArray = [];
    for (var j = 0; j < randomArray.length; j++) {
      if (randomInvalid.indexOf(randomArray[j]) == -1){
        randomMoveArray.push(randomArray[j]);
      }
    }
    return randomMoveArray;
  }

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  function movesNotTaken(user){
    for (var j = 1; j < episodeNumber+1; j++) {

      if(j>1 && snapshot.child("users").child(user).child(j).val() == null){
        var moveSubmit = randomMove(j);
        database.ref('users/' + user + '/' + j + "/").update({
          moveSubmit
        });
      }
    }
  }


  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY

  $(document).ready(function(){

    if(sessionUser == null && window.location.href.indexOf("index") == -1){
      window.location.href = "index.html";
    }


    if (sessionUser && snapshot.child("users").child(sessionUser).child(episodeNumber+1).child("moveSubmit").val() == null){
      $(".moveAlert").css("display", "inline-block")
    }

    // admin page load

    if (window.location.href.indexOf("admin") > -1 && $(".contestant1").val() == ""){

      // load contestants

      var contestantNumber = 0;
      var contestanTribes = [];
      var j = 0;
      for (var i = 0; i < contestants.length; i++) {
        var tribe = snapshot.child("contestants").child(contestants[i]).child("currentTribe").val();
        if (contestanTribes.indexOf(tribe) == -1){
          contestanTribes.push(tribe)
        }
      }
      var m = 1;
      for (var l = 0; l < contestanTribes.length; l++) {
        for (var k = 0; k < contestants.length; k++) {
          var tribe = snapshot.child("contestants").child(contestants[k]).child("currentTribe").val();
          if(votedOffContestants.indexOf(contestants[k])== -1){
            if(contestanTribes[l] == tribe){
              contestantNumber = m;
              var className = ".contestant" + contestantNumber;
              $(className).html(contestants[k] + "(" + tribe + ")");
              m++
            }
          } else if ($('.scoringTable div').text().indexOf(contestants[k]) == -1){
            var votedOffContestantNumber = 20 - j;
            var votedOffClassName = ".contestant" + votedOffContestantNumber;
            $(votedOffClassName).html(contestants[k] + "(Out)");
            j ++;

          }
        }
      }

      // admin page load tribes select

      for (var i = 0; i < tribes.length; i++) {
        var tribe = tribes[i]
        $(".selectTribe").append('<option value="' + tribe + '">' + tribe + '</option>')
      }

      // admin submit episode

      $('#submitEpisode').click(function(event){
        event.stopImmediatePropagation();
        var ev = $._data(this, 'events');

        var number = $("#epNumberToDatabase").val();
        var title = $("#epTitleToDatabase").val();
        var reward = $("#rewardWinnerToDatabase").val();
        var immunity = $("#immunityWinnerToDatabase").val();
        var airdate = $("#airdateToDatabase").val();
        var voted = $("#voteOffToDatabase").val().replace(/\s+/g, '-').toLowerCase();
        var voted2 = $("#voteOffToDatabase2").val().replace(/\s+/g, '-').toLowerCase();
        var voted3 = $("#voteOffToDatabase3").val().replace(/\s+/g, '-').toLowerCase();
        var message = $("#messageToDatabase").html();

        if (number == episodeNumber + 1){
          for (var i = 0; i < users.length; i++) {
            if(snapshot.child("users").child(users[i]).child(number).val() == null){
              var prevMoveSubmit = snapshot.child("users").child(users[i]).child(number-1).child("moveSubmit").val();
              var outToSubtract = snapshot.child("episodes").child(number-1).child("votedOff").val();
              outToSubtract = outToSubtract[0]

              var index = prevMoveSubmit.indexOf(outToSubtract);
              if (index !== -1) {
                prevMoveSubmit.splice(index, 1);
              }
              if (outToSubtract[1]){
                outToSubtract = outToSubtract[1]

                var index = prevMoveSubmit.indexOf(outToSubtract);
                if (index !== -1) {
                  prevMoveSubmit.splice(index, 1);
                }
              }
              if (outToSubtract[2]){
                outToSubtract = outToSubtract[2]

                var index = prevMoveSubmit.indexOf(outToSubtract);
                if (index !== -1) {
                  prevMoveSubmit.splice(index, 1);
                }
              }
              var moveSubmit = prevMoveSubmit
              database.ref('users/' + users[i] + '/' + number + '/').set({
                moveSubmit
              });
            }
          }
        }

        if (number < episodeNumber + 2 && number > 0){
          if((number < episodeNumber + 1 && confirm('Are you sure you want to edit existing episode number ' + number + '?')) || (number == episodeNumber + 1 && confirm('Are you sure you want to submit a new episode?  Warning: this will rollover all users to next episode'))){
            database.ref('episodes/' + number + '/').set({
              name: title,
              rewardWinner: reward,
              immunityWinner: immunity,
              votedOff: [voted, voted2, voted3],
              message: message,
              airdate: airdate
            });
            $(".episodeSubmitted").html("Episode " + number + " submitted.")

            // PLAYER SCORE Submit

            for (var i = 1; i < 21; i++) {
              var contestant = ""
              for (var p = 0; p < contestants.length; p++) {
                if ($(".contestant" + i).text().indexOf(contestants[p]) > -1){
                  contestant = contestants[p];
                }
              }
              var teamReward = 0;
              if ($(".teamReward." + i + " :input").prop('checked')){
                teamReward = 2;
              }
              var teamImmunity = 0;
              if ($(".teamImmunity." + i + " :input").prop('checked')){
                teamImmunity = 4;
              }
              var individualReward = 0;
              if ($(".individualReward." + i + " :input").prop('checked')){
                individualReward = 3;
              }
              var individualImmunity = 0;
              if ($(".individualImmunity." + i + " :input").prop('checked')){
                individualImmunity = 6;
              }
              var correctVote = 0;
              if ($(".correctVote." + i + " :input").prop('checked')){
                correctVote = 2;
              }
              var recievedVote = 0;
              if ($(".recievedVote." + i + " :input").prop('checked')){
                recievedVote = -1;
              }
              var votedOff = 0;
              if ($(".votedOff." + i + " :input").prop('checked')){
                votedOff = -2;
              }
              var clue = 0;
              if ($(".clue." + i + " :input").prop('checked')){
                clue = 1;
              }
              var foundIdol = 0;
              if ($(".foundIdol." + i + " :input").prop('checked')){
                foundIdol = 1;
              }
              var foundAdvantage = 0;
              if ($(".foundAdvantage." + i + " :input").prop('checked')){
                foundAdvantage = 1;
              }
              var heldIdol = 0;
              if ($(".heldIdol." + i + " :input").val()){
                heldIdol = parseInt($(".heldIdol." + i + " :input").val());
              }
              var heldAdvantage = 0;
              if ($(".heldAdvantage." + i + " :input").prop('checked')){
                heldAdvantage = 1;
              }
              var quoted = 0;
              if ($(".quoted." + i + " :input").prop('checked')){
                quoted = 1;
              }
              var chosenReward = 0;
              if ($(".chosenReward." + i + " :input").prop('checked')){
                chosenReward = 1;
              }
              var juryVotes = 0;
              if ($(".juryVotes." + i + " :input").val()){
                juryVotes = parseInt($(".juryVotes." + i + " :input").val());
              }
              var special = 0;
              if ($(".special." + i + " :input").val()){
                special = parseInt($(".special." + i + " :input").val());
              }
              var newTribe = snapshot.child("contestants").child(contestant).child("currentTribe").val();
              if ($(".selectTribe." + i + " option:selected").val()){
                newTribe = $(".selectTribe." + i + " option:selected").val()
              }

              var total = teamReward + teamImmunity + individualReward + individualImmunity + correctVote + recievedVote + votedOff + clue + foundIdol + foundAdvantage + heldIdol + heldAdvantage + quoted + chosenReward + juryVotes + special

              database.ref('episodes/' + number + '/' + contestant + '/').set({
                0: total,
                1: teamReward,
                2: teamImmunity,
                3: individualReward,
                4: individualImmunity,
                5: correctVote,
                6: recievedVote,
                7: votedOff,
                8: clue,
                9: foundIdol,
                10: foundAdvantage,
                11: heldIdol,
                12: heldAdvantage,
                13: quoted,
                14: chosenReward,
                15: juryVotes,
                16: special
              });
              database.ref('contestants/' + contestant + '/').update({
                currentTribe: newTribe
              });
            }
          }
        } else {
          alert("Please enter a valid episode number")
        }
      })

      // admin load episode

      $("#loadEpisode").click(function(){
        for (var i = 1; i < (episodeNumber+1); i++) {
          if ($(".numberToLoad").val() == i){
            var immunityWinner = snapshot.child("episodes").child(i).child("immunityWinner").val();
            var votedOff = snapshot.child("episodes").child(i).child("votedOff").val();
            var rewardWinner = snapshot.child("episodes").child(i).child("rewardWinner").val();
            var episodeName = snapshot.child("episodes").child(i).child("name").val();
            var message = snapshot.child("episodes").child(i).child("message").val();
            var airdate = snapshot.child("episodes").child(i).child("airdate").val();
            $("#epNumberToDatabase").val(i);
            $("#epTitleToDatabase").val(episodeName);
            $("#rewardWinnerToDatabase").val(rewardWinner);
            $("#immunityWinnerToDatabase").val(immunityWinner);
            $("#messageToDatabase").html(message);
            $("#voteOffToDatabase").val(votedOff[0]);
            $("#voteOffToDatabase2").val(votedOff[1]);
            $("#voteOffToDatabase3").val(votedOff[2]);
            $("#airdateToDatabase").val(airdate);

            for (var j = 1; j < 21; j++) {
              var contestant = ""
              for (var p = 0; p < contestants.length; p++) {
                if ($(".contestant" + j).text().indexOf(contestants[p]) > -1){
                  contestant = contestants[p];
                }
              }
              $(".Total." + j).text(snapshot.child("episodes").child(i).child(contestant).child(0).val())
              if (snapshot.child("episodes").child(i).child(contestant).child(1).val()>0){
                $(".teamReward." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(2).val()>0){
                $(".teamImmunity." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(3).val()>0){
                $(".individualReward." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(4).val()>0){
                $(".individualImmunity." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(5).val()>0){
                $(".correctVote." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(6).val()>0){
                $(".recievedVote." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(7).val()>0){
                $(".votedOff." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(8).val()>0){
                $(".clue." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(9).val()>0){
                $(".foundIdol." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(10).val()>0){
                $(".foundAdvantage." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(11).val()>0){
                $(".heldIdol." + j +" :input").val(snapshot.child("episodes").child(i).child(contestant).child(11).val());
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(12).val()>0){
                $(".heldAdvantage." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(13).val()>0){
                $(".quoted." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(14).val()>0){
                $(".chosenReward." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(15).val()>0){
                $(".juryVotes." + j +" :input").prop('checked', true);
              }
              if (snapshot.child("episodes").child(i).child(contestant).child(16).val()>0){
                $(".special." + j +" :input").val(snapshot.child("episodes").child(i).child(contestant).child(16).val());
              }
            }
          }
        }
      })

      // admin add tribe

      $("#newTribeSubmit").click(function(){
        var tribe = $("#newTribeName").val();
        var color = $("#newTribeColor").val();
        database.ref('tribes/' + tribe + "/").set({
          name: tribe,
          color: color
        });
      })

      // admin add contestant

      $("#addContestantSubmit").click(function(event){
        event.preventDefault();
        var first = $("#firstNameToDatabase").val();
        var last = $("#lastNameToDatabase").val();
        var tribe = $("#tribeToDatabase").val();
        var photo = $("#photoURLToDatabase").val();
        var str = first + " " + last;
        str = str.replace(/\s+/g, '-').toLowerCase();
        database.ref('contestants/' + str + '/').set({
          firstName: first,
          lastName: last,
          originalTribe: tribe,
          currentTribe: tribe,
          photoURL: photo
        });
        $(".contestantSubmitted").html(first + " " + last + " submitted.")
      })
      // admin delete user
      $("#deleteUserButton").click(function(){
        var userToBeDeleted = $("#deleteUser").val();
        if (userToBeDeleted && confirm('Are you sure you want to delete user ' + userToBeDeleted + "? (Cannot be undone)")){
          database.ref('users/' + userToBeDeleted + "/").set({})
        }
        });

    }



    // populate scoreboard

    if (window.location.href.indexOf("scoreboard") > -1){
      populateScoreboards();
      $(".rankingsPlayers").on( "click", function(event) {
        var comparativeEpisode = episodeNumber + 1;

        var comparisonUser = $(this).find(".playerName").text()
        var comparisonUserLower = $(this).find(".playerName").text().toLowerCase();
        var newComparisonTable = $(".comparison").append().insertAfter(this);
        $(".episodeRowComparison > div").not(".episodeRowComparison > div:first").remove();
        for (var i = 1; i <= episodeNumber; i++) {
          if (snapshot.child("users").child(comparisonUserLower).child(i).val()){
            $(".episodeRowComparison").append('<div class="comparativeEpisode">' + i + "</div>")
          } else {
            $(".episodeRowComparison").append('<div class="comparativeEpisode invalidEpisode">' + i + "</div>")
          }
        }

        $(".comparativeEpisode").not(".invalidEpisode").on( "click", function() {
            $(this).addClass("activeEpisode");
            $(".comparativeEpisode").not(this).removeClass("activeEpisode");
            $(".comparisonMoves").empty();
            $(".comparisonTitle >div:first").remove();
            $(".comparisonMoves:eq(1)").empty();
            $(".comparisonTitle:eq(1) >div:first").remove();
            comparativeEpisode = $(this).text();
            var comparisonUserDisplay = comparisonUser
            if (comparisonUser.length > 11){
              comparisonUserDisplay = comparisonUser.substring(0,11)+ "...";
            }
            $(".comparisonTitle:first").prepend('<div>' + comparisonUserDisplay + '</div>');
            $(".comparisonTitle:eq(1)").prepend('<div>Your Moves</div>');
            comparisonMoves = snapshot.child("users").child(comparisonUserLower).child(comparativeEpisode).child("moveSubmit").val();
            if (comparisonMoves != null){
              for (var i = 0; i < comparisonMoves.length; i++) {
                var wasRed = false;
                var redContestant = snapshot.child("episodes").child(comparativeEpisode).child("votedOff").val();
                var rankDisplay = i + 1
                var compareStock = calculateYourStock(comparisonMoves[i], comparisonUserLower).toFixed(1);
                if (Array.isArray(redContestant)){
                  if (comparisonMoves[i] == redContestant[0]){
                    $(".comparisonMoves:eq(0)").append('<div class="comparisonMovesDiv redName"><div><strong>' + rankDisplay + ': </strong>' + comparisonMoves[i] + '</div><div>' + compareStock + '</div></div>');
                    wasRed = true;
                  }
                  if(redContestant[1]){
                    if (comparisonMoves[i] == redContestant[1]){
                      $(".comparisonMoves:eq(0)").append('<div class="comparisonMovesDiv redName"><div><strong>' + rankDisplay + ': </strong>' + comparisonMoves[i] + '</div><div>' + compareStock + '</div></div>');
                      wasRed = true;
                    }
                  }
                  if(redContestant[2]){
                    if (comparisonMoves[i] == redContestant[2]){
                      $(".comparisonMoves:eq(0)").append('<div class="comparisonMovesDiv redName"><div><strong>' + rankDisplay + ': </strong>' + comparisonMoves[i] + '</div><div>' + compareStock + '</div></div>');
                      wasRed = true;
                    }
                  }
                } else if (comparisonMoves[i] == redContestant){
                  $(".comparisonMoves:eq(0)").append('<div class="comparisonMovesDiv redName"><div><strong>' + rankDisplay + ': </strong>' + comparisonMoves[i] + '</div><div>' + compareStock + '</div></div>');
                  wasRed = true;
                }
                if (wasRed == false) {
                  $(".comparisonMoves:eq(0)").append('<div class="comparisonMovesDiv"><div><strong>' + rankDisplay + ': </strong>' + comparisonMoves[i] + '</div><div>' + compareStock + '</div></div>');
                }
              }

              for (var i = comparativeEpisode-1; i > 0; i--) {
                var outForBottom = snapshot.child("episodes").child(i).child("votedOff").val();
                if (Array.isArray(outForBottom)) {
                  var compareStock = calculateYourStock(outForBottom[0], comparisonUserLower).toFixed(1);
                  $(".comparisonMoves:eq(0)").append('<div class="comparisonMovesDiv"><div><strong>Out: </strong>' + outForBottom[0] + '</div><div>' + compareStock + '</div></div>');
                  if (outForBottom[1]){
                    var compareStock = calculateYourStock(outForBottom[1], comparisonUserLower).toFixed(1);
                    $(".comparisonMoves:eq(0)").append('<div class="comparisonMovesDiv"><div><strong>Out: </strong>' + outForBottom[1] + '</div><div>' + compareStock + '</div></div>');
                  }
                  if (outForBottom[2]){
                    var compareStock = calculateYourStock(outForBottom[2], comparisonUserLower).toFixed(1);
                    $(".comparisonMoves:eq(0)").append('<div class="comparisonMovesDiv"><div><strong>Out: </strong>' + outForBottom[2] + '</div><div>' + compareStock + '</div></div>');
                  }
                } else {
                  var compareStock = calculateYourStock(outForBottom, comparisonUserLower).toFixed(1);
                  $(".comparisonMoves:eq(0)").append('<div class="comparisonMovesDiv"><div><strong>Out: </strong>' + outForBottom + '</div><div>' + compareStock + '</div></div>');
                }
              }

              // for session user
              comparisonMoves = snapshot.child("users").child(sessionUser).child(comparativeEpisode).child("moveSubmit").val();
              for (var i = 0; i < comparisonMoves.length; i++) {
                var wasRed = false;
                var redContestant = snapshot.child("episodes").child(comparativeEpisode).child("votedOff").val();
                var rankDisplay = i + 1
                var compareStock = calculateYourStock(comparisonMoves[i], sessionUser).toFixed(1);
                if (Array.isArray(redContestant)){
                  if (comparisonMoves[i] == redContestant[0]){
                    $(".comparisonMoves:eq(1)").append('<div class="comparisonMovesDiv redName"><div><strong>' + rankDisplay + ': </strong>' + comparisonMoves[i] + '</div><div>' + compareStock + '</div></div>');
                    wasRed = true;
                  }
                  if(redContestant[1]){
                    if (comparisonMoves[i] == redContestant[1]){
                      $(".comparisonMoves:eq(1)").append('<div class="comparisonMovesDiv redName"><div><strong>' + rankDisplay + ': </strong>' + comparisonMoves[i] + '</div><div>' + compareStock + '</div></div>');
                      wasRed = true;
                    }
                  }
                  if(redContestant[2]){
                    if (comparisonMoves[i] == redContestant[2]){
                      $(".comparisonMoves:eq(1)").append('<div class="comparisonMovesDiv redName"><div><strong>' + rankDisplay + ': </strong>' + comparisonMoves[i] + '</div><div>' + compareStock + '</div></div>');
                      wasRed = true;
                    }
                  }
                } else if (comparisonMoves[i] == redContestant){
                  $(".comparisonMoves:eq(1)").append('<div class="comparisonMovesDiv redName"><div><strong>' + rankDisplay + ': </strong>' + comparisonMoves[i] + '</div><div>' + compareStock + '</div></div>');
                  wasRed = true;
                }
                if (wasRed == false) {
                  $(".comparisonMoves:eq(1)").append('<div class="comparisonMovesDiv"><div><strong>' + rankDisplay + ': </strong>' + comparisonMoves[i] + '</div><div>' + compareStock + '</div></div>');
                }

              }

              for (var i = comparativeEpisode-1; i > 0; i--) {
                var outForBottom = snapshot.child("episodes").child(i).child("votedOff").val();
                if (Array.isArray(outForBottom)) {
                  var compareStock = calculateYourStock(outForBottom[0], sessionUser).toFixed(1);
                  $(".comparisonMoves:eq(1)").append('<div class="comparisonMovesDiv"><div><strong>Out: </strong>' + outForBottom[0] + '</div><div>' + compareStock + '</div></div>');
                  if (outForBottom[1]){
                    var compareStock = calculateYourStock(outForBottom[1], sessionUser).toFixed(1);
                    $(".comparisonMoves:eq(1)").append('<div class="comparisonMovesDiv"><div><strong>Out: </strong>' + outForBottom[1] + '</div><div>' + compareStock + '</div></div>');
                  }
                  if (outForBottom[2]){
                    var compareStock = calculateYourStock(outForBottom[2], sessionUser).toFixed(1);
                    $(".comparisonMoves:eq(1)").append('<div class="comparisonMovesDiv"><div><strong>Out: </strong>' + outForBottom[2] + '</div><div>' + compareStock + '</div></div>');
                  }
                } else {
                  var compareStock = calculateYourStock(outForBottom, sessionUser).toFixed(1);
                  $(".comparisonMoves:eq(1)").append('<div class="comparisonMovesDiv"><div><strong>Out: </strong>' + outForBottom + '</div><div>' + compareStock + '</div></div>');
                }
              }

              //this whole chunk is wrong... We have to first calculate the outs by looping through episodes, then use that to determine contestants left
              var outForColors = [];
              for (var i = comparativeEpisode-1; i > 0; i--) {
                var outTempValue = snapshot.child("episodes").child(i).child("votedOff").val();
                if (Array.isArray(outTempValue)){
                  outForColors.push(outTempValue[0]);
                  if (outTempValue[1]){
                    outForColors.push(outTempValue[1]);
                  }
                  if (outTempValue[2]){
                    outForColors.push(outTempValue[2]);
                  }
                } else {
                  outForColors.push(outTempValue);
                }
              }

              if(outForColors.length < 5){
                pool1 = 4
                pool2 = 4
                deadPool = 4
              }else if(outForColors.length < 9){
                pool1 = 3
                pool2 = 3
                deadPool = 3
              } else if(outForColors.length < 14){
                pool1 = 2
                pool2 = 2
                deadPool = 2
              } else if(outForColors.length < 5){
                pool1 = 1
                pool2 = 1
                deadPool = 3
              }
              for (var j = 1; j <= pool2; j++) {
                $(".comparisonMoves > div:nth-child("+ j +") > * > strong").addClass("green");
              }
              for (var k = pool2+1; k <= pool2+pool1; k++) {
                $(".comparisonMoves > div:nth-child("+ k +") > * > strong").addClass("lightgreen");
              }
              // var redContestant = snapshot.child("episodes").child(comparativeEpisode).child("votedOff").val();
              // if (Array.isArray(redContestant)){
              //   $("div:contains(" + redContestant[0] + ")").addClass("red");
              //   if ( redContestant[1] ){
              //     $("div:contains(" + redContestant[1] + ")").addClass("red");
              //   }
              //   if ( redContestant[2] ){
              //     $("div:contains(" + redContestant[2] + ")").addClass("red");
              //   }
              // } else {
              //   $("div:contains(" + redContestant + ")").addClass("red");
              // }

              var plusOuts = outForColors.length
              for (var l = plusOuts+1; l <= plusOuts + deadPool; l++) {
                $(".comparisonMoves > div:nth-last-child("+ l +") > * > strong").addClass("red");
              }
            }else {
              $(".comparisonMoves:eq(0)").append('<div>No Episode Data</div>');
            }
        })

        $('.comparativeEpisode:nth-child(' + comparativeEpisode + ')').triggerHandler('click');

      })
    }

    // log out click function

    $(".logOut").click(function(){
      sessionStorage.setItem('user', "");
      window.location.href = "index.html";
    })

    // session user display

    if (sessionUser){
      if (sessionUser == 'utopiancomplex'){
        $(".adminTab").css("display", "inline-block");
      }
      if (window.location.href.indexOf("index") > -1){
        window.location.href = "move.html";
      }
    }
    if (sessionUser){
      $(".username").html(snapshot.child("users").child(sessionUser).child("userName").val());
    }

    // create account

    $(".createAccountButton").click(function(){
      var actualNewUser = $("#createName").val();
      var newUserLowerCase = $("#createName").val().toLowerCase();
      var newEmail = $("#createEmail").val().toLowerCase();
      var paid = $('input[name=paid]:checked', '#paidForm').val();
      if (users.indexOf(newUserLowerCase) != -1){
        $(".invalidEmail").html("User name already exists.");
      } else if(validateEmail(newEmail)){
        database.ref('users/' + newUserLowerCase).set({
          userName: actualNewUser,
          email: newEmail,
          paid: paid
        });
        movesNotTaken(newUserLowerCase);
        alert("Thank you, your user name and email have been created.  Please Log in.");
        location.reload();
      } else {
        $(".invalidEmail").html("Please enter a valid Email address.");
      }
    });

    // log in

    $(".logInButton").click(function(){
      var userInput = $("#logInName").val().toLowerCase();
      var emailInput = $("#logInEmail").val().toLowerCase();
      if (users.indexOf(userInput) > -1){
        var emailData = snapshot.child("users").child(userInput).child("email").val();
        if (emailData == emailInput){
          sessionStorage.setItem('user', userInput);
          window.location.href = "move.html";
        } else {
          alert("Your email does not match our database")
        }
      } else if(users.indexOf(userInput) == -1){
        alert("Your username does not match our database")
      }
    });

    // move page load

    if (window.location.href.indexOf("move") > -1){

      var timeOut = 0;
      // Set the date we're counting down to
      var nextAirdate = snapshot.child("episodes").child(episodeNumber).child("airdate").val().split("-");
      if (nextAirdate[1] == "1"){
        nextAirdate[1] = "Jan";
      }
      if (nextAirdate[1] == "2"){
        nextAirdate[1] = "Feb";
      }
      if (nextAirdate[1] == "3"){
        nextAirdate[1] = "Mar";
      }
      if (nextAirdate[1] == "4"){
        nextAirdate[1] = "Apr";
      }
      if (nextAirdate[1] == "5"){
        nextAirdate[1] = "May";
      }
      if (nextAirdate[1] == "6"){
        nextAirdate[1] = "Jun";
      }
      if (nextAirdate[1] == "7"){
        nextAirdate[1] = "Jul";
      }
      if (nextAirdate[1] == "8"){
        nextAirdate[1] = "Aug";
      }
      if (nextAirdate[1] == "9"){
        nextAirdate[1] = "Sep";
      }
      if (nextAirdate[1] == "10"){
        nextAirdate[1] = "Oct";
      }
      if (nextAirdate[1] == "11"){
        nextAirdate[1] = "Nov";
      }
      if (nextAirdate[1] == "12"){
        nextAirdate[1] = "Dec";
      }
      var nextAirdateString = nextAirdate[1] + nextAirdate[2] + "," + nextAirdate[0];

      var countDownDate = new Date(nextAirdateString + " 17:10:00").getTime();
      // Update the count down every 1 second
      var x = setInterval(function() {
        // Get todays date and time
        var now = new Date().getTime();
        // Find the distance between now and the count down date
        var distance = countDownDate - now;
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        // Display the result in the element with id="demo"
        $(".timer").html("You have " + days + "d " + hours + "h "
        + minutes + "m " + seconds + "s left to submit.");
        // If the count down is finished, write some text
        if (distance < 0) {
          $(".timer").html("Time has run out this week.  Please wait patiently while scores are processed.")
          $(".submitButton>button").hide();
        } else if (snapshot.child("users").child(sessionUser).child(episodeNumber+1).child("moveSubmit").val()){
          $(".timer").html("Your move has been submitted, time to resubmit: " + days + "d " + hours + "h "
          + minutes + "m " + seconds + "s.");

        } else {
          ""
        }
      }, 1000);



      populateRank();
      multiplierGraveyardStyling();
      var startIndex, changeIndex, uiHeight;

      $('.sortable').sortable({
        'placeholder': 'marker',
        start: function(e, ui) {
          clickIndex = ui.item.index();
          startIndex = ui.placeholder.index();
          uiHeight = ui.item.outerHeight(true);
          ui.item.nextAll('#transitionFix:not(.marker)').css({
            transition: 'transform 0s',
            transform: 'translateY(' +uiHeight+ 'px)',

          });
          $('#transitionFix:not(.marker)').delay(50)
          .queue(function (next) {
            $(this).css({
              transition: 'transform .2s',
            });
            next();
          });
          ui.placeholder.css({
            height: 0,
            padding: 0
          });
          $(".deadZone").addClass("marginTop45");
        },
        change: function(e, ui) {
          changeIndex = ui.placeholder.index();
          changeRed = changeIndex+2;
          changeGreen = changeIndex;
          ui.item.nextAll('#transitionFix:not(.marker)').css({
            transition: 'transform .2s'
          });
          if (startIndex > changeIndex) {
            var slice = $('ul li').slice(changeIndex, $('ul li').length);
            slice.not('.ui-sortable-helper').each(function() {
              var item = $(this);
              //   if (changeIndex<clickIndex){$(".rank li:nth-child(" + changeRed+ ")").css({
              //     background:'lightcoral'
              //   });
              // }
              item.css({
                transition: 'transform .2s',
                transform: 'translateY(' +uiHeight+ 'px)'
              });
            });
          } else if (startIndex < changeIndex) {
            var slice = $('ul li').slice(startIndex, changeIndex);
            //   if (changeIndex>clickIndex){$(".rank li:nth-child(" + changeGreen+ ")").css({
            //     background:'lightgreen'
            //   });
            // }
            slice.not('.ui-sortable-helper').each(function() {
              var item = $(this);
              item.css({
                transform: 'translateY(0px)'
              });
            });
          }
          startIndex = changeIndex
        },
        stop: function(e, ui) {
          updateRank();
          $('.contestantBarMain').css({
            transition: 'transform 0s',
            transition: 'background-color .2s',
            background: 'none',
            transform: 'translateY(0)'
          })
          $(".deadZone").removeClass("marginTop45");
        }
      });

      // submit Move
      $(".moveSubmit").click(function(){
        var moveSubmit = []
        var i = 0
        $('.rank').children().each(function () {
          moveSubmit.push($(this).find(".contestantName").text().replace(/\s+/g, '-').toLowerCase());
        })
        var moveSubmitEpisode = episodeNumber + 1;
        database.ref('users/' + sessionUser + '/' + moveSubmitEpisode + "/").update({
          moveSubmit
        });

        $(".timer").html("Your move has been submitted.")
        $(".moveAlert").css("display", "none")
      });
    }




    // episode page

    if (window.location.href.indexOf("episodes") > -1){
      for (var i = 1; i < episodeNumber+1; i++) {
        var newEpisodeCell = $(".hiddenEpisodeCell > .episodeCell").clone().prependTo($(".cells"));
        newEpisodeCell.find("#episodeNumber").text(i);
        newEpisodeCell.find("#episodeTitle").text(snapshot.child("episodes").child(i).child("name").val());
        newEpisodeCell.find("#rewardWinner").text(snapshot.child("episodes").child(i).child("rewardWinner").val());
        newEpisodeCell.find("#immunityWinner").text(snapshot.child("episodes").child(i).child("immunityWinner").val());
        newEpisodeCell.find("#votedOff").text(snapshot.child("episodes").child(i).child("votedOff").val());
        newEpisodeCell.find("#message").html(snapshot.child("episodes").child(i).child("message").val());
        newEpisodeCell.css('display', 'block')
      }
    }
  });
})
