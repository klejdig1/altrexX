const BID_INCREMENT = 10;
const AUCTION_DURATION_SECONDS = 30;

const products = [
  {
    id: "1",
    name: "Vintage Camera",
    description: "Classic film camera in very good condition.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
    currentBid: 120,
    bidsCount: 14,
    activeBidders: 5,
    endsInSeconds: 1020,
    bidHistory: [
      { bidder: "Ardit M.", amount: 120 },
      { bidder: "Nora K.", amount: 110 },
      { bidder: "Elon B.", amount: 100 }
    ]
  },
  {
    id: "2",
    name: "Gaming Headset",
    description: "Surround sound headset with detachable mic.",
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=1000&q=80",
    currentBid: 75,
    bidsCount: 11,
    activeBidders: 4,
    endsInSeconds: 780,
    bidHistory: [
      { bidder: "Luna D.", amount: 75 },
      { bidder: "Blerim G.", amount: 65 },
      { bidder: "Eva R.", amount: 55 }
    ]
  },
  {
    id: "3",
    name: "Smart Watch",
    description: "Water-resistant smartwatch with fitness tracking.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
    currentBid: 95,
    bidsCount: 19,
    activeBidders: 7,
    endsInSeconds: 1260,
    bidHistory: [
      { bidder: "Sara T.", amount: 95 },
      { bidder: "Dion P.", amount: 85 },
      { bidder: "Vesa C.", amount: 80 }
    ]
  }
];

function getProductById(id) {
  return products.find((p) => p.id === id);
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);
}

function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderBidHistory(listEl, entries) {
  listEl.innerHTML = entries
    .map((entry) => `<li><span>${entry.bidder}</span><strong>${formatPrice(entry.amount)}</strong></li>`)
    .join("");
}

function startHomeCardCountdowns() {
  const timerElements = Array.from(document.querySelectorAll("[data-seconds-left]"));
  if (!timerElements.length) return;

  const states = timerElements.map((element) => ({
    element,
    seconds: Number(element.dataset.secondsLeft) || 0
  }));

  function renderAll() {
    states.forEach((state) => {
      if (state.seconds <= 0) {
        state.element.textContent = "Ended";
        return;
      }
      state.element.textContent = formatCountdown(state.seconds);
      state.seconds -= 1;
    });
  }

  renderAll();
  setInterval(renderAll, 1000);
}

function renderHome() {
  const list = document.getElementById("product-list");
  if (!list) return;

  list.innerHTML = products
    .map((product) => {
      return `
        <article class="card">
          <img src="${product.image}" alt="${product.name}">
          <div class="card-content">
            <p class="card-badge">Live</p>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p><strong>Current bid:</strong> ${formatPrice(product.currentBid)}</p>
            <p><strong>Auction ends in:</strong> <span class="card-timer" data-seconds-left="${product.endsInSeconds}">--:--</span></p>
            <p><strong>Number of bids:</strong> ${product.bidsCount}</p>
            <p><strong>Competing bidders:</strong> ${product.activeBidders}</p>
            <a href="product.html?id=${product.id}">Open Product</a>
          </div>
        </article>
      `;
    })
    .join("");

  startHomeCardCountdowns();
}

function startFakeTimer(target, bidButton, statusBadge, onExpire, startSeconds = AUCTION_DURATION_SECONDS) {
  let secondsLeft = startSeconds;
  const defaultLabel = `Place Bid (+${formatPrice(BID_INCREMENT)})`;

  function setBidButtonState(disabled) {
    bidButton.disabled = disabled;
    bidButton.textContent = disabled ? "Auction Ended" : defaultLabel;
  }

  setBidButtonState(false);

  function renderClock() {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    target.textContent = `${mm}:${ss}`;
  }

  renderClock();
  const interval = setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft < 0) {
      clearInterval(interval);
      target.textContent = "Auction ended";
      statusBadge.textContent = "Ended";
      statusBadge.classList.add("status-ended");
      setBidButtonState(true);
      onExpire();
      return;
    }
    renderClock();
  }, 1000);
}

function renderProductPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const product = getProductById(productId || "");

  if (!product) {
    document.body.innerHTML = "<main class='container'><p>Product not found.</p><a href='index.html'>Go back</a></main>";
    return;
  }

  const title = document.getElementById("product-title");
  const image = document.getElementById("product-image");
  const description = document.getElementById("product-description");
  const startingPrice = document.getElementById("starting-price");
  const price = document.getElementById("product-price");
  const timer = document.getElementById("countdown");
  const bidButtonMain = document.getElementById("bid-btn-main");
  const bidButtonSticky = document.getElementById("bid-btn-sticky");
  const activeBidders = document.getElementById("active-bidders");
  const watchingUsers = document.getElementById("watching-users");
  const totalBids = document.getElementById("total-bids");
  const statusBadge = document.getElementById("auction-status");
  const auctionMessage = document.getElementById("auction-message");
  const bidHistory = document.getElementById("bid-history");
  const stickyPrice = document.getElementById("sticky-price");
  const liveActivity = document.getElementById("live-activity");
  if (
    !title ||
    !image ||
    !description ||
    !startingPrice ||
    !price ||
    !timer ||
    !bidButtonMain ||
    !bidButtonSticky ||
    !activeBidders ||
    !watchingUsers ||
    !totalBids ||
    !statusBadge ||
    !auctionMessage ||
    !bidHistory ||
    !stickyPrice ||
    !liveActivity
  ) {
    return;
  }
  const bidButtons = [bidButtonMain, bidButtonSticky];

  let currentPrice = product.currentBid;
  let isAuctionEnded = false;
  let bidsCount = product.bidsCount;
  let watchersCount = Math.max(product.activeBidders + 2, 3);
  const history = [...product.bidHistory];
  const liveNames = ["Alba K.", "Luan H.", "Mira T.", "Rion A.", "Dua N."];

  title.textContent = product.name;
  image.src = product.image;
  description.textContent = product.description;
  startingPrice.textContent = formatPrice(product.currentBid);
  price.textContent = formatPrice(currentPrice);
  stickyPrice.textContent = formatPrice(currentPrice);
  activeBidders.textContent = String(product.activeBidders);
  watchingUsers.textContent = String(watchersCount);
  totalBids.textContent = String(bidsCount);
  auctionMessage.textContent = "Auction is live. Place your bid now.";
  liveActivity.textContent = "Live: New watchers are joining this auction.";
  renderBidHistory(bidHistory, history);
  startFakeTimer(
    timer,
    bidButtonMain,
    statusBadge,
    () => {
      isAuctionEnded = true;
      auctionMessage.textContent = "Auction is closed. No further bids are accepted.";
      liveActivity.textContent = "Live: Auction ended.";
      bidButtonSticky.disabled = true;
      bidButtonSticky.textContent = "Auction Ended";
    },
    AUCTION_DURATION_SECONDS
  );

  function placeBid() {
    if (isAuctionEnded || bidButtonMain.disabled || bidButtonSticky.disabled) return;
    currentPrice += BID_INCREMENT;
    bidsCount += 1;
    history.unshift({ bidder: "You", amount: currentPrice });
    price.textContent = formatPrice(currentPrice);
    stickyPrice.textContent = formatPrice(currentPrice);
    totalBids.textContent = String(bidsCount);
    auctionMessage.textContent = `New highest bid: ${formatPrice(currentPrice)}.`;
    liveActivity.textContent = `Live: You placed a bid at ${formatPrice(currentPrice)}.`;
    renderBidHistory(bidHistory, history.slice(0, 8));
  }

  bidButtons.forEach((button) => {
    button.addEventListener("click", placeBid);
  });

  setInterval(() => {
    if (isAuctionEnded) return;
    const watcherShift = Math.random() > 0.5 ? 1 : -1;
    watchersCount = Math.max(2, watchersCount + watcherShift);
    watchingUsers.textContent = String(watchersCount);

    if (Math.random() > 0.55) {
      const randomName = liveNames[Math.floor(Math.random() * liveNames.length)];
      const ghostBid = currentPrice + BID_INCREMENT;
      liveActivity.textContent = `Live: ${randomName} is preparing to bid ${formatPrice(ghostBid)}.`;
    }
  }, 3500);
}

const page = document.body.dataset.page;
if (page === "home") renderHome();
if (page === "product") renderProductPage();
