document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            // Simulate login validation
            if (email && password) {
                // Redirect to dashboard
                window.location.href = 'index.html';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            // Simulate signup process
            if (username && email && password) {
                // Redirect to login page
                window.location.href = 'login.html';
            }
        });
    }

    // Dashboard functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Share buttons functionality
    const shareButtons = document.querySelectorAll('.btn-share');
    if (shareButtons) {
        shareButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const platform = this.dataset.platform;
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent('Check out this space on Airattix!');
                
                let shareUrl = '';
                switch(platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                        break;
                    case 'whatsapp':
                        shareUrl = `https://wa.me/?text=${text}%20${url}`;
                        break;
                    case 'linkedin':
                        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                        break;
                }
                
                if (shareUrl) {
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                }
            });
        });
    }

    // Generic number parser (handles ₹, commas, text)
    const parseNumericValue = (value) => {
        if (typeof value !== 'string') return NaN;
        const cleaned = value.replace(/[^0-9.]/g, '');
        return cleaned ? Number(cleaned) : NaN;
    };

    // Storage page search + filter functionality
    if (window.location.pathname.toLowerCase().includes('storage.html')) {
        const storageCards = Array.from(document.querySelectorAll('.features-section .listing-card'));
        const heroSearchInput = document.querySelector('.hero-section .search-box input');
        const heroSearchButton = document.querySelector('.hero-section .search-box button');

        const filterCardBody = document.querySelector('.features-section .card .card-body');
        const locationFilterInput = filterCardBody ? filterCardBody.querySelector('input.form-control') : null;
        const filterSelects = filterCardBody ? filterCardBody.querySelectorAll('select.form-select') : [];
        const typeFilter = filterSelects[0] || null;
        const priceFilter = filterSelects[1] || null;
        const sizeFilter = filterSelects[2] || null;
        const applyFilterButton = filterCardBody ? filterCardBody.querySelector('.text-end .btn') : null;

        const listingsRow = storageCards.length ? storageCards[0].closest('.row') : null;
        let noResultsEl = document.getElementById('storageNoResults');
        if (!noResultsEl && listingsRow) {
            noResultsEl = document.createElement('div');
            noResultsEl.id = 'storageNoResults';
            noResultsEl.className = 'alert alert-warning mt-3';
            noResultsEl.textContent = 'No storage spaces found for your search/filter.';
            noResultsEl.style.display = 'none';
            listingsRow.parentElement.appendChild(noResultsEl);
        }

        const getStorageData = (card) => {
            const title = (card.querySelector('.card-title')?.textContent || '').trim().toLowerCase();
            const location = (card.querySelector('.card-text')?.textContent || '').trim().toLowerCase();
            const badges = card.querySelectorAll('.badge');
            const sizeText = (badges[0]?.textContent || '').trim();
            const typeText = (badges[1]?.textContent || '').trim().toLowerCase();
            const priceText = (card.querySelector('.price')?.textContent || '').trim();

            const sizeValue = parseNumericValue(sizeText);
            const priceValue = parseNumericValue(priceText);

            return { title, location, typeText, sizeValue, priceValue, text: `${title} ${location}` };
        };

        const matchesStoragePriceRange = (priceValue, selectedRange) => {
            if (!selectedRange) return true;
            if (Number.isNaN(priceValue)) return false;

            if (selectedRange.endsWith('+')) {
                const min = Number(selectedRange.replace('+', ''));
                if (Number.isNaN(min)) return true;
                return priceValue >= min;
            }

            const [min, max] = selectedRange.split('-').map(Number);
            if (Number.isNaN(min) || Number.isNaN(max)) return true;
            return priceValue >= min && priceValue <= max;
        };

        const matchesStorageSize = (sizeValue, selectedSize) => {
            if (!selectedSize) return true;
            if (Number.isNaN(sizeValue)) return false;

            if (selectedSize === 'small') return sizeValue <= 50;
            if (selectedSize === 'medium') return sizeValue > 50 && sizeValue <= 100;
            if (selectedSize === 'large') return sizeValue > 100;
            return true;
        };

        const applyStorageFilters = () => {
            const locationQuery = (locationFilterInput?.value || heroSearchInput?.value || '').trim().toLowerCase();
            const selectedType = (typeFilter?.value || '').trim().toLowerCase();
            const selectedPriceRange = (priceFilter?.value || '').trim();
            const selectedSize = (sizeFilter?.value || '').trim().toLowerCase();

            let visibleCount = 0;

            storageCards.forEach((card) => {
                const { text, typeText, sizeValue, priceValue } = getStorageData(card);

                const locationMatch = !locationQuery || text.includes(locationQuery);
                const typeMatch = !selectedType || typeText.includes(selectedType);
                const priceMatch = matchesStoragePriceRange(priceValue, selectedPriceRange);
                const sizeMatch = matchesStorageSize(sizeValue, selectedSize);

                const isVisible = locationMatch && typeMatch && priceMatch && sizeMatch;
                const column = card.closest('.col-md-6') || card.parentElement;
                column.style.display = isVisible ? '' : 'none';
                if (isVisible) visibleCount += 1;
            });

            if (noResultsEl) {
                noResultsEl.style.display = visibleCount === 0 ? '' : 'none';
            }
        };

        if (heroSearchButton) {
            heroSearchButton.addEventListener('click', () => {
                if (locationFilterInput) locationFilterInput.value = heroSearchInput?.value || '';
                applyStorageFilters();
            });
        }

        if (heroSearchInput) {
            heroSearchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (locationFilterInput) locationFilterInput.value = heroSearchInput.value;
                    applyStorageFilters();
                }
            });
        }

        if (applyFilterButton) {
            applyFilterButton.addEventListener('click', (event) => {
                event.preventDefault();
                applyStorageFilters();
            });
        }

        if (locationFilterInput) {
            locationFilterInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    applyStorageFilters();
                }
            });
        }

        [typeFilter, priceFilter, sizeFilter].forEach((control) => {
            if (control) {
                control.addEventListener('change', applyStorageFilters);
            }
        });
    }

    // Parking page search + advanced filters functionality
    if (window.location.pathname.toLowerCase().includes('parking.html')) {
        const parkingCards = Array.from(document.querySelectorAll('.listing-card'));
        const heroSearchInput = document.querySelector('.hero-section .search-box input');
        const heroSearchButton = document.querySelector('.hero-section .search-box button');

        const searchForm = document.getElementById('searchForm');
        const searchLocationInput = searchForm ? searchForm.querySelector('input.form-control[placeholder*="Search city"]') : null;
        const parkingTypeFilter = searchForm ? searchForm.querySelector('select[name="parking_type"]') : null;
        const sortByFilter = searchForm ? searchForm.querySelector('select[name="sort_by"]') : null;
        const vehicleTypeFilter = searchForm ? searchForm.querySelector('select[name="vehicle_type"]') : null;
        const priceMinFilter = searchForm ? searchForm.querySelector('input[name="price_min"]') : null;
        const priceMaxFilter = searchForm ? searchForm.querySelector('input[name="price_max"]') : null;
        const amenitiesFilters = searchForm ? Array.from(searchForm.querySelectorAll('input[name="amenities"]')) : [];

        const mapSearchInput = document.querySelector('.map-search-form input.form-control');
        const mapSearchButton = document.querySelector('.map-search-form button');

        const parkingRow = parkingCards.length ? parkingCards[0].closest('.row') : null;
        let noResultsEl = document.getElementById('parkingNoResults');
        if (!noResultsEl && parkingRow) {
            noResultsEl = document.createElement('div');
            noResultsEl.id = 'parkingNoResults';
            noResultsEl.className = 'alert alert-warning mt-3';
            noResultsEl.textContent = 'No parking spaces found for your search/filter.';
            noResultsEl.style.display = 'none';
            parkingRow.parentElement.appendChild(noResultsEl);
        }

        const amenityMatchers = {
            security: /security|secure/i,
            cctv: /cctv/i,
            charging: /ev\s*charging|charging/i
        };

        const getParkingData = (card) => {
            const title = (card.querySelector('.card-title')?.textContent || '').trim().toLowerCase();
            const location = (card.querySelector('.card-text')?.textContent || '').trim().toLowerCase();
            const badges = card.querySelectorAll('.badge');
            const vehicleText = (badges[0]?.textContent || '').trim().toLowerCase();
            const typeText = (badges[1]?.textContent || '').trim().toLowerCase();
            const detailsText = (card.querySelector('.text-muted')?.textContent || '').trim().toLowerCase();
            const priceValue = parseNumericValue((card.querySelector('.price')?.textContent || '').trim());

            return {
                title,
                location,
                vehicleText,
                typeText,
                detailsText,
                priceValue,
                text: `${title} ${location} ${vehicleText} ${typeText} ${detailsText}`
            };
        };

        const applyParkingFilters = () => {
            const locationQuery = (searchLocationInput?.value || heroSearchInput?.value || '').trim().toLowerCase();
            const selectedParkingType = (parkingTypeFilter?.value || '').trim().toLowerCase();
            const selectedVehicleType = (vehicleTypeFilter?.value || '').trim().toLowerCase();
            const selectedMinPrice = (priceMinFilter && priceMinFilter.value !== '') ? Number(priceMinFilter.value) : NaN;
            const selectedMaxPrice = (priceMaxFilter && priceMaxFilter.value !== '') ? Number(priceMaxFilter.value) : NaN;
            const selectedSort = (sortByFilter?.value || 'relevance').trim().toLowerCase();
            const selectedAmenities = amenitiesFilters.filter(cb => cb.checked).map(cb => cb.value);

            let visibleCards = [];

            parkingCards.forEach((card) => {
                const data = getParkingData(card);

                const locationMatch = !locationQuery || data.text.includes(locationQuery);
                const parkingTypeMatch = !selectedParkingType || data.text.includes(selectedParkingType);
                const vehicleTypeMatch = !selectedVehicleType || data.text.includes(selectedVehicleType);
                const minPriceMatch = Number.isNaN(selectedMinPrice) || data.priceValue >= selectedMinPrice;
                const maxPriceMatch = Number.isNaN(selectedMaxPrice) || data.priceValue <= selectedMaxPrice;
                const amenitiesMatch = selectedAmenities.every((amenity) => {
                    const matcher = amenityMatchers[amenity];
                    return matcher ? matcher.test(data.text) : true;
                });

                const isVisible = locationMatch && parkingTypeMatch && vehicleTypeMatch && minPriceMatch && maxPriceMatch && amenitiesMatch;

                const column = card.closest('.col-md-6') || card.parentElement;
                column.style.display = isVisible ? '' : 'none';

                if (isVisible) {
                    visibleCards.push({ card, price: data.priceValue });
                }
            });

            if (selectedSort === 'price_low') {
                visibleCards.sort((a, b) => a.price - b.price);
            } else if (selectedSort === 'price_high') {
                visibleCards.sort((a, b) => b.price - a.price);
            }

            if ((selectedSort === 'price_low' || selectedSort === 'price_high') && parkingRow) {
                visibleCards.forEach(({ card }) => {
                    const col = card.closest('.col-md-6') || card.parentElement;
                    parkingRow.appendChild(col);
                });
            }

            if (noResultsEl) {
                noResultsEl.style.display = visibleCards.length === 0 ? '' : 'none';
            }
        };

        if (heroSearchButton) {
            heroSearchButton.addEventListener('click', () => {
                if (searchLocationInput) searchLocationInput.value = heroSearchInput?.value || '';
                applyParkingFilters();
            });
        }

        if (heroSearchInput) {
            heroSearchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (searchLocationInput) searchLocationInput.value = heroSearchInput.value;
                    applyParkingFilters();
                }
            });
        }

        if (mapSearchButton) {
            mapSearchButton.addEventListener('click', () => {
                const mapQuery = mapSearchInput?.value || '';
                if (searchLocationInput) searchLocationInput.value = mapQuery;
                if (heroSearchInput) heroSearchInput.value = mapQuery;
                applyParkingFilters();
            });
        }

        if (searchForm) {
            searchForm.addEventListener('submit', (event) => {
                event.preventDefault();
                applyParkingFilters();
            });
        }

        [parkingTypeFilter, sortByFilter, vehicleTypeFilter, priceMinFilter, priceMaxFilter].forEach((control) => {
            if (control) {
                control.addEventListener('change', applyParkingFilters);
                control.addEventListener('input', applyParkingFilters);
            }
        });

        amenitiesFilters.forEach((checkbox) => {
            checkbox.addEventListener('change', applyParkingFilters);
        });

        if (searchLocationInput) {
            searchLocationInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    applyParkingFilters();
                }
            });
        }
    }

    // Chatbot booking assistant functionality (storage + parking pages)
    const chatbotWidgets = document.querySelectorAll('.chatbot-widget');
    if (chatbotWidgets.length) {
        chatbotWidgets.forEach(widget => {
            const toggleBtn = widget.querySelector('.chatbot-toggle');
            const body = widget.querySelector('.chatbot-body');
            const input = widget.querySelector('.chatbot-input');
            const sendBtn = widget.querySelector('.chatbot-send');
            const optionButtons = widget.querySelectorAll('.chat-option-btn');
            const bookingUrl = widget.dataset.bookingUrl || '#';
            const availableItems = Array.from(optionButtons)
                .map(btn => (btn.dataset.item || '').trim().toLowerCase())
                .filter(Boolean);

            const addMessage = (message, type = 'bot') => {
                if (!body) return;
                const msg = document.createElement('div');
                msg.className = `chat-message ${type}`;
                msg.textContent = message;
                body.appendChild(msg);
                body.scrollTop = body.scrollHeight;
            };

            const redirectToBooking = (selectedItem) => {
                addMessage(`Great choice! Redirecting you to booking for "${selectedItem}"...`, 'bot');
                const redirectUrl = `${bookingUrl}?item=${encodeURIComponent(selectedItem)}`;
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 900);
            };

            const processSelection = (selectedItem) => {
                const rawValue = (selectedItem || '').trim();
                if (!rawValue) return;

                addMessage(rawValue, 'user');
                const normalized = rawValue.toLowerCase();

                if (availableItems.includes(normalized)) {
                    redirectToBooking(rawValue);
                } else {
                    addMessage('Sorry, I could not find that item in the current list. Please choose one of the options shown.', 'bot');
                }
            };

            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    widget.classList.toggle('open');
                });
            }

            optionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    processSelection(button.dataset.item || button.textContent);
                });
            });

            if (sendBtn && input) {
                sendBtn.addEventListener('click', () => {
                    processSelection(input.value);
                    input.value = '';
                });

                input.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        processSelection(input.value);
                        input.value = '';
                    }
                });
            }
        });
    }

    // Initialize map if available
    const mapElement = document.getElementById('map');
    if (mapElement && typeof google !== 'undefined') {
        const map = new google.maps.Map(mapElement, {
            center: { lat: 20.5937, lng: 78.9629 }, // Center of India
            zoom: 5
        });
    }
});