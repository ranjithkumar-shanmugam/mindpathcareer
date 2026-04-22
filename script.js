const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const contactForm = document.getElementById("contactForm");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackWall = document.getElementById("feedbackWall");
const feedbackViewAll = document.getElementById("feedbackViewAll");
const feedbackList = document.getElementById("feedbackList");
const feedbackCount = document.getElementById("feedbackCount");

const googleFeedbackFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSce-t8spsLmq8Dpb7nVM_23qDRTmjkmoQPAwA5AYFYQ860LNA/formResponse";
const googleContactFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSfTQrlUIpWVTUAcTHO2AZywV35iiZ5agvwwpaREMD9RBxDM5A/formResponse";
const googleSheetFeedUrl =
  "https://docs.google.com/spreadsheets/d/10W0u194nVp9V--lfQ_ON7BY7_ip8hJtXDA5EvesMFdQ/gviz/tq?gid=479714639";
const googleFormMetadata = {
  fbzx: "3275102454781281064",
  fields: {
    name: "entry.1294302610",
    city: "entry.1909551288",
    feedback: "entry.1470809729",
  },
};
const googleContactFormMetadata = {
  fbzx: "-3913238198883300241",
  fields: {
    name: "entry.1294302610",
    phone: "entry.1909551288",
    message: "entry.1470809729",
  },
};

const fallbackFeedbacks = [
  {
    name: "Lakshmi R",
    city: "Coimbatore",
    feedback:
      "This helped us understand how our child learns best. The counselling was simple, clear, and very helpful as parents.",
  },
  {
    name: "Arun Prakash",
    city: "Madurai",
    feedback:
      "I was confused about my career options. The report and counselling gave me better clarity on what suits me naturally.",
  },
  {
    name: "Nivetha and Karthik",
    city: "Chennai",
    feedback:
      "We understood each other better as a couple after the session. It opened a new perspective on communication and behaviour.",
  },
  {
    name: "Meenakshi S",
    city: "Tiruchirappalli",
    feedback:
      "The process felt professional and comfortable. The guidance was practical, not complicated, and easy to apply.",
  },
];

let revealObserver;

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navLinks.classList.toggle("open");
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
  });

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function observeRevealElements(elements) {
  if (!elements.length) {
    return;
  }

  if ("IntersectionObserver" in window) {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
    }

    elements.forEach((element) => revealObserver.observe(element));
    return;
  }

  elements.forEach((element) => element.classList.add("visible"));
}

observeRevealElements([...document.querySelectorAll(".reveal")]);

function normalizeText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function getCellValue(cell) {
  if (!cell) {
    return "";
  }

  return cell.f || cell.v || "";
}

function parseGoogleSheetResponse(payload) {
  const table = payload && payload.table ? payload.table : {};
  const rows = table.rows || [];

  if (!rows.length) {
    return [];
  }

  return rows
    .map((row) => {
      const cells = row.c || [];
      return {
        timestamp: normalizeText(getCellValue(cells[0])),
        name: normalizeText(getCellValue(cells[1])),
        city: normalizeText(getCellValue(cells[2])),
        feedback: normalizeText(getCellValue(cells[3])),
      };
    })
    .filter((item) => item.name && item.city && item.feedback)
    .reverse();
}

function createFeedbackCard(item) {
  const card = document.createElement("article");
  card.className = "testimonial-card reveal";

  const message = document.createElement("p");
  message.textContent = `“${item.feedback}”`;

  const author = document.createElement("h3");
  author.textContent = `${item.name}, ${item.city}`;

  card.append(message, author);
  return card;
}

function renderFeedbackCards(container, feedbacks, limit) {
  const visibleFeedbacks = typeof limit === "number" ? feedbacks.slice(0, limit) : feedbacks;

  container.innerHTML = "";

  if (!visibleFeedbacks.length) {
    const emptyCard = createFeedbackCard({
      name: "Arivya",
      city: "Tamil Nadu",
      feedback: "Customer feedback will appear here soon.",
    });
    container.appendChild(emptyCard);
    observeRevealElements([emptyCard]);
    return;
  }

  const cards = visibleFeedbacks.map(createFeedbackCard);
  cards.forEach((card) => container.appendChild(card));
  observeRevealElements(cards);
}

function updateFeedbackCount(total) {
  if (!feedbackCount) {
    return;
  }

  feedbackCount.textContent =
    total === 1 ? "Showing 1 customer feedback" : `Showing ${total} customer feedbacks`;
}

