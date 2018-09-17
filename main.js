/**
 * 
 *
 */

'use strict';

console.log('Starting app...');

const request = require('request'), Promise = require("bluebird"); 

const express = require('express'),
    app = express(),
    helmet = require('helmet'),
    http = require('http').Server(app),
    io = require('socket.io')(http); // Pour websocket server fonctionnalité

app.use(helmet.hidePoweredBy({setTo: 'PHP/5.4.0'}));

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/docs'));

http.listen(port, '0.0.0.0', function () {
    console.log('listening on', port);
});


require('./settings.js')(); //settings fichier.



let coinNames = [];
io.on('connection', function (socket) {
    socket.emit('coinsAndMarkets', [marketNames, coinNames]);
    socket.emit('results', results);
});

// coin_prices est un objet avec les différences de prix entre les marchés. = {BTC : {market1 : 2000, market2: 4000, p : 2}, } (P pour pourcentage (difference))
// results est un tableau en deux dimension avec le nom des coins et les différence de poucentage, classés du plus petit au plus haut.
let coin_prices = {}, numberOfRequests = 0, results = []; // GLOBAL variables pour  push au browser.

function getMarketData(options, coin_prices, callback) {   //GET JSON DATA
    return new Promise(function (resolve, reject) {
        request(options.URL, function (error, response, body) {
            try {
                let data = JSON.parse(body);
                console.log("Success", options.marketName);
                if (options.marketName) {

                    let newCoinPrices = options.last(data, coin_prices, options.toBTCURL);
                    numberOfRequests++;
                    if (numberOfRequests >= 1) computePrices(coin_prices);
                    resolve(newCoinPrices);

                }
                else {
                    resolve(data);
                }

            } catch (error) {
                console.log("Error getting JSON response from", options.URL, error); // erreur
                reject(error);
            }

        });


    });
}

async function computePrices(data) {
    results = [];

    function loopData() {
        return new Promise(function (resolve, reject) {

            if (numberOfRequests >= 2) {

                for (let coin in data) {

                    if (Object.keys(data[coin]).length > 1) {
                        if (coinNames.includes(coin) == false) coinNames.push(coin);
                        let arr = [];
                        for (let market in data[coin]) {
                            arr.push([data[coin][market], market]);
                        }
                        arr.sort(function (a, b) {
                            return a[0] - b[0];
                        });
                        for (let i = 0; i < arr.length; i++) {
                            for (let j = i + 1; j < arr.length; j++) {
                                results.push(
                                    {
                                        coin: coin,
                                        spread: arr[i][0] / arr[j][0],
                                        market2: {
                                            name: arr[i][1],
                                            last: arr[i][0]
                                        },
                                        market1: {
                                            name: arr[j][1],
                                            last: arr[j][0]
                                        }

                                    },
                                    {
                                        coin: coin,
                                        spread: arr[j][0] / arr[i][0],
                                        market2: {
                                            name: arr[j][1],
                                            last: arr[j][0]
                                        },
                                        market1: {
                                            name: arr[i][1],
                                            last: arr[i][0]
                                        }

                                    }
                                );
                                
                               

                            }
                        }

                    }
                }
                results.sort(function (a, b) {
                    return a.spread - b.spread;
                });
                console.log('Finishing function...');
                resolve();
            }
        })
    }

    await loopData();

    console.log("Emitting Results...")

    io.emit('results', results);
}


(async function main() {
    let arrayOfRequests = [];

    for (let i = 0; i < markets.length; i++) {
        arrayOfRequests.push(getMarketData(markets[i], coin_prices));
    }

    await Promise.all(arrayOfRequests.map(p => p.catch(e => e)))

        .then(results => computePrices(coin_prices))

        .catch(e => console.log(e));

    setTimeout(main, 10000);
})();
