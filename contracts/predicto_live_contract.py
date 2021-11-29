import smartpy as sp

class Predicto(sp.Contract):
    def __init__(self, questionId:sp.TString, oracleAddress:sp.TAddress, endTime:sp.TTimestamp):
        self.init(
            balances = sp.big_map(tkey=sp.TAddress,tvalue=sp.TRecord(yes = sp.TNat, no=sp.TNat)),
            liquidityBalance = sp.big_map(tkey=sp.TAddress,tvalue=sp.TNat),
            yesPrice = sp.nat(0),
            noPrice = sp.nat(0),
            yesPool = sp.nat(0),
            noPool = sp.nat(0),
            invariant = sp.nat(0),
            totalLiquidityShares = sp.nat(0),
            questionId = questionId,
            isEventOver = sp.bool(False),
            oracleAddress = oracleAddress,
            endTime = endTime,
            isInitialized = sp.bool(False),
            ratio = sp.int(0),
            result = sp.bool(True)
        )

    @sp.entry_point
    def initializeMarket(self):
        sp.verify(self.data.isInitialized == sp.bool(False),"Already initialized")
        sp.verify(sp.amount >= sp.tez(1),"Amount is too low")
        self.data.isInitialized = sp.bool(True)
        self.data.isEventOver = sp.bool(False)
        self.data.totalLiquidityShares = sp.utils.mutez_to_nat(sp.amount)
        self.data.liquidityBalance[sp.sender] = sp.utils.mutez_to_nat(sp.amount)
        self.data.yesPool = sp.utils.mutez_to_nat(sp.amount)
        self.data.noPool = sp.utils.mutez_to_nat(sp.amount)
        self.data.noPrice = 500
        self.data.yesPrice = 500
        self.data.invariant = self.data.yesPool * self.data.noPool

    
    @sp.entry_point
    def buy(self,choice):
        sp.verify(self.data.isInitialized == sp.bool(True),"Market not initialized")
        sp.verify(self.data.isEventOver == sp.bool(False),"Market resolved already")
        sp.verify(sp.amount > sp.mutez(0),"Send some amount atleast")
        # true for yes token false for no token
        sp.if choice == sp.bool(True) :
            tempYesPool = sp.local("tempYesPool",self.data.yesPool).value + sp.utils.mutez_to_nat(sp.amount)
            newNoPool = sp.local("newNoPool",self.data.noPool).value + sp.utils.mutez_to_nat(sp.amount)
            self.data.noPool = newNoPool
            newYesPool = sp.fst(sp.ediv(sp.local(
                "newYesPool", self.data.invariant).value, newNoPool).open_some())
            tokensOut = abs(
                tempYesPool - newYesPool)
            self.data.yesPool = newYesPool
            sp.if self.data.balances.contains(sp.sender):
                record = self.data.balances.get(sp.sender)
                yes = record.yes + tokensOut
                no = record.no
                self.data.balances[sp.sender] = sp.record(yes = yes, no = no)
            sp.else:
                self.data.balances[sp.sender] = sp.record(yes = tokensOut, no = sp.nat(0))
            self.data.invariant = newYesPool* newNoPool
            self.data.yesPrice = (newNoPool * pow(10,3)) / (newNoPool+newYesPool)
            self.data.noPrice = (newYesPool * pow(10,3)) / (newNoPool+newYesPool)
        sp.else :
            tempNoPool = sp.local("tempNoPool",self.data.noPool).value + sp.utils.mutez_to_nat(sp.amount)
            newYesPool = sp.local("newYesPool",self.data.yesPool).value + sp.utils.mutez_to_nat(sp.amount)
            self.data.yesPool = newYesPool
            newNoPool = sp.fst(sp.ediv(sp.local(
                "newNoPool", self.data.invariant).value, newYesPool).open_some())
            tokensOut = abs(
                tempNoPool - newNoPool)
            self.data.noPool = newNoPool
            sp.if self.data.balances.contains(sp.sender):
                record = self.data.balances.get(sp.sender)
                yes = record.yes
                no = record.no + tokensOut
                self.data.balances[sp.sender] = sp.record(yes = yes, no = no)
            sp.else:
                self.data.balances[sp.sender] = sp.record(yes = sp.nat(0), no = tokensOut)
            self.data.invariant = newYesPool* newNoPool
            self.data.yesPrice = (newNoPool * pow(10,3)) / (newNoPool+newYesPool)
            self.data.noPrice = (newYesPool * pow(10,3)) / (newNoPool+newYesPool)

    @sp.entry_point
    def sell(self,choice,amount):
        sp.verify(self.data.isEventOver == sp.bool(False),"Market is resolved")
        sp.verify(self.data.isInitialized == sp.bool(True),"Market not initialized")
        sp.verify(self.data.balances.contains(sp.sender),"User not found in balance list")
        record = self.data.balances.get(sp.sender)
        # true for yes token false for no token
        sp.if choice == sp.bool(True) :
            sp.verify(abs(amount)<=record.yes,"Not enough tokens")
            c = ((sp.to_int(self.data.yesPool))*(self.data.noPool-abs(amount)))-(sp.to_int(self.data.invariant))
            b = (self.data.noPool + self.data.yesPool) - abs(amount)
            d = (b*b) - (4*c)
            squareD = self.squareRoot(abs(d))
            sol1 = sp.fst(sp.ediv(-b + sp.to_int(squareD),2).open_some())
            sol2 = sp.fst(sp.ediv(-b - sp.to_int(squareD),2).open_some())
            amountToTrade = sp.local('amountToTrade',sol1)
            sp.if amountToTrade.value < 0:
                amountToTrade.value = sol2
            sp.if amountToTrade.value > amount :
                amountToTrade.value = sol2
            self.data.noPool = abs((self.data.noPool) - abs((amount - amountToTrade.value)))
            self.data.yesPool = self.data.yesPool + abs(amountToTrade.value)
            self.data.invariant = self.data.noPool*self.data.yesPool
            self.data.yesPrice = (self.data.noPool * pow(10,3)) / (self.data.yesPool+self.data.noPool)
            self.data.noPrice = (self.data.yesPool * pow(10,3)) / (self.data.noPool+self.data.yesPool)
            amountToSend = sp.utils.nat_to_mutez(abs(amount - amountToTrade.value))
            sp.send(sp.sender, amountToSend, message = None)
            self.data.balances[sp.sender] = sp.record(yes = abs(record.yes-abs(amount)), no = record.no)
        sp.else :
            sp.verify(abs(amount)<=record.no,"Not enough tokens")
            c = ((sp.to_int(self.data.noPool))*(self.data.yesPool-abs(amount)))-(sp.to_int(self.data.invariant))
            b = (self.data.noPool + self.data.yesPool) - abs(amount)
            d = (b*b) - (4*c)
            squareD = self.squareRoot(abs(d))
            sol1 = sp.fst(sp.ediv(-b + sp.to_int(squareD),2).open_some())
            sol2 = sp.fst(sp.ediv(-b - sp.to_int(squareD),2).open_some())
            amountToTrade = sp.local('amountToTrade',sol1)
            sp.if amountToTrade.value < 0:
                amountToTrade.value = sol2
            sp.if amountToTrade.value > amount :
                amountToTrade.value = sol2
            self.data.yesPool = abs((self.data.yesPool) - abs(amount - amountToTrade.value))
            self.data.noPool = self.data.noPool + abs(amountToTrade.value)
            self.data.invariant = self.data.noPool*self.data.yesPool
            self.data.yesPrice = (self.data.noPool * pow(10,3)) / (self.data.yesPool+self.data.noPool)
            self.data.noPrice = (self.data.yesPool * pow(10,3)) / (self.data.noPool+self.data.yesPool)
            amountToSend = sp.utils.nat_to_mutez(abs(amount - amountToTrade.value)) 
            sp.send(sp.sender, amountToSend, message = None)
            self.data.balances[sp.sender] = sp.record(yes = record.yes, no = abs(record.no-abs(amount)))
    
    @sp.entry_point
    def addLiquidity(self):
        sp.verify(self.data.isInitialized == sp.bool(True),"Market not initialized")
        sp.verify(self.data.isEventOver == sp.bool(False),"Market resolved already")
        sp.verify(sp.amount > sp.mutez(0),"Send some amount atleast")
        #price of no is higher
        sp.if self.data.yesPool>self.data.noPool: 
            ratio = sp.fst(sp.ediv(self.data.yesPool*1000,self.data.noPool).open_some())
            noTokenToPool = sp.local("noTokenToPool",sp.fst(sp.ediv(sp.utils.mutez_to_nat(sp.amount)*1000,ratio).open_some()))
            tokensToSend = sp.local("tokensToSend",abs(sp.utils.mutez_to_nat(sp.amount) - noTokenToPool.value))
            yesPerShare = sp.fst(sp.ediv(self.data.yesPool*1000,self.data.totalLiquidityShares).open_some())
            sharesPurchased = sp.local("sharesPurchased", sp.fst(sp.ediv(sp.utils.mutez_to_nat(sp.amount)*1000,yesPerShare).open_some()))
            share = sp.local("share", self.data.liquidityBalance.get(sp.sender, 0)).value
            self.data.liquidityBalance[sp.sender] = share + sharesPurchased.value
            self.data.totalLiquidityShares = self.data.totalLiquidityShares + sharesPurchased.value
            self.data.yesPool = self.data.yesPool + sp.utils.mutez_to_nat(sp.amount)
            self.data.noPool = self.data.noPool+noTokenToPool.value
            self.data.invariant = self.data.noPool*self.data.yesPool
            sp.if self.data.balances.contains(sp.sender):
                record = self.data.balances.get(sp.sender)
                yes = record.yes 
                no = record.no + tokensToSend.value
                self.data.balances[sp.sender] = sp.record(yes = yes, no = no)
            sp.else:
                self.data.balances[sp.sender] = sp.record(yes = sp.nat(0), no = tokensToSend.value)
        sp.else:
            #price of yes is higher
            sp.if self.data.noPool>self.data.yesPool : 
                ratio = sp.fst(sp.ediv(self.data.noPool*1000,self.data.yesPool).open_some())
                yesTokenToPool = sp.local("yesTokenToPool",sp.fst(sp.ediv(sp.utils.mutez_to_nat(sp.amount)*1000,ratio).open_some()))
                tokensToSend = sp.local("tokensToSend",abs(sp.utils.mutez_to_nat(sp.amount) - yesTokenToPool.value))
                noPerShare = sp.fst(sp.ediv(self.data.noPool*1000,self.data.totalLiquidityShares).open_some())
                sharesPurchased = sp.local("sharesPurchased",sp.fst(sp.ediv(sp.utils.mutez_to_nat(sp.amount)*1000,noPerShare).open_some()))
                share = sp.local("share", self.data.liquidityBalance.get(sp.sender, 0)).value
                self.data.liquidityBalance[sp.sender] = share + sharesPurchased.value
                self.data.totalLiquidityShares = self.data.totalLiquidityShares + sharesPurchased.value
                self.data.yesPool = self.data.yesPool + yesTokenToPool.value 
                self.data.noPool = self.data.noPool+ sp.utils.mutez_to_nat(sp.amount)
                self.data.invariant = self.data.noPool*self.data.yesPool
                sp.if self.data.balances.contains(sp.sender):
                    record = self.data.balances.get(sp.sender)
                    yes = record.yes + tokensToSend.value
                    no = record.no
                    self.data.balances[sp.sender] = sp.record(yes = yes, no = no)
                sp.else:
                    self.data.balances[sp.sender] = sp.record(yes =tokensToSend.value, no = sp.nat(0))
            #price is same
            sp.else: 
                share = sp.local("share", self.data.liquidityBalance.get(sp.sender, 0)).value
                self.data.liquidityBalance[sp.sender] = share + sp.utils.mutez_to_nat(sp.amount)
                self.data.yesPool = self.data.yesPool + sp.utils.mutez_to_nat(sp.amount)
                self.data.noPool = self.data.noPool+ sp.utils.mutez_to_nat(sp.amount)
                self.data.invariant = self.data.noPool*self.data.yesPool
                self.data.totalLiquidityShares = self.data.totalLiquidityShares + sp.utils.mutez_to_nat(sp.amount)
                
    @sp.entry_point
    def removeLiquidity(self,amount):
        sp.verify(self.data.isInitialized == sp.bool(True),"Market not initialized")
        sp.verify(amount > 0,"Amount cant be less than 0")
        sp.verify(abs(amount) <= self.data.liquidityBalance[sp.sender],"Balance insufficent")
        #price of yes is higher
        sp.if self.data.noPool>self.data.yesPool: 
            factor = sp.local("factor",sp.fst(sp.ediv(self.data.totalLiquidityShares*1000,abs(amount)).open_some()))
            tezToSend = sp.local("tezTosend",sp.fst(sp.ediv(self.data.yesPool*1000,factor.value).open_some()))
            noByFactor = sp.local("noByFactor",sp.fst(sp.ediv(self.data.noPool*1000,factor.value).open_some()))
            noToSend = sp.local("noToSend", abs(noByFactor.value - tezToSend.value))
            self.data.liquidityBalance[sp.sender] = abs(self.data.liquidityBalance[sp.sender] - abs(amount))
            self.data.totalLiquidityShares = abs(self.data.totalLiquidityShares - abs(amount))
            self.data.yesPool = abs(self.data.yesPool - tezToSend.value)
            self.data.noPool = abs(self.data.noPool - noByFactor.value)
            self.data.invariant = self.data.noPool*self.data.yesPool
            sp.send(sp.sender, sp.utils.nat_to_mutez(tezToSend.value), message = None)
            sp.if self.data.balances.contains(sp.sender):
                record = self.data.balances.get(sp.sender)
                yes = record.yes 
                no = record.no + noToSend.value
                self.data.balances[sp.sender] = sp.record(yes = yes, no = no)
            sp.else:
                self.data.balances[sp.sender] = sp.record(yes = sp.nat(0), no = noToSend.value)
        sp.else:
            #price of no is higher
            sp.if self.data.yesPool>self.data.noPool : 
                factor = sp.local("factor",sp.fst(sp.ediv(self.data.totalLiquidityShares*1000,abs(amount)).open_some()))
                tezToSend = sp.local("tezTosend",sp.fst(sp.ediv(self.data.noPool*1000,factor.value).open_some()))
                yesByFactor = sp.local("yesByFactor",sp.fst(sp.ediv(self.data.yesPool*1000,factor.value).open_some()))
                yesToSend = sp.local("yesToSend", abs(yesByFactor.value - tezToSend.value))
                self.data.liquidityBalance[sp.sender] = abs(self.data.liquidityBalance[sp.sender] - abs(amount))
                self.data.totalLiquidityShares = abs(self.data.totalLiquidityShares - abs(amount))
                self.data.noPool = abs(self.data.noPool - tezToSend.value)
                self.data.yesPool = abs(self.data.yesPool - yesByFactor.value)
                self.data.invariant = self.data.noPool*self.data.yesPool
                sp.send(sp.sender, sp.utils.nat_to_mutez(tezToSend.value), message = None)
                sp.if self.data.balances.contains(sp.sender):
                    record = self.data.balances.get(sp.sender)
                    yes = record.yes + yesToSend.value
                    no = record.no 
                    self.data.balances[sp.sender] = sp.record(yes = yes, no = no)
                sp.else:
                    self.data.balances[sp.sender] = sp.record(yes = yesToSend.value, no = sp.nat(0))
            #price is same
            sp.else: 
                self.data.liquidityBalance[sp.sender] = abs(self.data.liquidityBalance[sp.sender] - abs(amount))
                self.data.yesPool = abs(self.data.yesPool - abs(amount))
                self.data.noPool = abs(self.data.noPool - abs(amount))
                self.data.invariant = self.data.noPool*self.data.yesPool
                self.data.totalLiquidityShares = abs(self.data.totalLiquidityShares - abs(amount))
                sp.send(sp.sender, sp.utils.nat_to_mutez(abs(amount)), message = None)

    @sp.entry_point
    def resolveMarket(self,result):
        sp.verify(self.data.isInitialized == sp.bool(True),"Market not initialized")
        sp.verify(self.data.isEventOver == sp.bool(False),"Market resolved already")
        sp.verify(self.data.oracleAddress == sp.sender,"Oracale address wrong")
        self.data.isEventOver = sp.bool(True)
        sp.if result == sp.bool(True):
            self.data.yesPrice = 1000
            self.data.noPrice = 0
        sp.else:
            self.data.yesPrice = 0
            self.data.noPrice = 1000
        self.data.result = result 
        #true for yes, false for no

    @sp.entry_point
    def claimShares(self):
        sp.verify(self.data.isInitialized == sp.bool(True),"Market not initialized")
        sp.verify(self.data.isEventOver == sp.bool(True),"Market not resolved yet")
        sp.verify(self.data.balances.contains(sp.sender),"User not found in balance list")
        record = self.data.balances.get(sp.sender)
        sp.if self.data.result == sp.bool(True):
            sp.verify(record.yes>0,"No balance to redeem")
            sp.send(sp.sender, sp.utils.nat_to_mutez(record.yes), message = None)
            self.data.balances[sp.sender] = sp.record(yes = 0, no = 0)
        sp.else:
            sp.verify(record.no>0,"No balance to redeem")
            sp.send(sp.sender, sp.utils.nat_to_mutez(record.no), message = None)
            self.data.balances[sp.sender] = sp.record(yes = 0, no = 0)

    def squareRoot(self, x):
        sp.verify(x >= 0)
        y = sp.local('y', x)
        sp.while y.value * y.value > x:
            y.value = (x // y.value + y.value) // 2
        sp.verify((y.value * y.value <= x) & (x < (y.value + 1) * (y.value + 1)))
        return y.value



if "templates" not in __name__:
    @sp.add_test(name = "Predicto")
    def test():
        alice = sp.test_account("Alice")
        bob = sp.test_account("Bob")
        cat = sp.test_account("Cat")
        c1 = Predicto(questionId=sp.string("QuestionID"), oracleAddress=alice.address, endTime=sp.timestamp_from_utc(2021, 10, 20, 23, 59, 59))
        scenario = sp.test_scenario()
        scenario.h1("Predicto")
        scenario += c1
        c1.initializeMarket().run(sender=alice,amount=sp.tez(10))
        scenario.h1("Buying 10 tez of yes bob")
        c1.buy(sp.bool(True)).run(sender=bob,amount=sp.tez(10))
        scenario.h1("Buying 10 tez of yes cat")
        c1.buy(sp.bool(True)).run(sender=cat,amount=sp.tez(10))
        scenario.h1("Add liquidity 10 dai alice")
        c1.addLiquidity().run(sender=alice,amount=sp.tez(10))
        scenario.h1("Selling 10 yes bob")
        c1.sell(choice=sp.bool(True),amount=10000000).run(sender=bob)
        scenario.h1("Removing Liqudity 5 alice")
        c1.removeLiquidity(5000000).run(sender=alice)
        scenario.h1("Selling 5 yes bob")
        c1.sell(choice=sp.bool(True),amount=5000000).run(sender=bob)
        scenario.h1("Resolving market yes")
        c1.resolveMarket(sp.bool(True)).run(sender=alice)
        scenario.h1("Claim Shares cat")
        c1.claimShares().run(sender=cat)
        scenario.h1("Removing Liqudity 8.33 alice")
        c1.removeLiquidity(8333333).run(sender=alice)
        scenario.h1("Claim Shares alice")
        c1.claimShares().run(sender=alice)

        #scenario.h1("Resolving market yes")
        #c1.resolveMarket(sp.bool(True)).run(sender=alice)
        #scenario.h1("Claiming shares yes bob")
        #c1.claimShares().run(sender=bob)
        #scenario.h1("Claiming shares no cat")
        #c1.claimShares().run(sender=cat).run(valid=False)
        #scenario.h1("Claiming shares yes alice")
        #c1.claimShares().run(sender=alice)
        #scenario.h1("Removing liquidity 10 alice")
        #c1.removeLiquidity(10000000).run(sender=alice)
        #scenario.h1("Removing liquidity 10 alice")
        #c1.claimShares().run(sender=alice)

    sp.add_compilation_target("Predicto_comp", Predicto(questionId=sp.string("QuestionID"), oracleAddress=sp.address("tz1RbD1TgNgxzw3AXa9TwPgnpkGCy5xKv2Vf"), endTime=sp.timestamp_from_utc(2021, 9, 20, 23, 59, 59)))

    