// Connects the cards at the top of the page to the components they point at.
// Relies on highlightComponent and removeHighlight from script.ts, so it must
// be loaded after it.

// A card is any element with a data-component-id attribute:
//
//   <li class="card" data-component-id="abc">abc</li>
//
// Hovering a card highlights the component with that id
function setUpComponentCards(): void {
  const cards = document.querySelectorAll<HTMLElement>("[data-component-id]");

  cards.forEach((card) => {
    const id = card.dataset.componentId;
    if (id === undefined) return;

    card.addEventListener("mouseenter", () => highlightComponent(id));
    card.addEventListener("mouseleave", removeHighlight);
  });
}

setUpComponentCards();
