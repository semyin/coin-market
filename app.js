const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// OKX API URL

const okxApiUrl = 'https://www.okx.com/priapi/v5/market/mult-tickers?instIds=BTC-USDT%2CETH-USDT%2COP-USDT%2CDOGE-USDT%2CSHIB-USDT%2CMEME-USDT%2CLUNA-USDT%2COMG-USDT%2CEOS-USDT%2COKB-USDT%2CXRP-USDT';

const currenciesApiUrl = 'https://www.okx.com/v3/users/common/list/currencies?locale=zh_CN'

app.use(express.static('public'));

// Function to fetch data from OKX API
const fetchData = async () => {
  try {
    const [tickers, currencies] = await Promise.all([
      axios.get(`${okxApiUrl}&t=${new Date().getTime()}`),
      axios.get(`${currenciesApiUrl}&t=${new Date().getTime()}`)
    ])
    const data = tickers.data
    let currency = null
    if (currencies) {
      if (currencies.data) {
        if (currencies.data.data) {
          if (Array.isArray(currencies.data.data) && currencies.data.data.length) {
            currency = currencies.data.data.find(item => {
              return item.isoCode === 'CNY'
            })
          }
        }
      }
    }
    if (currency) {
      const usdToThisRate = currency.usdToThisRate
      data.data.forEach(item => { 
        item.lastCurrency = (item.last * usdToThisRate).toFixed(2)
        item.low24hCurrency = (item.low24h * usdToThisRate).toFixed(2)
        item.high24hCurrency = (item.high24h * usdToThisRate).toFixed(2)
        item.vol24hCurrency = (item.vol24h * item.last * usdToThisRate).toFixed(2)
      });
    }
    return data
  } catch (error) {
    console.error('Error fetching data from OKX:', error);
    return null;
  }
};

// Endpoint to get the latest data
app.get('/data', async (req, res) => {
  const data = await fetchData();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});