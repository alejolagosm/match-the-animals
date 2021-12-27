// Initializing the DOM variables
const get_animals = document.getElementById("get-animals");
const drag_li = document.getElementById("drag-li");
const picture_li = document.getElementById("picture-li");
const check = document.getElementById("check");
const qt_animals = 8;

// Initialize arrays for the animal name and picture
let animals = [],
  animalpics = [];

// Initialize the variables for the list comparisons and drag and drop events
let listItems1 = [];
let listItems2 = [];
let dragStartIndex;

// Simple timeout function to race the promise in case there is an error
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// Get JSON from the API fetch call
const getJSON = async function (url) {
  try {
    const res = await Promise.race([fetch(url), timeout(5)]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} (${res.status}) Burro`);
    return data;
  } catch (err) {
    throw err;
  }
};

// Load the results from the API call based on a number of animals
const loadSearchResults = async function (number) {
  try {
    const data = await getJSON(
      `https://zoo-animal-api.herokuapp.com/animals/rand/${number}`
    );
    // Adding the data to each array
    data.forEach((animalInfo) => {
      animals.push(animalInfo.name);
      animalpics.push(animalInfo.image_link);
    });
    // Creating the list and adding it to the HTML
    createList();
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Drag and drop event listeners
function dragStart() {
  dragStartIndex = +this.closest("li").getAttribute("data-index");
}
function dragEnter() {
  this.classList.add("over");
}
function dragOver(e) {
  e.preventDefault();
}
function dragLeave() {
  this.classList.remove("over");
}
function dragDrop() {
  const dragEndIndex = +this.getAttribute("data-index");
  swapItems(dragStartIndex, dragEndIndex);
  this.classList.remove("over");
}

// Exchanging the items from the list after dragging the items
function swapItems(fromIndex, toIndex) {
  const itemOne = listItems2[fromIndex].querySelector(".draggable");
  const itemTwo = listItems2[toIndex].querySelector(".draggable");
  listItems2[fromIndex].appendChild(itemTwo);
  listItems2[toIndex].appendChild(itemOne);
}

// Checking the order of the items and checking if the player won
function checkOrder() {
  listItems2.forEach((listItem, index) => {
    const animalname = listItem.querySelector(".draggable").innerText.trim();
    if (animalname !== animals[index]) {
      listItem.classList.add("wrong");
    } else {
      listItem.classList.remove("wrong");
      listItem.classList.add("right");
    }
  });
  checkWinner();
}

// Function to check if the palyer won and activate modal window
function checkWinner() {
  if (listItems2.every((listItem) => listItem.classList.contains("right"))) {
    document.getElementById("modal-container").classList.remove("hidden");
    document.getElementById("list-container").classList.add("hidden");
  }
}

// Adding the drag and drop event listeners for each item on the list
function adddraglisteners() {
  const draggables = document.querySelectorAll(".draggable");
  const draglistItems = document.querySelectorAll(".drag-li li");
  draggables.forEach((draggable) =>
    draggable.addEventListener("dragstart", dragStart)
  );
  draglistItems.forEach((item) => {
    item.addEventListener("dragover", dragOver);
    item.addEventListener("drop", dragDrop);
    item.addEventListener("dragenter", dragEnter);
    item.addEventListener("dragleave", dragLeave);
  });
}

// Creating the list of the animals after the API call
function createList() {
  // Creating the list of the animal pics
  [...animalpics].forEach((animalpic, index) => {
    const listItem = document.createElement("li");
    listItem.setAttribute("data-index", index);
    listItem.innerHTML = `
  <span class="number">${index + 1}</span>
  <div>
  <img src=${animalpic} alt="Animal Picture" id="animal-pic" />
  </div>`;
    listItems1.push(listItem);
    picture_li.appendChild(listItem);
  });
  // Creating the list of the animal names
  [...animals]
    .map((animal) => ({ value: animal, sort: Math.random() }))
    .sort((value1, valueb) => value1.sort - valueb.sort)
    .map((object) => object.value)
    .forEach((animal, index) => {
      const listItem = document.createElement("li");
      listItem.setAttribute("data-index", index);
      listItem.innerHTML = `
        <span class="number">${index + 1}</span>
        <div class ="draggable" draggable ="true">
        <p class="name">${animal}</p>
        <i class="fas fa-grip-lines"></i>
        </div>
        `;
      listItems2.push(listItem);
      drag_li.appendChild(listItem);
    });

  adddraglisteners();
}

// Init On DOM Load
document.addEventListener("DOMContentLoaded", init);

// Init the DOM events on load
function init() {
  get_animals.addEventListener("click", startGame);
}

// Start the game
function startGame() {
  document.getElementById("init-container").classList.add("hidden");
  loadSearchResults(qt_animals);
  document.getElementById("list-container").classList.remove("hidden");
  check.addEventListener("click", checkOrder);
}

// Re-start the game
const replaybtn = document.getElementById("re-start");
replaybtn.addEventListener("click", startAgain);
function startAgain() {
  document.getElementById("modal-container").classList.add("hidden");
  document.getElementById("init-container").classList.remove("hidden");
  picture_li.innerHTML = "";
  drag_li.innerHTML = "";
  animals.splice(0, animals.length);
  animalpics.splice(0, animalpics.length);
  listItems1.splice(0, listItems1.length);
  listItems2.splice(0, listItems2.length);
}
