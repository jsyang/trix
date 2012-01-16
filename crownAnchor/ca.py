import random
import numpy

'''
Crown and Anchor (spinning wheel version)
Basic description: http://en.wikipedia.org/wiki/Crown_and_Anchor
Better photo of the wheel: http://www.jackofallspades.ca/wheel-rentals.php
Bet range: $0.50 - $2.00

There are 6 symbols:
  { diamond, clover, heart, spade, crown, anchor },
shall be referred to with indices 0 - 5.

Players bet on a symbol. Once all bets are placed, spinner is spun.

For each symbol matching a bet, player banker pays out the bet. 
Ex:
  Bet $0.50 on hearts. Spun heart, heart, crown.
  --> payout: $1.00 --> round end: $1.50
  
  Bet $1 on crowns. Spun spade, clover, diamond.
  --> payout: -$1.00 --> round end: $0.00
  
Normally this game is played with 3 x 6 sided dice, in this instance the die rolls
are substituted with a spinner which has the combinations arranged on it as follows:

28 outcomes on spinner, in order, as a circular linked list, starting from the 12 o'clock
position as per the photo:

000 <-.
544   |
222   |
332   |
555   |
100   |
444   | looped once, for 28 positions on the spinner
152   |
304   |
111   |
322   |
554   |
333   |
110 --'


Of note, we see the spinner does not match the pdf of the dice version of this game, as
only 14 different outcomes are available, all of them represented twice. In these 14
combinations, we have 3 distinct possibilities:

 1:   3 x symbol1
 2:   1 x symbol1, 2 x symbol2
 3:   1 x symbol1, 1 x symbol2, 1 x symbol3
 
Spin  # of unique symbols
000   1
544   2
222   1
332   2
555   1
100   2
444   1
152   3 <-
304   3 <-
111   1
322   2
554   2
333   1
110   2

Any bet gives us a positive payout if we hit at least 1 symbol on the spin. So,
spins with more unique symbols are the safer bets than spins with less.

Now, to the modelling:
By observing each round, we can make out a few parameters that will determine a
spin of the next round given the previous round.

Each spin position takes up 12 degrees of the wheel. Assuming the spinning of the 
wheel each round is within a consistency of +/- 45 degrees (90 degrees range) from 
the last position, we can get at least a starting heuristic for choosing what symbol
to bet on next, given the last spin.

The one which sticks out is to gather the expected payouts of the symbols based
on the last position and choose the symbol with the highest payout. This will
become the "useTable" heuristic.

'''

spins = ('000', '544', '222', '332', '555', '100', '444', '152', '304', '111', '322', '554', '333', '110')

# Do a spin with the bias being the last spin, given the
# deviation of how far from the bias the next spin lands.
def nextSpin( bias, stddev ): 
  return int(round(random.normalvariate(bias, stddev)))%12;

def payout( outcome, bet, amount ):  
  n = 0
  for i in outcome:
    if (i == str(bet)): n+=1
  if n > 0: return n*amount
  return -amount

# play N rounds using a heuristic
def playNrounds( N, bank, heuristic, stddev ):
  wins = 0
  stopped = 0

  # starting from a random index
  lastSpinIndex = random.randint(0,11)
  for n in range(N):
    bet = heuristic( lastSpinIndex, bank )
    lastSpinIndex = nextSpin( lastSpinIndex, stddev )
    lastPayout = payout( spins[lastSpinIndex], bet["symbol"], bet["amount"] )
    bank += lastPayout
    # print "Game #",n,": payout: ",lastPayout, " wins: ", wins, " bank: ", bank
    
    if(lastPayout>=0): wins+=1
    if bank<=0:
      stopped = n+1
      break

  if(stopped): return {"rate":float(wins)/stopped*100, "bank":bank, "stopped":stopped}  
  return {"rate":float(wins)/N*100, "bank":bank, "stopped":stopped}


# *************** Heuristics for choosing next symbol ***************
spinHeuristic = []

def buildHeuristicTable(stddevSpin):
  global spinHeuristic
  
  # within 2 std deviations of the spin; covers 95%
  sd=int(2*stddevSpin)
  pOutcome=1/(2*float(sd)+1)
  
  # best expectation for each position on the board
  expectation=[0.0]*len(spins)  
  
  for i in range(len(spins)): 
    expectationSymbol=[0]*6
    for j in range(i-sd,i+sd):
      k=j%len(spins)
      for n in range(6):
        expectationSymbol[n]+=payout(spins[k],n,1)
      
    expectation[i]=expectationSymbol.index(max(expectationSymbol))
    #print max(expectationSymbol), "@", expectation[i],"--", spins[i]
  spinHeuristic=expectation

