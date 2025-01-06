class Hotspot extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      triggerBtn: '[js-hotspot-trigger-btn]',
      triggerContent: '[js-hotspot-trigger-content]'
    }
  }

  connectedCallback() {
    this.triggerBtns = this.querySelectorAll(this._selectors.triggerBtn);
    
    this._audjustDesktopTriggerContentsPosition();
    window.addEventListener('resize', this._audjustDesktopTriggerContentsPosition);

    if (this.dataset.displayControl == 'hover-display' ) {
      this.triggerBtns.forEach((btn) => {
        console.log('btn', btn)
        btn.addEventListener('mouseenter', this._toggleTriggerContent);
      });
    }

    this.triggerBtns.forEach((btn) => {
      btn.addEventListener('click', this._toggleTriggerContent);
    });

    if (this.hasAttribute('open-first-hotspot-mobile') && window.innerWidth <= 1024) {
      this._clickFirstTriggerBtn();
    }
    console.log('this.dataset.displayControl', this.dataset.displayControl)
  }

  _clickFirstTriggerBtn = () => {
    const firstTriggerBtn = this.querySelector(`${this._selectors.triggerBtn}[data-index="0"]`);
    if (firstTriggerBtn) {
      firstTriggerBtn.click();
    }
  }

  _audjustDesktopTriggerContentsPosition = () => {
    this.triggerBtns.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      const leftSpace = rect.left;
      const rightSpace = window.innerWidth - rect.right;
      
      if (leftSpace > rightSpace) {
        btn.nextElementSibling.style.right = '58px';
        btn.nextElementSibling.style.left = 'unset';
      } else {
        btn.nextElementSibling.style.right = 'unset';
        btn.nextElementSibling.style.left = '58px';
      }
    });
  }

  _toggleTriggerContent = (evt) => {
    const currentTriggerBtn = evt.currentTarget;
    const mobileTriggerContentTarget = this.querySelector(`${this._selectors.triggerContent}[data-index="${currentTriggerBtn.dataset.index}"]`);

    if (currentTriggerBtn.dataset.active == 'false') {
      const prevActiveTriggerBtn = this.querySelector(`${this._selectors.triggerBtn}[data-active="true"]`);
      if (prevActiveTriggerBtn) {
        prevActiveTriggerBtn.dataset.active = 'false';
        prevActiveTriggerBtn.parentElement.dataset.active = 'false';

        const prevActiveMobileTriggerContent = this.querySelector(`${this._selectors.triggerContent}[data-index="${prevActiveTriggerBtn.dataset.index}"]`);
        if (prevActiveMobileTriggerContent) {
          prevActiveMobileTriggerContent.dataset.active = 'false';
        }
      }
      
      currentTriggerBtn.dataset.active = 'true';
      currentTriggerBtn.parentElement.dataset.active = 'true';
      mobileTriggerContentTarget.dataset.active = 'true';
    } else {
      currentTriggerBtn.dataset.active = 'false';
      currentTriggerBtn.parentElement.dataset.active = 'false';
      mobileTriggerContentTarget.dataset.active = 'false';
    }
  }
}