document.addEventListener("DOMContentLoaded", () => {
    /* -------------------------------------------------------------
       1. Verificare stare de logare a contului
    -------------------------------------------------------------- */
    const currentUser = sessionStorage.getItem("currentUser");

    if (currentUser) {
        // Cautare butoanele clasice din header
        const loginBtn = document.querySelector('a[href="login.html"]');
        const signupBtn = document.querySelector('a[href="register.html"]');
        
        // Transformam meniul daca userul este logat pe device
        if (loginBtn && signupBtn) {
            loginBtn.innerHTML = "Salut, <span style='color: white;'>" + currentUser + "</span>";
            loginBtn.href = "#"; // Poate duce la profil in viitor

            signupBtn.innerHTML = "Logout";
            signupBtn.href = "#"; // Gol
            signupBtn.style.color = "#888"; // o culoare mai stinsa ptr logout
            
            // Eveniment ptr Log out
            signupBtn.addEventListener("click", (e) => {
                e.preventDefault();
                sessionStorage.removeItem("currentUser");
                alert("Te-ai deconectat cu succes.");
                window.location.reload();
            });
        }
        
        // Transformare banner de restrictie în Formular de Recenzii!
        const authNotice = document.querySelector('.auth-notice');
        if (authNotice && window.location.pathname.includes('film.html')) {
            // Extragem ID-ul filmului din URL
            const urlParams = new URLSearchParams(window.location.search);
            const filmId = urlParams.get('id');

            if (filmId) {
                authNotice.innerHTML = `
                    <h3 style="text-align: left; margin-top: 5px; color: #fff;">Lasă o recenzie (ca ${currentUser})</h3>
                    <form id="new-review-form" style="display: flex; flex-direction: column; gap: 10px; text-align: left; padding: 10px 0;">
                                                <select id="rev-nota" style="padding: 10px; border-radius: 4px; border: 1px solid #444; background: #222; color: white;" required>
                            <option value="10">★ 10/10 Capodoperă</option>
                            <option value="9">★ 9/10 Excelent</option>
                            <option value="8">★ 8/10 Foarte Bun</option>
                            <option value="7">★ 7/10 Bun</option>
                            <option value="6">★ 6/10 Acceptabil</option>
                            <option value="5">★ 5/10 Mediocru</option>
                            <option value="4">★ 4/10 Slab</option>
                            <option value="3">★ 3/10 Foarte Slab</option>
                            <option value="2">★ 2/10 Groaznic</option>
                            <option value="1">★ 1/10 De Neimaginat</option>
                        </select>
                        <textarea id="rev-text" rows="3" placeholder="Scrie părerea ta aici..." style="padding: 10px; border-radius: 4px; border: 1px solid #444; background: #222; color: white; font-family: inherit;" required></textarea>
                        <button type="submit" class="btn" style="width: 100%;">Postează Recenzia</button>
                    </form>
                `;

                // Adaugăm logică pe butonul de submit a noii recenzii
                document.getElementById('new-review-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const textRev = document.getElementById('rev-text').value.trim();
                    const notaRev = document.getElementById('rev-nota').value;

                    if(textRev.length < 5) {
                        alert("Scrie o părere de minim 5 caractere!");
                        return;
                    }

                    // Aducem BD-ul temporar pentru Recenzii Custom din stocarea locala
                    let customReviews = JSON.parse(localStorage.getItem('cinemax_custom_reviews') || "{}");
                    if (!customReviews[filmId]) {
                        customReviews[filmId] = [];
                    }

                    // Calculam data curenta 
                    const today = new Date().toISOString().split('T')[0];

                    // Introducem review-ul curent
                    customReviews[filmId].unshift({
                        user: currentUser,
                        nota: notaRev,
                        text: textRev,
                        data: today
                    });

                    // Salvăm modificarea in browser
                    localStorage.setItem('cinemax_custom_reviews', JSON.stringify(customReviews));

                    alert("Recenzia ta a fost publicată cu succes!");
                    window.location.reload();
                });
            }
        }
    }


    /* -------------------------------------------------------------
       2. Logica de Autentificare (Pagina Login)
    -------------------------------------------------------------- */
    const loginForm = document.querySelector('form[action="index.html"]');
    // Ne asiguram ca rulam asta doar pe pagina unde exista formularul asta, ca sa nu dea eroare
    if (loginForm && window.location.pathname.includes("login.html")) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Opreste reincarcarea serverului default (HTML mode)
            
            const usr = document.getElementById("username").value.trim();
            const psw = document.getElementById("password").value.trim();
            
            // Citim baza de date invizibila simulata din Browser (LocalStorage)
            let dbUsers = JSON.parse(localStorage.getItem("cinemax_users") || "[]");
            let accountFound = dbUsers.find(u => u.username === usr && u.password === psw);
            
            if (accountFound) {
                // Succes de logare: salvam in sesiunea curenta
                sessionStorage.setItem("currentUser", accountFound.username);
                alert("Autentificare reușită! Bine ai revenit pe CineMax.");
                window.location.href = "index.html"; // Redirectare spre acasa
            } else {
                alert("Eroare! Ai cont? Username-ul sau parola sunt introduse incorect.");
            }
        });
    }

    /* -------------------------------------------------------------
       3. Logica de Înregistrare (Pagina Signup)
    -------------------------------------------------------------- */
    const regForm = document.querySelector('form[action="login.html"]');
    if (regForm && window.location.pathname.includes("register.html")) {
        regForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Blocare reincarcare html goala

            const usr = document.getElementById("reg-username").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const psw = document.getElementById("reg-password").value.trim();
            
            if (usr.length < 3) {
                alert("Username-ul trebuie sa aibă minim 3 litere."); 
                return;
            }

            // Citim DB ul ca sa adaugam un id
            let dbUsers = JSON.parse(localStorage.getItem("cinemax_users") || "[]");
            
            // Verificare unic (evitare conturi de spam)
            if(dbUsers.some(u => u.username === usr || u.email === email)) {
                alert("Acest nume de utilizator sau email exista deja în baza noastră!");
                return;
            }
            
            // Salvam datele noului utilizator
            dbUsers.push({username: usr, email: email, password: psw});
            localStorage.setItem("cinemax_users", JSON.stringify(dbUsers)); // stocare permanenta JSON
            
            alert("Cont creat ireprosabil! Acum folosește detaliile alese completate pentru Autentificare.");
            window.location.href = "login.html"; // Trimitem catre pagina de introducere detalii conectare
        });
    }
});
