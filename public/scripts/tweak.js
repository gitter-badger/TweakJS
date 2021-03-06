
/*
  tweak.js 1.7.4

  (c) 2014 Blake Newman.
  TweakJS may be freely distributed under the MIT license.
  For all details and documentation:
  http://tweakjs.com

  Brunch-config wrappes this coffeescript file and its modules into self contained function.
 */
var $, root, tweak, wrapper;

wrapper = function(root, tweak, require, $) {
  var pTweak;
  pTweak = tweak;

  /*
   Assign $ to tweak for internal use and allow to be overridden at anypoint
   */
  tweak.$ = $;

  /*
   Assign the module loader's require method to tweak.require. By default it
   used the passed require. However, for example, if using Curl then curl can
   be assigned to tweak.require
   */
  tweak.require = require;

  /*
    By default when creating a new Component if there is not an initial
    external config file relating to that Component then it doesn't matter.
    However when extending lots of Components it is generally better to
    make external relating config objects required to be found by a module loader
    so mistakes are reduced.
   */
  tweak.strict = false;

  /*
    Restore the previous stored tweak.
   */
  return tweak.noConflict = function() {
    root.tweak = pTweak;
    return this;
  };
};

root = (typeof self === 'object' && self.self === self && self) || (typeof global === 'object' && global.global === global && global) || window;


/* 
  To keep alternative frameworks to jQuery available to tweak, 
  register/define the appropriate framework to '$'
 */

if (typeof define === 'function' && define.amd) {
  define(['$', 'exports'], function($, exports) {

    /*
      This will enable a switch to a CommonJS based system with AMD.
      This may need adjustment to
     */
    var toRequire;
    toRequire = function(module) {
      return define([module], function(res) {
        return res;
      });
    };
    return wrapper(root, root.tweak = exports, toRequire, $);
  });
} else if (typeof exports !== 'undefined') {

  /*
    CommonJS and Node environment
   */
  try {
    $ = require('$');
  } catch (_error) {}
  if (!$) {
    try {
      $ = require('jquery');
    } catch (_error) {}
  }
  wrapper(root, tweak = exports, require, $);
} else {

  /*
    Typical web environment - even though a module loader is required
    it is best to allow the user to set it up. Example Brunch uses CommonJS
    however it does not work exactly like it does in node so it goes through here
   */
  wrapper(root, root.tweak = {}, require, root.jQuery || root.Zepto || root.ender || root.$);
}
;
/*
  TweakJS was initially designed in CoffeeScript for CoffeeScripters. It is much
  easier to use the framework in CoffeeScript; however those using JS the
  following helpers will provide extending features that CoffeeScipt possess.
  These can also be used to reduce the file size of compiled CoffeeScript files.
 */
tweak.Class = (function() {
  function Class() {}

  Class.prototype.__hasProp = {}.hasOwnProperty;


  /*
    To extend an object with JS use tweak.Extends.
    @param [Object] child The child Object to extend.
    @param [Object] parent The parent Object to inheret methods.
    @return [Object] Extended object
   */

  Class.prototype["extends"] = function(child, parent) {
    return function(child, parent) {
      var ctor, key;
      ctor = function() {
        this.constructor = child;
      };
      for (key in parent) {
        if (this.__hasProp.call(parent, key)) {
          child[key] = parent[key];
        }
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    };
  };


  /*
    To super a method with JS use this.super from within the class definition.
    To add super to prototype of a custom object not within the TweakJS classes
    in JS; do {class}.prototype.super = tweak.Super
  
    @param [Object] context The context to apply a super call to
    @param [string] name The method name to call super upon.
   */

  Class.prototype["super"] = function(context, name) {
    return context.__super__[name].call(this);
  };

  return Class;

})();
;
/*
  Tweak.js has an event system class, this provides functionality to extending
  classes to communicate simply and effectively while maintaining an organised
  structure to your code and applications. Each object can extend the
  tweak.EventSystem class to provide event functionality to classes. Majority of
  Tweak.js modules/classes already extend the EventSystem class, however when
  creating custom objects/classes you can extend the class using the tweak.Extends
  method, please see the Class class in the documentation.
    
  Examples are in JS, unless where CoffeeScript syntax may be unusual. Examples
  are not exact, and will not directly represent valid code; the aim of an example
  is to show how to roughly use a method.
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

tweak.Events = (function(superClass) {
  extend(Events, superClass);

  function Events() {
    return Events.__super__.constructor.apply(this, arguments);
  }


  /*
    Iterate through events to find matching named events. Can be used to add a new event through the optional Boolean build argument
  
    @overload findEvent(names, build)
      Find events with a space separated string.
      @param [String] names The event name(s); split on a space.
      @param [Boolean] build (Default = false) Whether or not to add an event object when none can be found.
      @return [Array<Event>] All event objects that are found/created then it is returned in an Array.
  
    @overload findEvent(names, build)
      Find events with an array of names (strings).
      @param [Array<String>] names An array of names (strings).
      @param [Boolean] build (Default = false) Whether or not to add an event object when none can be found.
      @return [Array<Event>] All event objects that are found/created then it is returned in an Array.
  
    @example Delimited string
      // This will find all events in the given space delimited string.
      var model;
      model = new Model();
      model.findEvent('sample:event another:event');
  
    @example Delimited string with build
      // This will find all events in the given space delimited string.
      // If event cannot be found then it will be created.
      var model;
      model = new Model();
      model.findEvent('sample:event another:event', true);
  
    @example Array of names (strings)
      // This will find all events from the names in the given array.
      var model;
      model = new Model();
      model.findEvent(['sample:event', 'another:event']);
  
    @example Array of names (strings) with build
      // This will find all events from the names in the given array.
      // If event cannot be found then it will be created.
      var model;
      model = new Model();
      model.findEvent(['sample:event', 'another:event'], true);
   */

  Events.prototype.findEvent = function(names, build) {
    var event, events, i, item, len, results;
    if (build == null) {
      build = false;
    }
    if (typeof names === 'string') {
      names = names.split(/\s+/);
    }
    events = this.__events = this.__events || {};
    results = [];
    for (i = 0, len = names.length; i < len; i++) {
      item = names[i];
      if (!(event = events[item])) {
        if (build) {
          event = this.__events[item] = {
            name: item,
            __callbacks: []
          };
        } else {
          continue;
        }
      }
      results.push(event);
    }
    return results;
  };


  /*
    Bind a callback to the event system. The callback is invoked when an
    event is triggered. Events are added to an object based on their name.
  
    Name spacing is useful to separate events into their relevant types.
    It is typical to use colons for name spacing. However you can use any other
    name spacing characters such as / \ - _ or .
    
    @overload addEvent(names, callback, context, max)
      Bind a callback to event(s) with context and/or total calls
      @param [String, Array<String>] names The event name(s). Split on a space, or an array of event names.
      @param [Function] callback The event callback function.
      @param [Object] context (optional, default = this) The contextual object of which the event to be bound to.
      @param [Number] max (optional, default = null). The maximum calls on the event listener. After the total calls the events callback will not invoke.
  
    @overload addEvent(names, callback, max, context)
      Bind a callback to event(s) with total calls and/or context
      @param [String, Array<String>] names The event name(s). Split on a space, or an array of event names.
      @param [Function] callback The event callback function.
      @param [Number] max The maximum calls on the event listener. After the total calls the events callback will not invoke.
      @param [Object] context (optional, default = this) The contextual object of which the event to be bound to.
  
    @example Bind a callback to event(s)
      var model;
      model = new Model();
      model.addEvent('sample:event', function(){
        alert('Sample event triggered.')
      });
    
    @example Bind a callback to event(s) with total calls
      var model;
      model = new Model();
      model.addEvent('sample:event', function(){
        alert('Sample event triggered.')
      }, 4);
  
    @example Bind a callback to event(s) with a separate context without total calls
      var model;
      model = new Model();
      model.addEvent('sample:event', function(){
        alert('Sample event triggered.')
      }, this);
  
    @example Bind a callback to event(s) with a separate context with maximum calls
      var model;
      model = new Model();
      model.addEvent('sample:event', function(){
        alert('Sample event triggered.')
      }, this, 3);
   */

  Events.prototype.addEvent = function(names, callback, context, max) {
    var event, i, ignore, item, j, len, len1, ref, ref1;
    if (context == null) {
      context = this;
    }
    if (typeof context === 'number' || context === null) {
      max = context;
      context = max || this;
    }
    ref = this.findEvent(names, true);
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      ignore = false;
      ref1 = event.__callbacks;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        item = ref1[j];
        if (item.callback === callback && context === item.ctx) {
          item.max = max;
          item.calls = 0;
          item.listen = ignore = true;
        }
      }
      if (!ignore) {
        event.__callbacks.push({
          ctx: context,
          callback: callback,
          max: max,
          calls: 0,
          listen: true
        });
      }
    }
  };


  /*
    Remove a previously bound callback function. Removing events can be limited to context and its callback.
    @param [String] names The event name(s). Split on a space, or an array of event names.
    @param [Function] callback (optional) The callback function of the event. If no specific callback is given then all the events under event name are removed.
    @param [Object] context (default = this) The contextual object of which the event is bound to. If this matches then it will be removed, however if set to null then all events no matter of context will be removed.
  
    @example Unbind a callback from event(s)
      var model;
      model = new Model();
      model.removeEvent('sample:event another:event', @callback);
  
    @example Unbind all callbacks from event(s)
      var model;
      model = new Model();
      model.removeEvent('sample:event another:event');
   */

  Events.prototype.removeEvent = function(names, callback, context) {
    var event, i, item, key, len, ref, ref1;
    if (context == null) {
      context = this;
    }
    ref = this.findEvent(names);
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      ref1 = event.__callbacks;
      for (key in ref1) {
        item = ref1[key];
        if (((callback == null) || callback === item.callback) && ((context == null) || context === item.ctx)) {
          event.__callbacks.splice(key, 1);
        }
      }
      if (event.__callbacks.length === 0) {
        delete this.__events[event.name];
      }
    }
  };


  /*
    Trigger events by name.
    @overload triggerEvent(names, params)
      Trigger events by name only.
      @param [String, Array<String>] names The event name(s). Split on a space, or an array of event names.
      @param [...] params Parameters to pass into the callback function.
  
    @overload triggerEvent(options, params)
      Trigger events by name and context.
      @param [Object] options Options and limiters to check against callbacks.
      @param [...] params Parameters to pass into the callback function.
      @option options [String, Array<String>] names The event name(s). Split on a space, or an array of event names.
      @option options [Context] context (Default = null) The context of the callback to check against a callback.
  
    @example Triggering event(s)
      var model;
      model = new Model();
      model.triggerEvent('sample:event, another:event');
  
    @example Triggering event(s) with parameters
      var model;
      model = new Model();
      model.triggerEvent('sample:event another:event', 'whats my name', 'its...');
  
    @example Triggering event(s) but only with matching context
      var model;
      model = new Model();
      model.triggerEvent({context:@, name:'sample:event another:event'});
   */

  Events.prototype.triggerEvent = function() {
    var context, event, i, item, j, len, len1, names, params, ref, ref1;
    names = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (typeof names === 'object' && !names instanceof Array) {
      names = names.names || [];
      context = names.context || null;
    }
    ref = this.findEvent(names);
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      ref1 = event.__callbacks;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        item = ref1[j];
        if (item.listen && ((context == null) || context === item.ctx)) {
          if ((item.max != null) && ++item.calls >= item.max) {
            item.listen = false;
          }
          setTimeout((function() {
            this.callback.apply(this.ctx, params);
          }).bind(item), 0);
        }
      }
    }
  };


  /*
    Set events listening state, maximum calls, and total calls limited by name and options (callback, context).
    @param [String] names The event name(s). Split on a space, or an array of event names.
    @param [Object] options Optional limiters and update values.
    @option options [Object] context The contextual object to limit updating events to.
    @option options [Function] callback Callback function to limit updating events to.
    @option options [Number] max Set a new maximum calls to an event.
    @option options [Number] calls Set the amount of calls that has been triggered on this event.
    @option options [Boolean] reset (Default = false) If true then calls on an event get set back to 0.
    @option options [Boolean] listen Whether to enable or disable listening to event.
  
    @example Updating event(s) to not listen
      var model;
      model = new Model();
      model.updateEvent('sample:event, another:event', {listen:false});
  
    @example Updating event(s) to not listen, however limited by optional context and/or callback
      // Limit events that match to a context and callback.
      var model;
      model = new Model();
      model.updateEvent('sample:event, another:event', {context:@, callback:@callback, listen:false});
  
      // Limit events that match to a callback.
      var model;
      model = new Model();
      model.updateEvent('sample:event, another:event', {callback:@anotherCallback, listen:false});
  
      // Limit events that match to a context.
      var model;
      model = new Model();
      model.updateEvent('sample:event, another:event', {context:@, listen:false});
  
    @example Updating event(s) maximum calls and reset its current calls
      var model;
      model = new Model();
      model.updateEvent('sample:event, another:event', {reset:true, max:100});
  
    @example Updating event(s) total calls
      var model;
      model = new Model();
      model.updateEvent('sample:event, another:event', {calls:29});
   */

  Events.prototype.updateEvent = function(names, options) {
    var callback, calls, ctx, event, i, item, j, len, len1, listen, max, ref, ref1, reset;
    if (options == null) {
      options = {};
    }
    ctx = options.context;
    max = options.max;
    reset = options.reset;
    calls = reset ? 0 : options.calls || 0;
    listen = options.listen;
    callback = options.callback;
    ref = this.findEvent(names);
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      ref1 = event.__callbacks;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        item = ref1[j];
        if (((ctx == null) || ctx !== item.ctx) && ((callback == null) || callback !== item.callback)) {
          if (max != null) {
            item.max = max;
          }
          if (calls != null) {
            item.calls = calls;
          }
          if (listen != null) {
            item.listen = listen;
          }
        }
      }
    }
  };


  /*
    Resets the events on this object to empty.
   */

  Events.prototype.resetEvents = function() {
    return this.__events = {};
  };

  return Events;

})(tweak.Class);
;
/*
  This class contains common shared functionality. The aim to reduce repeated code
  and overall file size of the framework.

  Examples are in JS, unless where CoffeeScript syntax may be unusual. Examples
  are not exact, and will not directly represent valid code; the aim of an example
  is to show how to roughly use a method.
 */
