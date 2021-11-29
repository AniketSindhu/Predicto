import smartpy as sp

FA12 = sp.io.import_template("FA1.2.py")

class Balance_of:
    def request_type():
        return sp.TRecord(
            owner = sp.TAddress,
            token_id = sp.TNat).layout(("owner", "token_id"))
    def response_type():
        return sp.TList(
            sp.TRecord(
                request = Balance_of.request_type(),
                balance = sp.TNat).layout(("request", "balance")))
    def entry_point_type():
        return sp.TRecord(
            callback = sp.TContract(Balance_of.response_type()),
            requests = sp.TList(Balance_of.request_type())
        ).layout(("requests", "callback"))


class ContractLibrary(sp.Contract,Balance_of): 
    
    def TransferFATwoTokens(sender,reciever,amount,tokenAddress,id):

        arg = [
            sp.record(
                from_ = sender,
                txs = [
                    sp.record(
                        to_         = reciever,
                        token_id    = id , 
                        amount      = amount 
                    )
                ]
            )
        ]

        transferHandle = sp.contract(
            sp.TList(sp.TRecord(from_=sp.TAddress, txs=sp.TList(sp.TRecord(amount=sp.TNat, to_=sp.TAddress, token_id=sp.TNat).layout(("to_", ("token_id", "amount")))))), 
            tokenAddress,
            entry_point='transfer').open_some()

        sp.transfer(arg, sp.mutez(0), transferHandle)


    def TransferFATokens(sender,reciever,amount,tokenAddress): 

        TransferParam = sp.record(
            from_ = sender, 
            to_ = reciever, 
            value = amount
        )

        transferHandle = sp.contract(
            sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_ as from", ("to_ as to", "value"))),
            tokenAddress,
            "transfer"
            ).open_some()

        sp.transfer(TransferParam, sp.mutez(0), transferHandle)

    def TransferToken(sender, reciver, amount, tokenAddress,id, faTwoFlag): 

        sp.if faTwoFlag: 

            ContractLibrary.TransferFATwoTokens(sender, reciver, amount , tokenAddress, id )

        sp.else: 

            ContractLibrary.TransferFATokens(sender, reciver, amount, tokenAddress)

    def updateFaTwo(owner,exchangeAddress,tokenAddress,tokenId,operationType): 
    
        contractHandle = sp.contract(
            sp.TList(
            sp.TVariant(
                add_operator = sp.TRecord(
                    owner = sp.TAddress,
                    operator = sp.TAddress,
                    token_id = sp.TNat).layout(("owner", ("operator", "token_id"))),
                remove_operator = sp.TRecord(
                    owner = sp.TAddress,
                    operator = sp.TAddress,
                    token_id = sp.TNat).layout(("owner", ("operator", "token_id")))
            )
        ),
        tokenAddress,
        "update_operators"
        ).open_some()

        contractData = [
            sp.variant("remove_operator", sp.record(
            owner = owner,
            operator = exchangeAddress,
            token_id = tokenId)),
        ]

        sp.if operationType: 
            
            contractData = [
                sp.variant("add_operator", sp.record(
                owner = owner,
                operator = exchangeAddress,
                token_id = tokenId)),
            ]   

        sp.transfer(contractData, sp.mutez(0), contractHandle)


