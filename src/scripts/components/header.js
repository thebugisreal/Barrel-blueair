class SiteHeader extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      mobileNavDrawer: '#MobileNavDrawer',
      mobileSubnav: '[js-mobile-subnav]',
      mobileSubnavTrigger: '[js-mobile-subnav-trigger]',
      mobileSubnavClose: '[js-mobile-subnav-close]',
      closeAnnouncementBtn: '[js-close-announcement]',
      announcementBar: '[js-announcement-bar]',
      announcementBarItem: '[js-announcement-bar-item]',
      trackingItem: '[js-tracking-item]',
      navItem: '[js-nav-item]',
      navMenu: '[js-nav-menu]'
    }
  }

  connectedCallback() {
    this.closeAnnouncementBtn = this.querySelector(this._selectors.closeAnnouncementBtn);
    this.announcementBar = this.querySelector(this._selectors.announcementBar);
    this.announcementBarItems = this.querySelectorAll(this._selectors.announcementBarItem);
    this.trackingItems = document.querySelectorAll(this._selectors.trackingItem);
    this.navItems = this.querySelectorAll(this._selectors.navItem)
    this.navMenus = this.querySelectorAll(this._selectors.navMenu)

    sessionStorage.removeItem("hideAnnouncement");

    this.mobileSubnavTriggers = document.querySelectorAll(`${this._selectors.mobileNavDrawer} ${this._selectors.mobileSubnavTrigger}`);
    this.mobileSubnavCloseBtns = document.querySelectorAll(`${this._selectors.mobileNavDrawer} ${this._selectors.mobileSubnavClose}`);

    if (this.dataset.template == 'index' && false) { // Remove false condition to add back in scroll effect
      document.addEventListener('scroll', this._headerOnScroll);
    }

    this._setVariables();
    this._watchWindowResize();
    if (this.announcementBar) {
      this._initAnnouncement();
      this.closeAnnouncementBtn.addEventListener('click', this._closeAnnouncementOnClick);
      this.announcementBarItems.forEach(el => {
        el.addEventListener('click', () => {
          const text =  el.dataset.analyticsAnnouncementText
          dataLayer.push({  
            event: 'announcement_click',
            click_name: `Announcement > ${text}`,
            announcement_text: text,
            click_url: el.href
          });
        })
      })
    }
    this.mobileSubnavTriggers.forEach((trigger) => {
      trigger.addEventListener('click', this._openMobileSubNav);
    });
    this.mobileSubnavCloseBtns.forEach((btn) => {
      btn.addEventListener('click', this._closeMobileSubNav);
    });

    this.navItems.forEach((item) => {
      item.addEventListener('mouseenter', this._handleMouseEnterNavItem.bind(this));
    });

    this.navMenus.forEach((menu) => {
      menu.addEventListener('mouseleave', this._handleMouseLeaveNavMenu.bind(this));
    })

    this.trackingItems.forEach(el => {
      el.addEventListener('click', () => {
        const { navGroup, clickName, clickElement, navLevel, event, clickModule } =  el.dataset
        dataLayer.push({
          event: event ? event : 'nav_click',
          click_name: clickName,
          click_element: clickElement,
          ...navGroup && {
            nav_group: navGroup,
          } ,
          ...navLevel && {
            nav_level: navLevel,
          },
          ...clickModule && {
            click_module: clickModule,
          },
          ...el.href && {
            click_url: el.href
          }
        });
      })
    })
  }

  _handleMouseEnterNavItem(e) {
    this.navItems.forEach((item) => {
      item.classList.remove('hovered')
    });
    e.currentTarget.classList.add('hovered')
  }

  _handleMouseLeaveNavMenu(e) {
    this.navItems.forEach((item) => {
      item.classList.remove('hovered')
    });
  }


  _headerOnScroll = () => {
    if (window.scrollY > 0) {
      this.classList.add('bg-white');
    } else {
      this.classList.remove('bg-white');
    }
  }

  _closeMobileSubNav = (evt) => {
    const subnavTarget = evt.currentTarget.closest(this._selectors.mobileSubnav);
    subnavTarget.dataset.active = 'false';
  }

  _openMobileSubNav = (evt) => {
    const subnavTarget = document.querySelector(`${this._selectors.mobileNavDrawer} ${this._selectors.mobileSubnav}[id="${evt.currentTarget.dataset.target}"]`);
    subnavTarget.dataset.active = 'true';
  }

  _watchWindowResize = () => {
    window.addEventListener('resize', this._setVariables)
  }

  _setVariables = () => {
    document.documentElement.style.setProperty('--header-height', `${this.clientHeight}px`)
  }

  _initAnnouncement = () => {
    const hideAnnouncement = sessionStorage.getItem("hideAnnouncement");
    if (hideAnnouncement) {
      this.announcementBar.classList.add('hidden')
    } else {
      this.announcementBar.classList.remove('hidden')
    }

    this._setVariables();
  }
  _closeAnnouncementOnClick = () => {
    sessionStorage.setItem("hideAnnouncement", "true");
    this._initAnnouncement();
  }
}

export default SiteHeader;