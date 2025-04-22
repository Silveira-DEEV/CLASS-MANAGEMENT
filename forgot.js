import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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

function resetPassword(event) {
    event.preventDefault(); 

    const email = document.getElementById("email").value;
    const message = document.getElementById("message");

    sendPasswordResetEmail(auth, email)
        .then(() => {
            message.textContent = "E-mail de redefinição enviado! Verifique sua caixa de entrada.";
            message.style.color = "green";
            message.style.display = "block";
        })
        .catch((error) => {
            message.textContent = "Erro: " + error.message;
            message.style.color = "red";
            message.style.display = "block";
        });
}

document.getElementById("resetForm").addEventListener("submit", resetPassword);
