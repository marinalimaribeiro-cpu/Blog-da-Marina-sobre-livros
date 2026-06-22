document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('book-form');
  const userBooks = document.getElementById('user-books');
  let books = [];
  let useApi = false;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(m){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]);
    });
  }

  function renderStars(r) {
    const n = Number(r) || 0;
    const filled = '★★★★★'.slice(0, n);
    const empty = '★★★★★'.slice(n).replace(/./g, '☆');
    return filled + empty;
  }

  function render() {
    userBooks.innerHTML = '';
    if (!books || books.length === 0) {
      userBooks.innerHTML = '<p style="color:var(--text-light)">Nenhum livro adicionado ainda.</p>';
      return;
    }

    books.forEach((b) => {
      const article = document.createElement('article');
      article.className = 'post';
      article.innerHTML = `
        <h3 class="post-title">${escapeHtml(b.title)}</h3>
        <div class="post-meta">Por ${escapeHtml(b.author)} &bull; ${escapeHtml(b.date || '')}</div>
        <div class="rating-container"><span class="rating-label">Avaliação:</span><span class="stars">${renderStars(b.rating)}</span></div>
        <div class="post-content"><p>${escapeHtml(b.review || '')}</p></div>
        <div style="margin-top:0.8rem"><button data-id="${b.id || ''}" class="delete-btn" style="background:#e07a5f;border:none;padding:0.4rem 0.6rem;border-radius:8px;color:#fff;cursor:pointer">Remover</button></div>
      `;
      userBooks.appendChild(article);
    });

    userBooks.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (useApi && id) {
        const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
        if (res.ok) await loadFromApi();
      } else {
        // fallback localStorage
        const idx = Number(e.currentTarget.dataset.index);
        books.splice(idx, 1);
        localStorage.setItem('books', JSON.stringify(books));
        render();
      }
    }));
  }

  async function loadFromApi() {
    try {
      const res = await fetch('/api/books');
      if (!res.ok) throw new Error('API indisponível');
      books = await res.json();
      useApi = true;
      render();
    } catch (err) {
      // fallback para localStorage
      useApi = false;
      books = JSON.parse(localStorage.getItem('books') || '[]');
      render();
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = form.title.value.trim();
    const author = form.author.value.trim();
    const date = form.date.value.trim();
    const rating = form.rating.value;
    const review = form.review.value.trim();

    if (!title || !author) {
      alert('Por favor preencha título e autor.');
      return;
    }

    const book = { title, author, date, rating, review, created: Date.now() };

    if (useApi) {
      const res = await fetch('/api/books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) });
      if (res.ok) {
        await loadFromApi();
        form.reset();
      } else {
        alert('Erro ao salvar no servidor');
      }
    } else {
      books.unshift(book);
      localStorage.setItem('books', JSON.stringify(books));
      render();
      form.reset();
    }
  });

  // inicializa
  loadFromApi();
});
