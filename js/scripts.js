
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
  var episodeNumber = Object.keys(snapshot.child("episodes").val()).length - 1;
  for (var i = 1; i < (episodeNumber+1); i++) {
    votedOffContestants.push(snapshot.child("episodes").child(i).child("votedOff").val());
  }
  for (var i = 0; i < contestants.length; i++) {
    if(votedOffContestants.indexOf(contestants[i])== -1){
      validContestants.push(contestants[i]);
    }
  }
  var overallRank = calculateOverallRank();
  var voteOffPool = 0
  var multiplierTwoPool = 0
  var multiplierOnePool = 0
  if (validContestants.length > 15){
    voteOffPool = 4
    multiplierTwoPool = 4
    multiplierOnePool = 4
  }else if (validContestants.length > 11 && validContestants < 16){
    voteOffPool = 3
    multiplierTwoPool = 3
    multiplierOnePool = 3
  }else if (validContestants.length > 7  && validContestants < 12){
    voteOffPool = 2
    multiplierTwoPool = 2
    multiplierOnePool = 2
  }else {
    voteOffPool = 3
    multiplierTwoPool = 1
    multiplierOnePool = 1
  }
  console.log(multiplierTwoPool);


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

  function calculateAveragePoints(contestant){
    var totalForAverage = 0;
    for (var i = 0; i < episodeNumber; i++) {
      totalForAverage = totalForAverage + parseInt(snapshot.child("episodes").child(i+1).child(contestant).child('0').val());
    }
    var average = totalForAverage/episodeNumber;
    return average;
  }

  function calculateYourStock(contestant, user){
    if (snapshot.child("users").child(user).child(i+1).child("moveSubmit").val()){
      var yourStock = 0;
      for (var i = 0; i < episodeNumber; i++) {
        var rankArray = snapshot.child("users").child(user).child(i+1).child("moveSubmit").val();
        var rank = rankArray.indexOf(contestant) + 1;
        var totalValid = rankArray.length;
        var graveyard = 0;
        if (totalValid > 15){
          graveyard = 4
        }else if (totalValid > 11 && validContestants < 16){
          graveyard = 3
        }else if (totalValid > 7  && validContestants < 12){
          graveyard = 2
        }else {
          graveyard = 3
        }

        if (rank < (totalValid + 1 - graveyard)){
        yourStock = yourStock + (1 - ((rank-1) * (1/(totalValid-graveyard))))
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
      var stockArray = []
      for (var i = 0; i < contestants.length; i++) {
        var contestantTotalStock = 0
        for (var j = 0; j < users.length; j++) {
          var stock = parseFloat(calculateYourStock(contestants[i], users[j]));
          if (stock == 0){
            stock = ".0000"
          }
          contestantTotalStock += stock;
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
      $(this).find(".yourRank").html(newRank);
      var newStock = calculateThisWeekStock(newRank)
      $(this).find(".addedStock").html('(+' + newStock + ')');
      var rankChange = previousRank - newRank;

      // moved this down for first episode... move back up to below var newrank
      var previousRank = $(this).find(".previousRankHidden").text();

      // comment out for first episode
      // if (rankChange > 0){
      //   rankChange = "+" + rankChange
      //   $(this).find(".previousRank").css({
      //     background: 'lightgreen'
      //   });
      // }
      // else if (rankChange < 0){
      //   $(this).find(".previousRank").css({
      //     background: 'lightcoral'
      //   });
      // }
      // else if (rankChange == 0){
      //   rankChange = " "
      //   $(this).find(".previousRank").css({
      //     background: 'none'
      //   });
      // }
      $(this).find(".previousRank").html(rankChange);
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
    console.log(validContestants);
    populateArray.forEach(function(contestant){
      var contestantObject = snapshot.child("contestants").child(contestant).val();
      var first = contestantObject.firstName;
      var last = contestantObject.lastName;
      var tribe = contestantObject.originalTribe;
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
      newContestantBar.find(".originalTribe").html(tribe);
      newContestantBar.find(".yourRank").html(j+1);
      newContestantBar.find(".previousRankHidden").html(j+1);
      newContestantBar.find(".epPoints").html(epPoints);
      newContestantBar.find(".averagePoints").html(average);
      newContestantBar.find(".yourStock").html(yourStock + ' <span class="addedStock">(+' + addedStock + ')</span>');
      newContestantBar.find(".overallRank").html(ovrlRank);
      newContestantBar.find(".idol").css("visibility", "hidden");
      if (idol){
        newContestantBar.find(".idol").css("visibility", "visible");
        if (idol > 1){
          newContestantBar.find(".idol").html("x" + idol);
        }
      }
      newContestantBar.find(".advantage").css("visibility", "hidden");
      if (advantage){
        newContestantBar.find(".advantage").css("visibility", "visible");
        if (advantage > 1){
          newContestantBar.find(".advantage").html("x" + advantage);
        }
      }
      if (tribe == "David"){
        newContestantBar.find(".contestantPhoto").css('box-shadow', '0px 0px 1px 3px orange')
      } else if (tribe == "Goliath"){
        newContestantBar.find(".contestantPhoto").css('box-shadow', '0px 0px 1px 3px #912CEE')
      }
      $(".rank").append(newContestantBar);
      newContestantBar.css('display', 'flex');
      j++;
    })
  }

  function multiplierGraveyardStyling(){
    // timestwo
    var barPosition = 170;
    $(".multiplierContainer").html('<div class="timesTwo"></div>');
    for (var i = 1; i <= multiplierTwoPool; i++) {
      barPosition += 55;
      $(".timesTwo").append('<div class="barBackground timesTwoBackground" style="top:' + barPosition + 'px;"></div>');
    }
    var twoMultiplierHeight = multiplierTwoPool*55
    $(".timesTwo").append('<div class="multiplierDiv tooltipmeowalt" style="height:' + twoMultiplierHeight + 'px;"><strong>x2 </strong> PTS.<span class="tooltiptext">Score double points for these contestants</span></div>');

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
    barPosition = (validContestants.length * 55) - (voteOffPool*55) + 170
    $(".multiplierContainer").append('<div class="graveyard"></div>');
    for (var i = 1; i <= voteOffPool; i++) {
      var graveyardOpacity = i/voteOffPool;
      barPosition += 55;
      $(".graveyard").append('<div class="barBackground graveyardBackground" style="top:' + barPosition + 'px; opacity:' + graveyardOpacity + ';"></div>');
    }
    var voteOffHeight = voteOffPool*55
    var voteOffPosition = (validContestants.length * 55) - voteOffHeight + 225;
    $(".graveyard").append('<div class="multiplierDiv graveyardBackground tooltipmeowalt" style="height:' + voteOffHeight + 'px; top:' + voteOffPosition + 'px;"><strong>PREDICT<br>GOING<br>HOME</strong><span class="tooltiptext">If one of these contestants goes home you score points in the Out Prediction category equal to 1 or less depending on their rank in this field</span></div>');
  }

  // function populateScoreboards(){
  //   // points ranking
  //
  //   for (var i = 0; i < users.length; i++) {
  //     // users[i]
  //     for (var j = 1; j < episodeNumber+1; j++) {
  //       for (var k = 0; k < contestants.length; k++) {
  //         // contestants[k]
  //         var episodeUserRankArray = snapshot.child("users").child(users[i]).child(j).child("moveSubmit").val();
  //         if 1-4{
  //           top 4
  //         }
  //         5-8{
  //
  //         }
  //       }
  //     }
  //   }
  //   for each user
  //   for each episode
  //   for each contestant
  //   grab the player rank multiplier
  //   grab the contestant score
  //   multiply and add to player score for the episode
  //   after all contestants and all episodes add to array next to user name.
  //   sort array and ouput users array
  //   populate rank with that and score array
  //
  //
  //   vote off ranking
  //   for each user
  //   for each episode
  //   for each contestant
  //   grab players voteoff predictions
  //   if voted off add to score
  //   after all episodes add to array next to userName
  //   sort array and output users array
  //   populate rank with that and score array
  //
  //   bracket ranking
  //
  //   overall ranking
  //   for each user
  //   cycle through ranking and grab rank
  //   add up and put next to name in array
  //   sort array and output user array
  //   populate rank with that and score array
  //
  //   perhaps we need a small function that just separates the score from the player name and we loop through the array with that to populate.
  // }


  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY

  $(document).ready(function(){
    $(".logOut").click(function(){
      sessionStorage.setItem('user', "");
      window.location.href = "index.html";
    })

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

    // adminpage load contestants
    if (window.location.href.indexOf("admin") > -1 && $(".contestant1").val() == ""){

      var contestantNumber = 0
      var j = 0
      for (var i = 0; i < contestants.length; i++) {
        if(votedOffContestants.indexOf(contestants[i])== -1){
          contestantNumber = i + 1 - j;
          var className = ".contestant" + contestantNumber;
          $(className).html(contestants[i]);
        } else {
          var votedOffContestantNumber = 20 - j;
          var votedOffClassName = ".contestant" + votedOffContestantNumber;
          $(votedOffClassName).html(contestants[i] + "(Voted Off)");
          j ++;

        }

      }
    }


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
        $(".createUserName").html("Thank you, your user name and email have been created.  Please Log in.");
      } else {
        $(".invalidEmail").html("Please enter a valid Email address.");
      }
    });
    $(".logInButton").click(function(){
      var userInput = $("#logInName").val().toLowerCase();
      var emailInput = $("#logInEmail").val().toLowerCase();
      console.log(userInput);
      if (users.indexOf(userInput) > -1){
        var emailData = snapshot.child("users").child(userInput).child("email").val();
        if (emailData == emailInput){
          sessionStorage.setItem('user', userInput);
          window.location.href = "move.html";
        } else {
          alert("Your email does not match our database")
        }
      } else {
        alert("Your username does not match our database")
      }
    });

// move page load
if (window.location.href.indexOf("move") > -1){
    populateRank();
    multiplierGraveyardStyling();
    var startIndex, changeIndex, uiHeight;

    $('.sortable').sortable({
      'placeholder': 'marker',
      start: function(e, ui) {
        clickIndex = ui.item.index();
        startIndex = ui.placeholder.index();
        uiHeight = ui.item.outerHeight(true);//get offset incl margin
        ui.item.nextAll('#transitionFix:not(.marker)').css({
          transition: 'transform 0s',
          transform: 'translateY(' +uiHeight+ 'px)'
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
      },
      change: function(e, ui) {
        changeIndex = ui.placeholder.index();
        changeRed = changeIndex+2;
        changeGreen = changeIndex;
        if (startIndex > changeIndex) {
          var slice = $('ul li').slice(changeIndex, $('ul li').length);
          slice.not('.ui-sortable-helper').each(function() {
            var item = $(this);
            //   if (changeIndex<clickIndex){$(".rank li:nth-child(" + changeRed+ ")").css({
            //     background:'lightcoral'
            //   });
            // }
            item.css({

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
      }
    });
    //   $('.sortable').sortable( {
    //     scroll:true,
    //     placeholder: "placeholder",
    //     stop: function( event, ui ) {
    //       $(".oGPlaceholder").remove();
    //       updateRank();
    //       $(".rankPlaceholder").html("")
    //       setTimeout(function() {
    //           $('.contestantBarMain').addClass('in');
    //       },0);
    //     }
    //   });
    // $('.sortable').sortable( {
    //   start: function (e, ui) {
    //     $(".contestantBarMain").each(function(index){
    //       if ($(this).is(":hover")){
    //     $("<div class='oGPlaceholder'> </div>").insertAfter($(this));
    //   }
    //     })
    //     $('.contestantBarMain').removeClass('in');
    // }
    //   });
    //   $( ".sortable" ).disableSelection();

    // $(".addContestant").submit(function(event) {
    //   event.preventDefault();
    //   var firstNameInput = $("input.firstNameInput").val();
    //   var lastNameInput = $("input.lastNameInput").val();
    //   var tribeInput = $("input.tribeInput").val();
    //   var photoPath = $("input.photoPath").val();
    //   var addedContestant = new contestant(firstNameInput, lastNameInput, photoPath, "0.0", "00", "0", "0", tribeInput, tribeInput);
    //   contestants.push(addedContestant);
    //   populateRank();
    // })

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
      $(".timerText").html("Your move has been submitted.")
      $(".submitMove").css("margin-top","17px")
    });
  }
    // admin submit episode
    $('#submitEpisode').click(function(){
      var number = $("#epNumberToDatabase").val();
      var title = $("#epTitleToDatabase").val();
      var reward = $("#rewardWinnerToDatabase").val();
      var immunity = $("#immunityWinnerToDatabase").val();
      var voted = $("#voteOffToDatabase").val().replace(/\s+/g, '-').toLowerCase();
      var message = $("#messageToDatabase").val();

      if (number < episodeNumber + 2 && number > 0){
        if((number < episodeNumber + 1 && confirm('Are you sure you want to edit existing episode number ' + number + '?')) || (number == episodeNumber + 1 && confirm('Are you sure you want to submit a new episode?  Warning: this will rollover all users to next episode'))){

          database.ref('episodes/' + number + '/').set({
            name: title,
            rewardWinner: reward,
            immunityWinner: immunity,
            votedOff: voted,
            message: message
          });
          $(".episodeSubmitted").html("Episode " + number + " submitted.")

          // PLAYER SCORE Submit

          // for each input in a contestant row:
          for (var i = 1; i < 21; i++) {
            var jqClass = ".contestant" + i
            var contestant = $(jqClass).text();
            var teamReward = 0;
            if ($(".teamReward." + i + " :input").prop('checked')){
              teamReward = 1;
            }
            var teamImmunity = 0;
            if ($(".teamImmunity." + i + " :input").prop('checked')){
              teamImmunity = 1;
            }
            var individualReward = 0;
            if ($(".individualReward." + i + " :input").prop('checked')){
              individualReward = 1;
            }
            var individualImmunity = 0;
            if ($(".individualImmunity." + i + " :input").prop('checked')){
              individualImmunity = 1;
            }
            var correctVote = 0;
            if ($(".correctVote." + i + " :input").prop('checked')){
              correctVote = 1;
            }
            var recievedVote = 0;
            if ($(".recievedVote." + i + " :input").prop('checked')){
              recievedVote = 1;
            }
            var votedOff = 0;
            if ($(".votedOff." + i + " :input").prop('checked')){
              votedOff = 1;
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
            if ($(".heldIdol." + i + " :input").prop('checked')){
              heldIdol = 1;
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
            if ($(".juryVotes." + i + " :input").prop('checked')){
              juryVotes = 1;
            }
            var special = 0;
            if ($(".special." + i + " :input").val()){
              special = parseInt($(".special." + i + " :input").val());
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



          }


          // check score type
          // put index of score type in a variable
          // add 1 if checked and 0 if not checked
          //
          // store all of these in variables and then call ref.set

          // use variables to set the data
        }
      } else {
        alert("Please enter a valid episode number")
      }
    })

    $("#loadEpisode").click(function(){
      for (var i = 1; i < (episodeNumber+1); i++) {
        if ($(".numberToLoad").val() == i){
          var immunityWinner = snapshot.child("episodes").child(i).child("immunityWinner").val();
          var votedOff = snapshot.child("episodes").child(i).child("votedOff").val();
          var rewardWinner = snapshot.child("episodes").child(i).child("rewardWinner").val();
          var episodeName = snapshot.child("episodes").child(i).child("name").val();
          var message = snapshot.child("episodes").child(i).child("message").val();

          $("#epNumberToDatabase").val(i);
          $("#epTitleToDatabase").val(episodeName);
          $("#rewardWinnerToDatabase").val(rewardWinner);
          $("#immunityWinnerToDatabase").val(immunityWinner);
          $("#voteOffToDatabase").val(votedOff);
          $("#messageToDatabase").val(message);

          for (var j = 1; j < 21; j++) {
            var contestant = $(".contestant" + j).text();

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
              $(".heldIdol." + j +" :input").prop('checked', true);
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


            // $(".teamReward." + j).val(snapshot.child("episodes").child(i).child(contestant).child(1).val())
            // $(".teamImmunity." + j).val(snapshot.child("episodes").child(i).child(contestant).child(2).val())
            // $(".individualReward." + j).val(snapshot.child("episodes").child(i).child(contestant).child(3).val())
            // $(".individualImmunity." + j).val(snapshot.child("episodes").child(i).child(contestant).child(4).val())
            // $(".correctVote." + j).val(snapshot.child("episodes").child(i).child(contestant).child(5).val())
            // $(".recievedVote." + j).val(snapshot.child("episodes").child(i).child(contestant).child(6).val())
            // $(".votedOff." + j).val(snapshot.child("episodes").child(i).child(contestant).child(7).val())
            // $(".clue." + j).val(snapshot.child("episodes").child(i).child(contestant).child(8).val())
            // $(".foundIdol." + j).val(snapshot.child("episodes").child(i).child(contestant).child(9).val())
            // $(".foundAdvantage." + j).val(snapshot.child("episodes").child(i).child(contestant).child(10).val())
            // $(".heldIdol." + j).val(snapshot.child("episodes").child(i).child(contestant).child(11).val())
            // $(".heldAdvantage." + j).val(snapshot.child("episodes").child(i).child(contestant).child(12).val())
            // $(".quoted." + j).val(snapshot.child("episodes").child(i).child(contestant).child(13).val())
            // $(".chosenReward." + j).val(snapshot.child("episodes").child(i).child(contestant).child(14).val())
            // $(".juryVotes." + j).val(snapshot.child("episodes").child(i).child(contestant).child(15).val())
            // $(".special." + j).val(snapshot.child("episodes").child(i).child(contestant).child(16).val())
            // }


          }
        }
      }

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
        photoURL: photo
      });
      $(".contestantSubmitted").html(first + " " + last + " submitted.")
    })
    // episode page
    if (window.location.href.indexOf("episodes") > -1){
      for (var i = 1; i < episodeNumber+1; i++) {
        var newEpisodeCell = $(".episodeCell").clone().appendTo($(".cells"));
        newEpisodeCell.find("#episodeNumber").text(i);
        newEpisodeCell.find("#episodeTitle").text(snapshot.child("episodes").child(i).child("name").val());
        newEpisodeCell.find("#rewardWinner").text(snapshot.child("episodes").child(i).child("rewardWinner").val());
        newEpisodeCell.find("#immunityWinner").text(snapshot.child("episodes").child(i).child("immunityWinner").val());
        newEpisodeCell.find("#votedOff").text(snapshot.child("episodes").child(i).child("votedOff").val());
        newEpisodeCell.find("#message").text(snapshot.child("episodes").child(i).child("message").val());
        newEpisodeCell.css('display', 'block')
      }
    }

  });
})
