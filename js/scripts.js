
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

var contestants = [];

var carl = new contestant("Carl", "Boudreaux", "img/carlboudreaux.png", "0.0", "0.0", "0", "0", "David", "David")
contestants.push(carl)
var pat = new contestant("Pat", "Cusak", "img/patcusak.png", "0.0", "0.0", "0", "0", "David", "David")
contestants.push(pat)
var christian = new contestant("Christian", "Hubicki", "img/christianhubicki.png", "0.0", "0.0", "0", "0", "David", "David")
contestants.push(christian)
var bi = new contestant("Bi", "Nguyen", "img/binguyen.png", "0.0", "0.0", "0", "0", "David", "David")
contestants.push(bi)
var elizabeth = new contestant("Elizabeth", "Olson", "img/elizabetholsen.png", "0.0", "0.0", "0", "0", "David", "David")
contestants.push(elizabeth)
var gabby = new contestant("Gabby", "Pascuzzi", "img/gabbypascuzzi.png", "0.0", "0.0", "0", "0", "David", "David")
contestants.push(gabby)
var jessica = new contestant("Jessica", "Peet", "img/jessicapeet.png", "0.0", "0.0", "0", "0", "David", "David")
contestants.push(jessica)
var davie = new contestant("Davie", "Rickenbacker", "img/davierickenbacker.png", "0.0", "0.0", "0", "0", "David", "David")
contestants.push(davie)
var lyrsa = new contestant("Lyrsa", "Torres", "img/lyrsatorres.png", "0.0", "0.0", "0", "0", "David", "David")
contestants.push(lyrsa)
var nick = new contestant("Nick", "Wilson", "img/nickwilson.png", "0.0", "0.0", "0", "0", "David", "David")
contestants.push(nick)
var jeremy = new contestant("Jeremy", "Crawford", "img/jeremycrawford.png", "0.0", "0.0", "0", "0", "Goliath", "Goliath")
contestants.push(jeremy)
var alec = new contestant("Alec", "Merlino", "img/alecmerlino.png", "0.0", "0.0", "0", "0", "Goliath", "Goliath")
contestants.push(alec)
var alison = new contestant("Alison", "Raybould", "img/alisonraybould.png", "0.0", "0.0", "0", "0", "Goliath", "Goliath")
contestants.push(alison)
var john = new contestant("John", "Hennigan", "img/johnhennigan.png", "0.0", "0.0", "0", "0", "Goliath", "Goliath")
contestants.push(john)
var dan = new contestant("Dan", "Rengering", "img/danrengering.png", "0.0", "0.0", "0", "0", "Goliath", "Goliath")
contestants.push(dan)
var mike = new contestant("Mike", "White", "img/mikewhite.png", "0.0", "0.0", "0", "0", "Goliath", "Goliath")
contestants.push(mike)
var natalie = new contestant("Natalie", "Cole", "img/nataliecole.png", "0.0", "0.0", "0", "0", "Goliath", "Goliath")
contestants.push(natalie)
var kara = new contestant("Kara", "Kay", "img/karakay.png", "0.0", "0.0", "0", "0", "Goliath", "Goliath")
contestants.push(kara)
var natalia = new contestant("Natalia", "Azoqa", "img/nataliaazoqa.png", "0.0", "0.0", "0", "0", "Goliath", "Goliath")
contestants.push(natalia)
var angelina = new contestant("Angelina", "Keeley", "img/angelinakeeley.png", "0.0", "0.0", "0", "0", "Goliath", "Goliath")
contestants.push(angelina)

function populateRank() {
  $(".rank").empty();
  for (i=0; i<contestants.length; i++){
    var newContestant = contestants[i];
    var newContestantBar = $(".contestantBarMain:first").clone();
    newContestantBar.addClass(newContestant.firstName)
    newContestantBar.find(".contestantPhoto").html('<img src="' + newContestant.photo + '" >');
    newContestantBar.find(".contestantName").html(newContestant.firstName + " " + newContestant.lastName);
    newContestantBar.find(".currentTribe").html(newContestant.currentTribe);
    newContestantBar.find(".originalTribe").html(newContestant.originalTribe);
    newContestantBar.find(".yourRank").html(i+1);
    newContestantBar.find(".previousRankHidden").html(i+1);
    newContestantBar.find(".epPoints").html("0");
    newContestantBar.find(".averagePoints").html(newContestant.averagePoints);
    newContestantBar.find(".yourStock").html("0.0");
    newContestantBar.find(".collectiveStock").html(newContestant.collectiveStock);
    $(".rank").append(newContestantBar);
    newContestantBar.css('display', 'flex');
  }
}

$(document).ready(function(){
  var sessionUser = sessionStorage.getItem('user');
  if (sessionUser){
    $(".username").html(sessionUser)
  }

  $(".createAccountButton").click(function(){
    var newUser = $("#createName").val();
    var newEmail = $("#createEmail").val();
    database.ref('users/' + newUser).set({
        email: newEmail
    });
  });
  $(".logInButton").click(function(){
    var userInput = $("#logInName").val();
    var emailInput = $("#logInEmail").val();
    database.ref('users/' + userInput).on("value", function(snapshot) {
      var emailData = snapshot.val();
      console.log(emailData.email);
       if (emailData.email == emailInput){
         sessionStorage.setItem('user', userInput);
         window.location.href = "move.html";
       } else {
         alert("Your username or email does not match our database")
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
            console.log(clickIndex);

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

  $(".addContestant").submit(function(event) {
    event.preventDefault();
    var firstNameInput = $("input.firstNameInput").val();
    var lastNameInput = $("input.lastNameInput").val();
    var tribeInput = $("input.tribeInput").val();
    var photoPath = $("input.photoPath").val();
    var addedContestant = new contestant(firstNameInput, lastNameInput, photoPath, "0.0", "00", "0", "0", tribeInput, tribeInput);
    contestants.push(addedContestant);
    populateRank();
  })

  $(".moveSubmit").click(function(){
    var i = 0
    $('.rank').children().each(function () {
      var rankName = $(this).find(".contestantName").text();
    database.ref('users/' + sessionUser + '/' + i).set({
        rankName
    });
    i ++;
  });
  });

})
