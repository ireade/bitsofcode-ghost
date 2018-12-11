/* Navigation Dialod */

for (var changeAnchorToButton = function (e) {
    var t = document.createElement("button");
    t.setAttribute("type", "button"), t.innerHTML = e.innerHTML, e.id && (t.id = e.id);
    for (var s = 0; s < e.classList.length; s++) t.classList.add(e.classList[s]);
    var n = e.parentNode;
    n.replaceChild(t, e)
}, anchorButtons = document.getElementsByClassName("anchorButton"), i = 0; i < anchorButtons.length; i++) changeAnchorToButton(anchorButtons[i]);

function Dialog(e, t, s, n) {
    this.dialogEl = e, this.overlayEl = t, this.focusedElBeforeOpen;
    var o = this.dialogEl.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
    this.focusableEls = Array.prototype.slice.call(o), this.firstFocusableEl = this.focusableEls[0], this.lastFocusableEl = this.focusableEls[this.focusableEls.length - 1], this.addEventListeners(s, n), this.close()
}

Dialog.prototype.open = function () {
    var e = this;
    this.dialogEl.removeAttribute("aria-hidden"), this.overlayEl.removeAttribute("aria-hidden"), this.focusedElBeforeOpen = document.activeElement, this.dialogEl.addEventListener("keydown", function (t) {
        e.handleKeyDown(t)
    }), this.overlayEl.addEventListener("click", function () {
        e.close()
    }), this.firstFocusableEl.focus()
};

Dialog.prototype.close = function () {
    this.dialogEl.setAttribute("aria-hidden", !0), this.overlayEl.setAttribute("aria-hidden", !0), this.focusedElBeforeOpen && this.focusedElBeforeOpen.focus()
};

Dialog.prototype.handleKeyDown = function (e) {
    function t() {
        document.activeElement === n.firstFocusableEl && (e.preventDefault(), n.lastFocusableEl.focus())
    }

    function s() {
        document.activeElement === n.lastFocusableEl && (e.preventDefault(), n.firstFocusableEl.focus())
    }
    var n = this,
        o = 9,
        r = 27;
    switch (e.keyCode) {
        case o:
            if (1 === n.focusableEls.length) return void e.preventDefault();
            e.shiftKey ? t() : s();
            break;
        case r:
            n.close()
    }
}

Dialog.prototype.addEventListeners = function (e, t) {
    for (var s = this, n = document.querySelectorAll(e), o = 0; o < n.length; o++) n[o].addEventListener("click", function () {
        s.open()
    });
    for (var r = document.querySelectorAll(t), o = 0; o < r.length; o++) r[o].addEventListener("click", function () {
        s.close()
    })
};

var dialogOverlay = document.querySelector(".dialog-overlay"),
    navDialogEl = document.querySelector(".dialog--nav");

new Dialog(navDialogEl, dialogOverlay, ".site__nav__open", ".site__nav__close");
