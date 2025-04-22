import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8fw3yHAOTIUqNws8S_579FFKSY4ZRZfU",
  authDomain: "projeto-salas.firebaseapp.com",
  databaseURL:
    "https://projeto-salas-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "projeto-salas",
  storageBucket: "projeto-salas.firebasestorage.app",
  messagingSenderId: "55494640837",
  appId: "1:55494640837:web:b00713624afc202bfb5cac",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função de registro
function register(event) {
  event.preventDefault(); 

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("errorMessage");
  const visualSuccess = document.getElementById("registerSuccessMessage");
  const visualError = document.getElementById("registerErrorMessage");

  
  visualSuccess.style.display = "none";
  visualError.style.display = "none";
  errorMessage.style.display = "none";

  
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      
      visualSuccess.style.display = "block";

      console.log("Usuário criado:", userCredential.user);
      errorMessage.style.display = "none";
      document.getElementById("registerForm").reset();
      setTimeout(() => {
        window.location.href = "index.html"; 
      }, 2000);
    })
    .catch((error) => {

      visualError.textContent = "❌ Erro ao registrar. Tente novamente.";
      visualError.style.display = "block";
      errorMessage.style.display = "none";
      if (error.code === "auth/email-already-in-use") {
        visualError.textContent = "❌ Este e-mail já está em uso.";
      } else if (error.code === "auth/invalid-email") {
        visualError.textContent = "❌ E-mail inválido.";
      } else if (error.code === "auth/weak-password") {
        visualError.textContent =
          "❌ A senha deve ter pelo menos 6 caracteres.";
      }

      console.error("Erro ao registrar:", error.message);
    });
}
document.getElementById("registerForm").addEventListener("submit", register);
