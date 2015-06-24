let turboRoutes = [];

Ember.RouterDSL.prototype.turboify = function(name, url, options = {}) {
  if (!name || !url) { throw new Error("You must provide at least a name and URL to `turboify`"); }

  this.route(name, options);

  turboRoutes.push([name, url, options]);
};

Ember.Router.reopen({
  setupRouter() {
    let ret = this._super(...arguments);
    let container = this.container;

    // monkeypatched ember above on module load
    turboRoutes.forEach(tuple => {
      let name = tuple[0];
      let url = tuple[1];
      let options = tuple[2];
      let selector = options.selector || 'body';

      container.register(`route:${name.dasherize()}`, Ember.Route.extend({
        model() {
          return $.get(url);
        }
      }));

      container.register(`view:${name.dasherize()}`, ServerRenderedView.extend({
        turboSelector: selector
      }));
    });

    return ret;
  }
});

let ServerRenderedView = Ember.View.extend({
  didInsertElement() {
    this._handleResponse(this.get('controller.model'));
  },

  _handleResponse(html) {
    let extractHTML = this._extractHTML(this.turboSelector, html);
    this.$().html(extractHTML);
    this._setupEvents();
  },

  _extractHTML(selector, html) {
    // TODO: make sure this is supported cross browser
    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(html, "text/html");
    let page = htmlDoc.querySelector(selector);
    let csrfToken = htmlDoc.querySelector("meta[name=csrf-token]");
    let csrfParam = htmlDoc.querySelector("meta[name=csrf-param]");
    let pageHTML = page.innerHTML;
    if (csrfToken) { pageHTML += csrfToken.outerHTML; }
    if (csrfParam) { pageHTML += csrfParam.outerHTML; }
    return pageHTML;
  },

  _setupEvents() {
    // Convert forms to AJAX calls transparently
    $('form[method=post]').on('submit', event => {
      let $form = $(event.target);
      let url = $form.attr('action');
      $.post(url, $form.serialize()).then(html => {
        this._handleResponse(html);
      }, xhr => {
        // TODO: error handling
      });
      return false;
    });

    // Convert form submission links to be AJAX calls
    // See: https://github.com/rails/jquery-ujs
    $('[data-method]').attr('data-remote', true);

    // Intercept the data-remote based AJAX calls and do our own manually
    // See: https://github.com/rails/jquery-ujs
    $('[data-remote]').on('ajax:beforeSend', (event, xhr, settings) => {
      $.ajax(settings.url, {
        type: 'POST',
        data: {_method: 'DELETE'}
      }).then(html => {
        this._handleResponse(html);
      }, xhr => {
        // TODO: error handling
      });
      return false;
    });
  }
});

export function initialize(container, application) {

}

export default {
  name: 'ember-turbolinks',
  initialize: initialize
};