function fetchFeedbacks() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const callbackName = `arivyaFeedbackCallback_${Date.now()}`;
    let settled = false;
    let timeoutId;

    function cleanup() {
      clearTimeout(timeoutId);
      script.remove();
      delete window[callbackName];
    }

    function settle(handler, value) {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      handler(value);
    }

    window[callbackName] = (payload) => {
      settle(resolve, parseGoogleSheetResponse(payload));
    };

    script.src =
      `${googleSheetFeedUrl}` +
      `&tqx=${encodeURIComponent(`out:json;responseHandler:${callbackName}`)}` +
      `&cacheBust=${Date.now()}`;
    script.async = true;
    script.onerror = () => {
      settle(reject, new Error("Failed to load Google Sheet feedback."));
    };

    timeoutId = setTimeout(() => {
      settle(reject, new Error("Timed out while loading Google Sheet feedback."));
    }, 10000);

    document.head.appendChild(script);
  });
}

function submitToGoogleForm(url, payload, targetName) {
  const iframe = document.createElement("iframe");
  iframe.name = targetName;
  iframe.hidden = true;

  const form = document.createElement("form");
  form.action = url;
  form.method = "POST";
  form.target = targetName;
  form.hidden = true;

  payload.forEach((value, key) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(iframe);
  document.body.appendChild(form);
  form.submit();

  setTimeout(() => {
    form.remove();
    iframe.remove();
  }, 4000);
}

async function initializeFeedbackViews() {
  if (!feedbackWall && !feedbackList) {
    return;
  }

  try {
    const feedbacks = await fetchFeedbacks();
    const sourceFeedbacks = feedbacks.length ? feedbacks : fallbackFeedbacks;

    if (feedbackWall) {
      renderFeedbackCards(feedbackWall, sourceFeedbacks, 4);
    }

    if (feedbackList) {
      renderFeedbackCards(feedbackList, sourceFeedbacks);
      updateFeedbackCount(sourceFeedbacks.length);
    }

    if (feedbackViewAll) {
      feedbackViewAll.hidden = sourceFeedbacks.length <= 4;
    }
  } catch (error) {
    if (feedbackWall) {
      renderFeedbackCards(feedbackWall, fallbackFeedbacks, 4);
    }

    if (feedbackList) {
      renderFeedbackCards(feedbackList, fallbackFeedbacks);
      updateFeedbackCount(fallbackFeedbacks.length);
    }

    if (feedbackViewAll) {
      feedbackViewAll.hidden = fallbackFeedbacks.length <= 4;
    }
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();
    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (!name || !phone || !message) {
      return;
    }

    const payload = new URLSearchParams();
    payload.append(googleContactFormMetadata.fields.name, name);
    payload.append(googleContactFormMetadata.fields.phone, phone);
    payload.append(googleContactFormMetadata.fields.message, message);
    payload.append("fvv", "1");
    payload.append("pageHistory", "0");
    payload.append("fbzx", googleContactFormMetadata.fbzx);
    payload.append("submissionTimestamp", "-1");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      submitToGoogleForm(
        googleContactFormUrl,
        payload,
        `contact-form-target-${Date.now()}`
      );

      alert("Thank you for contacting Arivya. We will get back to you soon.");
      contactForm.reset();
    } catch (error) {
      alert("We couldn't submit your message right now. Please try again.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
      }
    }
  });
}

if (feedbackForm && feedbackWall) {
  feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("feedbackName").value.trim();
    const city = document.getElementById("feedbackCity").value.trim();
    const message = document.getElementById("feedbackMessage").value.trim();
    const submitButton = feedbackForm.querySelector('button[type="submit"]');

    if (!name || !city || !message) {
      return;
    }

    const payload = new URLSearchParams();
    payload.append(googleFormMetadata.fields.name, name);
    payload.append(googleFormMetadata.fields.city, city);
    payload.append(googleFormMetadata.fields.feedback, message);
    payload.append("fvv", "1");
    payload.append("pageHistory", "0");
    payload.append("fbzx", googleFormMetadata.fbzx);
    payload.append("submissionTimestamp", "-1");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      await fetch(googleFeedbackFormUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: payload.toString(),
      });

      const feedbackCard = createFeedbackCard({
        name,
        city,
        feedback: message,
      });

      feedbackCard.classList.add("visible");
      feedbackWall.prepend(feedbackCard);

      while (feedbackWall.children.length > 4) {
        feedbackWall.removeChild(feedbackWall.lastElementChild);
      }

      if (feedbackViewAll) {
        feedbackViewAll.hidden = false;
      }

      feedbackForm.reset();
      alert("Thank you for sharing your feedback.");
    } catch (error) {
      alert("We couldn't submit your feedback right now. Please try again.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Feedback";
      }
    }
  });
}

initializeFeedbackViews();
