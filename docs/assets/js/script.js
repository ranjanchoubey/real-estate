'use strict';

/**
 * element toggle function
 */

const elemToggleFunc = function (elem) { elem.classList.toggle("active"); }



/**
 * navbar toggle
 */

const navbar = document.querySelector("[data-navbar]");
const overlay = document.querySelector("[data-overlay]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");

const navElemArr = [overlay, navCloseBtn, navOpenBtn];

/**
 * close navbar when click on any navbar link
 */

for (let i = 0; i < navbarLinks.length; i++) { navElemArr.push(navbarLinks[i]); }

/**
 * addd event on all elements for toggling navbar
 */

for (let i = 0; i < navElemArr.length; i++) {
  navElemArr[i].addEventListener("click", function () {
    elemToggleFunc(navbar);
    elemToggleFunc(overlay);
  });
}



/**
 * header active state
 */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  window.scrollY >= 400 ? header.classList.add("active")
    : header.classList.remove("active");
}); 


// script.js
document.addEventListener("DOMContentLoaded", function() {
  const names = [
    "manoj boddu",
    "B manoj",
    "Boddu Manoj"
  ];

  const nameInput = document.getElementById("name");
  const autocompleteList = document.getElementById("autocomplete-list");

  nameInput.addEventListener("input", function() {
    const value = this.value;
    autocompleteList.innerHTML = "";

    if (!value) return;

    names.forEach(name => {
      if (name.toLowerCase().includes(value.toLowerCase())) {
        const item = document.createElement("div");
        item.textContent = name;
        item.addEventListener("click", function() {
          nameInput.value = name;
          autocompleteList.innerHTML = "";
        });
        autocompleteList.appendChild(item);
      }
    });
  });

  document.addEventListener("click", function(e) {
    if (e.target !== nameInput) {
      autocompleteList.innerHTML = "";
    }
  });

  const form = document.getElementById('price-prediction-form');
  const resultMessage = document.getElementById('result-message');

  form.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Add default value 1000000 if link is not working
    if (!form.action) {
      data.predicted_price = 1000000;
    }

    try {
      const response = await fetch(form.action || 'http://localhost:7878/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        resultMessage.innerText = `Predicted Price: ${result.predicted_price}`;
      } else {
        resultMessage.innerText = 'Error: Unable to get prediction';
      }
    } catch (error) {
      resultMessage.innerText = 'Error: Unable to get prediction';
    }
  });
});