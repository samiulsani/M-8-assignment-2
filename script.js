const searchInput = document.getElementById('search');
const searchButton = document.getElementById('search-button');
const drinkCardsContainer = document.getElementById('drink-cards-container');
const groupList = document.getElementById('group-list');
const groupCountDisplay = document.getElementById('group-count');
const modal = document.getElementById('modal');
const modalDetails = document.getElementById('modal-details');
const closeButton = document.querySelector('.close-button');

let group = [];

function fetchRandomDrinks(numDrinks = 8) {
    drinkCardsContainer.innerHTML = ""; // Clear existing cards
    for (let i = 0; i < numDrinks; i++) {
        fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')
            .then(response => response.json())
            .then(data => {
                if (data.drinks) {
                    const card = createDrinkCard(data.drinks[0]);
                    drinkCardsContainer.appendChild(card);
                }
            }).catch(error => {
                console.error("Error fetching random drink:", error);
                if (drinkCardsContainer.innerHTML === "") { // Only show error if no cards have loaded
                    drinkCardsContainer.innerHTML = "<p>Error fetching drinks. Please try again later.</p>";
                }
            });
    }
}

function fetchDrinks(searchTerm = "") {
    let url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            drinkCardsContainer.innerHTML = "";
            if (data.drinks === null || data.drinks.length === 0) { // Check for empty results
                drinkCardsContainer.innerHTML = "<p>No drinks found.</p>";
                return;
            }

            data.drinks.forEach(drink => {
                const card = createDrinkCard(drink);
                drinkCardsContainer.appendChild(card);
            });
        }).catch(error => {
            console.error("Error fetching data:", error);
            drinkCardsContainer.innerHTML = "<p>Error fetching drinks. Please try again later.</p>";
        });
}

function createDrinkCard(drink) {
    const card = document.createElement('div');
    card.classList.add('drink-card');
    card.innerHTML = `
        <img src="${drink.strDrinkThumb}" alt="${drink.strDrink} Image">
        <h3>${drink.strDrink}</h3>
        <p>Category: ${drink.strCategory ? drink.strCategory : "N/A"}</p>
        <p>Instructions: ${drink.strInstructions ? drink.strInstructions.substring(0, 15) + "..." : "N/A"}</p>
        <button class="add-to-group ${group.some(d => d.id === drink.idDrink) ? 'already-selected' : ''}" data-id="${drink.idDrink}" ${group.some(d => d.id === drink.idDrink) ? 'disabled' : ''}>${group.some(d => d.id === drink.idDrink) ? 'Already Selected' : 'Add to Group'}</button>
        <button class="details" data-id="${drink.idDrink}">Details</button>
    `;
    return card;
}

searchButton.addEventListener('click', () => {
    fetchDrinks(searchInput.value);
});

fetchRandomDrinks(); // Call for initial load

drinkCardsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-group')) {
        const drinkId = event.target.dataset.id;
        const drinkName = event.target.parentNode.querySelector('h3').textContent;

        if (group.length < 7) {
            if (!group.some(drink => drink.id === drinkId)) {
                group.push({ id: drinkId, name: drinkName });
                updateGroupList();
            }
        } else {
            alert('You cannot add more than 7 drinks to a group.');
        }
    } else if (event.target.classList.contains('details')) {
        const drinkId = event.target.dataset.id;
        fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`)
            .then(response => response.json())
            .then(data => {
                if (data.drinks) {
                    displayModal(data.drinks[0]);
                }
            }).catch(error => {
                console.error("Error fetching drink details:", error);
                modalDetails.innerHTML = "<p>Error fetching drink details. Please try again later.</p>";
                modal.style.display = 'block'; // Show modal even on error
            });
    }
});

function updateGroupList() {
    groupList.innerHTML = '';
    group.forEach(drink => {
        fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.id}`)
            .then(response => response.json())
            .then(data => {
                if (data.drinks) {
                    const li = document.createElement('li');
                    li.innerHTML = `<img src="${data.drinks[0].strDrinkThumb}" alt="${drink.name} Image"><span>${drink.name}</span>`;
                    groupList.appendChild(li);
                }
            }).catch(error => {
                console.error("Error fetching drink image for cart:", error);
            });
    });
    groupCountDisplay.textContent = group.length;
}

function displayModal(drink) {
    modalDetails.innerHTML = `
        <h2>${drink.strDrink}</h2>
        <img src="${drink.strDrinkThumb}" alt="${drink.strDrink} Image" style="max-width: 200px; margin: 10px auto; display: block;">
        <p>Category: ${drink.strCategory ? drink.strCategory : "N/A"}</p>
        <p>Glass: ${drink.strGlass ? drink.strGlass : "N/A"}</p>
        <p>Instructions: ${drink.strInstructions ? drink.strInstructions : "N/A"}</p>
        
    `;
    modal.style.display = 'block';
}

function getIngredientsList(drink) {
    let ingredients = "";
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        if (ingredient) {
            ingredients += `<li>${measure ? measure + " " : ""}${ingredient}</li>`;
        } else {
            break;
        }
    }
    return ingredients;
}

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});