tweak.Common = (function() {
  function Common() {}


  /*
    Merge properties from object from one object to another. (First object is the object to take on the properties from the second object).
    @param [Object, Array] one The Object/Array to combine properties into.
    @param [Object, Array] two The Object/Array that shall be combined into the first object.
    @return [Object, Array] Returns the resulting combined object from two Object/Array.
   */

  Common.prototype.combine = function(one, two) {
    var key, prop;
    for (key in two) {
      prop = two[key];
      if (typeof prop === 'object') {
        if (one[key] == null) {
          one[key] = prop instanceof Array ? [] : {};
        }
        one[key] = tweak.Common.combine(one[key], prop);
      } else {
        one[key] = prop;
      }
    }
    return one;
  };


  /*
    Clone an object to remove reference to original object or simply to copy it.
    @param [Object, Array] ref Reference object to clone.
    @return [Object, Array] Returns the copied object, while removing object references.
   */

  Common.prototype.clone = function(ref) {
    var attr, copy;
    if (null === ref || 'object' !== typeof ref || ref === this) {
      return ref;
    }
    if (ref instanceof Date) {
      copy = new Date();
      copy.setTime(ref.getTime());
      return copy;
    }
    if (ref instanceof Array) {
      copy = [];
    } else if (typeof ref === 'object') {
      copy = {};
    } else {
      throw new Error('Unable to copy object, type not supported.');
    }
    for (attr in ref) {
      if (ref.hasOwnProperty(attr)) {
        copy[attr] = tweak.Common.clone(ref[attr]);
      }
    }
    return copy;
  };


  /*
    Convert a simple JSON string/object.
    @param [JSONString, JSONObject] data JSONString/JSONObject to convert to vice versa.
    @return [JSONObject, JSONString] Returns JSON data of the opposite data type
   */

  Common.prototype.parse = function(data) {
    return JSON[typeof data === 'string' ? 'parse' : 'stringify'](data);
  };


  /*
    Try to find a module by name in multiple paths. A final surrogate if available will be returned if no module can be found.
    @param [Array<String>] paths An array of context paths.
    @param [String] module The module path to convert to absolute path; based on the context path.
    @param [Object] surrogate (Optional) A surrogate Object that can be used if there is no module found.
    @return [Object] Returns an Object that has the highest priority.
    @throw When an object cannot be found and no surrogate is provided the following error message will appear -
      "No default module (#{module name}) for component #{component name}".
    @throw When an object is found but there is an error during processing the found object the following message will appear -
      "Module (#{path}) found. Encountered #{e.name}: #{e.message}".
   */

  Common.prototype.findModule = function(contexts, module, surrogate) {
    var context, e, i, len;
    for (i = 0, len = contexts.length; i < len; i++) {
      context = contexts[i];
      try {
        return tweak.Common.require(context, module);
      } catch (_error) {
        e = _error;
        if (e.name !== 'Error') {
          e.message = "Module (" + context + "}) found. Encountered " + e.name + ": " + e.message;
          throw e;
        }
      }
    }
    if (surrogate != null) {
      return surrogate;
    }
    throw new Error("No default module (" + module + ") for component " + contexts[0]);
  };


  /*
    Require method to find a module in a given context path and module path.
    The context path and module path are merged together to create an absolute path.
    @param [String] context The context path.
    @param [String] module The module path to convert to absolute path, based on the context path.
    @param [Object] surrogate (Optional) A surrogate Object that can be used if there is no module found.
    @return [Object] Required object or the surrogate if requested.
    @throw Error upon no found module.
   */

  Common.prototype.require = function(context, module, surrogate) {
    var e, path;
    path = tweak.Common.relToAbs(context, module);
    try {
      return tweak.require(path);
    } catch (_error) {
      e = _error;
      if (surrogate != null) {
        return surrogate;
      }
      throw e;
    }
  };


  /*
    Split a name out to individual absolute names.
    Names formated like './cd[2-4]' will return an array or something like ['album1/cd2','album1/cd3','album1/cd4'].
    Names formated like './cd[2-4]a ./item[1]/model' will return an array or something
    like ['album1/cd2a','album1/cd3a','album1/cd4a','album1/item0/model','album1/item1/model'].
    @param [String] context The current context's name.
    @param [String, Array<String>] names The string to split into separate component names.
    @return [Array<String>] Array of absolute names.
   */

  Common.prototype.splitMultiName = function(context, names) {
    var i, item, len, max, min, prefix, reg, result, suffix, values;
    values = [];
    reg = /^(.*)\[(\d*)(?:[,\-](\d*)){0,1}\](.*)$/;
    if (typeof names === 'string') {
      names = names.split(/\s+/);
    }
    for (i = 0, len = names.length; i < len; i++) {
      item = names[i];
      result = reg.exec(item);
      if (result != null) {
        prefix = result[1];
        min = result[2] || 0;
        max = result[3] || min;
        suffix = result[4];
        while (min <= max) {
          values.push(tweak.Common.relToAbs(context, "" + prefix + (min++) + suffix));
        }
      } else {
        values.push(tweak.Common.relToAbs(context, item));
      }
    }
    return values;
  };


  /*
    Convert relative path to an absolute path; relative path defined by ./ or .\
    It will also reduce the prefix path by one level per ../ in the path.
    @param [String] context The context path.
    @param [String] name The path to convert to absolute path, based on the context path.
    @return [String] Absolute path.
   */

  Common.prototype.relToAbs = function(context, name) {
    var amount;
    amount = name.split(/\.{2,}[\/\\]*/).length - 1 || 0;
    context = context.replace(new RegExp("([\\/\\\\]*[^\\/\\\\]+){" + amount + "}[\\/\\\\]?$"), '');
    return name.replace(/^(\.+[\/\\]*)+/, context + "/");
  };

  return Common;

})();

