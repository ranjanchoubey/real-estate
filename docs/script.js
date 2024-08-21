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

  const apiUrl = 'https://real-estate-api-v3m0.onrender.com';

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

      fetch(`${apiUrl}/predict`, {
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
      const radius = parseInt(document.getElementById('range').value, 10); // Ensure radius is an integer

      // Log the data being sent to the server
      console.log('Sending data:', { location, radius });

      fetch(`${apiUrl}/get_apartments_within_radius`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ location, radius })
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(`Network response was not ok: ${err.message}`);
          });
        }
        return response.json();
      })
      .then(data => {
        const sectorList = document.getElementById('sector-list');
        const houseList = document.getElementById('house-list');
        sectorList.innerHTML = '';
        houseList.innerHTML = '';

        if (data.apartments_within_radius && Array.isArray(data.apartments_within_radius)) {
          data.apartments_within_radius.forEach(apartment => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = apartment.PropertyName;
            link.addEventListener('click', function(event) {
              event.preventDefault();
              fetchRecommendations(apartment.PropertyName);
            });
            listItem.appendChild(link);
            sectorList.appendChild(listItem);
          });
        } else {
          console.error('Invalid data format');
        }
      })
      .catch(error => {
        console.error('Error fetching sector data:', error);
      });
    });
  }

  function fetchRecommendations(propertyName) {
    fetch(`${apiUrl}/recommend_properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ property_name: propertyName })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(`Network response was not ok: ${err.message}`);
        });
      }
      return response.json();
    })
    .then(data => {
      const houseList = document.getElementById('house-list');
      houseList.innerHTML = '';

      if (Array.isArray(data)) {
        data.forEach(house => {
          const listItem = document.createElement('li');
          const link = document.createElement('a');
          link.href = house.Link;
          link.textContent = house.PropertyName;
          link.target = '_blank'; // Open link in a new tab
          listItem.appendChild(link);
          houseList.appendChild(listItem);
        });
      } else {
        console.error('Invalid data format');
      }
    })
    .catch(error => {
      console.error('Error fetching house recommendations:', error);
    });
  }
});
