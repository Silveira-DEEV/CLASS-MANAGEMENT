import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB8fw3yHAOTIUqNws8S_579FFKSY4ZRZfU",
    authDomain: "projeto-salas.firebaseapp.com",
    databaseURL: "https://projeto-salas-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "projeto-salas",
    storageBucket: "projeto-salas.firebasestorage.app",
    messagingSenderId: "55494640837",
    appId: "1:55494640837:web:b00713624afc202bfb5cac"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


function register(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById("errorMessage");

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Usuário registrado com sucesso!");
            window.location.href = "index.html";
            console.log("Usuário criado:", userCredential.user);
            errorMessage.style.display = "none";
            document.getElementById("registerForm").reset();
        })
        .catch((error) => {
            errorMessage.textContent = "Erro: " + error.message;
            errorMessage.style.display = "block";
            console.error("Erro ao registrar:", error);
        });
}
document.getElementById("registerForm").addEventListener("submit", register);