tweak.Common = new tweak.Common();
;
/*
  This is the base Class for dynamic storage based modules. A good way to think of
  a Store/Model/Collection is to think it as Cache; it can be used to Store data for
  temporary access. It receives and sends its data to a secondary permanent storage
  solution. The Store class is the base functionality shared between a Model and
  Collection. Classes that inherit Store class trigger events when it's storage
  base is updated, this makes it easy to listen to changes and to action as and
  when required.

  Examples are in JS, unless where CoffeeScript syntax may be unusual. Examples
  are not exact, and will not directly represent valid code; the aim of an example
  is to show how to roughly use a method.
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

tweak.Store = (function(superClass) {
  extend(Store, superClass);

  function Store() {
    return Store.__super__.constructor.apply(this, arguments);
  }

  Store.prototype._type = 'BASE';

  Store.prototype.length = 0;


  /*
    Default initialiser function
   */

  Store.prototype.init = function() {};


  /*
    Set a single property or multiple properties.
  
    @overload set(name, data, silent)
      Set an individual property by the name (String).
      @param [String] name The name of the property.
      @param [*] data Data to Store in the property.
      @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes to the data.
  
    @overload set(data, silent)
      Set multiple properties by an object of data.
      @param [Object] data Key and property based object.
      @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes to the data.
  
    @example Setting single property.
      this.set('sample', 100);
  
    @example Setting multiple properties.
      this.set({sample:100, second:2});
  
    @example Setting properties silently.
      this.set('sample', 100, true);
      this.set({sample:100, second:2}, true);
  
    @event changed:#{key} Triggers an event and passes in changed property.
    @event changed Triggers a generic event that the Store has been updated.
   */

  Store.prototype.set = function() {
    var data, key, name, obj, params, prev, prevProps, prop, silent, type;
    data = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    silent = params[0];
    type = typeof data;
    if (type === 'string' || type === 'number') {
      prevProps = data;
      data = {};
      data[prevProps] = params[0];
      silent = params[1];
    }
    obj = {};
    for (key in data) {
      prop = data[key];
      prev = this._data[key];
      if (prev == null) {
        this.length++;
      }
      this._data[key] = (typeof this[name = "__set" + (key.replace(/^[a-z]/, function(m) {
        return m.toUpperCase();
      }))] === "function" ? this[name](prop) : void 0) || prop;
      if (!silent) {
        this.triggerEvent("changed:" + key, prop);
      }
    }
    if (!silent) {
      this.triggerEvent('changed');
    }
  };


  /*
    Returns whether two objects are the same (similar).
    @param [Object, Array] one Object to compare to Object two.
    @param [Object, Array] two Object to compare to Object one.
    @return [Boolean] Are the two Objects the same/similar?
  
    @example comparing objects.
      this.same({'sample':true},{'sample':true}); //true
      this.same({'sample':true},{'not':true}); //false
   */

  Store.prototype.same = function(one, two) {
    var key, prop;
    for (key in one) {
      prop = one[key];
      if ((two[key] == null) || two[key] !== prop) {
        return false;
      }
    }
    return true;
  };


  /*
    Get a property from the base storage.
    @param [String, Array<String>] property Property/properties to retrieve from the base storage.
    @param [...] params Parameters to pass into getter method
    @return [*] Property/properties from base storage.
    
    @overload get()
      Get all properties from base storage.
      @return [Array<*>, Object] Properties from base storage.
  
    @overload get(name)
      Get an individual property by a property name.
      @param [String] name The name of the property.
      @return [*] Property from base storage.
  
    @overload get(limit)
      Get multiple properties from base storage.
      @param [Array<String>] limit Array of property names to retrive from the base storage.
      @return [Array<*>, Object] Properties from base storage.
  
    @example Get property.
      this.get('sample');
  
    @example Get mutiple properties.
      this.get(['sample', 'pizza']);
  
    @example Get all properties.
      this.get();
   */

  Store.prototype.get = function() {
    var base, data, i, item, j, key, len, limit, name, params;
    limit = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (limit == null) {
      limit = (function() {
        var ref, results;
        ref = this._data;
        results = [];
        for (key in ref) {
          item = ref[key];
          results.push(key);
        }
        return results;
      }).call(this);
    }
    if (typeof limit === 'string' || typeof limit === 'number') {
      limit = [limit];
    }
    base = this._data instanceof Array ? [] : {};
    for (i = j = 0, len = limit.length; j < len; i = ++j) {
      item = limit[i];
      data = typeof this[name = "__get" + (("" + item).replace(/^[a-z]/, function(m) {
        return m.toUpperCase();
      }))] === "function" ? this[name].apply(this, params) : void 0;
      if (data == null) {
        data = this._data[item];
      }
      base[item] = data;
    }
    if (i <= 1) {
      base = base[item];
    }
    return base;
  };


  /*
    Checks if a property/properties exists from the base storage.
    @param [String, Array<String>] limit Property/properties name to look for in the base storage.
    @param [...] params Parameters to pass into getter method
    @return [Boolean] Returns true or false depending if the property exists in the base storage.
  
    @overload has(name)
      Get an individual property by a property name.
      @param [String] name The name of the property.
      @return [*] Property from base storage.
  
    @overload has(limit)
      Get multiple properties from base storage.
      @param [Array<String>] limit Array of property names to retrive from the base storage.
      @return [Array<*>, Object] Properties from base storage.
  
    @example Get property.
      this.has('sample');
  
    @example Get mutiple properties.
      this.has(['sample', 'pizza']);
   */

  Store.prototype.has = function(limit, params) {
    var data, i, item, j, len, name;
    if (typeof limit === 'string' || typeof limit === 'number') {
      limit = [limit];
    }
    for (i = j = 0, len = limit.length; j < len; i = ++j) {
      item = limit[i];
      data = typeof this[name = "__get" + (item.replace(/^[a-z]/, function(m) {
        return m.toUpperCase();
      }))] === "function" ? this[name].apply(this, params) : void 0;
      if ((data == null) && (this._data[item] == null)) {
        return false;
      }
    }
    return true;
  };


  /*
    Returns an array of keys where the property matches given value.
    @param [*] value Value to check.
    @return [Array<String>] Returns an array of keys where the property matches given value.
    
    @example find keys of base storage where the value matches.
      this.where(1009); //[3,87]
   */

  Store.prototype.where = function(value) {
    var data, key, prop, result;
    result = [];
    data = this._data;
    for (key in data) {
      prop = data[key];
      if (prop === value) {
        result.push(key);
      }
    }
    return result;
  };


  /*
    Reset the Store length to 0 and triggers change event.
  
    @event changed Triggers a generic event that the Store has been updated.
   */

  Store.prototype.reset = function() {
    this.length = 0;
    this.triggerEvent('changed');
  };


  /*
    Import data into the Store.
    @param [Object, Array] data data to import.
    @param [Boolean] silent (optional, default = true) If false events are not triggered upon any changes.
  
    @event changed:#{index} Triggers an event and passes in changed property.
    @event changed Triggers a generic event that the Collection has been updated.
   */

  Store.prototype["import"] = function(data, silent) {
    var item, key, ref;
    if (silent == null) {
      silent = true;
    }
    for (key in data) {
      item = data[key];
      if (((ref = this._data[key]) != null ? ref["import"] : void 0) != null) {
        this._data[key]["import"](item, silent);
      } else {
        this.set(key, item, silent);
      }
    }
  };


  /*
    Export the Store's data.
    @param [Array<String>] limit (default = all properties) Limit which properties to convert.
    @return [Object] Collection as a JSONString
   */

  Store.prototype["export"] = function(limit) {
    var item, j, key, len, res;
    res = {};
    if (limit == null) {
      limit = (function() {
        var ref, results;
        ref = this._data;
        results = [];
        for (key in ref) {
          item = ref[key];
          results.push(key);
        }
        return results;
      }).call(this);
    }
    for (j = 0, len = limit.length; j < len; j++) {
      key = limit[j];
      if ((item = this.get(key)) != null) {
        if (item["export"] != null) {
          res[key] = item["export"]();
        } else {
          res[key] = item;
        }
      }
    }
    return res;
  };

  return Store;

})(tweak.Events);
;
/*
  A Collection is used by other modules like the Controller to store, retrieve and
  listen to a set of ordered data. A Collection triggers events when its storage
  base is updated, this makes it easy to listen to changes and to action as and
  when required. The Collection data is not a database, but a JSON representation
  of its data can be exported and imported to and from storage sources. In Tweak.js
  the Model extends the Store module - which is the core functionality shared between
  Model's and Collection's. The main difference between a Model and collection it
  the base of its data type. The Model uses an object as its base data type and a
  collection base type is an Array.

  To further extend a Collection, Tweak.js allows data to be imported and exported.
  When doing this please know that all data stored should be able to be converted
  to a JSON string. A Collection of Models can also be exported and imported to
  and from a database, as it has an inbuilt detection for when a value should be
  created as a Model representation. Keep note that a Collection of Collections is
  not appropriate as this becomes complicated and it can get messy quickly. It
  should be possible to export and import data of that nature, but it’s not
  recommended - always try to keep stored data structured simply.

  Examples are in JS, unless where CoffeeScript syntax may be unusual. Examples
  are not exact, and will not directly represent valid code; the aim of an example
  is to show how to roughly use a method.
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

tweak.Collection = (function(superClass) {
  var __fullTrigger;

  extend(Collection, superClass);

  Collection.prototype._type = 'collection';


  /*
    @private
    Method to trigger a change event for all of the properties in the Collection
   */

  __fullTrigger = function(data, trigger) {
    var item, key;
    for (key in data) {
      item = data[key];
      trigger("changed:" + key, item);
    }
    return triggerEvent('changed', data);
  };


  /*
    The constructor initialises the controllers unique ID and its initial data.
  
    @example Creating a Collection with predefined set of data.
      var collection;
      collection = new tweak.Collection([
        new Model(),
        new Model()
      ]);
   */

  function Collection(_data) {
    this._data = _data != null ? _data : [];
  }


  /*
    Add a new property to the end of the Collection.
    @param [*] data Data to add to the end of the Collection.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
  
    @event changed:#{key} Triggers an event and passes in changed property.
    @event changed Triggers a generic event that the Collection has been updated.
   */

  Collection.prototype.add = function(data, silent) {
    this.set(this.length, data, silent);
  };


  /*
    Get an element at specified index.
    @param [Number] index Index of property to return.
    @return [*] Returned data from the specified index.
   */

  Collection.prototype.at = function(index) {
    return this.get(index);
  };


  /*
    Push a new property to the end of the Collection.
    @param [*] data Data to add to the end of the Collection.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
  
    @event changed:#{key} Triggers an event and passes in changed property.
    @event changed Triggers a generic event that the Collection has been updated.
   */

  Collection.prototype.push = function(data, silent) {
    this.set(this.length, data, silent);
  };


  /*
    Splice method that allows for event triggering on the base object.
    @param [Number] position The position to insert the property at into the Collection.
    @param [Number] remove The amount of properties to remove from the Collection.
    @param [Array<*>] data an array of data to insert into the Collection.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
  
    @event changed:#{key} Triggers an event and passes in changed property.
    @event changed Triggers a generic event that the Collection has been updated.
  
    @example Removing four properties from the 6th position in the array.
      var collection;
      collection = new tweak.Collection();
      collection.splice(5, 4);
  
    @example Inserting two properties from the 3rd position in the array.
      var collection;
      collection = new tweak.Collection();
      collection.splice(2, 0, ['100', '200']);
  
    @example Silently insert two properties from the 3rd position in the array.
      var collection;
      collection = new tweak.Collection();
      collection.splice(2, 0, ['100', '200'], true);
   */

  Collection.prototype.splice = function(position, remove, data, silent) {
    var ref;
    if (silent == null) {
      silent = false;
    }
    (ref = this._data).splice.apply(ref, [position, remove].concat(slice.call(data)));
    this.length = this._data.length;
    if (!silent) {
      __fullTrigger(this._data, this.triggerEvent);
    }
  };


  /*
    Insert values into base data at a given index (Short cut to splice method).
    @param [Number] index The index to insert the property at into the Collection.
    @param [Array<*>] data an array of data to insert into the Collection.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
  
    @event changed:#{key} Triggers an event and passes in changed property.
    @event changed Triggers a generic event that the Collection has been updated.
  
  
    @example Inserting two properties from the 3rd position in the array.
      var collection;
      collection = new tweak.Collection();
      collection.insert(2, ['100', '200']);
  
    @example Silently insert two properties from the 3rd position in the array.
      var collection;
      collection = new tweak.Collection();
      collection.splice(2, ['100', '200'], true);
   */

  Collection.prototype.insert = function(index, data, silent) {
    this.splice(position, 0, data, silent);
  };


  /*
    Adds property to the first index of the Collection.
    @param [Array<*>] data an array of data to insert at the first index of the Collection.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
  
    @event changed:#{index} Triggers an event and passes in changed property.
    @event changed Triggers a generic event that the Collection has been updated.
    @return [Number] The length of the Collection.
   */

  Collection.prototype.unshift = function(data, silent) {
    this.splice(0, 0, data, silent);
    return this.length;
  };


  /*
    Remove a single property or many properties from the Collection.
  
    @overload remove(index, silent)
      Remove an individual property from the Collection.
      @param [String] index The index to remove from the Collection.
      @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes to the data.
  
    @overload remove(data, silent)
      Remove multiple properties from the Collection by an Array of keys (Strings).
      @param [Array] keys An array of keys (indexes) to remove.
      @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes to the data.
  
    @event removed:#{index} Triggers an event based on what properties have been removed.
    @event changed Triggers a generic event that the Collection has been changed.
  
    @example Remove a single property.
      var collection;
      collection = new tweak.Collection();
      collection.remove(3);
  
    @example Remove multiple properties.
      var collection;
      collection = new tweak.Collection();
      collection.remove([1,3]);
  
    @example Remove properties silently.
      var collection;
      collection = new tweak.Collection();
      collection.remove([4,2], true);
      collection.remove(1, true);
   */

  Collection.prototype.remove = function(keys, silent) {
    var i, index, len;
    if (!(keys instanceof Array)) {
      keys = [keys];
    }
    for (i = 0, len = keys.length; i < len; i++) {
      index = keys[i];
      this._data.splice(index, 1);
      if (!silent) {
        this.triggerEvent("removed:" + index);
      }
    }
    if (!silent) {
      this.triggerEvent('changed');
    }
  };


  /*
    Remove an element at a specified index.
    @param [Number] index Index of property to remove.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
    
    @example Remove a property at a given index.
      var collection;
      collection = new tweak.Collection();
      collection.removeAt(1);
  
    @example Silently remove a property at a given index.
      var collection;
      collection = new tweak.Collection();
      collection.removeAt(3, true);
   */

  Collection.prototype.removeAt = function(index, silent) {
    var element, key, prop;
    element = this.at(index);
    for (key in element) {
      prop = element[key];
      this.remove(key, silent);
    }
  };


  /*
    Remove a property at the last index of the Collection.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
  
    @event removed:#{key} Triggers an event based on what property has been removed.
    @event changed Triggers a generic event that the Collection has been updated.
    @return [*] The property value that was removed.
  
    @example Remove the last property from the Collection.
      var collection;
      collection = new tweak.Collection();
      collection.pop();
  
    @example Silently remove the last property from the Collection.
      var collection;
      collection = new tweak.Collection();
      collection.pop(true);
   */

  Collection.prototype.pop = function(silent) {
    var length, result;
    length = this.length - 1;
    result = this._data[length];
    this.remove(length, silent);
    return result;
  };


  /*
    Remove a property at the first index of the Collection.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
  
    @event removed:#{key} Triggers an event based on what property has been removed.
    @event changed Triggers a generic event that the Collection has been updated.
    @return [*] The property value that was removed.
  
    @example Remove the first property from the Collection.
      var collection;
      collection = new tweak.Collection();
      collection.shift();
  
    @example Silently remove the first property from the Collection.
      var collection;
      collection = new tweak.Collection();
      collection.shift(true);
   */

  Collection.prototype.shift = function(silent) {
    var result;
    result = this._data[0];
    this.remove(0, silent);
    return result;
  };


  /*
    Reduce the collection by removing properties from the first index.
    @param [Number] length The length of the Array to shorten to.
  
    @example Remove the first five properties from the Collection.
      var collection;
      collection = new tweak.Collection();
      collection.reduce(5);
  
    @example Silently remove the first five property from the Collection.
      var collection;
      collection = new tweak.Collection();
      collection.reduce(5, true);
   */

  Collection.prototype.reduce = function(length, silent) {
    this.splice(0, length, silent);
  };


  /*
    Reduce the collection by removing properties from the last index.
    @param [Number] length The length of the Array to shorten to.
  
    @example Remove the first five properties from the Collection.
      var collection;
      collection = new tweak.Collection();
      collection.reduce(5);
  
    @example Silently remove the first five property from the Collection.
      var collection;
      collection = new tweak.Collection();
      collection.reduce(5, true);
   */

  Collection.prototype.reduceRight = function(length, silent) {
    this.splice(0, this.length - length, silent);
  };


  /*
    Returns an Array of keys (indexes) where the Collection properties match the specified value.
    @param [*] value The value to find a match against.
    @return [Array] An Array of indexes where the Collection properties match the specified value.
  
    @example Retrieve the keys (indexes) where the value 'dog' can be found.
      var collection;
      collection = new tweak.Collection();
      collection.indexes('dog');
   */

  Collection.prototype.indexes = function(value) {
    var index, prop, ref, results;
    ref = this._data;
    results = [];
    for (index in ref) {
      prop = ref[index];
      if (value === prop) {
        results.push(index);
      }
    }
    return results;
  };


  /*
    Concatenate Arrays to the end of the Collection.
    @param [Array] arrays An Array containing a set of Arrays to concatenate to the end of the Collection.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes to the data.
  
    @note As it may be that the Collection is to be updated silently when using this method. The Arrays to concatenate to the end of the Collection has to be wrapped in an Array.
    @example Concatenate a set of Arrays to the end of a collection.
      var collection;
      collection = new tweak.Collection();
      collection.concat([[1,4,6], ['dog', 'cat']);
  
    @example Silently concatenate a set of Arrays to the end of a collection.
      var collection;
      collection = new tweak.Collection();
      collection.concat([['frog', 'toad']], true);
   */

  Collection.prototype.concat = function(arrays, silent) {
    var ref;
    this.splice(this.length - 1, 0, (ref = []).concat.apply(ref, arrays), silent);
  };


  /*
    Reset the Collection back to defaults
    
    @event changed Triggers a generic event that the store has been updated
   */

  Collection.prototype.reset = function() {
    this._data = [];
    Collection.__super__.reset.call(this);
  };


  /*
    This method directly accesses the Collection's data's every method.
    See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
   */

  Collection.prototype.every = function() {
    return this._data.every(arguments);
  };


  /*
    This method directly accesses the Collection's data's filter method.
    See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
   */

  Collection.prototype.filter = function() {
    return this._data.filter(arguments);
  };


  /*
    This method directly accesses the Collection's data's forEach method.
    See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
   */

  Collection.prototype.forEach = function() {
    return this._data.forEach(arguments);
  };


  /*
    This method directly accesses the Collection's data's join method.
    See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
   */

  Collection.prototype.join = function() {
    return this._data.join(arguments);
  };


  /*
    This method directly accesses the Collection's data's map method.
    See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
   */

  Collection.prototype.map = function() {
    return this._data.map(arguments);
  };


  /*
    This method directly accesses the Collection's data's reverse method.
    See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse
  
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
  
    @event changed:#{index} Triggers an event and passes in changed property.
    @event changed Triggers a generic event that the Collection has been updated.
   */

  Collection.prototype.reverse = function(silent) {
    var result;
    result = this._data.reverse();
    if (!silent) {
      __fullTrigger(this._data, this.triggerEvent);
    }
    return result;
  };


  /*
    This method directly accesses the Collection's data's slice method.
    See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
   */

  Collection.prototype.slice = function() {
    return this._data.slice(arguments);
  };


  /*
    This method directly accesses the Collection's data's some method.
    See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
   */

  Collection.prototype.some = function() {
    return this._data.some(arguments);
  };


  /*
    This method directly accesses the Collection's data's sort method.
    See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  
    @param [Function] fn (optional) If a comparing function is present then this is passed to sort function.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
  
    @event changed:#{index} Triggers an event and passes in changed property.
    @event changed Triggers a generic event that the Collection has been updated.
   */

  Collection.prototype.sort = function(fn, silent) {
    var result;
    if (silent == null) {
      silent = false;
    }
    result = fn != null ? this._data.sort(fn) : this._data.sort();
    __fullTrigger(this._data, this.triggerEvent);
    return result;
  };

  return Collection;

})(tweak.Store);
;
/*
  This class provides a collection of components. Upon initialisation components
  are dynamically built, from its configuration. The configuration for this
  component is an Array of component names (Strings). The component names are
  then used to create a component. Components nested within those components are
  then initialised creating a powerful scope of nest components that are completely
  unique to themselves.

  Examples are in JS, unless where CoffeeScript syntax may be unusual. Examples
  are not exact, and will not directly represent valid code; the aim of an example
  is to show how to roughly use a method.
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

tweak.Components = (function(superClass) {
  extend(Components, superClass);

  function Components() {
    return Components.__super__.constructor.apply(this, arguments);
  }

  Components.prototype._type = 'components';


  /*
   Construct the Collection with given options from the Components configuration.
   */

  Components.prototype.init = function() {
    var _name, data, i, item, j, k, l, len, len1, len2, len3, name, names, obj, path, prop, ref;
    this._data = [];
    data = [];
    _name = this.component.name;
    ref = this.component.config.components;
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      obj = {};
      if (item instanceof Array) {
        names = tweak.Common.splitMultiName(_name, item[0]);
        path = tweak.Common.relToAbs(_name, item[1]);
        for (j = 0, len1 = names.length; j < len1; j++) {
          name = names[j];
          this._data.push(new tweak.Component(this, {
            name: name,
            "extends": path
          }));
        }
      } else if (typeof item === 'string') {
        data = tweak.Common.splitMultiName(_name, item);
        for (k = 0, len2 = data.length; k < len2; k++) {
          name = data[k];
          this._data.push(new tweak.Component(this, {
            name: name
          }));
        }
      } else {
        obj = item;
        name = obj.name;
        data = tweak.Common.splitMultiName(_name, name);
        obj["extends"] = tweak.Common.relToAbs(_name, obj["extends"]);
        for (l = 0, len3 = data.length; l < len3; l++) {
          prop = data[l];
          obj.name = prop;
          this._data.push(new tweak.Component(this, obj));
        }
      }
      this._data[this.length++].init();
    }
  };


  /*
    @private
    Reusable method to render and re-render.
    @param [String] type The type of rendering to do either 'render' or 'rerender'.
   */

  Components.prototype.__componentRender = function(type) {
    var i, item, len, ref;
    if (this.length === 0) {
      this.triggerEvent('ready');
    } else {
      this.total = 0;
      ref = this._data;
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        item.controller.addEvent('ready', function() {
          if (++this.total === this.length) {
            return this.triggerEvent('ready');
          }
        }, this, 1);
        item[type]();
      }
    }
  };


  /*
    Renders all of its Components.
    @event ready Triggers ready event when itself and its sub-Components are ready/rendered.
   */

  Components.prototype.render = function() {
    this.__componentRender('render');
  };


  /*
    Re-render all of its Components.
    @event ready Triggers ready event when itself and its sub-Components are ready/re-rendered.
   */

  Components.prototype.rerender = function() {
    this.__componentRender('rerender');
  };


  /*
    Find Component with matching data in model.
    @param [String] property The property to find matching value against.
    @param [*] value Data to compare to.
    @return [Array] An array of matching Components.
   */

  Components.prototype.whereData = function(property, value) {
    var collectionKey, componentData, data, key, modelData, prop, result;
    result = [];
    componentData = this._data;
    for (collectionKey in componentData) {
      data = componentData[collectionKey];
      modelData = data.model.data || model.data;
      for (key in modelData) {
        prop = modelData[key];
        if (key === property && prop === value) {
          result.push(data);
        }
      }
    }
    return result;
  };


  /*
    Reset this Collection of components. Also destroys it's components (views removed from DOM).
    @event changed Triggers a generic event that the store has been updated.
   */

  Components.prototype.reset = function() {
    var i, item, len, ref;
    ref = this._data;
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      item.destroy();
    }
    Components.__super__.reset.call(this);
  };

  return Components;

})(tweak.Collection);
;
/*
  The future of MVC doesn't always lie in web applications; the architecture to
  TweakJS allows for integration of components anywhere on a website. For example
  you can plug "Web Components" into your static site; like sliders, accordions.
  The flexibility is endless; allowing MVC to be used from small web components
  to full scale one page web applications.

  TweakJS wraps its Models, Views, Templates, and Controllers into a Component
  module. The Component module acts intelligently to build up your application
  with simple configuration files. Each Component its built through a config
  object; this allows for powerful configuration with tonnes of flexibility.
  The config objects are extremely handy for making Components reusable, with
  easy accessible configuration settings.

  Each Component can have sub Components which are accessible in both directions;
  although it is recommended to keep functionality separate it sometimes comes in
  handy to have access to other parts of the application. Each Component can
  extend another Component, which will then inherent the models, views, templates,
  and controllers directly from that Component. If you however want to extend a
  Component using a different Model you can simply overwrite that model, or extend
  the functionality to the inherited model Components model.

  Examples are in JS, unless where CoffeeScript syntax may be unusual. Examples
  are not exact, and will not directly represent valid code; the aim of an example
  is to show how to roughly use a method.
 */
