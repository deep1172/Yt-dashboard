document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/video').then(res => res.json()).then(data => {
    document.getElementById('videoDetails').innerText = JSON.stringify(data.items[0], null, 2);
  });

  document.getElementById('commentForm').addEventListener('submit', async e => {
    e.preventDefault();
    const text = document.getElementById('commentInput').value;
    await fetch('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    alert('Comment posted!');
  });

  document.getElementById('noteForm').addEventListener('submit', async e => {
    e.preventDefault();
    const content = document.getElementById('noteInput').value;
    const tags = document.getElementById('tagInput').value.split(',').map(t => t.trim());
    const res = await fetch('/api/note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, tags })
    });
    const note = await res.json();
    alert('Note added!');
  });

  document.getElementById('searchInput').addEventListener('input', async e => {
    const query = e.target.value;
    const res = await fetch(`/api/note/search?q=${query}`);
    const notes = await res.json();
    document.getElementById('notesList').innerText = JSON.stringify(notes, null, 2);
  });
});
