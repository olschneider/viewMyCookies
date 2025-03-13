document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.sendMessage({ action: "getCookies" }, (response) => {
        cookies = response.cookies;
        displayCookies(response.cookies);
    });
});

let cookies = [];

function decodeBase64(base64String) {
    try {
        return decodeURIComponent(atob(base64String).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        return base64String; // Retourne la chaîne originale si le décodage échoue
    }
}

// Fonction pour afficher les cookies
function displayCookies(filteredCookies) {
    const cookieList = document.getElementById('cookieList');
    cookieList.innerHTML = ''; // Efface la liste actuelle

    // Regrouper les cookies par domaine
    const groupedCookies = filteredCookies.reduce((acc, cookie) => {
        const domain = cookie.domain || 'N/A';
        if (!acc[domain]) {
            acc[domain] = [];
        }
        acc[domain].push(cookie);
        return acc;
    }, {});

    // Afficher les cookies regroupés par domaine
    for (const [domain, cookies] of Object.entries(groupedCookies)) {
        const domainSection = document.createElement('div');
        domainSection.classList.add('domain-section');

        const domainHeader = document.createElement('div');
        domainHeader.classList.add('domain-header');
        domainHeader.textContent = domain;
        domainSection.appendChild(domainHeader);

        const cookieListElement = document.createElement('div');
        cookieListElement.classList.add('cookie-list');

        cookies.forEach(cookie => {
            const button = document.createElement('button');
            button.classList.add('cookie-button');

            // Afficher Name et Value
            const displayedInfo = `Nom: ${cookie.name || 'N/A'}, Valeur: ${decodeBase64(cookie.value) || 'N/A'}`;
            button.innerHTML = displayedInfo;

            // Ajouter les autres champs dans un span caché
            const extraInfo = document.createElement('span');
            extraInfo.classList.add('extra-info');
            extraInfo.innerHTML = `
                <br>HostOnly: ${cookie.hostOnly || 'N/A'},
                HttpOnly: ${cookie.httpOnly || 'N/A'},
                Path: ${cookie.path || 'N/A'},
                SameSite: ${cookie.sameSite || 'N/A'},
                Secure: ${cookie.secure || 'N/A'},
                Session: ${cookie.session || 'N/A'},
                StoreId: ${cookie.domainSectiontoreId || 'N/A'}
            `;
            button.appendChild(extraInfo);

            // Ajouter les événements de survol
            button.addEventListener('mouseover', () => {
                extraInfo.style.display = 'inline';
            });

            button.addEventListener('mouseout', () => {
                extraInfo.style.display = 'none';
            });

            cookieListElement.appendChild(button);
        });

        domainSection.appendChild(cookieListElement);
        cookieList.appendChild(domainSection);

        // Ajouter l'événement de clic pour afficher/masquer les cookies
        domainHeader.addEventListener('click', () => {
            const isVisible = cookieListElement.style.display === 'block';
            cookieListElement.style.display = isVisible ? 'none' : 'block';
        });
    }
}

// Fonction pour filtrer les cookies
function filterCookies(searchTerm) {
    return cookies.filter(cookie =>
        Object.values(cookie).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
}

// Écouteur d'événement pour le bouton de recherche
document.getElementById('searchButton').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredCookies = filterCookies(searchTerm);
    displayCookies(filteredCookies);
});
