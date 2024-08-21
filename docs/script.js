document.addEventListener('DOMContentLoaded', function() {
  // Handle opening and closing of the navbar
  const navOpenBtn = document.querySelector('[data-nav-open-btn]');
  const navCloseBtn = document.querySelector('[data-nav-close-btn]');
  const navbar = document.querySelector('[data-navbar]');
  const overlay = document.querySelector('[data-overlay]');
  const searchBtn = document.querySelector('.header-bottom-actions-btn[aria-label="Search"]');
  const profileBtn = document.querySelector('.header-bottom-actions-btn[aria-label="Profile"]');
  const cartBtn = document.querySelector('.header-bottom-actions-btn[aria-label="Cart"]');
  const addListingBtn = document.querySelector('.header-top-btn');
  const header = document.querySelector("[data-header]");
  const pricePredictionForm = document.getElementById('price-prediction-form');
  const predictionValue = document.getElementById('prediction-value');
  const resultBox = document.getElementById('result-box');
  const getSectorsBtn = document.getElementById('get-sectors');

  if (navOpenBtn && navCloseBtn && navbar) {
    navOpenBtn.addEventListener('click', () => {
      navbar.classList.add('active');
    });

    navCloseBtn.addEventListener('click', () => {
      navbar.classList.remove('active');
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        navbar.classList.remove('active');
      });
    }
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      console.log('Search button clicked');
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      console.log('Profile button clicked');
    });
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      console.log('Cart button clicked');
    });
  }

  if (addListingBtn) {
    addListingBtn.addEventListener('click', () => {
      console.log('Add Listing button clicked');
    });
  }

  if (header) {
    window.addEventListener("scroll", function () {
      window.scrollY >= 400 ? header.classList.add("active")
        : header.classList.remove("active");
    });
  }

  if (pricePredictionForm) {
    pricePredictionForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const propertyType = document.getElementById('property-type').value;
      const sector = document.getElementById('sector').value;
      const bedRoom = document.getElementById('bedRoom').value;
      const bathroom = document.getElementById('bathroom').value;
      const balcony = document.getElementById('balcony').value;
      const agePossession = document.getElementById('agePossession').value;
      const builtUpArea = document.getElementById('built_up_area').value;
      const servantRoom = document.getElementById('servant_room').value;
      const storeRoom = document.getElementById('store_room').value;
      const furnishingType = document.getElementById('furnishing_type').value;
      const luxuryCategory = document.getElementById('luxury_category').value;
      const floorCategory = document.getElementById('floor_category').value;

      const data = {
        property_type: propertyType,
        sector: sector,
        bedRoom: parseInt(bedRoom),
        bathroom: parseInt(bathroom),
        balcony: balcony,
        agePossession: agePossession,
        built_up_area: parseFloat(builtUpArea),
        servant_room: parseInt(servantRoom),
        store_room: parseInt(storeRoom),
        furnishing_type: furnishingType,
        luxury_category: luxuryCategory,
        floor_category: floorCategory
      };

      fetch('https://real-estate-api-v3m0.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        console.log('Success:', result);
        if (predictionValue) {
          predictionValue.textContent = result.predicted_price;
          resultBox.style.display = 'block';
          resultBox.classList.add('slide-in');
          resultBox.scrollIntoView({ behavior: 'smooth' });
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  }

  if (getSectorsBtn) {
    getSectorsBtn.addEventListener('click', function() {
      const location = document.getElementById('location').value;
      const range = document.getElementById('range').value;

      fetch(`https://api.example.com/sectors?location=${location}&range=${range}`)
        .then(response => response.json())
        .then(data => {
          const sectorList = document.getElementById('sector-list');
          sectorList.innerHTML = '';

          data.sectors.forEach(sector => {
            const listItem = document.createElement('li');
            const card = document.createElement('div');
            card.className = 'recommendation-card';

            const cardTitle = document.createElement('h3');
            cardTitle.className = 'h3 card-title';
            const titleLink = document.createElement('a');
            titleLink.href = '#';
            titleLink.textContent = sector.name;
            titleLink.addEventListener('click', function() {
              fetch(`https://api.example.com/houses?sector=${sector.id}`)
                .then(response => response.json())
                .then(houseData => {
                  const houseList = document.getElementById('house-list');
                  houseList.innerHTML = '';

                  houseData.houses.forEach(house => {
                    const houseItem = document.createElement('li');
                    const houseCard = document.createElement('div');
                    houseCard.className = 'recommendation-card';

                    const houseCardIcon = document.createElement('div');
                    houseCardIcon.className = 'card-icon';
                    const houseImg = document.createElement('img');
                    houseImg.src = house.icon;
                    houseImg.alt = 'House icon';
                    houseCardIcon.appendChild(houseImg);

                    const houseCardTitle = document.createElement('h3');
                    houseCardTitle.className = 'h3 card-title';
                    const houseTitleLink = document.createElement('a');
                    houseTitleLink.href = '#';
                    houseTitleLink.textContent = house.title;
                    houseCardTitle.appendChild(houseTitleLink);

                    const houseCardText = document.createElement('p');
                    houseCardText.className = 'card-text';
                    houseCardText.textContent = house.description;

                    const houseCardLink = document.createElement('a');
                    houseCardLink.href = '#';
                    houseCardLink.className = 'card-link';
                    houseCardLink.innerHTML = `<span>Learn More</span><ion-icon name="arrow-forward-outline"></ion-icon>`;

                    houseCard.appendChild(houseCardIcon);
                    houseCard.appendChild(houseCardTitle);
                    houseCard.appendChild(houseCardText);
                    houseCard.appendChild(houseCardLink);

                    houseItem.appendChild(houseCard);
                    houseList.appendChild(houseItem);
                  });
                });
            });
            cardTitle.appendChild(titleLink);
            card.appendChild(cardTitle);
            listItem.appendChild(card);
            sectorList.appendChild(listItem);
          });
        });
    });
  }
});
