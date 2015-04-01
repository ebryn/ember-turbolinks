# Ember-Turbolinks

Ember-Turbolinks makes migrating your server-generated apps to Ember.js significantly easier by using techniques pioneered by the [pjax](https://github.com/defunkt/jquery-pjax) and Rails' [Turbolinks](https://github.com/rails/turbolinks) projects.

For example, if you're incrementally rewriting a server-generated application in Ember.js, you can now let Ember actually take over all of the routing of your application even though only parts of it have been rewritten in Ember. Typically the ROI of admin or setting page rewrites is very low, so Ember-Turbolinks offers a nice mechanism for boosting the performance of those areas of the application and let's you take advantage of nice features of Ember such as automatic loading substates.

## Installation

`ember install:addon ember-turbolinks`

## Usage

Inside your `app/router.js`, turboify your server-generated web application by configuring the routes you want loaded by Ember:

```
Router.map(function() {
  //            <route name> <server url>        <optional parameters>
  this.turboify('settings',  '/legacy/settings', {container: '#content', path: '/admin/settings'});
});
