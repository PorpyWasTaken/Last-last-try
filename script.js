import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAoVdv14MTRh_tST3Mwa1X6LhhIWzfahKU",
  authDomain: "flambeau-packing-142ad.firebaseapp.com",
  databaseURL: "https://flambeau-packing-142ad-default-rtdb.firebaseio.com",
  projectId: "flambeau-packing-142ad",
  storageBucket: "flambeau-packing-142ad.appspot.com",
  messagingSenderId: "219383298265",
  appId: "1:219383298265:web:9e8f3ceb3115d50d92a6c8"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const loginScreen = document.getElementById("login-screen");
const mainScreen = document.getElementById("main-screen");
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const currentUserEl = document.getElementById("current-user");
const friendsListEl = document.getElementById("friends-list");
const packingListEl = document.getElementById("packing-list");
const listTitle = document.getElementById("list-title");

const items = [
  "Rx Medications", "Sleeping Bag", "Rain gear - jacket and pants", "Wet shoes (close-toed)",
  "Personal hygiene items", "2 t-shirts/tank tops", "1 long-sleeved shirt", "1 warm sweater (wool or synthetic fleece)",
  "2 pair pants", "2 pairs wool socks", "Underwear", "Brimmed hat", "Warm stocking hat",
  "Water bottle (32 oz)", "Headlamp/Flashlight", "Dry shoes", "1 or 2 pairs of shorts",
  "Swimsuit", "Small daypack or fanny pack", "Camping towel", "Sleeping pad",
  "Sunglasses", "Card game, journal, or book", "Camera"
];

let currentUser = null;
let viewingUser = null;
let unsubscribe = null;

loginBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    localStorage.setItem("flambeauUser", name);
    currentUser = name;
    viewingUser = name;
    initUser(name);
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("flambeauUser");
  location.reload();
});

const savedUser = localStorage.getItem("flambeauUser");
if (savedUser) {
  currentUser = savedUser;
  viewingUser = savedUser;
  initUser(savedUser);
}

function initUser(name) {
  loginScreen.style.display = "none";
  mainScreen.style.display = "block";
  currentUserEl.textContent = name;

  const userRef = ref(db, `users/${name}`);

  get(userRef).then(snapshot => {
    if (!snapshot.exists()) {
      const data = {};
      items.forEach(item => data[item] = false);
      set(userRef, data);
    }
  });

  renderFriends();
  switchToUserList(name);
}

function renderFriends() {
  const usersRef = ref(db, "users");
  onValue(usersRef, snapshot => {
    const data = snapshot.val();
    friendsListEl.innerHTML = "";
    if (data) {
      Object.keys(data).forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        li.addEventListener("click", () => {
          viewingUser = user;
          if (user === currentUser) {
            listTitle.textContent = "Your Packing List";
          } else {
            listTitle.textContent = `${user}'s Packing List (view only)`;
          }
          switchToUserList(user);
        });
        friendsListEl.appendChild(li);
      });
    }
  });
}

function switchToUserList(user) {
  if (unsubscribe) unsubscribe();

  const userRef = ref(db, `users/${user}`);
  unsubscribe = onValue(userRef, snapshot => {
    const data = snapshot.val();
    renderList(data || {});
  });
}

function renderList(userData) {
  packingListEl.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = userData[item] || false;
    checkbox.disabled = viewingUser !== currentUser;

    if (viewingUser === currentUser) {
      checkbox.addEventListener("change", () => {
        const itemRef = ref(db, `users/${currentUser}/${item}`);
        set(itemRef, checkbox.checked);
      });
    }

    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(item));
    packingListEl.appendChild(li);
  });
}