class Predicto(ContractLibrary):
    def __init__(self):
        self.init_type(
            sp.TRecord(
                balances = sp.TBigMap(k=sp.TAddress, v=sp.TRecord(yes = sp.TNat, no=sp.TNat)),
                liquidityBalance = sp.TBigMap(k=sp.TAddress,v=sp.TNat),
                yesPrice = sp.TNat,
                noPrice = sp.TNat,
                yesPool = sp.TNat,
                noPool = sp.TNat,
                invariant = sp.TNat,
                totalLiquidityShares = sp.TNat,
                questionId = sp.TString,
                isEventOver = sp.TBool,
                oracleAddress = sp.TAddress,
                tokenAddress = sp.TAddress,
                faTwoFlag = sp.TBool,
                endTime = sp.TTimestamp,
                isInitialized = sp.TBool,
                result = sp.TBool,
                factoryAddress = sp.TAddress
        ))

    @sp.entry_point
    def initializeMarket(self,tokenAmount):
        sp.set_type(tokenAmount,sp.TNat)
        sp.verify(self.data.isInitialized == sp.bool(False),"Already initialized")
        sp.verify(tokenAmount >= 1,"Amount is too low")
        self.data.isInitialized = sp.bool(True)
        self.data.isEventOver = sp.bool(False)
        self.data.totalLiquidityShares = tokenAmount
        self.data.liquidityBalance[sp.sender] = tokenAmount
        self.data.yesPool = tokenAmount
        self.data.noPool = tokenAmount
        self.data.noPrice = 500
        self.data.yesPrice = 500
        self.data.invariant = self.data.yesPool * self.data.noPool
        ContractLibrary.TransferToken(sp.sender, sp.self_address, tokenAmount, self.data.tokenAddress, 0, self.data.faTwoFlag)
        #ContractLibrary.getBalance(self.data.tokenAddress, 0, self.data.faTwoFlag)

    
    @sp.entry_point
    def buy(self,choice,tokenAmount):
        sp.set_type(tokenAmount,sp.TNat)
        sp.set_type(choice,sp.TBool)
        sp.verify(self.data.isInitialized == sp.bool(True),"Market not initialized")
        sp.verify(self.data.isEventOver == sp.bool(False),"Market resolved already")
        sp.verify(tokenAmount > 0,"Send some amount atleast")

        ContractLibrary.TransferToken(sp.sender, sp.self_address, tokenAmount, self.data.tokenAddress, 0, self.data.faTwoFlag)

        # true for yes token false for no token
        sp.if choice :
            tempYesPool = sp.local("tempYesPool",self.data.yesPool).value + tokenAmount
            newNoPool = sp.local("newNoPool",self.data.noPool).value + tokenAmount
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
            tempNoPool = sp.local("tempNoPool",self.data.noPool).value + tokenAmount
            newYesPool = sp.local("newYesPool",self.data.yesPool).value + tokenAmount
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
        sp.set_type(amount,sp.TNat)
        sp.set_type(choice,sp.TBool)
        sp.verify(self.data.isEventOver == sp.bool(False),"Market is resolved")
        sp.verify(self.data.isInitialized == sp.bool(True),"Market not initialized")
        sp.verify(self.data.balances.contains(sp.sender),"User not found in balance list")
        record = self.data.balances.get(sp.sender)
        # true for yes token false for no token
        sp.if choice == sp.bool(True) :
            sp.verify(amount<=record.yes,"Not enough tokens")
            c = ((sp.to_int(self.data.yesPool))*(self.data.noPool- amount))-(sp.to_int(self.data.invariant))
            b = (self.data.noPool + self.data.yesPool) - amount
            d = (b*b) - (4*c)
            squareD = self.squareRoot(abs(d))
            sol1 = sp.fst(sp.ediv(-b + sp.to_int(squareD),2).open_some())
            sol2 = sp.fst(sp.ediv(-b - sp.to_int(squareD),2).open_some())
            amountToTrade = sp.local('amountToTrade',sol1)
            sp.if amountToTrade.value < 0:
                amountToTrade.value = sol2
            sp.if amountToTrade.value > sp.to_int(amount) :
                amountToTrade.value = sol2
            self.data.noPool = abs((self.data.noPool) - abs((sp.to_int(amount) - amountToTrade.value)))
            self.data.yesPool = self.data.yesPool + abs(amountToTrade.value)
            self.data.invariant = self.data.noPool*self.data.yesPool
            self.data.yesPrice = (self.data.noPool * pow(10,3)) / (self.data.yesPool+self.data.noPool)
            self.data.noPrice = (self.data.yesPool * pow(10,3)) / (self.data.noPool+self.data.yesPool)
            amountToSend = abs(sp.to_int(amount) - amountToTrade.value)
            #sp.send(sp.sender, amountToSend, message = None)
            ContractLibrary.TransferToken(sp.self_address, sp.sender, amountToSend, self.data.tokenAddress, 0, self.data.faTwoFlag)
            self.data.balances[sp.sender] = sp.record(yes = abs(record.yes- amount), no = record.no)
        sp.else :
            sp.verify(amount<=record.no,"Not enough tokens")
            c = ((sp.to_int(self.data.noPool))*(self.data.yesPool- amount))-(sp.to_int(self.data.invariant))
            b = (self.data.noPool + self.data.yesPool) - amount
            d = (b*b) - (4*c)
            squareD = self.squareRoot(abs(d))
            sol1 = sp.fst(sp.ediv(-b + sp.to_int(squareD),2).open_some())
            sol2 = sp.fst(sp.ediv(-b - sp.to_int(squareD),2).open_some())
            amountToTrade = sp.local('amountToTrade',sol1)
            sp.if amountToTrade.value < 0:
                amountToTrade.value = sol2
            sp.if amountToTrade.value > sp.to_int(amount) :
                amountToTrade.value = sol2
            self.data.yesPool = abs((self.data.yesPool) - abs(sp.to_int(amount) - amountToTrade.value))
            self.data.noPool = self.data.noPool + abs(amountToTrade.value)
            self.data.invariant = self.data.noPool*self.data.yesPool
            self.data.yesPrice = (self.data.noPool * pow(10,3)) / (self.data.yesPool+self.data.noPool)
            self.data.noPrice = (self.data.yesPool * pow(10,3)) / (self.data.noPool+self.data.yesPool)
            amountToSend = abs(sp.to_int(amount) - amountToTrade.value)
            ContractLibrary.TransferToken(sp.self_address, sp.sender, amountToSend, self.data.tokenAddress, 0, self.data.faTwoFlag)
            #sp.send(sp.sender, amountToSend, message = None)
            self.data.balances[sp.sender] = sp.record(yes = record.yes, no = abs(record.no- amount))
    
    @sp.entry_point
    def addLiquidity(self, tokenAmount):
        sp.set_type(tokenAmount,sp.TNat)
        sp.verify(self.data.isInitialized == sp.bool(True),"Market not initialized")
        sp.verify(self.data.isEventOver == sp.bool(False),"Market resolved already")
        sp.verify(tokenAmount > 0,"Send some amount atleast")
        ContractLibrary.TransferToken(sp.sender, sp.self_address, tokenAmount, self.data.tokenAddress, 0, self.data.faTwoFlag)
        #price of no is higher
        sp.if self.data.yesPool>self.data.noPool: 
            ratio = sp.fst(sp.ediv(self.data.yesPool*1000,self.data.noPool).open_some())
            noTokenToPool = sp.local("noTokenToPool",sp.fst(sp.ediv(tokenAmount*1000,ratio).open_some()))
            tokensToSend = sp.local("tokensToSend",abs(tokenAmount - noTokenToPool.value))
            yesPerShare = sp.fst(sp.ediv(self.data.yesPool*1000,self.data.totalLiquidityShares).open_some())
            sharesPurchased = sp.local("sharesPurchased", sp.fst(sp.ediv(tokenAmount *1000,yesPerShare).open_some()))
            share = sp.local("share", self.data.liquidityBalance.get(sp.sender, 0)).value
            self.data.liquidityBalance[sp.sender] = share + sharesPurchased.value
            self.data.totalLiquidityShares = self.data.totalLiquidityShares + sharesPurchased.value
            self.data.yesPool = self.data.yesPool + tokenAmount
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
                yesTokenToPool = sp.local("yesTokenToPool",sp.fst(sp.ediv(tokenAmount*1000,ratio).open_some()))
                tokensToSend = sp.local("tokensToSend",abs(tokenAmount - yesTokenToPool.value))
                noPerShare = sp.fst(sp.ediv(self.data.noPool*1000,self.data.totalLiquidityShares).open_some())
                sharesPurchased = sp.local("sharesPurchased",sp.fst(sp.ediv(tokenAmount*1000,noPerShare).open_some()))
                share = sp.local("share", self.data.liquidityBalance.get(sp.sender, 0)).value
                self.data.liquidityBalance[sp.sender] = share + sharesPurchased.value
                self.data.totalLiquidityShares = self.data.totalLiquidityShares + sharesPurchased.value
                self.data.yesPool = self.data.yesPool + yesTokenToPool.value 
                self.data.noPool = self.data.noPool+ tokenAmount
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
                self.data.liquidityBalance[sp.sender] = share + tokenAmount
                self.data.yesPool = self.data.yesPool + tokenAmount
                self.data.noPool = self.data.noPool+ tokenAmount
                self.data.invariant = self.data.noPool*self.data.yesPool
                self.data.totalLiquidityShares = self.data.totalLiquidityShares + tokenAmount
                
    @sp.entry_point
    def removeLiquidity(self,amount):
        sp.set_type(amount,sp.TNat)
        sp.verify(self.data.isInitialized == sp.bool(True),"Market not initialized")
        sp.verify(amount > 0,"Amount cant be less than 0")
        sp.verify(amount <= self.data.liquidityBalance[sp.sender],"Balance insufficent")
        #price of yes is higher
        sp.if self.data.noPool>self.data.yesPool: 
            factor = sp.local("factor",sp.fst(sp.ediv(self.data.totalLiquidityShares*1000,amount).open_some()))
            tezToSend = sp.local("tezTosend",sp.fst(sp.ediv(self.data.yesPool*1000,factor.value).open_some()))
            noByFactor = sp.local("noByFactor",sp.fst(sp.ediv(self.data.noPool*1000,factor.value).open_some()))
            noToSend = sp.local("noToSend", abs(noByFactor.value - tezToSend.value))
            self.data.liquidityBalance[sp.sender] = abs(self.data.liquidityBalance[sp.sender] - amount)
            self.data.totalLiquidityShares = abs(self.data.totalLiquidityShares - amount)
            self.data.yesPool = abs(self.data.yesPool - tezToSend.value)
            self.data.noPool = abs(self.data.noPool - noByFactor.value)
            self.data.invariant = self.data.noPool*self.data.yesPool
            #sp.send(sp.sender, sp.utils.nat_to_mutez(tezToSend.value), message = None)
            ContractLibrary.TransferToken(sp.self_address, sp.sender, tezToSend.value, self.data.tokenAddress, 0, self.data.faTwoFlag)
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
                factor = sp.local("factor",sp.fst(sp.ediv(self.data.totalLiquidityShares*1000,amount).open_some()))
                tezToSend = sp.local("tezTosend",sp.fst(sp.ediv(self.data.noPool*1000,factor.value).open_some()))
                yesByFactor = sp.local("yesByFactor",sp.fst(sp.ediv(self.data.yesPool*1000,factor.value).open_some()))
                yesToSend = sp.local("yesToSend", abs(yesByFactor.value - tezToSend.value))
                self.data.liquidityBalance[sp.sender] = abs(self.data.liquidityBalance[sp.sender] - amount)
                self.data.totalLiquidityShares = abs(self.data.totalLiquidityShares - amount)
                self.data.noPool = abs(self.data.noPool - tezToSend.value)
                self.data.yesPool = abs(self.data.yesPool - yesByFactor.value)
                self.data.invariant = self.data.noPool*self.data.yesPool
                #sp.send(sp.sender, sp.utils.nat_to_mutez(tezToSend.value), message = None)
                ContractLibrary.TransferToken(sp.self_address, sp.sender, tezToSend.value, self.data.tokenAddress, 0, self.data.faTwoFlag)
                sp.if self.data.balances.contains(sp.sender):
                    record = self.data.balances.get(sp.sender)
                    yes = record.yes + yesToSend.value
                    no = record.no 
                    self.data.balances[sp.sender] = sp.record(yes = yes, no = no)
                sp.else:
                    self.data.balances[sp.sender] = sp.record(yes = yesToSend.value, no = sp.nat(0))
            #price is same
            sp.else: 
                self.data.liquidityBalance[sp.sender] = abs(self.data.liquidityBalance[sp.sender] - amount)
                self.data.yesPool = abs(self.data.yesPool - amount)
                self.data.noPool = abs(self.data.noPool - amount)
                self.data.invariant = self.data.noPool*self.data.yesPool
                self.data.totalLiquidityShares = abs(self.data.totalLiquidityShares - amount)
                #sp.send(sp.sender, sp.utils.nat_to_mutez(abs(amount)), message = None)
                ContractLibrary.TransferToken(sp.self_address, sp.sender, amount, self.data.tokenAddress, 0, self.data.faTwoFlag)

    @sp.entry_point
    def resolveMarket(self,result):
        sp.set_type(result,sp.TBool)
        sp.verify(self.data.isInitialized == sp.bool(True),"Market not initialized")
        sp.verify(self.data.isEventOver == sp.bool(False),"Market resolved already")
        sp.verify(self.data.factoryAddress == sp.sender,"Must be called by factory contract")
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
            #sp.send(sp.sender, sp.utils.nat_to_mutez(record.yes), message = None)
            ContractLibrary.TransferToken(sp.self_address, sp.sender, record.yes, self.data.tokenAddress, 0, self.data.faTwoFlag)
            self.data.balances[sp.sender] = sp.record(yes = 0, no = 0)
        sp.else:
            sp.verify(record.no>0,"No balance to redeem")
            #sp.send(sp.sender, sp.utils.nat_to_mutez(record.no), message = None)
            ContractLibrary.TransferToken(sp.self_address, sp.sender, record.no, self.data.tokenAddress, 0, self.data.faTwoFlag)
            self.data.balances[sp.sender] = sp.record(yes = 0, no = 0)

    def squareRoot(self, x):
        sp.verify(x >= 0)
        y = sp.local('y', x)
        sp.while y.value * y.value > x:
            y.value = (x // y.value + y.value) // 2
        sp.verify((y.value * y.value <= x) & (x < (y.value + 1) * (y.value + 1)))
        return y.value


class PredictoFactory(sp.Contract):
    def __init__(self):
        self.predicto = Predicto()
        self.init(markets=sp.map(
            tkey=sp.TString,  # questionId
            tvalue=sp.TRecord(
                questionId=sp.TString,
                question = sp.TString,
                endTime=sp.TTimestamp,
                description=sp.TString,
                oracleAddress = sp.TAddress,
                contractAddress = sp.TAddress,
                createdAt = sp.TTimestamp,
                tokenAddress = sp.TAddress,
                faTwoFlag = sp.TBool,
                isResolved= sp.TBool)))
    
        
    @sp.entry_point
    def add_market(self, params):
        sp.set_type(params, sp.TRecord(questionId=sp.TString, question = sp.TString, endTime=sp.TTimestamp, description=sp.TString, oracleAddress = sp.TAddress, tokenAddress = sp.TAddress, faTwoFlag = sp.TBool))
        market_data = sp.local('market_data',sp.record(
            balances = sp.big_map(tkey=sp.TAddress,tvalue=sp.TRecord(yes = sp.TNat, no=sp.TNat)),
            liquidityBalance = sp.big_map(tkey=sp.TAddress,tvalue=sp.TNat),
            yesPrice = sp.nat(0),
            noPrice = sp.nat(0),
            yesPool = sp.nat(0),
            noPool = sp.nat(0),
            invariant = sp.nat(0),
            totalLiquidityShares = sp.nat(0),
            questionId = params.questionId,
            isEventOver = sp.bool(False),
            oracleAddress = params.oracleAddress,
            tokenAddress = params.tokenAddress,
            faTwoFlag = params.faTwoFlag,
            endTime = params.endTime,
            isInitialized = sp.bool(False),
            result = sp.bool(True),
            factoryAddress = sp.self_address))

        address = sp.local('address', sp.create_contract(
                storage = market_data.value,
                contract = self.predicto))

        self.data.markets[params.questionId] = sp.record(
                questionId=params.questionId,
                question = params.question,
                endTime = params.endTime,
                description = params.description,
                oracleAddress = params.oracleAddress,
                contractAddress = address.value,
                createdAt = sp.now,
                tokenAddress = params.tokenAddress,
                faTwoFlag = params.faTwoFlag,
                isResolved= sp.bool(False))

    @sp.entry_point
    def resolve_market(self, params):
        sp.set_type(params,sp.TRecord(questionId = sp.TString, result = sp.TBool))
        sp.verify(sp.sender == self.data.markets[params.questionId].oracleAddress,"Must be called by the oracle")
        #sp.verify(sp.now >= self.data.markets[params.questionId].endTime,"Cant resolve the market before resolving date")
        resolve_entry_point = sp.contract(sp.TBool, self.data.markets[params.questionId].contractAddress, "resolveMarket").open_some()
        sp.transfer(params.result, sp.tez(0), resolve_entry_point)
        self.data.markets[params.questionId].isResolved = sp.bool(True)


if "templates" not in __name__:
    @sp.add_test(name = "Predicto")
    def test():
        scenario = sp.test_scenario()
        admin = sp.address("KT19eGoVGhXHkTSQT9Dfrm4z4QHUa4RttabH")
        alice = sp.test_account("Alice")
        bob = sp.test_account("Bob")
        cat = sp.test_account("Cat")
        token_metadata = {
            "decimals"    : "18",               # Mandatory by the spec
            "name"        : "STABLE",           # Recommended
            "symbol"      : "STABLE",           # Recommended
        }
        contract_metadata = {
            "" : "ipfs://bafkreiguafu5cz52trcpjsm3jxelsqjewo64b2ncx42ackcw3n5h5aghjq",
        }
        token = FA12.FA12(
            admin,
            config              = FA12.FA12_config(support_upgradable_metadata = True),
            token_metadata      = token_metadata,
            contract_metadata   = contract_metadata
        )
        scenario += token
        TOKEN_DECIMALS = 10 ** 18

        token.mint(address = alice.address, value = 1000 * TOKEN_DECIMALS ).run(sender = admin)
        scenario.verify(token.data.balances[alice.address].balance == 1000 * TOKEN_DECIMALS)
        token.mint(address = bob.address, value = 1000 * TOKEN_DECIMALS ).run(sender = admin)
        scenario.verify(token.data.balances[bob.address].balance == 1000 * TOKEN_DECIMALS)
        token.mint(address = cat.address, value = 1000 * TOKEN_DECIMALS ).run(sender = admin)
        scenario.verify(token.data.balances[cat.address].balance == 1000 * TOKEN_DECIMALS)
        
        c1 = PredictoFactory()
        scenario += c1

        scenario.h1("Adding a prediction market")

        c1.add_market(questionId = sp.string("124125"), question = sp.string("Will it rain today?"), endTime = sp.timestamp_from_utc(2021, 12, 20, 23, 59, 59), description = sp.string("If it rains today market will resolve to yes"), oracleAddress = alice.address, tokenAddress = token.address, faTwoFlag= sp.bool(False))
        
        scenario.register(c1.predicto)
        dynamic_contract = scenario.dynamic_contract(0, c1.predicto)
        
        token.approve(spender = dynamic_contract.address, value = 1000 * TOKEN_DECIMALS ).run(sender = alice)
        token.approve(spender = dynamic_contract.address, value = 1000 * TOKEN_DECIMALS ).run(sender = bob)
        token.approve(spender = dynamic_contract.address, value = 1000 * TOKEN_DECIMALS ).run(sender = cat)

        scenario.h1("Initializing Market")
        dynamic_contract.call("initializeMarket", 10 * TOKEN_DECIMALS).run(sender=alice)
        
        scenario.h1("Buying 10 tez of yes bob")
        dynamic_contract.call("buy",sp.record(choice=sp.bool(True),tokenAmount = 10 * TOKEN_DECIMALS)).run(sender=bob)
        
        
        scenario.h1("Resolving market to no")
        c1.resolve_market(questionId = sp.string("124125"), result = sp.bool(False)).run(sender = alice)

"""     ***Prediction market all functions testing***

        c1 = Predicto(questionId=sp.string("QuestionID"), oracleAddress=alice.address, endTime=sp.timestamp_from_utc(2021, 12, 20, 23, 59, 59),tokenAddress=token.address,faTwoFlag= sp.bool(False))

        token.approve(spender = c1.address, value = 1000 * TOKEN_DECIMALS ).run(sender = alice)
        token.approve(spender = c1.address, value = 1000 * TOKEN_DECIMALS ).run(sender = bob)
        token.approve(spender = c1.address, value = 1000 * TOKEN_DECIMALS ).run(sender = cat)

        scenario += c1
        scenario.h1("Initializing Market")
        c1.initializeMarket(10 * TOKEN_DECIMALS).run(sender=alice)

        scenario.h1("Buying 10 tez of yes bob")
        c1.buy(choice=sp.bool(True),tokenAmount = 10 * TOKEN_DECIMALS).run(sender=bob)

        scenario.h1("Buying 10 tez of yes cat")
        c1.buy(choice=sp.bool(True),tokenAmount = 10 * TOKEN_DECIMALS).run(sender=cat)

        scenario.h1("Add liquidity 10 token alice")
        c1.addLiquidity(10 * TOKEN_DECIMALS).run(sender=alice)
        
        scenario.h1("Selling 10 yes bob")
        c1.sell(choice=sp.bool(True),amount=10 * TOKEN_DECIMALS).run(sender=bob)
        
        scenario.h1("Removing Liqudity 5 alice")
        c1.removeLiquidity(5 * TOKEN_DECIMALS).run(sender=alice)

        scenario.h1("Selling 5 yes bob")
        c1.sell(choice=sp.bool(True),amount=5 * TOKEN_DECIMALS).run(sender=bob)

        scenario.h1("Resolving market yes")
        c1.resolveMarket(sp.bool(True)).run(sender=alice)
        
        scenario.h1("Claim Shares cat")
        c1.claimShares().run(sender=cat)
        
        scenario.h1("Removing Liqudity 8.33 alice")
        c1.removeLiquidity(8333333333333333333).run(sender=alice)
        
        scenario.h1("Claim Shares alice")
        c1.claimShares().run(sender=alice) """



        #Very old tests

        #scenario = sp.test_scenario()
        #scenario.h1("Predicto")
        #scenario += c1
        #c1.initializeMarket().run(sender=alice,amount=sp.tez(10))
        #scenario.h1("Buying 10 tez of yes bob")
        #c1.buy(sp.bool(True)).run(sender=bob,amount=sp.tez(10))
        #scenario.h1("Buying 10 tez of yes cat")
        #c1.buy(sp.bool(True)).run(sender=cat,amount=sp.tez(10))
        #scenario.h1("Add liquidity 10 dai alice")
        #c1.addLiquidity().run(sender=alice,amount=sp.tez(10))
        #scenario.h1("Selling 10 yes bob")
        #c1.sell(choice=sp.bool(True),amount=10000000).run(sender=bob)
        #scenario.h1("Removing Liqudity 5 alice")
        #c1.removeLiquidity(5000000).run(sender=alice)
        #scenario.h1("Selling 5 yes bob")
        #c1.sell(choice=sp.bool(True),amount=5000000).run(sender=bob)
        #scenario.h1("Resolving market yes")
        #c1.resolveMarket(sp.bool(True)).run(sender=alice)
        #scenario.h1("Claim Shares cat")
        #c1.claimShares().run(sender=cat)
        #scenario.h1("Removing Liqudity 8.33 alice")
        #c1.removeLiquidity(8333333).run(sender=alice)
        #scenario.h1("Claim Shares alice")
        #c1.claimShares().run(sender=alice)

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

    #sp.add_compilation_target("Predicto_comp", Predicto(questionId=sp.string("QuestionID"), oracleAddress=sp.address("tz1RbD1TgNgxzw3AXa9TwPgnpkGCy5xKv2Vf"), endTime=sp.timestamp_from_utc(2021, 9, 20, 23, 59, 59),tokenAddress=sp.address("KT19eGoVGhXHkTSQT9Dfrm4z4QHUa4RttabH"),faTwoFlag= sp.bool(False)))

    