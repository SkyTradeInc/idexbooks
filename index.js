const axios = require('axios');
const chalk = require('chalk')
const log = console.log
const green = chalk.green
const red = chalk.red
const Table = require('cli-table3');

// START CONFIG \\
const symbol = 'XLG';         // uppercase
const localCurrency = 'aud'   // lowercase
// END CONFIG \\


let table = new Table({
    head: [`Price (${localCurrency.toUpperCase()})`, 'Price (ETH)', `Amount (${symbol})`, `Sum (${symbol})`, 'Sum (ETH)', 'Ethereum Address']
});

function getBook(levels) {
  return new Promise((resolve, reject) => {
    if(!levels) reject({})
    axios.post('https://api.idex.market/returnOrderBook', {
      market: `ETH_${symbol}`,
      count: levels
    })
    .then(data => {
      const asks = data.data.asks
      const bids = data.data.bids
      resolve({
        asks,
        bids
      })
    })
    .catch(reject)
  })
}

function getPrice(symbol) {
  return new Promise((resolve, reject) => {
    axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${localCurrency}`)
    .then(data => {
      const price = data.data.ethereum[localCurrency]
      resolve(price)
    })
    .catch(reject)
  })
}

getPrice().then(ethPrice => {
  getBook(100).then(book => {
    let {asks, bids} = book
    let total = 0
    let totalEth = 0
    let bidTable = []
    let askTable = []
    for(let i = 0; i<asks.length; i++) {
      const amount = parseInt(asks[i].amount)
      const price = parseFloat(asks[i].price)
      const aud = (ethPrice*price).toFixed(4)
      total+= amount
      totalEth += (amount*price)
      askTable.push([aud, price.toFixed(8), amount.toLocaleString(), total.toLocaleString(), totalEth.toLocaleString(), asks[i].params.user]);
    }

    total = 0
    totalEth = 0
    for(let i = 0; i<bids.length; i++) {
      const amount = parseInt(bids[i].amount)
      const price = parseFloat(bids[i].price)
      const aud = (ethPrice*price).toFixed(4)

      total+= amount
      totalEth += (amount*price)
      bidTable.push([aud, price.toFixed(8), amount.toLocaleString(), total.toLocaleString(), totalEth.toLocaleString(), bids[i].params.user]);
    }
    askTable.reverse()
    table.push( ...askTable, ['', '', '', ''], ...bidTable)
    console.log(table.toString());
  })
})
