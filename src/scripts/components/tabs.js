/**
 * <s-tabs>
 *   <div class="tab__triggers" role="tablist" aria-orientation="horizontal" js-tablist>
 *     <button id="tab1-tab" class="tab__trigger" aria-controls="tab1-content-panel" role="tab" aria-selected="true" js-tab>Tab1</button>
 *     <button id="tab2-tab" class="tab__trigger" aria-controls="tab2-content-panel" role="tab" aria-selected="false" js-tab>Tab2</button>
 *     <button id="tab3-tab" class="tab__trigger" aria-controls="tab3-content-panel" role="tab" aria-selected="false" js-tab>Tab3</button>
 *   </div>
 *   <div id="tab1-content-panel" class="tab__panel" role="tabpanel" aria-labelledby="tab1-tab" aria-hidden="false"></div>
 *   <div id="tab2-content-panel" class="tab__panel" role="tabpanel" aria-labelledby="tab2-tab" aria-hidden="true"></div>
 *   <div id="tab3-content-panel" class="tab__panel" role="tabpanel" aria-labelledby="tab3-tab" aria-hidden="true"></div>
 * </s-tabs>
 **/

class Tabs extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this._elements = {
      tabs: this.querySelectorAll('[js-tab]'),
      tabList: this.querySelectorAll('[js-tab-list]'),
      tabPanel: this.querySelectorAll('[js-tab-panel]')
    };

    this._tabEventListener();
    this._tabListListener();
  }


  _tabEventListener = () => {
    const { tabs } = this._elements;
    tabs.forEach((tab) =>
      tab.addEventListener("click", this._showTabPanel)
    );
  }

  _showTabPanel = (el) => {
    const { tabs } = this._elements;
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].setAttribute('aria-selected', 'false');
    }
    el.currentTarget.setAttribute('aria-selected', 'true');
    var tabPanelToOpen = el.currentTarget.getAttribute('aria-controls');
    var tabPanels = this.querySelectorAll('[role=tabpanel]');
    for (let i = 0; i < tabPanels.length; i++) {
      tabPanels[i].setAttribute('aria-hidden', 'true');
    }
    this.querySelector(`[id="${tabPanelToOpen}"]`).setAttribute('aria-hidden', 'false');
  }

  _tabListListener = () => {
    const { tabList } = this._elements;
    tabList.forEach((list) =>
      list.addEventListener("keydown", this._tabListKeydown)
    );
  }

  _tabListKeydown = (e) => {
    if (e.keyCode == 37) {
      $("[aria-selected=true]").prev().click().focus();
      e.preventDefault();
    }
    if (e.keyCode == 38) {
      $("[aria-selected=true]").prev().click().focus();
      e.preventDefault();
    }
    if (e.keyCode == 39) {
      $("[aria-selected=true]").next().click().focus();
      e.preventDefault();
    }
    if (e.keyCode == 40) {
      $("[aria-selected=true]").next().click().focus();
      e.preventDefault();
    }
  }

}