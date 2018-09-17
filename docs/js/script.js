'use strict';

function history(coin1, coin2) {
    alert('', coin1, coin2);
}

let checkedMarkets = {
        showAll: true,
        bittrex: true,
        poloniex: true

    },
    checkedCoins = {
        showAll: false,
        // TIC: false,
        // PLC: false
    };

let addOne = true;
//pour enlever les marchés
function addRemoveAll(coinsOrMarkets) {

    if (coinsOrMarkets === 'marchés') {

        for (let market in checkedMarkets) {
            checkedMarkets[market] = !checkedMarkets.showAll;
            console.log(checkedMarkets[market]);
            addOne = false;
            addRemoveMarket(market);
            addOne = true;

        }
        useData();
    }

    if (coinsOrMarkets === 'coins') {

        for (let coin in checkedCoins) {
            checkedCoins[coin] = !checkedCoins.showAll;
            console.log(checkedCoins[coin]);
            addOne = false;
            addRemoveCoin(coin)
            addOne = true;

        }
        useData();
    }

}


function addRemoveCoin(coin) {
    if (addOne) checkedCoins[coin] = !checkedCoins[coin];

    if (checkedCoins[coin]) {
        $('#check-' + coin).addClass('fa-check-square-o');
        $('#check-' + coin).removeClass('fa-square-o');
    }
    else {
        $('#check-' + coin).removeClass('fa-check-square-o');
        $('#check-' + coin).addClass('fa-square-o');
    }

    if (addOne) useData();
}

function addRemoveMarket(market) {
    console.log("")
    if (addOne){ console.log(""); checkedMarkets[market] = !checkedMarkets[market] };

    if (checkedMarkets[market]) {
        console.log("");
        $('#check-' + market).addClass('fa-check-square-o');
        $('#check-' + market).removeClass('fa-square-o');
    }
    else {
        $('#check-' + market).removeClass('fa-check-square-o');
        $('#check-' + market).addClass('fa-square-o')
    }

    if (addOne) useData();
}

function remove(item, highOrLow) {
    let li = $(item).closest('li');
    let coin = li.attr("data-coin");
    let market = li.attr("data-market1");
    if (!Array.isArray(checkedCoins[coin])) checkedCoins[coin]= [];
    checkedCoins[coin].push(market);
    console.log("Enlever item...", checkedCoins[coin]);
    useData();
}

function searchMarketsOrCoins(marketOrCoin, input) {
    input = input.toUpperCase();
    let listItems = $('#' + marketOrCoin + '-list > li');

    if (input === "") {
        listItems.show();
    } else {
        listItems.each(function () {
            let text = $(this).text().toUpperCase();
            (text.indexOf(input) >= 0) ? $(this).show() : $(this).hide();
        });
    }


}

let useData;