var slice = [].slice;

tweak.Component = (function() {
  Component.prototype.model = null;

  Component.prototype.view = null;

  Component.prototype.components = null;

  Component.prototype.controller = null;

  Component.prototype.router = null;

  Component.prototype.modules = ['controller', 'model', 'view', 'router', 'components'];


  /*
    @param [Object] relation Relation to the Component.
    @param [Object] options Configuration for the Component.
   */

  function Component(relation, options) {
    var j, k, len, len1, name, name2, prop, prop2, ref, ref1;
    if (options == null) {
      throw new Error('No options given');
    }
    relation = this.relation = relation === window ? {} : relation;
    if (relation.relation == null) {
      relation.relation = {};
    }
    this.parent = relation instanceof tweak.Component ? relation : relation.component || relation;
    this.root = this.parent.root || this;
    this.name = options.name;
    if (this.name == null) {
      throw new Error('No name given');
    }
    options.name = this.name = tweak.Common.relToAbs(this.parent.name || '', this.name);
    this.config = this.__buildConfig(options);
    if (this.config.router) {
      this.__addRouter();
    }
    this.__addModel();
    this.__addView();
    this.__addComponents();
    this.__addController();
    ref = this.modules;
    for (j = 0, len = ref.length; j < len; j++) {
      name = ref[j];
      if (!(prop = this[name])) {
        continue;
      }
      prop.parent = this.parent;
      prop.component = this;
      ref1 = this.modules;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        name2 = ref1[k];
        if (name !== name2 && (prop2 = this[name2])) {
          prop[name2] = prop2;
        }
      }
    }
  }


  /*
    When the component is initialised it's modules are also initialised.
   */

  Component.prototype.init = function() {
    var item, j, len, name, ref;
    ref = this.modules;
    for (j = 0, len = ref.length; j < len; j++) {
      name = ref[j];
      if (name !== 'view' && (item = this[name])) {
        if (typeof item.init === "function") {
          item.init();
        }
      }
    }
  };


  /*
    @private
    Builds the configuration object for the Component.
    @param [Object] options Component options.
    @return [Object] Combined config based on the components inheritance.
   */

  Component.prototype.__buildConfig = function(options) {
    var configs, extension, i, j, name, paths, ref, ref1, requested, result;
    configs = [];
    paths = this.paths = [];
    extension = this.name;
    if (options) {
      configs.push(tweak.Common.clone(options));
      if (options["extends"]) {
        extension = options["extends"];
      }
    }
    name = ((ref = this.parent) != null ? ref.name : void 0) || this.name;
    while (extension) {
      requested = tweak.Common.require(name, extension + "/config", tweak.strict ? null : {});
      paths.push(tweak.Common.relToAbs(name, extension));
      configs.push(tweak.Common.clone(requested));
      extension = requested["extends"];
    }
    result = configs[configs.length - 1];
    for (i = j = ref1 = configs.length - 2; ref1 <= 0 ? j <= 0 : j >= 0; i = ref1 <= 0 ? ++j : --j) {
      result = tweak.Common.combine(result, configs[i]);
    }
    if (result.model == null) {
      result.model = {};
    }
    if (result.view == null) {
      result.view = {};
    }
    if (result.controller == null) {
      result.controller = {};
    }
    if (result.components == null) {
      result.components = [];
    }
    if (result.events == null) {
      result.events = {};
    }
    return result;
  };


  /*
    @private
    Add a module to the Component, if module can't be found then it will use a surrogate object.
    @param [String] name Name of the module.
    @param [Object] surrogate Surrogate if the module can not be found.
    @param [...] params Parameters passed into the module on construction.
   */

  Component.prototype.__addModule = function() {
    var Module, module, name, params, surrogate;
    name = arguments[0], surrogate = arguments[1], params = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    Module = tweak.Common.findModule(this.paths, "./" + name, surrogate);
    module = this[name] = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Module, [this.config[name]].concat(slice.call(params)), function(){});
    module.component = this;
    module.root = this.root;
  };


  /*
    @private
    Short cut method to adding view using the addModule method.
    @param [...] params Parameters passed to into the view constructor.
   */

  Component.prototype.__addView = function() {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.__addModule.apply(this, ['view', tweak.View].concat(slice.call(params)));
  };


  /*
    @private
    Short cut method to adding Model using the addModule method.
    @param [...] params Parameters passed to into the model constructor.
   */

  Component.prototype.__addModel = function() {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.__addModule.apply(this, ['model', tweak.Model].concat(slice.call(params)));
  };


  /*
    @private
    Short cut method to adding controller using the addModule method.
    @param [...] params Parameters passed to into the controller constructor.
   */

  Component.prototype.__addController = function() {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.__addModule.apply(this, ['controller', tweak.Controller].concat(slice.call(params)));
  };


  /*
    @private
    Add module to this Component.
    @param [...] params Parameters passed to into the Components constructor.
   */

  Component.prototype.__addComponents = function() {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.__addModule.apply(this, ['components', tweak.Components].concat(slice.call(params)));
  };


  /*
    @private
    Short cut method to adding router using the addModule method.
    @param [...] params Parameters passed to into the router constructor.
   */

  Component.prototype.__addRouter = function() {
    var params;
    params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.__addModule.apply(this, ['router', tweak.Router].concat(slice.call(params)));
  };


  /*
    @private
    Reusable method to render and re-render.
    @param [String] type The type of rendering to do either 'render' or 'rerender'.
   */

  Component.prototype.__componentRender = function(type) {
    this.view.addEvent(type + "ed", function() {
      this.components.addEvent('ready', function() {
        return this.controller.triggerEvent('ready');
      }, this, 1);
      return this.components[type]();
    }, this, 1);
    this.view[type]();
  };


  /*
    Renders itself and its subcomponents.
    @event ready Triggers ready event when itself and its Components are ready/rendered.
   */

  Component.prototype.render = function() {
    var name;
    name = this.name;
    this.__componentRender('render');
  };


  /*
    Re-renders itself and its subcomponents.
    @event ready Triggers ready event when itself and its Components are ready/re-rendered.
   */

  Component.prototype.rerender = function() {
    this.__componentRender('rerender');
  };


  /*
    Destroy this Component. It will clear the view if it exists; and removes it from the Components Collection.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
   */

  Component.prototype.destroy = function(silent) {
    var components, i, item, j, len, ref;
    this.view.clear();
    components = this.relation.components;
    if (components != null) {
      i = 0;
      ref = components.data;
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        if (item.uid === this.uid) {
          components.remove(i, silent);
          return;
        }
        i++;
      }
    }
  };


  /*
    Short-cut to the controllers findEvent method.
  
    @overload findEvent(names, build)
      Find events on controller with a space separated string.
      @param [String] names The event name(s); split on a space.
      @param [Boolean] build (Default = false) Whether or not to add an event object to the controller when none can be found.
      @return [Array<Event>] All event objects that are found/created then it is returned in an Array.
  
    @overload findEvent(names, build)
      Find events on controller with an array of names (strings).
      @param [Array<String>] names An array of names (strings).
      @param [Boolean] build (Default = false) Whether or not to add an event object to the controller when none can be found.
      @return [Array<Event>] All the controllers event objects that are found/created then it is returned in an Array.
   */

  Component.prototype.findEvent = function(names, build) {
    return this.controller.findEvent(names, build);
  };


  /*
    Short-cut to the controllers addEvent method.
  
    @param [String, Array<String>] names The event name(s). Split on a space, or an array of event names.
    @param [Function] callback The event callback function.
    @param [Number] maximum (Default = null). The maximum calls on the event listener. After the total calls the events callback will not invoke.
    @param [Object] context The contextual object of which the event to be bound to.
   */

  Component.prototype.addEvent = function(names, callback, max, context) {
    return this.controller.addEvent(names, callback, max, context);
  };


  /*
    Short cut to the controllers removeEvent method.
  
    @param [String] names The event name(s). Split on a space, or an array of event names.
    @param [Function] callback (optional) The callback function of the event. If no specific callbacki s given then all the controller events under event name are removed.
    @param [Object] context (default = this) The contextual object of which the event is bound to. If this matches then it will be removed, however if set to null then all events no matter of context will be removed.
   */

  Component.prototype.removeEvent = function(names, callback, context) {
    return this.controller.removeEvent(names, callback, context);
  };


  /*
    Short cut to the controllers triggerEvent method.
  
    @overload triggerEvent(names, params)
      Trigger events on controller by name only.
      @param [String, Array<String>] names The event name(s). Split on a space, or an array of event names.
      @param [...] params Parameters to pass into the callback function.
  
    @overload triggerEvent(options, params)
      Trigger events on controller by name and context.
      @param [Object] options Options and limiters to check against callbacks.
      @param [...] params Parameters to pass into the callback function.
      @option options [String, Array<String>] names The event name(s). Split on a space, or an array of event names.
      @option options [Context] context (Default = null) The context of the callback to check against a callback.
   */

  Component.prototype.triggerEvent = function() {
    var names, params, ref;
    names = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return (ref = this.controller).triggerEvent.apply(ref, [names].concat(slice.call(params)));
  };


  /*
    Shortcut to the controllers updateEvent method.
  
    @param [String] names The event name(s). Split on a space, or an array of event names.
    @param [Object] options Optional limiters and update values.
    @option options [Object] context The contextual object to limit updating events to.
    @option options [Function] callback Callback function to limit updating events to.
    @option options [Number] max Set a new maximum calls to an event.
    @option options [Number] calls Set the amount of calls that has been triggered on this event.
    @option options [Boolean] reset (Default = false) If true then calls on an event get set back to 0.
    @option options [Boolean] listen Whether to enable or disable listening to event.
   */

  Component.prototype.updateEvent = function(names, options) {
    return this.controller.updateEvent(names, options);
  };


  /*
    Resets the controllers events to empty.
   */

  Component.prototype.resetEvents = function() {
    return this.controller.resetEvents();
  };


  /*
    This method is used to extract all data of a component. If there is an export method within the Component Controller
    then the Controller export method will be executed with the data returned from the method.
    @param [Object] limit Limit the data from model to be exported
    @return [Object] Extracted data from Component.
   */

  Component.prototype["export"] = function(limit) {
    var base;
    return (typeof (base = this.controller)["export"] === "function" ? base["export"]() : void 0) || {
      model: this.model["export"](limit, {
        components: this.components["export"]()
      })
    };
  };


  /*
    This method is used to import data into a component. If there is an import method within the Component Controller
    then the Controller import method will be executed with the data passed to the method.
    @param [Object] data Data to import to the Component.
    @option data [Object] model Object to import into the Component's Model.
    @option data [Array<Object>] components Array of Objects to import into the Component's Components.
   */

  Component.prototype["import"] = function(data) {
    if (this.controller["import"] != null) {
      return this.controller["import"](data);
    } else {
      if (data.model) {
        this.model["import"](data.model);
      }
      if (data.components) {
        return this.components["import"](data.components);
      }
    }
  };

  return Component;

})();
;
/*
  A Controller defines the business logic between other modules. It can be used to
  control data flow, logic and more. It should process the data from the Model,
  interactions and responses from the View, and control the logic between other
  modules.

  Examples are in JS, unless where CoffeeScript syntax may be unusual. Examples
  are not exact, and will not directly represent valid code; the aim of an example
  is to show how to roughly use a method.
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

tweak.Controller = (function(superClass) {
  extend(Controller, superClass);

  function Controller() {
    return Controller.__super__.constructor.apply(this, arguments);
  }


  /*
    By default, this does nothing during initialization unless it is overridden.
   */

  Controller.prototype.init = function() {};

  return Controller;

})(tweak.Events);
;
/*
  Simple cross browser history API. Upon changes to the history a change event is
  called. The ability to hook event listeners to the tweak.History API allows
  routes to be added accordingly, and for multiple Routers to be declared for
  better code structure.

  Examples are in JS, unless where CoffeeScript syntax may be unusual. Examples
  are not exact, and will not directly represent valid code; the aim of an example
  is to show how to roughly use a method.
 */
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

