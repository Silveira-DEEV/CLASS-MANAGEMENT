import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  document.getElementById("loginSuccessMessage").style.display = "none";
  document.getElementById("loginErrorMessage").style.display = "none";
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("Usuário logado:", userCredential.user);
    const msg = document.getElementById("loginSuccessMessage");
    msg.style.display = "block";
    setTimeout(() => {
      window.location.href = "formulario.html";
    }, 2000);
  } catch (error) {
    const loginError = document.getElementById("loginErrorMessage");
    loginError.style.display = "block";

    switch (error.code) {
      case "auth/too-many-requests":
        loginError.textContent =
          "❌ Muitos acessos. Tente novamente mais tarde.";
        break;
      case "auth/user-not-found":
        loginError.textContent = "❌ Usuário não encontrado.";
        break;
      case "auth/wrong-password":
        loginError.textContent = "❌ Senha incorreta.";
        break;
      default:
        loginError.textContent =
          "❌ Falha ao realizar login. Verifique suas credenciais.";
        break;
    }
    document.getElementById("errorMessage").style.display = "none";

    console.error("Erro no login:", error.message);
  }
});
