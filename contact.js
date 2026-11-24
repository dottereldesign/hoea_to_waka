(() => {
  const contactForm = document.querySelector("[data-contact-form]");
  if (!contactForm) return;

  const requestedInterest = new URLSearchParams(window.location.search).get("interest");
  const interestSelect = contactForm.querySelector("[name='interest']");
  if (requestedInterest && interestSelect instanceof HTMLSelectElement) {
    const matchingOption = Array.from(interestSelect.options).find(
      (option) => option.value.toLowerCase() === requestedInterest.toLowerCase()
    );
    if (matchingOption) interestSelect.value = matchingOption.value;
  }

  // Leave room below the field when the menu opens near the viewport edge.
  function makeRoomForOptions() {
    const viewportHeight = document.documentElement.clientHeight;
    const room = Math.min(340, viewportHeight * 0.45);
    const available = viewportHeight - interestSelect.getBoundingClientRect().bottom;
    if (available < room) window.scrollBy({ top: room - available, behavior: "instant" });
  }

  interestSelect.addEventListener("pointerdown", () => requestAnimationFrame(makeRoomForOptions));
  interestSelect.addEventListener("keydown", event => {
    if (["Enter", " ", "ArrowDown", "ArrowUp", "F4"].includes(event.key)) makeRoomForOptions();
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const organisation = String(data.get("organisation") || "").trim();
    const interest = String(data.get("interest") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = encodeURIComponent(`Website enquiry from ${name || "a visitor"}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Organisation: ${organisation || "Not provided"}`,
        `Interested in: ${interest || "Not selected"}`,
        "",
        message,
      ].join("\n")
    );
    const status = contactForm.querySelector("[data-form-status]");
    if (status) status.textContent = "Opening your email app…";
    window.location.href = `mailto:anna@hoeatowaka.co.nz?subject=${subject}&body=${body}`;
  });
})();