tweak.History = (function(superClass) {
  var __toggleListener;

  extend(History, superClass);

  History.prototype.usePush = true;

  History.prototype.useHash = false;

  History.prototype.started = false;

  History.prototype.root = '/';

  History.prototype.iframe = null;

  History.prototype.url = null;

  History.prototype.__interval = null;

  History.prototype.intervalRate = 50;


  /*
    Checks that the window and history is available.
    This addr support for the history to work outside of browsers
    if the window, history and location are set manually.
   */

  function History() {
    this.__checkChanged = bind(this.__checkChanged, this);
    if (typeof window !== 'undefined') {
      this.location = (this.window = window).location;
      this.history = window.history;
    }
  }


  /*
    Start listening to the URL changes to push back the history API if available.
    
    @param [Object] options An optional object to pass in optional arguments
    @option options [Boolean] useHash (default = false) Specify whether to use hashState if true then pushState will be set to false.
    @option options [Boolean] forceRefresh (default = false) When set to true then pushState and hashState will not be used.
    @option options [Number] interval (default = null) When set to a number this is what the refresh rate will be when an interval has to be used to check changes to the URL.
    @option options [Boolean] silent (default = false) If set to true then an initial change event trigger will not be called.
    
    @event changed When the URL is updated a change event is fired from tweak.History.
  
    @example Starting the history with auto configuration.
      tweak.History.start();
  
    @example Starting the history with forced HashState.
      tweak.History.start({
        hashState:true
      });
  
    @example Starting the history with forced PushState.
      tweak.History.start({
        pushState:true
      });
  
    @example Starting the history with forced refresh or page.
      tweak.History.start({
        forceRefresh:true
      });
  
    @example Starting the history with an interval rate for the polling speed for older browsers.
      tweak.History.start({
        hashState:true,
        interval: 100
      });
  
    @example Starting the history silently.
      tweak.History.start({
        hashState:true,
        silent: true
      });
   */

  History.prototype.start = function(options) {
    var body, frame, location, ref, root, url, useHash, usePush;
    if (options == null) {
      options = {};
    }
    if (this.started) {
      return;
    }
    this.started = true;
    usePush = this.usePush = options.useHash ? false : (ref = this.history) != null ? ref.pushState : void 0;
    useHash = this.useHash = !usePush;
    if (options.forceRefresh || (useHash && !('onhashchange' in this.window))) {
      this.usePush = this.useHash = useHash = usePush = false;
    }
    if (options.interval) {
      this.intervalRate = options.interval;
    }
    this.root = root = ("/" + (options.root || '/') + "/").replace(/^\/+|\/+$/g, '/');
    this.url = url = this.__getURL();
    location = this.location;
    if (useHash) {
      this.location.replace(root + "#" + (this.__getPath()) + (this.__getHash()));
    } else if (usePush && this.__getHash() !== '') {
      this.set(this.__getHash(), {
        replace: true
      });
    }
    if (!usePush && !useHash && !options.forceRefresh) {
      frame = document.createElement('iframe');
      frame.src = 'javascript:0';
      frame.style.display = 'none';
      frame.tabIndex = -1;
      body = document.body;
      this.iframe = body.insertBefore(frame, body.firstChild).contentWindow;
      this.__setHash(this.iframe, "#" + url, false);
    }
    this.__toggleListeners();
    if (!options.silent) {
      return this.triggerEvent('changed', this.url.replace(/^\/+/, ''));
    }
  };


  /*
   Stop tweak.History. Most likely useful for a web component that uses the history to change state,
   but if removed from page then component may want to stop the history.
   */

  History.prototype.stop = function() {
    this.__toggleListeners('remvoe');
    return this.started = false;
  };


  /*
    Set the URL and add the URL to history.
    
    @param [Object] options An optional object to pass in optional arguments.
    @option options [Boolean] replace (default = false) Specify whether to replace the current item in the history.
    @option options [Boolean] silent (default = true) Specify whether to allow triggering of event when setting the URL.
  
    @example Setting the History (updating the URL).
      tweak.History.set('/#/fake/url');
  
    @example Replacing the last History state (updating the URL).
      tweak.History.set('/#/fake/url', {
        replace:true
      });
  
    @example Setting the History (updating the URL) and calling history change event.
      tweak.History.set('/#/fake/url', {
        silent:false
      });
   */

  History.prototype.set = function(url, options) {
    var fullUrl, replace, root;
    if (options == null) {
      options = {};
    }
    if (!this.started) {
      return;
    }
    if (options.silent == null) {
      options.silent = true;
    }
    replace = options.replace;
    url = this.__getURL(url) || '';
    root = this.root;
    if (url === '' || url.charAt(0) === '?') {
      root = root.slice(0, -1) || '/';
    }
    fullUrl = "" + root + (url.replace(/^\/*/, ''));
    url = decodeURI(url.replace(/#.*$/, ''));
    if (this.url === url) {
      return;
    }
    this.url = url;
    if (this.usePush) {
      this.history[replace ? 'replaceState' : 'pushState']({}, document.title, fullUrl);
    } else if (this.useHash) {
      this.__setHash(this.window, url, replace);
      if (this.iframe && url !== this.__getHash(this.iframe)) {
        this.__setHash(this.iframe, url, replace);
      }
    } else {
      this.location.assign(fullURL);
      return;
    }
    if (!options.silent) {
      this.triggerEvent('changed', (this.url = url).replace(/^\/+/, ''));
    }
  };

  __toggleListener = function(prefix, type, fn) {
    var attach;
    if (window.addEventListener) {
      return element[prefix + 'EventListener'](type, fn);
    } else if (window.attachEvent) {
      attach = prefix === 'on' ? 'attach' : 'detach';
      return element[attach + 'Event']("prefix" + type, fn);
    } else {
      return element[prefix + type] = fn;
    }
  };


  /*
    @private
    Add listeners of remove history change listeners.
    @param [String] prefix (Default = 'add') Set the prefix - 'add' or 'remove'.
   */

  History.prototype.__toggleListeners = function(prefix) {
    if (prefix == null) {
      prefix = 'add';
    }
    if (this.pushState) {
      __toggleListener('popstate', this.__checkChanged);
    } else if (this.useHash && !this.iframe) {
      __toggleListener('hashchange', this.__checkChanged);
    } else if (this.useHash) {
      if (prefix === 'add') {
        this.__interval = setInterval(this.__checkChanged, this.intervalRate);
      } else {
        clearInterval(this.__interval);
        document.body.removeChild(this.iframe.frameElement);
        this.iframe = this.__interval = null;
      }
    }
  };


  /*
    @private
    Get the URL formatted without the hash.
    @param [Window] window The window to retrieve hash.
    @return Normalized URL without hash.
   */

  History.prototype.__getHash = function(window) {
    var match;
    match = (window || this).location.href.match(/#(.*)$/);
    if (match) {
      return match[1];
    } else {
      return '';
    }
  };


  /*
    @private
    Get search part of url
    @return search if it matches or return empty string.
   */

  History.prototype.__getSearch = function() {
    var match;
    match = this.location.href.replace(/#.*/, '').match(/\?.+/);
    if (match) {
      return match[0];
    } else {
      return '';
    }
  };


  /*
    @private
    Get the pathname and search parameters, without the root.
    @return Normalized URL.
   */

  History.prototype.__getPath = function() {
    var path, root;
    path = decodeURI("" + this.location.pathname + (this.__getSearch()));
    root = this.root.slice(0, -1);
    if (!path.indexOf(root)) {
      path = path.slice(root.length);
    }
    if (path.charAt(0) === '/') {
      return path.slice(1);
    } else {
      return path;
    }
  };


  /*
    @private
    Get a normalized URL.
    @param [String] URL The URL to normalize - if null then URL will be retrieved from window.location.
    @param [Boolean] force Force the returning value to be hash state.
    @return Normalized URL without trailing slashes at either side.
   */

  History.prototype.__getURL = function(url, force) {
    var root;
    if (url == null) {
      if (this.usePush || force) {
        url = decodeURI("" + this.location.pathname + this.location.search);
        root = this.root.replace(/\/$/, '');
        if (!url.indexOf(root)) {
          url = url.slice(root.length);
        }
      } else {
        url = this.__getHash();
      }
    }
    url = url.replace(/^\/{2,}/g, '/');
    if (!url.match(/^\/+/)) {
      url = "/" + url;
    }
    return url.replace(/\/+$/g, '');
  };


  /*
    @private
    Change the hash or replace the hash.
    @param [Location] location The location to amend the hash to. ieFrame.location or the window.location.
    @param [String] URL The URL to replace the current hash with.
    @param [Boolean] replace Whether to replace the hash by href or to change hash directly.
   */

  History.prototype.__setHash = function(window, url, replace) {
    if (this.iframe === window) {
      window.document.open().close();
    }
    if (replace) {
      window.location.replace((location.href.replace(/(javascript:|#).*$/, '')) + "#" + url);
    } else {
      window.location.hash = "" + url;
    }
  };


  /*
    @private
    Check whether the URL has been changed, if it has then trigger change event.
   */

  History.prototype.__checkChanged = function() {
    var now, old;
    now = this.__getURL();
    old = this.url;
    if (now === old) {
      if (this.iframe) {
        now = this.__getHash(this.iframe);
        this.set(now);
      } else {
        return false;
      }
    }
    this.triggerEvent('changed', this.url = now);
    return true;
  };

  return History;

})(tweak.Events);

tweak.History = new tweak.History();
;
/*
  A Model is used by other modules like the Controller to store, retrieve and
  listen to a set of data. Tweak.js will call events through its
  **event system** when it is updated, this makes it easy to listen to updates and
  to action as and when required. The Model’s data is not a database, but a JSON
  representation of its data can be exported and imported to and from storage
  sources. In Tweak.js the Model extends the Store module - which is the core
  functionality shared between the Model and Collection. The main difference
  between a Model and collection it the base of its storage. The Model uses an
  object to store its data and a collection base storage is an Array.

  Examples are in JS, unless where CoffeeScript syntax may be unusual. Examples
  are not exact, and will not directly represent valid code; the aim of an
  example is to show how to roughly use a method.
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

tweak.Model = (function(superClass) {
  extend(Model, superClass);

  Model.prototype._type = 'model';


  /*
    The constructor initialises the controllers unique ID and its initial data.
  
    @example Creating a Model with predefined set of data
      var model;
      model = new tweak.Model({
        'demo':true,
        'example':false,
        'position':99
      });
   */

  function Model(_data) {
    this._data = _data != null ? _data : {};
  }


  /*
    Remove a single property or many properties.
    @param [String, Array<String>] properties Array of property names to remove from a Model, or single String of the name of the property to remove.
    @param [Boolean] silent (optional, default = false) If true events are not triggered upon any changes.
  
    @event removed:#{key} Triggers an event based on what property has been removed.
    @event changed Triggers a generic event that the Model has been updated.
  
    @example Removing a single property.
      var model;
      model = new tweak.Model();
      model.remove('demo');
  
    @example Removing multiple properties.
      var model;
      model = new tweak.Model();
      model.remove(['demo', 'example']);
  
    @example Removing properties silently.
      var model;
      model = new tweak.Model();
      model.remove(['demo', 'example'], true);
      model.remove('position', true);
   */

  Model.prototype.remove = function(properties, silent) {
    var i, key, len, prop, property, ref;
    if (typeof properties === 'string') {
      properties = [properties];
    }
    for (i = 0, len = properties.length; i < len; i++) {
      property = properties[i];
      ref = this._data;
      for (key in ref) {
        prop = ref[key];
        if (!(key === property)) {
          continue;
        }
        this.length--;
        delete this._data[key];
        if (!silent) {
          this.triggerEvent("removed:" + key);
        }
      }
    }
    if (!silent) {
      this.triggerEvent('changed');
    }
  };


  /*
    Looks through the store for where the data matches.
    @param [*] property The property data to find a match against.
    @return [Array] Returns an array of the positions of the data.
   */

  Model.prototype.pluck = function(property) {
    var key, prop, ref, result;
    result = [];
    ref = this._data;
    for (key in ref) {
      prop = ref[key];
      if (prop === property) {
        result.push(key);
      }
    }
    return result;
  };


  /*
    Reset the Model back to defaults.
    @event changed Triggers a generic event that the Model has been updated.
   */

  Model.prototype.reset = function() {
    this._data = {};
    Model.__super__.reset.call(this);
  };

  return Model;

})(tweak.Store);
;
/*
  Web applications often provide linkable, bookmark, shareable URLs for important
  locations in the application. The Router module provides methods for routing to
  events which can control the application. Traditionally it used to be that
  routers worked from hash fragments (#page/22). However, the HTML5 History API now
  provides standard URL formats (/page/22). Routers provide functionality that
  links applications/components/modules together through data passed through the URL.

  The router's routes can be formatted as a string that provides additional easy
  management to routing of events. A route can contain the following structure.
  Which implements splats, parameters and optional parameters.
  
  @example Route with parameters
    Adding a route ':section:page' or ':section/:page' attached to the event of 'navigation', will trigger a
    'navigation' event and pass the following data with a similar HashState of '/#/5/93'.
    {
      url:'/5/93',
      data:{
        section:'5',
        page:'93'
      }
    }
  
  @example Route with parameters one being optional
    Adding a optional parameter route ':section?page' or ':section/?page' attached to the event of 'navigation',
    will trigger a 'navigation' event and pass the following data with a similar HashState of '/#/5/6'.
    {
      url:'/5/6',
      data:{
        section:'5',
        page:'6'
      }
    }

    Adding a optional parameter route ':section?page' or ':section/?page' attached to the event of 'navigation',
    will trigger a 'navigation' event and pass the following data with a similar HashState of '/#/5'.
    {
      url:'/5',
      data:{
        section:'5'
      }
    }
  
  @example Route with splat
    Adding a splat route ':section:page/*' or ':section/:page/*' attached to the event of 'navigation', will
    trigger a 'navigation' event and pass the following data with a similar HashState of '/#/5/6/www.example.com'.
    {
      url:'/5/6/www.example.com',
      data:{
        section:'5',
        page:'6',
        splat:'www.example.com'
      }
    }
  
  @example URL with query string
    When you want to use URLs that contain a query string, '/blog?id=9836384&light&reply=false', then the data
    sent back to an event will look like:
    {
      url:'/blog?id=9836384&light&reply=false',
      data:{
        blog:{
          id:9836384,
          light:'true',
          reply:'false'
        }
      }
    }

  Examples are in JS, unless where CoffeeScript syntax may be unusual. Examples
  are not exact, and will not directly represent valid code; the aim of an example
  is to show how to roughly use a method.
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

tweak.Router = (function(superClass) {
  var __getKeys, __getQueryData, __paramReg, __toRegex;

  extend(Router, superClass);

  Router.prototype.uid = 0;

  Router.prototype["super"] = tweak["super"];


  /*
    The constructor initialises the routers unique ID, routes, and event listening.
    
    @param [object] routes (optional, default = {}) An object containing event name based keys to an array of routes.
  
    @example Creating a Router with a set of predefined routes.
      var router;
      router = new tweak.Router({
        'navigation':[
          ':section/:page',
          /:website/:section/?page
        ],
        'demo':[
          ':splat/:example/*'
        ]
      });
   */

  function Router(routes1) {
    this.routes = routes1 != null ? routes1 : {};
    tweak.History.addEvent('changed', this.__urlChanged, this);
  }


  /*
    Add a route to the Router.
    @param [String] event The event name to add route to.
    @param [String, Reg-ex] route A string or Reg-ex formatted string or Reg-ex.
  
    @example Adding a single string formatted route to an event.
      var router;
      router = new tweak.Router();
      router.add('navigation', '/:section/:page');
  
    @example Adding a single Reg-ex formatted route to an event.
      var router;
      router = new tweak.Router();
      router.add('navigation', /^(*.)$/);
   */

  Router.prototype.add = function(event, route) {
    if (this.routes[event] != null) {
      this.routes[event].push(route);
    } else {
      this.routes[event] = [route];
    }
  };


  /*
    @overload remove(event, route)
      Remove a single string formatted route from an event.
      @param [String] event The event name to add route to.
      @param [String] route A string formatted string. (':section/:page')
  
    @overload remove(event, route)
      Remove a string containing multiple string formatted routes from an event.
      @param [String] event The event name to add route to.
      @param [String] route A string containing multiple string formatted routes. (':section/:page :section/:page/*')
  
    @overload remove(event, route)
      Remove a single Reg-ex formatted route from an event.
      @param [String] event The event name to add route to.
      @param [Boolean] route A Reg-ex formatted route. (/^.*$/)
    
    @example Removing a single string formatted route from an event
      var router;
      router = new tweak.Router();
      router.remove('navigation', '/:section/:page');
  
    @example Removing a multiple string formatted routes from an event.
      var router;
      router = new tweak.Router();
      router.remove('navigation', '/:section/:page /:website/:section/?page');
  
    @example Removing a single Reg-ex formatted route from an event.
      var router;
      router = new tweak.Router();
      router.remove('navigation', /^(*.)$/);
   */

  Router.prototype.remove = function(event, routes) {
    var i, key, len, ref, route, routers;
    routers = this.routes[event];
    if (typeof routes === 'string') {
      ref = (" " + (routes.replace(/\s+/g, ' ')) + " ").split(' ');
      for (i = 0, len = ref.length; i < len; i++) {
        route = ref[i];
        routers = (" " + (routers.join(' ')) + " ").split(" " + route + " ");
      }
    } else {
      for (key in routers) {
        route = routers[key];
        if (route === routes) {
          delete routers[key];
        }
      }
    }
    this.routes[event] = routers;
    if ((routers != null) && ((routes == null) || routers.length === 0)) {
      delete this.routes[event];
    }
  };


  /*
    @private
    Reg-ex to get parameters from a URL.
   */

  __paramReg = /\/?[?:]([^?\/:]*)/g;


  /*
    @private
    Checks URL segment to see if it can extract additional data when formatted like a query string.
    @param [String] segment The URL segment to extract additional data when formatted as a query string.
    @return [Object, String] Extracted data of given segment parameter.
   */

  __getQueryData = function(segment) {
    var i, key, len, option, params, prop, props, query;
    query = /^.*\?(.+)/.exec(segment);
    if (query) {
      params = /([^&]+)&*/.exec(query[1]);
      if (params) {
        for (i = 0, len = params.length; i < len; i++) {
          option = params[i];
          segment = {};
          props = /(.+)[:=]+(.+)|(.+)/.exec(segment);
          if (props) {
            key = props[3] || props[1];
            prop = props[2] || 'true';
            segment[key] = prop;
          }
        }
      }
    } else if (segment) {
      segment = segment.replace(/\?/g, '');
    }
    return segment;
  };


  /*
    @private
    Converts a string formatted route into its Reg-ex counterpart.
    @param [String] route The route to convert into a Reg-ex formatted route.
    @return [Reg-ex] The Reg-ex formatted route of given string formatted route.
   */

  __toRegex = function(route) {
    var escapeReg, splatReg;
    escapeReg = /[\-\\\^\[\]\s{}+.,$|#]/g;
    splatReg = /\/?(\*)$/;
    route = route.replace(escapeReg, '\\$&');
    route = route.replace(__paramReg, function(match) {
      var res;
      res = '\\/?([^\\/]*?)';
      if (/^\/?\?/.exec(match)) {
        return "(?:" + res + ")?";
      } else {
        return res;
      }
    });
    route = route.replace(splatReg, '\\/?(.*?)');
    return new RegExp("^" + route + "[\\/\\s]?$");
  };


  /*
    @private
    Get the parameter keys from a string formatted route to use as the data passed to event.
    @param [String] route The string formatted route to get parameter keys from.
   */

  __getKeys = function(route) {
    var res;
    res = route.match(__paramReg) || [];
    res.push('splat');
    return res;
  };


  /*
    @private
    When history event is made this method is called to check this Routers events to see if any route events can be triggered.
    @param [String] url A URL to check route events to.
    @event {event_name} Triggers a route event with passed in data from URL.
   */

  Router.prototype.__urlChanged = function(url) {
    var event, item, key, keys, match, ref, res, results, route, routes;
    url = url.replace(/^\/+|\/+$/g, '');
    ref = this.routes;
    results = [];
    for (event in ref) {
      routes = ref[event];
      results.push((function() {
        var i, j, len, len1, ref1, results1;
        results1 = [];
        for (i = 0, len = routes.length; i < len; i++) {
          route = routes[i];
          keys = [];
          if (typeof route === 'string') {
            keys = __getKeys(route);
            route = __toRegex(route);
          }
          if (match = route.exec(url)) {
            res = {
              url: url,
              data: {}
            };
            match.splice(0, 1);
            key = 0;
            for (j = 0, len1 = match.length; j < len1; j++) {
              item = match[j];
              res.data[((ref1 = keys[key]) != null ? ref1.replace(/^[?:\/]*/, '') : void 0) || key] = __getQueryData(item);
              key++;
            }
            results1.push(this.triggerEvent(event, res));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  return Router;

})(tweak.Events);
;
/*
  A View is a module used as a presentation layer. Which is used to render,
  manipulate and listen to an interface. The Model, View and Controller separates
  logic of the Views interaction to that of data and functionality. This helps to
  keep code organized and tangle free - the View should primarily be used to render,
  manipulate and listen to the presentation layer. A View consists of a template to
  which data is bound to and rendered/re-rendered.

  Examples are in JS, unless where CoffeeScript syntax may be unusual. Examples
  are not exact, and will not directly represent valid code; the aim of an example
  is to show how to roughly use a method.
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

tweak.View = (function(superClass) {
  var $;

  extend(View, superClass);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  $ = tweak.$;


  /*
    Default initialiser function - called when the View has rendered
   */

  View.prototype.init = function() {};


  /*
    Default template method. This is used to generate a html fro a template engine ect, to be used during the rendering
    process.By default this method will generate a template through handlebars, it will also seek out the handlebars
    template through the module loader.
    @return [String] Returns a string representaion of HTML to attach to view during render.
   */

  View.prototype.template = function() {
    var config;
    config = this.component.config.view || {};
    return (config.template ? tweak.Common.require(config.template) : tweak.Common.findModule(this.component.paths, './template'))(config.data || this.model._data);
  };


  /*
    Default attach method. This is used to attach a HTML string to an element. You can override this method with your
    own attachment functionality.
  
    @param [DOMElement] element A DOMElement or a string representing a selector query if using a selector engine.
    @param [String] content A HTML representation of a string
    @return [DOMElement] Returns athe attached DOMElement
   */

  View.prototype.attach = function(parent, content) {
    var e, i, item, len, method, num, ref, ref1, ref2;
    content = $(content)[0];
    switch (method = (ref = this.component.config.view) != null ? (ref1 = ref.attach) != null ? ref1.method : void 0 : void 0) {
      case 'prefix':
      case 'before':
        parent.insertBefore(content, parent.firstChild);
        return parent.firstElementChild;
      case 'replace':
        ref2 = parent.children;
        for (i = 0, len = ref2.length; i < len; i++) {
          item = ref2[i];
          try {
            parent.removeChild(item);
          } catch (_error) {
            e = _error;
          }
        }
        parent.appendChild(content);
        return parent.firstElementChild;
      default:
        if (/^\d+$/.test("" + method)) {
          num = Number(method);
          parent.insertBefore(content, parent.children[num]);
          return parent.children[num];
        } else {
          parent.appendChild(content);
          return parent.lastElementChild;
        }
    }
  };


  /*
    Checks to see if the item is attached to ; this is determined if the node has a parentNode.
    @return [Boolean] Returns whether the View has been rendered.
   */

  View.prototype.isAttached = function(element, parent) {
    if (element == null) {
      element = this.el;
    }
    if (parent == null) {
      parent = document.documentElement;
    }
    return parent.contains(element);
  };


  /*
    Renders the View, using a html template engine. The View is loaded asynchronously, this prevents the DOM from
    from congesting during rendering. The View won't be rendered until its parent View is rendered and any other
    components Views that are waiting to be rendered; this makes sure that components are rendered into in there
    correct positions.
    
    @param [Boolean] silent (Optional, default = false) If true events are not triggered upon any changes.
    @event rendered The event is called when the View has been rendered.
   */

  View.prototype.render = function(silent) {
    var _getAttachment, attachTo, attachment, classNames, config, name, names, parent, ref, ref1, ref2;
    if (this.isAttached() && !silent) {
      return this.triggerEvent('rendered');
    }
    config = this.component.config.view;
    _getAttachment = (function(_this) {
      return function(parent) {
        var check, child, name, ref;
        child = null;
        if (!parent) {
          return;
        }
        check = function(elements) {
          var attachment, i, len, prop, results, val;
          results = [];
          for (i = 0, len = elements.length; i < len; i++) {
            prop = elements[i];
            if (child) {
              break;
            }
            attachment = prop.getAttribute('data-attach');
            if ((attachment != null) && !attachment.match(/\s+/)) {
              results.push((function() {
                var j, len1, ref, results1;
                ref = tweak.Common.splitMultiName(this.component.parent.name || '', attachment);
                results1 = [];
                for (j = 0, len1 = ref.length; j < len1; j++) {
                  val = ref[j];
                  if (name === val) {
                    child = prop;
                    break;
                  } else {
                    results1.push(void 0);
                  }
                }
                return results1;
              }).call(_this));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
        name = ((ref = config.attach) != null ? ref.to : void 0) || _this.component.name;
        check(parent);
        check($('[data-attach]', parent));
        return child;
      };
    })(this);
    attachTo = (config != null ? (ref = config.attach) != null ? ref.to : void 0 : void 0) || this.component.name;
    parent = (ref1 = this.component.parent) != null ? (ref2 = ref1.view) != null ? ref2.el : void 0 : void 0;
    attachment = _getAttachment(parent) || _getAttachment(document.documentElement) || parent || document.documentElement;
    this.$el = $(this.attach(attachment, this.template()));
    this.el = this.$el[0];
    names = tweak.Common.clone(this.component.paths);
    if (names.indexOf(this.component.name) === -1) {
      names.unshift(this.component.name);
    }
    classNames = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = names.length; i < len; i++) {
        name = names[i];
        results.push(name.replace(/[\/\\]/g, '-'));
      }
      return results;
    })();
    this.$el.addClass(classNames.join(' '));
    if (!silent) {
      this.triggerEvent('rendered');
    }
    this.init();
  };


  /*
    Clears and element and removes event listeners on itself and child DOM elements.
    @param [String, DOMElement] element A DOMElement or a string representing a selector query if using a selector engine.
   */

  View.prototype.clear = function(element) {
    if (element == null) {
      element = this.el;
    }
    $(element).remove();
  };


  /*
    Select a DOMElement using a selector engine dependency affixed to the tweak.Selector object.
    @param [String, DOMElement] element A DOMElement or a string representing a selector query if using a selector engine.
    @param [DOMElement] root (Default = @el) The element root to search for elements with a selector engine.
    @return [Array<DOMElement>] An array of DOMElements.
   */

  View.prototype.element = function(element, root) {
    var i, item, len, results;
    if (root == null) {
      root = this.el;
    }
    if (element instanceof Array) {
      results = [];
      for (i = 0, len = element.length; i < len; i++) {
        item = element[i];
        results.push($(item, root));
      }
      return results;
    } else {
      return $(element, root);
    }
  };

  return View;

})(tweak.Events);
;
//# sourceMappingURL=tweak.js.map