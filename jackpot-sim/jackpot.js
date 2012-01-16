/*
  Simulation of "Jackpot" drinking game.
  Thai variant of "Shut the Box" ~ http://en.wikipedia.org/wiki/Shut_the_Box
  Seems to me the rules are confused by people (especially bloggers) who encounter this game.
  We shall use the rules as defined by the Wikipedia article under the variant "Thai style".
  
  jsyang.ca@gmail.com
  Sept. 16, 2011
  
  Equipment:
    2 x 6-sided die
    9 x tiles numbered 1-9
    (these tiles spell ".JACKPOT." when all of them are face down)
    
  Goal:
    Win the ".JACKPOT." / minimize amount of drinking on loss.
  
  End States:
    Win:  All tiles are face down at the end of turn. Other players must drink.
    Lose: Cannot flip any tiles. Player must drink the sum of the tiles face up.
  
  Start State:
    All tiles face up.
    
  Rules:
    Turn taking. One plays until an end state is reached, then next player begins.
    Cannot flip a tile that is already face down.
    
    Roll both dice. Possible moves:
      1: Choose a tile matching a die value to flip DOWN.
      2: Choose a tile matching the sum of the dice values to flip DOWN.
    
    Ex: All tiles are up. Rolled 2, 3.
    Can flip: 2 OR 3 OR 5.
    
    Ex: Tile 2 is down. Rolled 2, 3.
    Can flip: 3 OR 5.
    
    Ex: Tile 2, 3 are down. Rolled 2, 3.
    Can flip: 5.
    
--> Turns out we can reach a win-rate of almost 10% if we use the ranking heuristic.

*/

function Roll() { return Math.ceil(Math.random()*6); }
function Roll2(){ return [Roll(),Roll()]; }
function Moves(){ 
  var r=Roll2();
  var sum=r[0]+r[1];
  return sum<10? r.concat(sum) : r;
}

var scores = [];
var wins = 0;
  
function Game(strategy) {

  this.inplay=1;
  
  this.uptiles = {"1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1, remaining:9};
  
  this.statestring = function() {
    var s="";
    for(var i=1; i<10; i++) {
      var t=i+"";
      if(t in this.uptiles) s+=i+" ";
    }
    return s;
  };
  
  this.sumuptiles = function() {
    var sum=0;
    for(var i=1; i<10; i++) {
      var t=i+"";
      if(t in this.uptiles) sum+=i;
    }
    return sum;
  };
  
  this.flip = function(tile) {
    tile+=""; // ensure type is string
    if(tile in this.uptiles) {
      delete this.uptiles[tile];
      this.uptiles.remaining--;
    }
  };
  
  this.strategy=strategy;
    
  this.turn = function() {
    if(!this.inplay) return;
    
    var moves=Moves();
    var legalmoves=[];
    for(var i in moves) {
      var t=""+moves[i];
      if(t in this.uptiles)
        legalmoves.push(moves[i]);
    }

    // Use our strategy if we have legal moves
    if(legalmoves.length) {
      this.flip(this.strategy(legalmoves));
      return this.statestring();
    } else {
      this.inplay=0;
      var tileSum=this.sumuptiles();
      if(tileSum!=0) scores.push(tileSum);
      else wins++;
    }       
  };
  
};

// Strategies:

function ChooseLargest(choices) {
  var max=Number.NEGATIVE_INFINITY;
  for(var i in choices)
    if(max<choices[i]) max=choices[i];
  return max;
}

function ChooseSmallest(choices) {
  var min=Number.POSITIVE_INFINITY;
  for(var i in choices)
    if(min>choices[i]) min=choices[i];
  return min;
}

function ChooseOrderPrecedence(choices) {
  var rank=[-1,6,5,4,3,2,1,7,8,9];
   
  // Choose the choice with the highest rank
  var maxRank=rank[choices[0]];
  var maxRankTile=choices[0];
  for(var i in choices)
    if(maxRank<rank[choices[i]]) {
      maxRank=rank[choices[i]];
      maxRankTile=choices[i];
    }
  return maxRankTile;
}

// Simulation:

function RunNSims(n,strat) {
  // Reset scores stats.
  scores=[];
  wins=0;
  for(var currentGame=new Game(strat), m=0; m<n; m++, currentGame=new Game(strat))
    while(currentGame.inplay)
      currentGame.turn();
      
  return "Mean: " + SampleMean(scores) + "\nVariance: " + SampleVariance(scores) + "\nWin rate: " + wins/n;
}

// Sample statistics

function SampleMean(a) {
  if(!a.length) return;
  var sum=0;
  for(var i in a)
    sum+=a[i];
  return sum/a.length;
}

function SampleVariance(a) {
  if(!a.length) return;
  var mean=SampleMean(a);
  var sum=0;  
  for(var i in a) {
    var y=(a[i]-mean);
    sum+=y*y;
  }
  return sum/a.length;  
}

// Simulation execution:
//RunNSims(1e6,ChooseLargest);


/* other stuff
function onesInNRolls(n){ var o=0; for(var m=n;m-->0;) { var r=Roll2(); if(r[0]==1||r[1]==1) o++; } return o/n;}
*/
