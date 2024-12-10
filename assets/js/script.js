'use strict';


const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
}


const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const navToggler = document.querySelector("[data-nav-toggler]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  navToggler.classList.toggle("active");
  document.body.classList.toggle("active");
}

addEventOnElem(navToggler, "click", toggleNavbar);

const closeNavbar = function () {
  navbar.classList.remove("active");
  navToggler.classList.remove("active");
  document.body.classList.remove("active");
}

addEventOnElem(navbarLinks, "click", closeNavbar);


const header = document.querySelector("[data-header]");

const activeHeader = function () {
  if (window.scrollY > 300) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
}

addEventOnElem(window, "scroll", activeHeader);

const addToFavBtns = document.querySelectorAll("[data-add-to-fav]");

const toggleActive = function () {
  this.classList.toggle("active");
}

addEventOnElem(addToFavBtns, "click", toggleActive);


const sections = document.querySelectorAll("[data-section]");

const scrollReveal = function () {
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].getBoundingClientRect().top < window.innerHeight / 1.5) {
      sections[i].classList.add("active");
    } else {
      sections[i].classList.remove("active");
    }
  }
}

scrollReveal();

addEventOnElem(window, "scroll", scrollReveal);

let accountBalance = 5000;
const balanceDisplay = document.getElementById("account-balance");

function updateBalance() {
  balanceDisplay.textContent = `Account Balance: $${accountBalance.toFixed(2)}`;
}

document.querySelectorAll(".btn-buy, .btn-sell").forEach(button => {
  button.addEventListener("click", (event) => {
    const row = event.target.closest("tr");
    const quantityText = row.querySelector(".market-cap .quantity-text");
    let quantity = parseInt(quantityText.textContent);
    const quantityInput = row.querySelector(".quantity-input");
    const quantityToChange = parseInt(quantityInput.value);
    const price = parseFloat(row.querySelector(".last-price").textContent.replace('$', ''));

    if (event.target.classList.contains("btn-buy")) {
      const cost = price * quantityToChange;
      if (accountBalance >= cost) {
        accountBalance -= cost;
        quantity += quantityToChange;
        alert(`You have successfully bought ${quantityToChange} shares for $${cost.toFixed(2)}.`);
      } else {
        alert("Insufficient funds to complete the purchase.");
      }
    } else if (event.target.classList.contains("btn-sell")) {
      const revenue = price * quantityToChange;
      if (quantity >= quantityToChange) {
        accountBalance += revenue;
        quantity -= quantityToChange;
        alert(`You have successfully sold ${quantityToChange} shares for $${revenue.toFixed(2)}.`);
      } else {
        alert("You cannot sell more shares than you own!");
      }
    }

    quantityText.textContent = quantity;
    updateBalance();
  });
});

updateBalance();

let symbol = 'AMD';
let apiKey = 'cta0hhpr01quh43p0ap0cta0hhpr01quh43p0apg';
const ctx = document.getElementById('stockChart').getContext('2d');
let stockChart = null;


function viewChart(symbol) {
  document.getElementById('chart-container').style.display = 'block';

  // Initialize TradingView widget for the AMD symbol
  new TradingView.widget({
    "width": "100%", // Chart width
    "height": "100%", // Chart height
    "symbol": symbol, // The stock symbol you want to display (AMD in this case)
    "interval": "D", // Chart interval (daily)
    "timezone": "America/New_York", // Timezone
    "theme": "light", // Theme (can be "dark" or "light")
    "style": "1", // 1 for candlesticks, other options available
    "container_id": "tradingview-chart", // The container where the chart will render
    "autosize": true, // Automatically adjust chart size
  });

  document.getElementById('close-chart').addEventListener('click', function () {
    document.getElementById('chart-container').style.display = 'none';
  });
}




async function fetchStockData() {
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data) {
      const { c: currentPrice, h: high, l: low, o: open, pc: prevClose } = data;

      const stockData = {
        labels: ['Open', 'High', 'Low', 'Close'],
        datasets: [{
          label: `${symbol} Stock Price`,
          data: [open, high, low, currentPrice],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          fill: true
        }]
      };

      if (stockChart) {
        stockChart.destroy();
      }

      stockChart = new Chart(ctx, {
        type: 'bar',
        data: stockData,
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'category',
            },
            y: {
              beginAtZero: false
            }
          }
        }
      });
    } else {
      console.error('Failed to fetch stock data');
    }
  } catch (error) {
    console.error('Error fetching stock data:', error);
  }
}



// const apiKey = 'cta0hhpr01quh43p0ap0cta0hhpr01quh43p0apg';
// const symbol = 'AMD';
// const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;

// const ctx = document.getElementById('stockChart').getContext('2d');
// let stockChart = null;

// async function fetchStockData() {
//   const response = await fetch(url);
//   const data = await response.json();

//   if (data && data.c) {
//     const stockPrice = data.c;
//     const highPrice = data.h;
//     const lowPrice = data.l;
//     const openPrice = data.o;
//     const prevClosePrice = data.pc;

//     document.getElementById('stock-symbol').textContent = symbol;
//     document.getElementById('current-price').textContent = `$${stockPrice}`;
//     document.getElementById('high-price').textContent = `$${highPrice}`;
//     document.getElementById('low-price').textContent = `$${lowPrice}`;
//     document.getElementById('open-price').textContent = `$${openPrice}`;
//     document.getElementById('prev-close-price').textContent = `$${prevClosePrice}`;

//     const chartData = {
//       labels: ['1', '2', '3', '4', '5'],
//       datasets: [{
//         label: `${symbol} Stock Price`,
//         data: [stockPrice, stockPrice + 1, stockPrice - 1, stockPrice + 0.5, stockPrice - 0.3], // Example price fluctuations
//         borderColor: '#4CAF50',
//         backgroundColor: 'rgba(76, 175, 80, 0.2)',
//         fill: true
//       }]
//     };

//     updateChart(chartData);
//   } else {
//     console.error('Failed to fetch stock data');
//   }
// }

// function updateChart(chartData) {
//   if (stockChart) {
//     stockChart.destroy();
//   }

//   stockChart = new Chart(ctx, {
//     type: 'line',
//     data: chartData,
//     options: {
//       responsive: true,
//       scales: {
//         x: {
//           type: 'category',
//           labels: chartData.labels
//         },
//         y: {
//           beginAtZero: false
//         }
//       }
//     }
//     });
// }

// document.addEventListener('DOMContentLoaded', () => {
//   fetchStockData();
// });
