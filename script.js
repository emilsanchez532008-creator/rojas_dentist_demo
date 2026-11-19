(function () {
  "use strict";

  var whatsappNumber = "524776645499";
  var header = document.querySelector("#hd");
  var burger = document.querySelector("#burger");
  var menu = document.querySelector("#menu");
  var openModalTrigger = null;
  var selectors = {
    name: document.querySelector("#patient-name"),
    phone: document.querySelector("#patient-phone"),
    time: document.querySelector("#preferred-time"),
    service: document.querySelector("#service-interest"),
    consent: document.querySelector("#privacy-consent")
  };

  function updateScrollLock() {
    var modalIsOpen = Boolean(document.querySelector(".modal:not([hidden])"));
    var menuIsOpen = burger && burger.getAttribute("aria-expanded") === "true";
    document.body.classList.toggle("lock", modalIsOpen || menuIsOpen);
  }

  function updateHeader() {
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 24);
    }
  }

  function setMenuOpen(isOpen) {
    if (!burger || !menu) {
      return;
    }

    burger.classList.toggle("open", isOpen);
    menu.classList.toggle("open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    updateScrollLock();
  }

  function initializeNavigation() {
    if (!burger || !menu) {
      return;
    }

    burger.addEventListener("click", function () {
      setMenuOpen(burger.getAttribute("aria-expanded") !== "true");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    });
  }

  function getFocusableElements(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (element) {
      return !element.hidden;
    });
  }

  function closeModal(modal, restoreFocus) {
    if (!modal) {
      return;
    }

    modal.classList.remove("open");
    modal.hidden = true;
    updateScrollLock();

    if (restoreFocus && openModalTrigger && document.contains(openModalTrigger)) {
      openModalTrigger.focus();
    }

    openModalTrigger = null;
  }

  function openModal(modal, trigger) {
    if (!modal) {
      return;
    }

    document.querySelectorAll(".modal:not([hidden])").forEach(function (openDialog) {
      closeModal(openDialog, false);
    });

    openModalTrigger = trigger;
    modal.hidden = false;
    modal.classList.add("open");
    updateScrollLock();

    var closeButton = modal.querySelector("[data-modal-close]");
    if (closeButton) {
      closeButton.focus();
    }
  }

  function initializeModals() {
    document.querySelectorAll("[data-modal-open]").forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        openModal(document.getElementById(trigger.dataset.modalOpen), trigger);
      });
    });

    document.querySelectorAll(".modal").forEach(function (modal) {
      var closeButton = modal.querySelector("[data-modal-close]");
      if (closeButton) {
        closeButton.addEventListener("click", function () {
          closeModal(modal, true);
        });
      }

      modal.addEventListener("click", function (event) {
        if (event.target === modal) {
          closeModal(modal, true);
        }
      });
    });
  }

  function handleEscapeAndFocus(event) {
    var openDialog = document.querySelector(".modal:not([hidden])");

    if (event.key === "Escape") {
      if (openDialog) {
        closeModal(openDialog, true);
      } else if (burger && burger.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        burger.focus();
      }
      return;
    }

    if (event.key !== "Tab" || !openDialog) {
      return;
    }

    var focusableElements = getFocusableElements(openDialog);
    if (focusableElements.length === 0) {
      event.preventDefault();
      openDialog.querySelector(".modal-panel").focus();
      return;
    }

    var firstElement = focusableElements[0];
    var lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function initializeReveal() {
    var elements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function initializeBrandImages() {
    document.querySelectorAll(".brand-logo-image").forEach(function (image) {
      var fallback = image.nextElementSibling;

      function showOfficialLogo() {
        image.hidden = false;
        if (fallback) {
          fallback.hidden = true;
        }
      }

      image.addEventListener("load", showOfficialLogo);
      image.addEventListener("error", function () {
        image.hidden = true;
        if (fallback) {
          fallback.hidden = false;
        }
      });

      if (image.complete && image.naturalWidth > 0) {
        showOfficialLogo();
      }
    });
  }

  function initializeClinicPhotos() {
    document.querySelectorAll(".clinic-photo img").forEach(function (image) {
      var figure = image.closest(".clinic-photo");

      image.addEventListener("load", function () {
        figure.classList.remove("is-fallback");
      });
      image.addEventListener("error", function () {
        figure.classList.add("is-fallback");
      });

      if (image.complete) {
        figure.classList.toggle("is-fallback", image.naturalWidth === 0);
      }
    });
  }

  function initializeServiceLinks() {
    document.querySelectorAll("[data-service]").forEach(function (link) {
      var service = link.dataset.service;
      var message = "Hola, quiero consultar el servicio de " + service + " en Rojas Family Dentist.";
      link.href = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "Consultar este servicio: " + service + " por WhatsApp");
    });
  }

  function setFieldError(field, errorElement, message) {
    field.setAttribute("aria-invalid", message ? "true" : "false");
    errorElement.textContent = message;
  }

  function initializeAppointmentForm() {
    var form = document.querySelector("#appointment-form");
    var success = document.querySelector("#form-success");
    var followup = document.querySelector("#whatsapp-followup");

    if (!form || !success || !followup) {
      return;
    }

    var errors = {
      name: document.querySelector("#name-error"),
      phone: document.querySelector("#phone-error"),
      time: document.querySelector("#time-error"),
      service: document.querySelector("#service-error"),
      consent: document.querySelector("#consent-error")
    };

    Object.keys(selectors).forEach(function (key) {
      selectors[key].addEventListener("input", function () {
        setFieldError(selectors[key], errors[key], "");
      });
      selectors[key].addEventListener("change", function () {
        setFieldError(selectors[key], errors[key], "");
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = selectors.name.value.trim();
      var phone = selectors.phone.value.replace(/\D/g, "");
      var preferredTime = selectors.time.value;
      var service = selectors.service.value;
      var isValid = true;

      setFieldError(selectors.name, errors.name, "");
      setFieldError(selectors.phone, errors.phone, "");
      setFieldError(selectors.time, errors.time, "");
      setFieldError(selectors.service, errors.service, "");
      setFieldError(selectors.consent, errors.consent, "");

      if (name.length < 3) {
        setFieldError(selectors.name, errors.name, "Escribe tu nombre completo.");
        isValid = false;
      }
      if (phone.length !== 10) {
        setFieldError(selectors.phone, errors.phone, "Ingresa un teléfono de 10 dígitos.");
        isValid = false;
      }
      if (!preferredTime) {
        setFieldError(selectors.time, errors.time, "Selecciona un horario preferido.");
        isValid = false;
      }
      if (!service) {
        setFieldError(selectors.service, errors.service, "Selecciona un servicio de interés.");
        isValid = false;
      }
      if (!selectors.consent.checked) {
        setFieldError(selectors.consent, errors.consent, "Debes aceptar el Aviso de Privacidad para continuar.");
        isValid = false;
      }

      if (!isValid) {
        var firstInvalidField = form.querySelector('[aria-invalid="true"]');
        if (firstInvalidField) {
          firstInvalidField.focus();
        }
        return;
      }

      var message = [
        "Hola, quiero solicitar una cita en Rojas Family Dentist.",
        "",
        "*Nombre:* " + name,
        "*Teléfono:* " + phone,
        "*Servicio de interés:* " + service,
        "*Horario preferido:* " + preferredTime,
        "",
        "Quedo pendiente de la confirmación de disponibilidad. Gracias."
      ].join("\n");
      var whatsappUrl = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);

      followup.href = whatsappUrl;
      form.hidden = true;
      success.hidden = false;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      success.focus();
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  initializeNavigation();
  initializeModals();
  initializeReveal();
  initializeBrandImages();
  initializeClinicPhotos();
  initializeServiceLinks();
  initializeAppointmentForm();
  document.addEventListener("keydown", handleEscapeAndFocus);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
})();
