const apiKey = 'AIzaSyA7Wbhd7KYAMKt10vKVnJY81qDWTCs9MPw';
const spreadsheetId = '1IUZpjUEHsZe-4k4V6w1JqDNSH9zw9gKpceogu6cqx3Q';

const sheet1Range = 'BASE MANPOWER!E:I';
const sheet2Range = 'KOMPETENSI SEARCH GITHUB!B:G';
const sheet3Range = 'DEPT_JAB_GITHUB!A:E';

function searchData() {
  const searchTerm = document.getElementById('search').value.trim().toLowerCase();
  if (!searchTerm) {
    alert('Silakan masukkan nama untuk mencari.');
    return;
  }

  localStorage.setItem('lastSearch', searchTerm);
  document.getElementById('loading').style.display = 'block';
  

  document.getElementById('results').innerHTML = '';

  const sheet1Url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheet1Range}?key=${apiKey}`;
  const sheet2Url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheet2Range}?key=${apiKey}`;
  const sheet3Url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheet3Range}?key=${apiKey}`;

  Promise.all([
    fetch(sheet1Url).then(res => res.json()),
    fetch(sheet2Url).then(res => res.json()),
    fetch(sheet3Url).then(res => res.json())
  ])
  .then(([data1, data2, data3]) => {
    const results1 = (data1.values || []).filter(row => row[0]?.toLowerCase().includes(searchTerm));
    const results2 = (data2.values || []).filter(row => row[0]?.toLowerCase().includes(searchTerm));
    const results3 = (data3.values || []);

    displayResults(results1, 'Data Manpower');
    displayResults(results2, 'Daftar Kompetensi');
    displayCompetencyRecommendations(results1, results3);

    document.getElementById('loading').style.display = 'none';
  })
  .catch(error => {
    console.error('Gagal mengambil data:', error);
    document.getElementById('loading').innerHTML = 'Terjadi kesalahan saat mengambil data.';
  });
}

 function displayResults(results, sectionTitle) {
      const resultsDiv = document.getElementById('results');
      const section = document.createElement('section');
      section.className = 'result-section';

      const title = document.createElement('h2');
      title.innerText = sectionTitle;
      section.appendChild(title);

  const grid = document.createElement('div');
grid.className = 'grid-4';


      if (results.length === 0) {
        section.innerHTML += `<p>Tidak ditemukan data untuk ${sectionTitle}.</p>`;
        resultsDiv.appendChild(section);
        return;
      }

      results.forEach(row => {
        const card = document.createElement('div');
        card.className = 'grid-card';

        let icon = 'https://cdn-icons-png.flaticon.com/512/1828/1828911.png';
        let label = row[4] || 'Pelatihan';
        let status = row[5];

        if (status === 'Y') icon = 'https://cdn-icons-png.flaticon.com/512/845/845646.png';
        else if (status === 'OFF') icon = 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png';
        else if (status === 'Y/I') icon = 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png';

        card.innerHTML = `<img src="${icon}" alt="Status Icon" /><p>${label}</p>`;
        grid.appendChild(card);
      });

      section.appendChild(grid);
      resultsDiv.appendChild(section);
    }


function displayCompetencyRecommendations(results1, data3) {
  const resultsDiv = document.getElementById('results');
  const section = document.createElement('section');
  section.className = 'result-section';

  const title = document.createElement('h2');
  title.innerText = 'Rekomendasi Kompetensi Jabatan';
  section.appendChild(title);

const grid = document.createElement('div');
grid.className = 'grid-4';

  grid.id = 'rekomendasi-grid';

  const matches = [];
  const uniqueRoles = new Set();

  results1.forEach(row1 => {
    const dept = row1[1]?.trim().toLowerCase();
    const jabatan = row1[4]?.trim().toLowerCase();
    if (dept && jabatan) uniqueRoles.add(`${dept}|${jabatan}`);
  });

  uniqueRoles.forEach(roleKey => {
    const [deptKey, jabKey] = roleKey.split('|');

    data3.forEach(row3 => {
      const dept3 = row3[0]?.trim().toLowerCase();
      const jab3 = row3[2]?.trim().toLowerCase();
      const namaPelatihan = row3[4];
      if (dept3 === deptKey && jab3 === jabKey && namaPelatihan) {
        const key = `${jab3}|${namaPelatihan}`;
        if (!matches.some(item => item.key === key)) {
          matches.push({ namaPelatihan, key });
        }
      }
    });
  });

  if (matches.length === 0) {
    section.innerHTML += `<p>Tidak ada rekomendasi kompetensi yang cocok.</p>`;
    resultsDiv.appendChild(section);
    return;
  }

  matches.forEach(item => {
    const card = document.createElement('div');
    card.className = 'grid-card';
    card.innerHTML = `
      <img src="https://cdn-icons-png.flaticon.com/512/1828/1828911.png" alt="Training Icon" />
      <p>${item.namaPelatihan}</p>
    `;
    grid.appendChild(card);
  });

  section.appendChild(grid);
  resultsDiv.appendChild(section);
}



function runCardCarousel(data) {
  const container = document.getElementById('carousel-cards');
  const groupSize = 4;
  let index = 0;

  function renderGroup() {
    container.innerHTML = '';
    const group = data.slice(index, index + groupSize);
    group.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="https://cdn-icons-png.flaticon.com/512/1828/1828911.png" alt="Training Icon" />
        <h2>${item.namaPelatihan}</h2>
        <p>${item.jabatan}</p>
      `;
      container.appendChild(card);
    });
  }

  renderGroup();

  setInterval(() => {
    index += groupSize;
    if (index >= data.length) index = 0;
    renderGroup();
  }, 4000);
}


function startCarousel(track, itemCount) {
  const visibleCards = 4;
  const cardWidth = track.querySelector('.card')?.offsetWidth || 250;
  const gap = 16;
  const totalGroups = Math.ceil(itemCount / visibleCards);
  let index = 0;

  setInterval(() => {
    index = (index + 1) % totalGroups;
    const offset = index * (cardWidth + gap) * visibleCards;
    track.style.transform = `translateX(-${offset}px)`;
  }, 4000);
}


function reset() {
  document.getElementById('search').value = '';
  document.getElementById('results').innerHTML = '';
  document.getElementById('loading').style.display = 'none';
  localStorage.removeItem('lastSearch');
}

window.addEventListener('DOMContentLoaded', () => {
  const lastSearch = localStorage.getItem('lastSearch');
  if (lastSearch) {
    document.getElementById('search').value = lastSearch;
    searchData();
  }
});
