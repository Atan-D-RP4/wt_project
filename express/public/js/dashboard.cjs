// public/js/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Dashboard loading...");
  try {
    const response = await fetch("/api/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // In a real app, include your JWT token or session info here:
        "Authorization": "Bearer " + localStorage.getItem("authToken"),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const data = await response.json();

    // Update accounts section dynamically
    const accountsContainer = document.getElementById("accountsContainer");
    if (!accountsContainer) throw new Error("No accounts container found");
    accountsContainer.innerHTML = ""; // Clear any existing content

    data.accounts.forEach((account) => {
      const accountCard = document.createElement("div");
      accountCard.classList.add("col-md-6", "col-lg-4", "mb-4");
      accountCard.innerHTML = `
        <div class="account-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">${
        account.type.charAt(0).toUpperCase() + account.type.slice(1)
      } Account</h5>
              <span class="badge ${
        account.type === "checking" ? "bg-primary" : "bg-secondary"
      }">
                ${account.type === "checking" ? "Primary" : "Savings"}
              </span>
            </div>
            <p class="card-text text-muted mb-1">Account: ••••${
        account.accountNumber.slice(-4)
      }</p>
            <div class="account-balance mb-3">$${
        account.balance.toFixed(2)
      }</div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary">Transfer</button>
              <button class="btn btn-sm btn-outline-secondary">Details</button>
            </div>
          </div>
        </div>
      `;
      accountsContainer.appendChild(accountCard);
    });

    // Update financial summary elements (example for monthly spending)
    // You can target more elements as needed:
    const spendingElem = document.querySelector(".stats-card .stat-value");
    if (spendingElem) {
      spendingElem.textContent = "$" + data.summary.monthlySpending.toFixed(2);
    }
    // (Similarly update monthly income, savings progress, credit score, etc.)
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
});
