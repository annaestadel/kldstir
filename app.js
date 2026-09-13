const CONFIG = {
  phoneRaw: "79062345277",
  phoneTel: "+79062345277",
  phoneDisplay: "+7 906 234-52-77",
  maxUrl: "https://max.ru/u/f9LHodD0cOKvPBxBS5Kv4rZPp90MZPFooaGvTl2jcxNGz0MuL_vRAivh1I0",
  defaultMessage:
    "Здравствуйте, Владимир! Нужен ремонт стиральной машины в Калининграде.",
};

const STORAGE_COOKIE = "cookie-consent";

function waLink(text) {
  return `https://wa.me/${CONFIG.phoneRaw}?text=${encodeURIComponent(text)}`;
}

function smsLink(text) {
  return `sms:${CONFIG.phoneTel}?body=${encodeURIComponent(text)}`;
}

function applyContactLinks() {
  document.querySelectorAll("[data-phone-display]").forEach((el) => {
    el.textContent = CONFIG.phoneDisplay;
  });

  document.querySelectorAll("a[data-tel]").forEach((el) => {
    el.href = `tel:${CONFIG.phoneTel}`;
  });

  document.querySelectorAll("a[data-wa]").forEach((el) => {
    const custom = el.getAttribute("data-wa-text");
    el.href = waLink(custom || CONFIG.defaultMessage);
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  document.querySelectorAll("a[data-sms]").forEach((el) => {
    const custom = el.getAttribute("data-sms-text");
    el.href = smsLink(custom || CONFIG.defaultMessage);
  });

  document.querySelectorAll("a[data-max]").forEach((el) => {
    el.href = CONFIG.maxUrl;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });
}

function initMenu() {
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".mobile-menu");
  if (!burger || !menu) return;

  const close = () => {
    burger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    document.body.classList.remove("menu-open");
  };

  const open = () => {
    burger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    document.body.classList.add("menu-open");
  };

  burger.addEventListener("click", () => {
    const expanded = burger.getAttribute("aria-expanded") === "true";
    if (expanded) close();
    else open();
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function initFaq() {
  document.querySelectorAll(".faq__item").forEach((item) => {
    const btn = item.querySelector(".faq__q");
    const panel = item.querySelector(".faq__a");
    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      document.querySelectorAll(".faq__item.is-open").forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector(".faq__q")?.setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      } else {
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });
}

function initForm() {
  const form = document.querySelector("#lead-form");
  if (!form) return;

  const consent = form.querySelector("#pdn-consent");
  const error = form.querySelector(".form__error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (error) error.hidden = true;

    if (!consent?.checked) {
      if (error) {
        error.hidden = false;
        error.textContent = "Отметьте согласие на обработку персональных данных.";
      }
      consent?.focus();
      return;
    }

    const name = form.querySelector("#name")?.value.trim() || "";
    const phone = form.querySelector("#phone")?.value.trim() || "";
    const issue = form.querySelector("#issue")?.value.trim() || "";

    if (!phone) {
      if (error) {
        error.hidden = false;
        error.textContent = "Укажите телефон, чтобы я мог перезвонить.";
      }
      form.querySelector("#phone")?.focus();
      return;
    }

    const lines = [
      "Заявка с сайта: ремонт стиральной машины",
      name ? `Имя: ${name}` : null,
      `Телефон: ${phone}`,
      issue ? `Проблема: ${issue}` : null,
      "Калининград / область",
    ].filter(Boolean);

    window.open(waLink(lines.join("\n")), "_blank", "noopener,noreferrer");
  });
}

function fillIssue(text) {
  const field = document.querySelector("#issue");
  if (field) field.value = text;
  document.querySelector("#lead")?.scrollIntoView({ behavior: "smooth" });
  field?.focus();
}

function initIssueButtons() {
  document.querySelectorAll("[data-issue]").forEach((btn) => {
    btn.addEventListener("click", () => {
      fillIssue(btn.getAttribute("data-issue") || "");
    });
  });
}

function initCookies() {
  const banner = document.querySelector(".cookie");
  if (!banner) return;

  const saved = localStorage.getItem(STORAGE_COOKIE);
  if (saved === "all" || saved === "necessary") {
    banner.hidden = true;
    return;
  }

  banner.hidden = false;
  const check = banner.querySelector("#cookie-check");
  const accept = banner.querySelector("[data-cookie-accept]");
  const necessary = banner.querySelector("[data-cookie-necessary]");
  const hint = banner.querySelector(".cookie__hint");

  accept?.addEventListener("click", () => {
    if (!check?.checked) {
      if (hint) {
        hint.hidden = false;
        hint.textContent = "Поставьте галочку, если согласны на использование файлов cookie.";
      }
      check?.focus();
      return;
    }
    localStorage.setItem(STORAGE_COOKIE, "all");
    banner.hidden = true;
  });

  necessary?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_COOKIE, "necessary");
    banner.hidden = true;
  });
}

function initReviewsCarousel() {
  const root = document.querySelector("[data-reviews-carousel]");
  if (!root) return;

  const viewport = root.querySelector(".reviews-viewport");
  const track = root.querySelector(".reviews-track");
  const slides = [...root.querySelectorAll(".reviews-slide")];
  const prev = document.querySelector("[data-reviews-prev]");
  const next = document.querySelector("[data-reviews-next]");
  const dotsWrap = root.querySelector("[data-reviews-dots]");
  if (!viewport || !track || slides.length === 0) return;

  let page = 0;
  const last = slides.length - 1;
  let dots = [];

  function slideWidth() {
    return viewport.clientWidth;
  }

  function layout() {
    root.style.setProperty("--reviews-slide-w", `${slideWidth()}px`);
    go(page);
  }

  function renderDots() {
    if (!dotsWrap) return;
    dotsWrap.replaceChildren();
    dots = slides.map((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "reviews-dot";
      btn.setAttribute("aria-label", `Отзывы, слайд ${i + 1} из ${slides.length}`);
      btn.addEventListener("click", () => go(i));
      dotsWrap.append(btn);
      return btn;
    });
  }

  function go(nextPage) {
    page = Math.max(0, Math.min(nextPage, last));
    track.style.transform = `translate3d(-${page * slideWidth()}px, 0, 0)`;
    if (prev) prev.disabled = page === 0;
    if (next) next.disabled = page === last;
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === page);
      dot.setAttribute("aria-current", i === page ? "true" : "false");
    });
  }

  prev?.addEventListener("click", () => go(page - 1));
  next?.addEventListener("click", () => go(page + 1));

  let startX = 0;
  viewport.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
  });
  viewport.addEventListener("pointerup", (e) => {
    const dx = e.clientX - startX;
    if (Math.abs(dx) < 50) return;
    go(dx > 0 ? page - 1 : page + 1);
  });

  window.addEventListener("resize", layout);

  renderDots();
  layout();
}

document.addEventListener("DOMContentLoaded", () => {
  applyContactLinks();
  initMenu();
  initFaq();
  initForm();
  initIssueButtons();
  initCookies();
  initReviewsCarousel();
});
