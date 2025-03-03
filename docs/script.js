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
  const apiResponseBox = document.getElementById('api-response-box'); // New element to display API response

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

      fetch('https://real-estate-api-v3m0.onrender.com/property', {
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
    console.log('Get Sectors button found');
    getSectorsBtn.addEventListener('click', function() {
      console.log('Get Sectors button clicked');
      const location = document.getElementById('location').value;
      const radius = document.getElementById('range').value;
  
      console.log('Location:', location);
      console.log('Radius:', radius);
  
      fetch('https://real-estate-api-v3m0.onrender.com/get_apartments_within_radius', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: location,
          radius: parseInt(radius)
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('API response:', data);  
        const sectorList = document.getElementById('sector-list');
        sectorList.innerHTML = ''; // Clear previous results
  
        if (data.sectors) {
          data.sectors.forEach(sector => {
            const li = document.createElement('li');
            li.textContent = sector;
            sectorList.appendChild(li);
          });
        }
  
        const houseList = document.getElementById('house-list');
        houseList.innerHTML = ''; // Clear previous results
  
        if (data.houses) {
          data.houses.forEach(house => {
            const li = document.createElement('li');
            li.textContent = house;
            houseList.appendChild(li);
          });
        }

        // Display apartments within radius
        const apartmentsList = document.getElementById('apartments-list');
        apartmentsList.innerHTML = ''; // Clear previous results

        if (data.apartments_within_radius) {
          data.apartments_within_radius.forEach(apartment => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = apartment.PropertyName;
            a.href = apartment.Link;
            a.target = '_blank';
            li.appendChild(a);
            apartmentsList.appendChild(li);
          });
        }

        // Display API response
        if (apiResponseBox) {
          apiResponseBox.textContent = JSON.stringify(data, null, 2);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        if (apiResponseBox) {
          apiResponseBox.textContent = 'Error: ' + error;
        }
      });
    });
  } else {
    console.log('Get Sectors button not found');
  }
  
});
