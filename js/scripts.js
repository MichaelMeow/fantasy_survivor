
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

database.ref().on("value", function(snapshot) {
  var userData = snapshot.child("users").val();
  var users = Object.keys(snapshot.child("users").val());
  var contestantData = snapshot.child("contestants").val();
  var episodeData = snapshot.child("episodes").val();
  var contestants = Object.keys(snapshot.child("contestants").val());
  var validContestants = []
  var votedOffContestants = [];
  var episodeNumber = Object.keys(snapshot.child("episodes").val()).length - 1;
  for (var i = 0; i < episodeNumber.length; i++) {
    var epNum = episodeNumber[i]
    votedOffContestants.push(snapshot.child("episodes").child(epNum).child("votedOff").val());
  }
  for (var i = 0; i < contestants.length; i++) {
    if(votedOffContestants.indexOf(contestants[i])== -1){
      validContestants.push(contestants[i]);
    }
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

  function calculateAveragePoints(contestant){
    var totalForAverage = 0;
    for (var i = 0; i < episodeNumber; i++) {
      totalForAverage = totalForAverage + parseInt(snapshot.child("episodes").child(i+1).child(contestant).child('0').val());
    }
    var average = totalForAverage/episodeNumber;
    return average;
  }

  function calculateYourStock(contestant, user){
    var yourStock = 0;
    for (var i = 0; i < episodeNumber; i++) {
      var rankArray = snapshot.child("users").child(user).child(i+1).child("moveSubmit").val();
      var rank = rankArray.indexOf(contestant) + 1;
      var totalValid = rankArray.length;
      yourStock = yourStock + (1 - ((rank-1) * (1/(totalValid-1))))
    }
    return yourStock;
  }

  function calcualateThisWeekStock(currentRank, totalValid){
    var addedStock = 1 - ((currentRank-1) * (1/(totalValid-1)));
    return addedStock.toFixed(1);
  }

  function calculateOverallRank(){
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
  }

  function populateRank() {
    var populateArray = [];
    var moveSubmitData = "moveSubmit"
    if (snapshot.child("episodes").val()){
      populateArray = contestants;
    } else {
      var previousRank = snapshot.child("users").child(sessionUser).child(episodeNumber).child(moveSubmitData).val();
      for (var i = 0; i < previousRank.length; i++) {
        if(votedOffContestants.indexOf(previousRank[i])== -1){
          populateArray.push(previousRank[i]);
        }
      }
    }
    $(".rank").empty();
    var j = 0
    populateArray.forEach(function(contestant){
      var contestantObject = snapshot.child("contestants").child(contestant).val();
      var first = contestantObject.firstName;
      var last = contestantObject.lastName;
      var tribe = contestantObject.originalTribe;
      var photo = contestantObject.photoURL;
      var epPoints = snapshot.child("episodes").child(episodeNumber).child(contestant).child('0').val();
      var average = calculateAveragePoints(contestant);
      var yourStock = calculateYourStock(contestant, sessionUser).toFixed(1);
      var addedStock = calcualateThisWeekStock((j+1),populateArray.length);
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
      $(".rank").append(newContestantBar);
      newContestantBar.css('display', 'flex');
      j++;
    })
  }


  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY
  // DOCUMENT READY

  $(document).ready(function(){
    $(".adminTab").hide();
    $(".logOut").click(function(){
      sessionStorage.setItem('user', "");
      window.location.href = "index.html";
    })

    if (sessionUser){
      if (sessionUser == 'UtopianComplex'){
        $(".adminTab").show();
      }
      if (window.location.href.indexOf("index") > -1){
        window.location.href = "move.html";
      }
    }
    if (sessionUser){
      $(".username").html(sessionUser)
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
      var newUser = $("#createName").val();
      var newEmail = $("#createEmail").val();
      var paid = $('input[name=paid]:checked', '#paidForm').val();

      if(validateEmail(newEmail)){
        database.ref('users/' + newUser).set({
          email: newEmail,
          paid: paid
        });
        $(".createUserName").html("Thank you, your user name and email have been created.  Please Log in.");
      } else {
        $(".invalidEmail").html("Please enter a valid Email address.");
      }
    });
    $(".logInButton").click(function(){
      var userInput = $("#logInName").val();
      var emailInput = $("#logInEmail").val();
      database.ref('users/' + userInput).on("value", function(snapshot) {
        if (snapshot.val()){
          var emailData = snapshot.val();

          if (emailData.email == emailInput){
            sessionStorage.setItem('user', userInput);
            window.location.href = "move.html";
          } else {
            alert("Your email does not match our database")
          }
        } else {
          alert("Your username does not match our database")
        }
      }, function (error) {
        console.log("Error: " + error.code);
      });
    });


    populateRank();
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
      database.ref('users/' + sessionUser + '/' + episodeNumber + "/").update({
        moveSubmit
      });
      $(".rank").empty();
      populateRank();
    });
    // admin submit episode
    $('#submitEpisode').click(function(){
      var number = $("#epNumberToDatabase").val();
      var title = $("#epTitleToDatabase").val();
      var reward = $("#rewardWinnerToDatabase").val();
      var immunity = $("#immunityWinnerToDatabase").val();
      var voted = $("#voteOffToDatabase").val().replace(/\s+/g, '-').toLowerCase();
      var message = $("#messageToDatabase").val();
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

  });
})