def alwaysChooseDiamonds(*args):
  return {"symbol":0, "amount":1}
def alwaysChooseClubs(*args):
  return {"symbol":1, "amount":1}
def alwaysChooseHearts(*args):
  return {"symbol":2, "amount":1}
def alwaysChooseSpades(*args):
  return {"symbol":3, "amount":1}
def alwaysChooseCrown(*args):
  return {"symbol":4, "amount":1}
def alwaysChooseAnchor(*args):
  return {"symbol":5, "amount":1}

def useTable(lastSpinIndex,bank):
  return {"symbol":spinHeuristic[lastSpinIndex], "amount":1}

def useTableAnchorBetHigh(lastSpinIndex,bank):
  amountToBet=1
  if(spinHeuristic[lastSpinIndex]==5): amountToBet=2
  return {"symbol":spinHeuristic[lastSpinIndex], "amount":amountToBet}

def useTableLowPass(lastSpinIndex,bank):
  amountToBet=[0,0,2,0,2,2]
  return {"symbol":spinHeuristic[lastSpinIndex], "amount":amountToBet[spinHeuristic[lastSpinIndex]]}

def useTableHighPass(lastSpinIndex,bank):
  amountToBet=[0.5,0.5,0,0.5,0,0]
  return {"symbol":spinHeuristic[lastSpinIndex], "amount":amountToBet[spinHeuristic[lastSpinIndex]]}

def useRandom(*args):
  return {"symbol":random.randint(0,6), "amount":1}

# *************** Batch runs ***************
def playNgamesMrounds(N,M,bank,heuristic,stddev):
  games=[playNrounds(M,bank,heuristic,stddev) for i in range(N)]
  winrates=[]
  endbanks=[]
  losses=0
  for g in games:
    winrates.append(g["rate"])
    endbanks.append(g["bank"])
    if(g["stopped"]>0): losses+=1
  
  print "%(name)022s  %(meanwin)#2.2f%%,%(stdwin)03.2f%%    %(meanend)02.2f       %(lossrate)02.2f" % \
        {"name":heuristic.__name__,\
         "meanwin":numpy.average(winrates),\
         "stdwin":numpy.std(winrates),\
         "meanend":numpy.average(endbanks),\
         "lossrate":float(losses)/N*100}

# *************** run! ***************

# use standard deviation of 2 spots from last spin.
buildHeuristicTable(2)
print "                        Mean, Std.Dev.   Mean                 "
print "             Heuristic  Winrate          Ending$     Loss Rate"
print "______________________________________________________________"
playNgamesMrounds(1000,20,20,useRandom,2)
print "______________________________________________________________"
playNgamesMrounds(1000,20,20,alwaysChooseDiamonds,2)
playNgamesMrounds(1000,20,20,alwaysChooseClubs,2)
playNgamesMrounds(1000,20,20,alwaysChooseHearts,2)
playNgamesMrounds(1000,20,20,alwaysChooseSpades,2)
playNgamesMrounds(1000,20,20,alwaysChooseCrown,2)
playNgamesMrounds(1000,20,20,alwaysChooseAnchor,2)
print "______________________________________________________________"
playNgamesMrounds(1000,20,20,useTable,2)
playNgamesMrounds(1000,20,20,useTableAnchorBetHigh,2)
playNgamesMrounds(1000,20,20,useTableLowPass,2)
playNgamesMrounds(1000,20,20,useTableHighPass,2)

'''
A typical result:

                        Mean, Std.Dev.   Mean                 
             Heuristic  Winrate          Ending$     Loss Rate
______________________________________________________________
             useRandom  24.90%,9.97%     13.43       0.50
______________________________________________________________
  alwaysChooseDiamonds  24.65%,9.66%     14.80       0.80
     alwaysChooseClubs  24.93%,12.81%    13.28       2.40
    alwaysChooseHearts  32.99%,10.53%    18.14       0.10
    alwaysChooseSpades  25.16%,10.53%    11.74       0.70
     alwaysChooseCrown  32.87%,11.45%    18.08       0.00
    alwaysChooseAnchor  33.47%,10.56%    18.41       0.00
______________________________________________________________
              useTable  29.70%,10.70%    17.38       0.10
 useTableAnchorBetHigh  30.00%,10.73%    17.02       1.80
       useTableLowPass  71.59%,11.45%    18.59       1.20
      useTableHighPass  57.77%,11.72%    18.96       0.00

Best result seems to come from using the table of expectations,
and betting high on Hearts, Crowns and Anchors, otherwise bet
nothing.

'''
