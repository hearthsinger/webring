'use strict';

async function fetchMembers() {
  const res = await fetch('https://api.ooooo.garden/ring/members', {
    method: 'GET',
  });

  if (!res.ok) {
    console.error('failed to fetch ring members');
    return;
  }

  const { members } = await res.json();

  const elements = members
    .map((member) => {
      const link = document.createElement('a');

      link.setAttribute('href', member.url);
      link.textContent = member.title;

      return [link, member.owner, member.description];
    })
    .map(([link, owner, description]) => {
      const item = document.createElement('li');
      item.append(link);
      item.append(` - by ${owner}`);
      item.append(document.createElement('br'));
      item.append(`↳ ${description}`);

      return item;
    });

  const list = document.querySelector('#directory');
  list.append(...elements);
}

document.addEventListener('DOMContentLoaded', fetchMembers);
