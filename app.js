const BID_INCREMENT = 10;
const AUCTION_DURATION_SECONDS = 30;

const products = [
  {
    id: "1",
    name: "Vintage Camera",
    description: "Classic film camera in very good condition.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
    currentBid: 120
  },
  {
    id: "2",
    name: "Gaming Headset",
    description: "Surround sound headset with detachable mic.",
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=1000&q=80",
    currentBid: 75
  },
  {
    id: "3",
    name: "Smart Watch",
    description: "Water-resistant smartwatch with fitness tracking.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
    currentBid: 95
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
            <p><strong>Starting Bid:</strong> ${formatPrice(product.currentBid)}</p>
            <a href="product.html?id=${product.id}">Open Product</a>
          </div>
        </article>
      `;
    })
    .join("");
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
  const bidButton = document.getElementById("bid-btn");
  const totalBids = document.getElementById("total-bids");
  const statusBadge = document.getElementById("auction-status");
  const auctionMessage = document.getElementById("auction-message");
  if (
    !title ||
    !image ||
    !description ||
    !startingPrice ||
    !price ||
    !timer ||
    !bidButton ||
    !totalBids ||
    !statusBadge ||
    !auctionMessage
  ) {
    return;
  }

  let currentPrice = product.currentBid;
  let isAuctionEnded = false;
  let bidsCount = 0;

  title.textContent = product.name;
  image.src = product.image;
  description.textContent = product.description;
  startingPrice.textContent = formatPrice(product.currentBid);
  price.textContent = formatPrice(currentPrice);
  totalBids.textContent = String(bidsCount);
  auctionMessage.textContent = "Place your first bid to lead this auction.";
  startFakeTimer(
    timer,
    bidButton,
    statusBadge,
    () => {
      isAuctionEnded = true;
      auctionMessage.textContent = "Auction is closed. No further bids are accepted.";
    },
    AUCTION_DURATION_SECONDS
  );

  bidButton.addEventListener("click", () => {
    if (isAuctionEnded || bidButton.disabled) return;
    currentPrice += BID_INCREMENT;
    bidsCount += 1;
    price.textContent = formatPrice(currentPrice);
    totalBids.textContent = String(bidsCount);
    auctionMessage.textContent = `Bid placed successfully. You are at ${formatPrice(currentPrice)}.`;
  });
}

const page = document.body.dataset.page;
if (page === "home") renderHome();
if (page === "product") renderProductPage();
