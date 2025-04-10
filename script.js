import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Usuário logado:', userCredential.user);
        alert('Login bem-sucedido!');
        window.location.href = "formulario.html";
    } catch (error) {
        const errorMessage = error.message;
        document.getElementById('errorMessage').textContent = errorMessage;
        document.getElementById('errorMessage').style.display = 'block';
        function catchErrorMessage(error) {
            if (error.message == 'Firebase: Error (auth/too-many-requests).') {
                errorMessage = "Usuário não encontrado";
            }
        }
        alert(catchErrorMessage(error));
    }
});