$(window).load(function () {
    new WOW().init();

    $('.loader').hide();
    $('#header').show();


    let socket = io();

    let numberOfLoads = 0; //nombre de résultats final
    let numberOfMLoads = 0; //nombre de marchés loadés


    socket.on('coinsAndMarkets', function (data) { //Function pour quand nous prenom les data des marchés
        if (numberOfMLoads === 0) {  //Seulement besoin de lancer cette fonction une fois (Currently)
            let list = $('#market-list').empty(), coinList = $('#coin-list').empty();

            let marketSource = $("#market-list-template").html(); //Source
            let marketTemplate = Handlebars.compile(marketSource); // ^ et template  pour coin et les listes de marchés

            let coinSource = $("#coin-list-template").html(); //Source
            let coinTemplate = Handlebars.compile(coinSource); // ^ et template pour les coins et les listes de marchés

            let coinDataLen = data[1].length;
            for (let i = 0; i < coinDataLen; i++) { //boucle pour les coins
                let context = {coin: data[1][i]};
                let coin = context.coin;
                if (data[0][i]) {
                    context.market = data[0][i][0];
                    let market = context.market;
                    list.append(marketTemplate(context));
                    if (checkedMarkets[market] === false || checkedMarkets[market] === undefined) {
                        checkedMarkets[market] = false;
                        $('#check-' + market).removeClass('fa-check-square-o');
                        $('#check-' + market).addClass('fa-square-o')
                    }
                }

                coinList.append(coinTemplate(context));
                if (checkedCoins[coin] === undefined) checkedCoins[coin] = true;
                else {
                    $('#check-' + coin).removeClass('fa-check-square-o');
                    $('#check-' + coin).addClass('fa-square-o');
                }
            }
            numberOfMLoads++;
        }
    });

    let highest = $('#highest'); //plus haut UL
    let highSource = $("#high-template").html(); //Template source
    let highTemplate = Handlebars.compile(highSource); //Template

    let bestSource = $("#best-template").html();
    let bestTemplate = Handlebars.compile(bestSource);

    var data;

    $('#coin-search').keyup(function () {
        let value = $(this).val();
        console.log(value);
        searchMarketsOrCoins("coin", value)
    });
    $('#market-search').keyup(function () {
        let value = $(this).val();
        searchMarketsOrCoins("market", value)
    });

    $('.loadNumberInput').change(function () {
        useData();
    });
    function allowedData(lowMarket, highMarket, coinName) {
        if(checkedMarkets[lowMarket] && checkedMarkets[highMarket] && checkedCoins[coinName]){
            if(Array.isArray(checkedCoins[coinName])) {
                if(!checkedCoins[coinName].includes(lowMarket) && !checkedCoins[coinName].includes(highMarket)) {
                    return true;
                }
                else return false;

            }
            else{
                return true;
            }
        }
        else {
            return false;
        }
    }

    useData = function () {
        console.log(data);
        let topN = $('.loadNumberInput').val();
        if (!topN) topN = 5;
        let highestN = 1;
        let initN = 1;
        let dataLen = data.length;
        highest.empty();  //ENlever les data précédentes (LI) de UL
        for (let i = dataLen - initN; i >= dataLen - topN; i--) { //boucle du top 10
            let market1 = data[i].market1.name, market2 = data[i].market2.name, pairIndex, coinName = data[i].coin;
            
            if (allowedData(market2, market1, coinName)) {
                for (let j = data.length - 1; j >= 0; j--) {
                    if (
                        data[j].market1.name === market2 //égal
                        && data[j].market2.name === market1 // au marché opposé
                        && data[i].coin !== data[j].coin //and ce n'est pas le meme coin
                        && data[j].coin !== 'BTC' //et different de BTC
                        && checkedCoins[data[j].coin] //et n'est pas enlevé
                        && checkedCoins[data[j].coin][0] !== market1
                        && checkedCoins[data[j].coin][0] !== market2) // et n'est pas indisponible
                    {
                        pairIndex = j;
                        break;
                    }
                }
                if (pairIndex > -1) { 
                    let context = { //data requises
                        coin: data[i].coin,
                        diff: ((data[i].spread - 1) * 100).toFixed(3),
                        market2price: (data[i].market2.last * 1000).toPrecision(3),
                        market2: market2,
                        market1price: (data[i].market1.last * 1000).toPrecision(3),
                        market1: market1,
                        pair: {
                            coin: data[pairIndex].coin,
                            diff: ((data[pairIndex].spread - 1) * 100).toFixed(3),
                            market2price: (data[pairIndex].market2.last * 1000).toPrecision(3),
                            market2: data[pairIndex].market2.name,
                            market1price: (data[pairIndex].market1.last * 1000).toPrecision(3),
                            market1: data[pairIndex].market1.name,
                        },
                        totalDiff: (((data[i].spread - 1) * 100) + ((data[pairIndex].spread - 1) * 100)).toFixed(2)
                    };

                    if (i === data.length - highestN) { //ajouter seulement les plus hauts
                        $('.best-pair').empty();
                        let bestHTML = bestTemplate(context);
                        $('.best-pair').append(bestHTML);
                    }


                    let html = highTemplate(context);
                    highest.append(html);
                    console.log("Appending...")
                }
                else if (data.length - topN > 0) {
                    topN++;
                    highestN++;
                }
            }

            else if (data.length - topN > 0) {
                topN++;
                highestN++;
            }
        }
    };

    let waitForMoreData;

    socket.on('results', function (results) {
        clearTimeout(waitForMoreData);
        numberOfLoads++;
        if (numberOfLoads === 1) {
            $('.socket-loader').hide();
            $('#highest, #lowest').show();
            data = results;
            useData();
        }

        else {
            waitForMoreData = setTimeout(function () {
                data = results;
                useData();
            }, 1000);
        }

    });

});




