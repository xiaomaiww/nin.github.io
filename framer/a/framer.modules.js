require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"ViewNavigationController":[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.ViewNavigationController = (function(superClass) {
  var ANIMATION_OPTIONS, BACKBUTTON_VIEW_NAME, BACK_BUTTON_FRAME, DEBUG_MODE, DIR, INITIAL_VIEW_NAME, PUSH;

  extend(ViewNavigationController, superClass);

  INITIAL_VIEW_NAME = "initialView";

  BACKBUTTON_VIEW_NAME = "vnc-backButton";

  ANIMATION_OPTIONS = {
    time: 0.3,
    curve: "ease-in-out"
  };

  BACK_BUTTON_FRAME = {
    x: 0,
    y: 20,
    width: 44,
    height: 44
  };

  PUSH = {
    UP: "pushUp",
    DOWN: "pushDown",
    LEFT: "pushLeft",
    RIGHT: "pushRight",
    CENTER: "pushCenter"
  };

  DIR = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right"
  };

  DEBUG_MODE = false;

  function ViewNavigationController(options) {
    var base, base1, base2, base3;
    this.options = options != null ? options : {};
    this.views = this.history = this.initialView = this.currentView = this.previousView = this.initialViewName = null;
    if ((base = this.options).width == null) {
      base.width = Screen.width;
    }
    if ((base1 = this.options).height == null) {
      base1.height = Screen.height;
    }
    if ((base2 = this.options).clip == null) {
      base2.clip = true;
    }
    if ((base3 = this.options).backgroundColor == null) {
      base3.backgroundColor = "#999";
    }
    ViewNavigationController.__super__.constructor.call(this, this.options);
    this.views = [];
    this.history = [];
    this.animationOptions = this.options.animationOptions || ANIMATION_OPTIONS;
    this.initialViewName = this.options.initialViewName || INITIAL_VIEW_NAME;
    this.backButtonFrame = this.options.backButtonFrame || BACK_BUTTON_FRAME;
    this.debugMode = this.options.debugMode != null ? this.options.debugMode : DEBUG_MODE;
    this.on("change:subLayers", function(changeList) {
      return Utils.delay(0, (function(_this) {
        return function() {
          var i, len, ref, results, subLayer;
          ref = changeList.added;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subLayer = ref[i];
            results.push(_this.addView(subLayer, true));
          }
          return results;
        };
      })(this));
    });
  }

  ViewNavigationController.prototype.addView = function(view, viaInternalChangeEvent) {
    var obj, vncHeight, vncWidth;
    vncWidth = this.options.width;
    vncHeight = this.options.height;
    view.states.add((
      obj = {},
      obj["" + PUSH.UP] = {
        x: 0,
        y: -vncHeight
      },
      obj["" + PUSH.LEFT] = {
        x: -vncWidth,
        y: 0
      },
      obj["" + PUSH.CENTER] = {
        x: 0,
        y: 0
      },
      obj["" + PUSH.RIGHT] = {
        x: vncWidth,
        y: 0
      },
      obj["" + PUSH.DOWN] = {
        x: 0,
        y: vncHeight
      },
      obj
    ));
    view.states.animationOptions = this.animationOptions;
    if (view.name === this.initialViewName) {
      this.initialView = view;
      this.currentView = view;
      view.states.switchInstant(PUSH.CENTER);
      this.history.push(view);
    } else {
      view.states.switchInstant(PUSH.RIGHT);
    }
    if (!(view.superLayer === this || viaInternalChangeEvent)) {
      view.superLayer = this;
    }
    if (view.name !== this.initialViewName) {
      this._applyBackButton(view);
    }
    return this.views.push(view);
  };

  ViewNavigationController.prototype.transition = function(view, direction, switchInstant, preventHistory) {
    if (direction == null) {
      direction = DIR.RIGHT;
    }
    if (switchInstant == null) {
      switchInstant = false;
    }
    if (preventHistory == null) {
      preventHistory = false;
    }
    if (view === this.currentView) {
      return false;
    }
    if (direction === DIR.RIGHT) {
      view.states.switchInstant(PUSH.RIGHT);
      this.currentView.states["switch"](PUSH.LEFT);
    } else if (direction === DIR.DOWN) {
      view.states.switchInstant(PUSH.DOWN);
      this.currentView.states["switch"](PUSH.UP);
    } else if (direction === DIR.LEFT) {
      view.states.switchInstant(PUSH.LEFT);
      this.currentView.states["switch"](PUSH.RIGHT);
    } else if (direction === DIR.UP) {
      view.states.switchInstant(PUSH.UP);
      this.currentView.states["switch"](PUSH.DOWN);
    } else {
      view.states.switchInstant(PUSH.CENTER);
      this.currentView.states.switchInstant(PUSH.LEFT);
    }
    view.states["switch"](PUSH.CENTER);
    this.previousView = this.currentView;
    this.previousView.custom = {
      lastTransition: direction
    };
    this.currentView = view;
    if (preventHistory === false) {
      this.history.push(this.previousView);
    }
    return this.emit("change:view");
  };

  ViewNavigationController.prototype.removeBackButton = function(view) {
    return Utils.delay(0.1, (function(_this) {
      return function() {
        return view.subLayersByName(BACKBUTTON_VIEW_NAME)[0].visible = false;
      };
    })(this));
  };

  ViewNavigationController.prototype.back = function() {
    var direction, lastTransition, lastView, oppositeTransition, preventHistory, switchInstant;
    lastView = this._getLastHistoryItem();
    lastTransition = lastView.custom.lastTransition;
    oppositeTransition = this._getOppositeDirection(lastTransition);
    this.transition(lastView, direction = oppositeTransition, switchInstant = false, preventHistory = true);
    return this.history.pop();
  };

  ViewNavigationController.prototype._getLastHistoryItem = function() {
    return this.history[this.history.length - 1];
  };

  ViewNavigationController.prototype._applyBackButton = function(view, frame) {
    if (frame == null) {
      frame = this.backButtonFrame;
    }
    return Utils.delay(0, (function(_this) {
      return function() {
        var backButton;
        if (view.backButton !== false) {
          backButton = new Layer({
            name: BACKBUTTON_VIEW_NAME,
            width: 80,
            height: 80,
            superLayer: view
          });
          if (_this.debugMode === false) {
            backButton.backgroundColor = "transparent";
          }
          backButton.frame = frame;
          return backButton.on(Events.Click, function() {
            return _this.back();
          });
        }
      };
    })(this));
  };

  ViewNavigationController.prototype._getOppositeDirection = function(initialDirection) {
    if (initialDirection === DIR.UP) {
      return DIR.DOWN;
    } else if (initialDirection === DIR.DOWN) {
      return DIR.UP;
    } else if (initialDirection === DIR.RIGHT) {
      return DIR.LEFT;
    } else if (initialDirection === DIR.LEFT) {
      return DIR.RIGHT;
    } else {
      return DIR.LEFT;
    }
  };

  return ViewNavigationController;

})(Layer);

 

/*

USAGE EXAMPLE 1 - Define InitialViewName

initialViewKey = "view1"

vnc = new ViewNavigationController
	initialViewName: initialViewKey

view1 = new Layer
	name: initialViewKey
	width:  Screen.width
	height: Screen.height
	backgroundColor: "red"
	parent: vnc
 */


/*

USAGE EXAMPLE 2 - Use default initialViewName "initialView"

vnc = new ViewNavigationController

view1 = new Layer
	name: "initialView"
	width:  Screen.width
	height: Screen.height
	backgroundColor: "red"
	parent: vnc

view2 = new Layer
	width:  Screen.width
	height: Screen.height
	backgroundColor: "green"
	parent: vnc

view1.onClick ->
	vnc.transition view2

view2.onClick ->
	vnc.back()
 */

/*上部分是切换屏加后退，下部分是下拉刷新*/
},{}],"Hook":[function(require,module,exports){

/*
--------------------------------------------------------------------------------
Hook module for Framer
--------------------------------------------------------------------------------

by:      Sigurd Mannsåker
github:  https://github.com/sigtm/framer-hook

················································································


The Hook module simply expands the Layer prototype, and lets you make any
numeric Layer property follow another property - either its own or another
object's - via a spring or gravity attraction.


--------------------------------------------------------------------------------
Example: Layered animation (eased + spring)
--------------------------------------------------------------------------------

myLayer = new Layer

 * Make our own custom property for the x property to follow
myLayer.easedX = 0

 * Hook x to easedX via a spring
myLayer.hook
	property: "x"
	targetProperty: "easedX"
	type: "spring(150, 15)"

 * Animate easedX
myLayer.animate
	properties:
		easedX: 200
	time: 0.15
	curve: "cubic-bezier(0.2, 0, 0.4, 1)"

NOTE: 
To attach both the x and y position, use "pos", "midPos" or "maxPos" as the
property/targetProperty.


--------------------------------------------------------------------------------
Example: Hooking property to another layer
--------------------------------------------------------------------------------

target = new Layer
hooked = new Layer

hooked.hook
	property: "scale"
	to: target
	type: "spring(150, 15)"

The "hooked" layer's scale will now continuously follow the target layer's scale
with a spring animation.


--------------------------------------------------------------------------------
layer.hook(options)
--------------------------------------------------------------------------------

Options are passed as a single object, like you would for a new Layer.
The options object takes the following properties:


property [String]
-----------------
The property you'd like to hook onto another object's property


type [String]
-------------
Either "spring(strength, friction)" or "gravity(strength, drag)". Only the last
specified drag value is used for each property, since it is only applied to
each property once (and only if it has a gravity hook applied to it.)


to [Object] (Optional)
----------------------
The object to attach it to. Defaults to itself.


targetProperty [String] (Optional)
----------------------------------
Specify the target object's property to follow, if you don't want to follow
the same property that the hook is applied to.


modulator [Function] (Optional)
-------------------------------
The modulator function receives the target property's value, and lets you
modify it before it is fed into the physics calculations. Useful for anything
from standard Utils.modulate() type stuff to snapping and conditional values.


zoom [Number] (Optional)
------------------------
This factor defines the distance that 1px represents in regards to gravity and
drag calculations. Only one value is stored per layer, so specifying it
overwrites its existing value. Default is 100.


--------------------------------------------------------------------------------
layer.unHook(property, object)
--------------------------------------------------------------------------------

This removes all hooks for a given property and target object. Example:

 * Hook it
layer.hook
	property: "x"
	to: "otherlayer"
	targetProperty: "y"
	type: "spring(200,20)"

 * Unhook it
layer.unHook "x", otherlayer


--------------------------------------------------------------------------------
layer.onHookUpdate(delta)
--------------------------------------------------------------------------------

After a layer is done applying accelerations to its hooked properties, it calls
onHookUpdate() at the end of each frame, if it is defined. This is an easy way
to animate or trigger other stuff, perhaps based on your layer's updated
properties or velocities.

The delta value from the Framer loop is passed on to onHookUpdate() as well,
which is the time in seconds since the last animation frame.

Note that if you unhook all your hooks, onHookUpdate() will of course no longer
be called for that layer.
 */
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start === 'number') {
      start = 0;
    }
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

Layer.prototype.hook = function(config) {
  var base, base1, f, name;
  if (!(config.property && config.type && (config.to || config.targetProperty))) {
    throw new Error('layer.hook() needs a property, a hook type and either a target object or target property to work');
  }
  if (this.hooks == null) {
    this.hooks = {
      hooks: [],
      velocities: {},
      defs: {
        zoom: 100,
        getDrag: (function(_this) {
          return function(velocity, drag, zoom) {
            velocity /= zoom;
            drag = -(drag / 10) * velocity * velocity * velocity / Math.abs(velocity);
            if (_.isNaN(drag)) {
              return 0;
            } else {
              return drag;
            }
          };
        })(this),
        getGravity: (function(_this) {
          return function(strength, distance, zoom) {
            var dist;
            dist = Math.max(1, distance / zoom);
            return strength * zoom / (dist * dist);
          };
        })(this)
      }
    };
  }
  if (config.zoom) {
    this.hooks.zoom = config.zoom;
  }
  f = Utils.parseFunction(config.type);
  config.type = f.name;
  config.strength = f.args[0];
  config.friction = f.args[1] || 0;
  if (config.targetProperty == null) {
    config.targetProperty = config.property;
  }
  if (config.to == null) {
    config.to = this;
  }
  if (config.property.toLowerCase().includes('pos')) {
    config.prop = 'pos';
    if (config.property.toLowerCase().includes('mid')) {
      config.thisX = 'midX';
      config.thisY = 'midY';
    } else if (config.property.toLowerCase().includes('max')) {
      config.thisX = 'maxX';
      config.thisY = 'maxY';
    } else {
      config.thisX = 'x';
      config.thisY = 'y';
    }
    if (config.targetProperty.toLowerCase().includes('mid')) {
      config.toX = 'midX';
      config.toY = 'midY';
    } else if (config.targetProperty.toLowerCase().includes('max')) {
      config.toX = 'maxX';
      config.toY = 'maxY';
    } else {
      config.toX = 'x';
      config.toY = 'y';
    }
  } else {
    config.prop = config.property;
  }
  this.hooks.hooks.push(config);
  if ((base = this.hooks.velocities)[name = config.prop] == null) {
    base[name] = config.prop === 'pos' ? {
      x: 0,
      y: 0
    } : 0;
  }
  return (base1 = this.hooks).emitter != null ? base1.emitter : base1.emitter = Framer.Loop.on('render', this.hookLoop, this);
};

Layer.prototype.unHook = function(property, object) {
  var prop, remaining;
  if (!this.hooks) {
    return;
  }
  prop = property.toLowerCase().includes('pos') ? 'pos' : property;
  this.hooks.hooks = this.hooks.hooks.filter(function(hook) {
    return hook.to !== object || hook.property !== property;
  });
  if (this.hooks.hooks.length === 0) {
    delete this.hooks;
    Framer.Loop.removeListener('render', this.hookLoop);
    return;
  }
  remaining = this.hooks.hooks.filter(function(hook) {
    return prop === hook.prop;
  });
  if (remaining.length === 0) {
    return delete this.hooks.velocities[prop];
  }
};

Layer.prototype.hookLoop = function(delta) {
  var acceleration, damper, drag, force, gravity, hook, i, len, name, prop, ref, ref1, target, vLength, vector, velocity;
  if (this.hooks) {
    acceleration = {};
    drag = {};
    ref = this.hooks.hooks;
    for (i = 0, len = ref.length; i < len; i++) {
      hook = ref[i];
      if (hook.prop === 'pos') {
        if (acceleration.pos == null) {
          acceleration.pos = {
            x: 0,
            y: 0
          };
        }
        target = {
          x: hook.to[hook.toX],
          y: hook.to[hook.toY]
        };
        if (hook.modulator) {
          target = hook.modulator(target);
        }
        vector = {
          x: target.x - this[hook.thisX],
          y: target.y - this[hook.thisY]
        };
        vLength = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
        if (hook.type === 'spring') {
          damper = {
            x: -hook.friction * this.hooks.velocities.pos.x,
            y: -hook.friction * this.hooks.velocities.pos.y
          };
          vector.x *= hook.strength;
          vector.y *= hook.strength;
          acceleration.pos.x += (vector.x + damper.x) * delta;
          acceleration.pos.y += (vector.y + damper.y) * delta;
        } else if (hook.type === 'gravity') {
          drag.pos = hook.friction;
          gravity = this.hooks.defs.getGravity(hook.strength, vLength, this.hooks.defs.zoom);
          vector.x *= gravity / vLength;
          vector.y *= gravity / vLength;
          acceleration.pos.x += vector.x * delta;
          acceleration.pos.y += vector.y * delta;
        }
      } else {
        if (acceleration[name = hook.prop] == null) {
          acceleration[name] = 0;
        }
        target = hook.to[hook.targetProperty];
        if (hook.modulator) {
          target = hook.modulator(target);
        }
        vector = target - this[hook.prop];
        if (hook.type === 'spring') {
          force = vector * hook.strength;
          damper = -hook.friction * this.hooks.velocities[hook.prop];
          acceleration[hook.prop] += (force + damper) * delta;
        } else if (hook.type === 'gravity') {
          drag[hook.prop] = hook.friction;
          force = this.hooks.defs.getGravity(hook.strength, vector, this.hooks.defs.zoom);
          acceleration[hook.prop] += force * delta;
        }
      }
    }
    ref1 = this.hooks.velocities;
    for (prop in ref1) {
      velocity = ref1[prop];
      if (prop === 'pos') {
        if (drag.pos) {
          velocity.x += this.hooks.defs.getDrag(velocity.x, drag.pos, this.hooks.defs.zoom);
          velocity.y += this.hooks.defs.getDrag(velocity.y, drag.pos, this.hooks.defs.zoom);
        }
        velocity.x += acceleration.pos.x;
        velocity.y += acceleration.pos.y;
        this.x += velocity.x * delta;
        this.y += velocity.y * delta;
      } else {
        if (drag[prop]) {
          this.hooks.velocities[prop] += this.hooks.defs.getDrag(this.hooks.velocities[prop], drag[prop], this.hooks.defs.zoom);
        }
        this.hooks.velocities[prop] += acceleration[prop];
        this[prop] += this.hooks.velocities[prop] * delta;
      }
    }
    return typeof this.onHookUpdate === "function" ? this.onHookUpdate(delta) : void 0;
  }
};

/*上部分是下拉刷新，下部分是字母排列*/
},{}],"contacts":[function(require,module,exports){
exports.people = {
  A: {
    names: ["Aaron Carámbula", "Adam Michela", "Adria Jimenez", "Andy Ngo"],
    images: ["images/contacts/aaron.png", "images/contacts/adam.png", "images/contacts/adria.png", "images/contacts/andy.png"]
  },
  B: {
    names: ["Ben Adamson", "Benjamin den Boer", "Blaise DiPersia", "Brandon Souba"],
    images: ["images/contacts/ben2.png", "images/contacts/ben.png", "images/contacts/blaise.png", "images/contacts/brandon.png"]
  },
  C: {
    names: ["Carlos Albertos", "Cemre Güngör", "Christian Baroni", "Christophe Tauziet"],
    images: ["images/contacts/carlos.png", "images/contacts/cemre.png", "images/contacts/christian.png", "images/contacts/christophe.png"]
  },
  D: {
    names: ["Daniël van der Winden", "David Lee", "David van Leeuwen", "Dominik Wiegand"],
    images: ["images/contacts/daniel.png", "images/contacts/david.png", "images/contacts/david2.png", "images/contacts/dominik.png"]
  },
  E: {
    names: ["Ed Chao", "Edward Sanchez", "Edwin van Rijkom", "Elliott Kember"],
    images: ["images/contacts/ed.png", "images/contacts/edward.png", "images/contacts/edwin.png", "images/contacts/elliott.png"]
  },
  F: {
    names: ["Fabrizio Bellomo", "Florian Ludwig", "Floris Verloop", "Fran Pérez"],
    images: ["images/contacts/fabrizio.png", "images/contacts/florian.png", "images/contacts/floris.png", "images/contacts/fran.png"]
  },
  G: {
    names: ["Gavin McFarland", "Geoff Teehan", "George Kedenburg III", "Giel Cobben"],
    images: ["images/contacts/gavin.png", "images/contacts/geoff.png", "images/contacts/george.png", "images/contacts/giel.png"]
  }
};

/*上部分是字母排列  下部分是切换2代，*/
},{}],"ViewNavigationController2":[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.ViewNavigationController2 = (function(superClass2) {
  var ANIMATION_OPTIONS2, BACKBUTTON_VIEW_NAME2, BACK_BUTTON_FRAME2, DEBUG_MODE2, DIR2, INITIAL_VIEW_NAME2, PUSH2;

  extend(ViewNavigationController2, superClass2);

  INITIAL_VIEW_NAME2 = "initialView2";

  BACKBUTTON_VIEW_NAME2 = "vnc-backButton2";

  ANIMATION_OPTIONS2 = {
    time: 0.3,
    curve: "ease-in-out"
  };

  BACK_BUTTON_FRAME2 = {
    x: 0,
    y: 20,
    width: 44,
    height: 44
  };

  PUSH2 = {
    UP: "pushUp",
    DOWN: "pushDown",
    LEFT: "pushLeft",
    RIGHT: "pushRight",
    CENTER: "pushCenter"
  };

  DIR2 = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right"
  };

  DEBUG_MODE2 = false;

  function ViewNavigationController2(options) {
    var base, base1, base2, base3;
    this.options = options != null ? options : {};
    this.views = this.history = this.initialView2 = this.currentView = this.previousView = this.initialViewName = null;
    if ((base = this.options).width == null) {
      base.width = Screen.width;
    }
    if ((base1 = this.options).height == null) {
      base1.height = Screen.height;
    }
    if ((base2 = this.options).clip == null) {
      base2.clip = true;
    }
    if ((base3 = this.options).backgroundColor == null) {
      base3.backgroundColor = "#999";
    }
    ViewNavigationController2.__super__.constructor.call(this, this.options);
    this.views = [];
    this.history = [];
    this.animationOptions = this.options.animationOptions || ANIMATION_OPTIONS2;
    this.initialViewName = this.options.initialViewName || INITIAL_VIEW_NAME2;
    this.backButtonFrame = this.options.backButtonFrame || BACK_BUTTON_FRAME2;
    this.debugMode = this.options.debugMode != null ? this.options.debugMode : DEBUG_MODE2;
    this.on("change:subLayers", function(changeList) {
      return Utils.delay(0, (function(_this) {
        return function() {
          var i, len, ref, results, subLayer;
          ref = changeList.added;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subLayer = ref[i];
            results.push(_this.addView(subLayer, true));
          }
          return results;
        };
      })(this));
    });
  }

  ViewNavigationController2.prototype.addView = function(view, viaInternalChangeEvent) {
    var obj, vncHeight, vncWidth;
    vncWidth = this.options.width;
    vncHeight = this.options.height;
    view.states.add((
      obj = {},
      obj["" + PUSH2.UP] = {
        x: 0,
        y: -vncHeight
      },
      obj["" + PUSH2.LEFT] = {
        x: -vncWidth,
        y: 0
      },
      obj["" + PUSH2.CENTER] = {
        x: 0,
        y: 0
      },
      obj["" + PUSH2.RIGHT] = {
        x: vncWidth,
        y: 0
      },
      obj["" + PUSH2.DOWN] = {
        x: 0,
        y: vncHeight
      },
      obj
    ));
    view.states.animationOptions = this.animationOptions;
    if (view.name === this.initialViewName) {
      this.initialView2 = view;
      this.currentView = view;
      view.states.switchInstant(PUSH2.CENTER);
      this.history.push(view);
    } else {
      view.states.switchInstant(PUSH2.RIGHT);
    }
    if (!(view.superLayer === this || viaInternalChangeEvent)) {
      view.superLayer = this;
    }
    if (view.name !== this.initialViewName) {
      this._applyBackButton(view);
    }
    return this.views.push(view);
  };

  ViewNavigationController2.prototype.transition = function(view, direction, switchInstant, preventHistory) {
    if (direction == null) {
      direction = DIR2.RIGHT;
    }
    if (switchInstant == null) {
      switchInstant = false;
    }
    if (preventHistory == null) {
      preventHistory = false;
    }
    if (view === this.currentView) {
      return false;
    }
    if (direction === DIR2.RIGHT) {
      view.states.switchInstant(PUSH2.RIGHT);
      this.currentView.states["switch"](PUSH2.LEFT);
    } else if (direction === DIR2.DOWN) {
      view.states.switchInstant(PUSH2.DOWN);
      this.currentView.states["switch"](PUSH2.UP);
    } else if (direction === DIR2.LEFT) {
      view.states.switchInstant(PUSH2.LEFT);
      this.currentView.states["switch"](PUSH2.RIGHT);
    } else if (direction === DIR2.UP) {
      view.states.switchInstant(PUSH2.UP);
      this.currentView.states["switch"](PUSH2.DOWN);
    } else {
      view.states.switchInstant(PUSH2.CENTER);
      this.currentView.states.switchInstant(PUSH2.LEFT);
    }
    view.states["switch"](PUSH2.CENTER);
    this.previousView = this.currentView;
    this.previousView.custom = {
      lastTransition: direction
    };
    this.currentView = view;
    if (preventHistory === false) {
      this.history.push(this.previousView);
    }
    return this.emit("change:view");
  };

  ViewNavigationController2.prototype.removeBackButton = function(view) {
    return Utils.delay(0.1, (function(_this) {
      return function() {
        return view.subLayersByName(BACKBUTTON_VIEW_NAME2)[0].visible = false;
      };
    })(this));
  };

  ViewNavigationController2.prototype.back = function() {
    var direction, lastTransition, lastView, oppositeTransition, preventHistory, switchInstant;
    lastView = this._getLastHistoryItem();
    lastTransition = lastView.custom.lastTransition;
    oppositeTransition = this._getOppositeDirection(lastTransition);
    this.transition(lastView, direction = oppositeTransition, switchInstant = false, preventHistory = true);
    return this.history.pop();
  };

  ViewNavigationController2.prototype._getLastHistoryItem = function() {
    return this.history[this.history.length - 1];
  };

  ViewNavigationController2.prototype._applyBackButton = function(view, frame) {
    if (frame == null) {
      frame = this.backButtonFrame;
    }
    return Utils.delay(0, (function(_this) {
      return function() {
        var backButton;
        if (view.backButton !== false) {
          backButton = new Layer({
            name: BACKBUTTON_VIEW_NAME2,
            width: 80,
            height: 80,
            superLayer: view
          });
          if (_this.debugMode === false) {
            backButton.backgroundColor = "transparent";
          }
          backButton.frame = frame;
          return backButton.on(Events.Click, function() {
            return _this.back();
          });
        }
      };
    })(this));
  };

  ViewNavigationController2.prototype._getOppositeDirection = function(initialDirection) {
    if (initialDirection === DIR2.UP) {
      return DIR2.DOWN;
    } else if (initialDirection === DIR2.DOWN) {
      return DIR2.UP;
    } else if (initialDirection === DIR2.RIGHT) {
      return DIR2.LEFT;
    } else if (initialDirection === DIR2.LEFT) {
      return DIR2.RIGHT;
    } else {
      return DIR2.LEFT;
    }
  };

  return ViewNavigationController2;

})(Layer);

 

/*

USAGE EXAMPLE 1 - Define InitialViewName

initialViewKey = "view1"

vnc = new ViewNavigationController
	initialViewName: initialViewKey

view1 = new Layer
	name: initialViewKey
	width:  Screen.width
	height: Screen.height
	backgroundColor: "red"
	parent: vnc
 */


/*

USAGE EXAMPLE 2 - Use default initialViewName "initialView"

vnc = new ViewNavigationController

view1 = new Layer
	name: "initialView"
	width:  Screen.width
	height: Screen.height
	backgroundColor: "red"
	parent: vnc

view2 = new Layer
	width:  Screen.width
	height: Screen.height
	backgroundColor: "green"
	parent: vnc

view1.onClick ->
	vnc.transition view2

view2.onClick ->
	vnc.back()
 */

/*  以上为卡2 ，以下为SVG            */
},{}],"SVGLayer":[function(require,module,exports){
"SVGLayer class\n\nproperties\n- linecap <string> (\"round\" || \"square\" || \"butt\")\n- fill <string> (css color)\n- stroke <string> (css color)\n- strokeWidth <number>\n- dashOffset <number> (from -1 to 1, defaults to 0)";
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.SVGLayer = (function(superClass) {
  extend(SVGLayer, superClass);

  function SVGLayer(options) {
    var cName, d, footer, header, path, t;
    if (options == null) {
      options = {};
    }
    options = _.defaults(options, {
      dashOffset: 1,
      strokeWidth: 2,
      stroke: "#28affa",
      backgroundColor: null,
      clip: false,
      fill: "transparent",
      linecap: "round"
    });
    SVGLayer.__super__.constructor.call(this, options);
    if (options.fill === null) {
      this.fill = null;
    }
    this.width += options.strokeWidth / 2;
    this.height += options.strokeWidth / 2;
    d = new Date();
    t = d.getTime();
    cName = "c" + t;
    header = "<svg class='" + cName + "' x='0px' y='0px' width='" + this.width + "' height='" + this.height + "' viewBox='-" + (this.strokeWidth / 2) + " -" + (this.strokeWidth / 2) + " " + (this.width + this.strokeWidth / 2) + " " + (this.height + this.strokeWidth / 2) + "'>";
    path = options.path;
    footer = "</svg>";
    this.html = header + path + footer;
    Utils.domComplete((function(_this) {
      return function() {
        var domPath;
        domPath = document.querySelector('.' + cName + ' path');
        _this._pathLength = domPath.getTotalLength();
        _this.style = {
          "stroke-dasharray": _this.pathLength
        };
        return _this.dashOffset = options.dashOffset;
      };
    })(this));
  }

  SVGLayer.define("pathLength", {
    get: function() {
      return this._pathLength;
    },
    set: function(value) {
      return print("SVGLayer.pathLength is readonly");
    }
  });

  SVGLayer.define("linecap", {
    get: function() {
      return this.style.strokeLinecap;
    },
    set: function(value) {
      return this.style.strokeLinecap = value;
    }
  });

  SVGLayer.define("strokeLinecap", {
    get: function() {
      return this.style.strokeLinecap;
    },
    set: function(value) {
      return this.style.strokeLinecap = value;
    }
  });

  SVGLayer.define("fill", {
    get: function() {
      return this.style.fill;
    },
    set: function(value) {
      if (value === null) {
        value = "transparent";
      }
      return this.style.fill = value;
    }
  });

  SVGLayer.define("stroke", {
    get: function() {
      return this.style.stroke;
    },
    set: function(value) {
      return this.style.stroke = value;
    }
  });

  SVGLayer.define("strokeColor", {
    get: function() {
      return this.style.stroke;
    },
    set: function(value) {
      return this.style.stroke = value;
    }
  });

  SVGLayer.define("strokeWidth", {
    get: function() {
      return Number(this.style.strokeWidth.replace(/[^\d.-]/g, ''));
    },
    set: function(value) {
      return this.style.strokeWidth = value;
    }
  });

  SVGLayer.define("dashOffset", {
    get: function() {
      return this._dashOffset;
    },
    set: function(value) {
      var dashOffset;
      this._dashOffset = value;
      if (this.pathLength != null) {
        dashOffset = Utils.modulate(value, [0, 1], [this.pathLength, 0]);
        return this.style.strokeDashoffset = dashOffset;
      }
    }
  });

  return SVGLayer;

})(Layer);


},{}],"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];


//以上为SVG 以下为底部导航--------------------------------------------------------------------------

},{}],"tabBarModule":[function(require,module,exports){
 
/*
	tabBarModule
	–
	Created by Petter Nilsson
	http://petter.pro
 */
var defaults, getItemFromName, setBadgeValue, setSelected, updateViews;

defaults = {
  screenWidth: 360,
  screenHeight: 675,
  barHeight: 50,
  labelOffset: -22,   //文字的到底的高
  iconOffset: -7,   //图到底的高
   tintColor: "#007aff",           //高亮的色
   tintColorUnselected: "#929292",  //没高亮的色
  //blur: 40,
  opacity: 0.95,
  borderShadow: "0px -1px 0px 0px rgba(0,0,0,0.32)",
  backgroundColor: "#f8f8f8",  //导航的背景色
  showLabels: true,
  badgeSize: 36/2,
  badgeColor: "#FF3B30" //圆点的颜色
 
};

defaults.labelTextStyle = {
  fontSize: "12px",
  textAlign: "center",
  fontFamily: "Helvetica Neue', sans-serif"
};

defaults.badgeTextStyle = {
  fontSize: "2px",
  lineHeight: "19px", //红的点的高
  color: "#fff",
  textAlign: "center",
  fontFamily: "Helvetica Neue', sans-serif"
};

exports.defaults = defaults;

getItemFromName = function(name) {
  var item, j, len, ref;
  ref = this.items;
  for (j = 0, len = ref.length; j < len; j++) {
    item = ref[j];
    if (item.name === name) {
      return item;
    }
  }
};

updateViews = function(selectedItem) {
  var item, j, len, ref, results;
  ref = this.items;
  results = [];
  for (j = 0, len = ref.length; j < len; j++) {
    item = ref[j];
    if (item.view != null) {
      if (item.view === selectedItem.view) {
        item.view.visible = true;  //变换
      } else {
        item.view.visible = false;
      }
      if (item.blurView === selectedItem.blurView) {
        results.push(item.blurView.visible =false);
      } else {
        results.push(item.blurView.visible =  false);
      }
    } else {
      results.push(void 0);
    }
  }
  return results;
};
//变换底部
setSelected = function(name) {
  var item, j, len, ref, results;
  if (name !== this.selected) {
    ref = this.items;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      item = ref[j];
      if (item.name === name) {
      item.iconLayer.backgroundColor = defaults.tintColor;
       if (item.labelLayer) {
         item.labelLayer.style = {
            "color": defaults.tintColor
        };
       }
        if (item.iconLayer.selectedIcon) {
          item.iconLayer.style = {
            "-webkit-mask-image": "url(" + item.iconLayer.selectedIcon + ")"
          };
        }
        this.selected = item.name;
        this.updateViews(item);  //页面变换
        results.push(this.emit("tabBarDidSwitch", item.name));
      } else {
        item.iconLayer.backgroundColor = defaults.tintColorUnselected;
        if (item.labelLayer) {
          item.labelLayer.style = {
            "color": defaults.tintColorUnselected
          };
        }
        if (item.iconLayer.selectedIcon) {
          results.push(item.iconLayer.style = {
            "-webkit-mask-image": "url(" + item.iconLayer.icon + ")"
          });
        } else {
          results.push(void 0);
        }
      }
    }
    return results;
  }
};

setBadgeValue = function(name, value) {
  var item, j, len, ref, results;
  ref = this.items;
  results = [];
  for (j = 0, len = ref.length; j < len; j++) {
    item = ref[j];
    if (item.name === name) {
      if (value) {
        item.badgeLayer.html = value;
        results.push(item.badgeLayer.visible = true);
      } else {
        results.push(item.badgeLayer.visible = false);
      }
    } else {
      results.push(void 0);
    }
  }
  return results;
};

exports.tabBar = function(barItems) {
  var background, badgeLayer, blurView, i, iconLayer, itemCount, itemLayer, labelLayer, name, params, tabBar;
  tabBar = new Layer({
    x: 0,  //底部的位置
    y: defaults.screenHeight - defaults.barHeight, 
    width: defaults.screenWidth,
    height: defaults.barHeight,
    backgroundColor: defaults.backgroundColor, 
    superLayer: home1  //底部的位置
 
  });
  tabBar.style = {
    "box-shadow": defaults.borderShadow
  };
  tabBar.getItemFromName = getItemFromName;
  tabBar.updateViews = updateViews;
  tabBar.setSelected = setSelected;
  tabBar.setBadgeValue = setBadgeValue;
  tabBar.selected = null;
  tabBar.items = [];
  background = new Layer({
    x: 0,
    y: 0,
    width: defaults.screenWidth,
    height: defaults.barHeight,
    backgroundColor: defaults.backgroundColor,
    opacity: defaults.opacity,
    superLayer: tabBar
  });
  itemCount = Object.keys(barItems).length;
  i = 0;
  for (name in barItems) {
    params = barItems[name];
    itemLayer = new Layer({
      backgroundColor: "none",
      width: defaults.screenWidth / itemCount,
      height: defaults.barHeight,
      x: i * (defaults.screenWidth / itemCount),
      y: 0,
      superLayer: tabBar,
      name: name
    });
  if (params.view != null) {
    blurView = params.view.copy();
      if (ScrollComponent.prototype.isPrototypeOf(blurView)) {
        params.view.content.blur = defaults.blur;
      } else {
		params.view.blur = defaults.blur;  
      
      }
      blurView.superLayer = tabBar;
      blurView.index = 0;
      blurView.y = blurView.y - (defaults.screenHeight - defaults.barHeight);
      itemLayer.view = params.view;
      itemLayer.blurView = blurView;
    } 
    iconLayer = new Layer({
     // width: 30,
      //height: 30, icon的高宽
      superLayer: itemLayer
    });
    iconLayer.icon = params.icon;
    if (params.selectedIcon != null) {
      iconLayer.selectedIcon = params.selectedIcon;
    }
    iconLayer.style = {
      "-webkit-mask-image": "url(" + iconLayer.icon + ")",
      "-webkit-mask-repeat": "no-repeat",
      "-webkit-mask-position": "center center"
    };
    iconLayer.centerX();
    iconLayer.centerY(defaults.iconOffset);
    itemLayer.iconLayer = iconLayer;
    if (defaults.showLabels) {
      labelLayer = new Layer({
        width: itemLayer.width,
        x: 0,
        y: defaults.barHeight + defaults.labelOffset,
        superLayer: itemLayer,
        backgroundColor: "none"
      });
      labelLayer.html = name;
      labelLayer.style = defaults.labelTextStyle;
      itemLayer.labelLayer = labelLayer;
    }
    badgeLayer = new Layer({
      width: defaults.badgeSize,
      height: defaults.badgeSize,
      x: 0,
      y: -3,       //红的点的高
      borderRadius: 9,
      superLayer: itemLayer,
      backgroundColor: defaults.badgeColor
    });
    badgeLayer.style = defaults.badgeTextStyle;
    badgeLayer.centerX(10);
    itemLayer.badgeLayer = badgeLayer;
    itemLayer.badgeLayer.visible = false;
    tabBar.items.push(itemLayer);
    itemLayer.on(Events.Click, function() {
      return tabBar.setSelected(this.name);
    });
    i++;
  }
  tabBar.setSelected(tabBar.items[0].name);
  return tabBar;
};


//以上为底部导航，以下为滑动时旁边的等下面的到位才变
},{}],"StickyHeaders":[function(require,module,exports){

/*
StickyHeaders for Framer
By @72mena
 */
exports.StickyHeaders = (function() {
  function StickyHeaders() {}

  StickyHeaders.enableFor = function(sC, topMargin) {
    var dataSH, header, i, j, len, stickyHeaders;
    dataSH = [];
    if (topMargin == null) {
      topMargin = 0;
    }
    stickyHeaders = sC.content.childrenWithName("StickyHeader");
    if (stickyHeaders.length > 0) {
      for (i = j = 0, len = stickyHeaders.length; j < len; i = ++j) {
        header = stickyHeaders[i];
        dataSH.push(header.y);
      }
    }
    return sC.content.on("change:y", function() {
      var currentY, k, len1, prevMaxY, prevStickyPosition, results;
      if (stickyHeaders.length > 0) {
        results = [];
        for (i = k = 0, len1 = stickyHeaders.length; k < len1; i = ++k) {
          header = stickyHeaders[i];
          header.y = dataSH[i];
          currentY = dataSH[i] - sC.scrollY;
          if (i > 0) {
            prevStickyPosition = dataSH[i] - stickyHeaders[i - 1].height;
            prevMaxY = stickyHeaders[i - 1].height + topMargin;
            if (currentY < prevMaxY) {
              stickyHeaders[i - 1].y = prevStickyPosition;
            }
          }
          if (currentY <= topMargin) {
            results.push(header.y = sC.scrollY + topMargin);
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    });
  };

  return StickyHeaders;

})();

//圆点圈转转转
},{}],"spinner":[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.spinnerView = (function(superClass) {
  var isSpinning;

  extend(spinnerView, superClass);

  spinnerView.prototype.viewArray = [];

  spinnerView.prototype.circleArray = [];

  spinnerView.prototype.backgroundArray = [];

  isSpinning = false;

  function spinnerView(options) {
    var base, base1, base2, base3, base4, base5, base6, containerAnimation, immersiveBG;
    this.options = options != null ? options : {};
    if ((base = this.options).duration == null) {
      base.duration = 3;
    }
    if ((base1 = this.options).dotSize == null) {
      base1.dotSize = 40;
    }
    if ((base2 = this.options).dotCount == null) {
      base2.dotCount = 4;
    }
    if ((base3 = this.options).loaderHeight == null) {
      base3.loaderHeight = 160;
    }
    if ((base4 = this.options).dotColor == null) {
      base4.dotColor = "#fff";
    }
    this.options.width = 0;
    this.options.height = 0;
    this.options.opacity = 0;
    if ((base5 = this.options).hasBackgroundColor == null) {
      base5.hasBackgroundColor = "";
    }
    if ((base6 = this.options).backgroundOpacity == null) {
      base6.backgroundOpacity = 1;
    }
    spinnerView.__super__.constructor.call(this, this.options);
    this.centerX();
    this.centerY();
    this.y = this.y - 20;
    this.x = this.x - 20;
    this.states.add({
      hide: {
        opacity: 0
      },
      show: {
        opacity: 1
      }
    });
    this.states.animationOptions = {
      time: .44
    };
    if (this.options.hasBackgroundColor !== "") {
      immersiveBG = new Layer({
        width: Screen.width,
        height: Screen.height,
        backgroundColor: this.options.hasBackgroundColor,
        opacity: this.options.backgroundOpacity
      });
      immersiveBG.sendToBack();
      immersiveBG.states.add({
        hide: {
          opacity: 0
        },
        show: {
          opacity: this.options.backgroundOpacity
        }
      });
      immersiveBG.states.animationOptions = {
        time: .44
      };
      immersiveBG.states.switchInstant("hide");
      this.backgroundArray.push(immersiveBG);
    }
    containerAnimation = new Animation({
      layer: this,
      properties: {
        rotation: this.rotation + 360
      },
      curve: "linear",
      repeat: 1000,
      time: this.options.duration * 0.932
    });
    this.on(Events.StateDidSwitch, function(from, to, states) {
      var i, j, ref;
      if (to === "hide") {
        for (i = j = 0, ref = this.options.dotCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          this.viewArray[i].destroy();
          this.circleArray[i].destroy();
        }
        this.circleArray = [];
        this.viewArray = [];
        this.rotation = 0;
        return containerAnimation.stop();
      }
    });
    this.on(Events.StateWillSwitch, function(from, to, states) {
      if (to === "show") {
        return containerAnimation.start();
      }
    });
  }

  spinnerView.prototype.circleAnimation = function() {
    var i, j, offset, ref, results, scaleAnimationA, scaleAnimationB;
    results = [];
    for (i = j = 0, ref = this.viewArray.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      offset = Utils.round(i * 0.1 + 0.05, 2);
      this.viewArray[i].animate({
        properties: {
          rotation: this.viewArray[i].rotation + 180
        },
        delay: offset,
        time: this.options.duration / 4 + 0.3,
        curve: "ease-in-out"
      });
      scaleAnimationA = new Animation({
        layer: this.circleArray[i],
        properties: {
          scale: 0.44
        },
        delay: offset / 2,
        time: this.options.duration / 8 + 0.15,
        curve: "ease-in-out"
      });
      scaleAnimationB = scaleAnimationA.reverse();
      scaleAnimationA.on(Events.AnimationEnd, scaleAnimationB.start);
      results.push(scaleAnimationA.start());
    }
    return results;
  };

  spinnerView.prototype.start = function() {
    var c, i, j, ref, self, v;
    if (isSpinning === true) {
      return;
    }
    isSpinning = true;
    if (this.options.hasBackgroundColor !== "") {
      this.backgroundArray[0].states["switch"]("show");
    }
    for (i = j = 0, ref = this.options.dotCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      v = new Layer({
        height: this.options.dotSize,
        width: this.options.dotSize,
        x: -this.options.dotSize / 2,
        y: -this.options.dotSize / 2,
        backgroundColor: "transparent"
      });
      this.viewArray.push(v);
      this.addChild(v);
      c = new Layer({
        height: this.options.dotSize,
        width: this.options.dotSize,
        backgroundColor: this.options.dotColor,
        y: -this.options.loaderHeight / 2,
        borderRadius: this.options.dotSize / 2
      });
      this.circleArray.push(c);
      v.addChild(c);
    }
    this.circleAnimation();
    this.states["switch"]("show");
    self = this;
    return this.viewArray[this.options.dotCount - 1].on(Events.AnimationEnd, function() {
      return self.circleAnimation();
    });
  };

  spinnerView.prototype.stop = function() {
    if (isSpinning === false) {
      return;
    }
    isSpinning = false;
    this.states["switch"]("hide");
    if (this.options.hasBackgroundColor !== "") {
      return this.backgroundArray[0].states["switch"]("hide");
    }
  };

  return spinnerView;

})(Layer);

//以上为圆点圈转转转，以下为文字层
},{}],"TextLayer":[function(require,module,exports){
var TextLayer, convertTextLayers, convertToTextLayer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TextLayer = (function(superClass) {
  extend(TextLayer, superClass);

  function TextLayer(options) {
    if (options == null) {
      options = {};
    }
    this.doAutoSize = false;
    this.doAutoSizeHeight = false;
    if (options.backgroundColor == null) {
      options.backgroundColor = options.setup ? "hsla(60, 90%, 47%, .4)" : "transparent";
    }
    if (options.color == null) {
      options.color = "red";
    }
    if (options.lineHeight == null) {
      options.lineHeight = 1.25;
    }
    if (options.fontFamily == null) {
      options.fontFamily = "Helvetica";
    }
    if (options.fontSize == null) {
      options.fontSize = 20;
    }
    if (options.text == null) {
      options.text = "Use layer.text to add text";
    }
    TextLayer.__super__.constructor.call(this, options);
    this.style.whiteSpace = "pre-line";
    this.style.outline = "none";
  }

  TextLayer.prototype.setStyle = function(property, value, pxSuffix) {
    if (pxSuffix == null) {
      pxSuffix = false;
    }
    this.style[property] = pxSuffix ? value + "px" : value;
    this.emit("change:" + property, value);
    if (this.doAutoSize) {
      return this.calcSize();
    }
  };

  TextLayer.prototype.calcSize = function() {
    var constraints, size, sizeAffectingStyles;
    sizeAffectingStyles = {
      lineHeight: this.style["line-height"],
      fontSize: this.style["font-size"],
      fontWeight: this.style["font-weight"],
      paddingTop: this.style["padding-top"],
      paddingRight: this.style["padding-right"],
      paddingBottom: this.style["padding-bottom"],
      paddingLeft: this.style["padding-left"],
      textTransform: this.style["text-transform"],
      borderWidth: this.style["border-width"],
      letterSpacing: this.style["letter-spacing"],
      fontFamily: this.style["font-family"],
      fontStyle: this.style["font-style"],
      fontVariant: this.style["font-variant"]
    };
    constraints = {};
    if (this.doAutoSizeHeight) {
      constraints.width = this.width;
    }
    size = Utils.textSize(this.text, sizeAffectingStyles, constraints);
    if (this.style.textAlign === "right") {
      this.width = size.width;
      this.x = this.x - this.width;
    } else {
      this.width = size.width;
    }
    return this.height = size.height;
  };

  TextLayer.define("autoSize", {
    get: function() {
      return this.doAutoSize;
    },
    set: function(value) {
      this.doAutoSize = value;
      if (this.doAutoSize) {
        return this.calcSize();
      }
    }
  });

  TextLayer.define("autoSizeHeight", {
    set: function(value) {
      this.doAutoSize = value;
      this.doAutoSizeHeight = value;
      if (this.doAutoSize) {
        return this.calcSize();
      }
    }
  });

  TextLayer.define("contentEditable", {
    set: function(boolean) {
      this._element.contentEditable = boolean;
      this.ignoreEvents = !boolean;
      return this.on("input", function() {
        if (this.doAutoSize) {
          return this.calcSize();
        }
       });
    }
  });

  TextLayer.define("text", {
    get: function() {
      return this._element.textContent;
    },
    set: function(value) {
      this._element.textContent = value;
      this.emit("change:text", value);
      if (this.doAutoSize) {
        return this.calcSize();
      }
    }
  });

  TextLayer.define("fontFamily", {
    get: function() {
      return this.style.fontFamily;
    },
    set: function(value) {
      return this.setStyle("fontFamily", value);
    }
  });

  TextLayer.define("fontSize", {
    get: function() {
      return this.style.fontSize.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("fontSize", value, true);
    }
  });

  TextLayer.define("lineHeight", {
    get: function() {
      return this.style.lineHeight;
    },
    set: function(value) {
      return this.setStyle("lineHeight", value);
    }
  });

  TextLayer.define("fontWeight", {
    get: function() {
      return this.style.fontWeight;
    },
    set: function(value) {
      return this.setStyle("fontWeight", value);
    }
  });

  TextLayer.define("fontStyle", {
    get: function() {
      return this.style.fontStyle;
    },
    set: function(value) {
      return this.setStyle("fontStyle", value);
    }
  });

  TextLayer.define("fontVariant", {
    get: function() {
      return this.style.fontVariant;
    },
    set: function(value) {
      return this.setStyle("fontVariant", value);
    }
  });

  TextLayer.define("padding", {
    set: function(value) {
      this.setStyle("paddingTop", value, true);
      this.setStyle("paddingRight", value, true);
      this.setStyle("paddingBottom", value, true);
      return this.setStyle("paddingLeft", value, true);
    }
  });

  TextLayer.define("paddingTop", {
    get: function() {
      return this.style.paddingTop.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingTop", value, true);
    }
  });

  TextLayer.define("paddingRight", {
    get: function() {
      return this.style.paddingRight.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingRight", value, true);
    }
  });

  TextLayer.define("paddingBottom", {
    get: function() {
      return this.style.paddingBottom.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingBottom", value, true);
    }
  });

  TextLayer.define("paddingLeft", {
    get: function() {
      return this.style.paddingLeft.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingLeft", value, true);
    }
  });

  TextLayer.define("textAlign", {
    set: function(value) {
      return this.setStyle("textAlign", value);
    }
  });

  TextLayer.define("textTransform", {
    get: function() {
      return this.style.textTransform;
    },
    set: function(value) {
      return this.setStyle("textTransform", value);
    }
  });

  TextLayer.define("letterSpacing", {
    get: function() {
      return this.style.letterSpacing.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("letterSpacing", value, true);
    }
  });

  TextLayer.define("length", {
    get: function() {
      return this.text.length;
    }
  });

  return TextLayer;

})(Layer);

convertToTextLayer = function(layer) {
  var css, cssObj, importPath, t;
  t = new TextLayer({
    name: layer.name,
    frame: layer.frame,
    parent: layer.parent
  });
  cssObj = {};
  css = layer._info.metadata.css;
  css.forEach(function(rule) {
    var arr;
    if (_.includes(rule, '/*')) {
      return;
    }
    arr = rule.split(': ');
    return cssObj[arr[0]] = arr[1].replace(';', '');
  });
  t.style = cssObj;
  importPath = layer.__framerImportedFromPath;
  if (_.includes(importPath, '@2x')) {
    t.fontSize *= 2;
    t.lineHeight = (parseInt(t.lineHeight) * 2) + 'px';
    t.letterSpacing *= 2;
  }
  t.y -= (parseInt(t.lineHeight) - t.fontSize) / 2;
  t.y -= t.fontSize * 0.1;
  t.x -= t.fontSize * 0.08;
  t.width += t.fontSize * 0.5;
  t.text = layer._info.metadata.string;
  layer.destroy();
  return t;
};

Layer.prototype.convertToTextLayer = function() {
  return convertToTextLayer(this);
};

convertTextLayers = function(obj) {
  var layer, prop, results;
  results = [];
  for (prop in obj) {
    layer = obj[prop];
    if (layer._info.kind === "text") {
      results.push(obj[prop] = convertToTextLayer(layer));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

Layer.prototype.frameAsTextLayer = function(properties) {
  var t;
  t = new TextLayer;
  t.frame = this.frame;
  t.superLayer = this.superLayer;
  _.extend(t, properties);
  this.destroy();
  return t;
};

exports.TextLayer = TextLayer;

exports.convertTextLayers = convertTextLayers;


},{}],"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];
//以上为文字层，以下为按钮效果
},{}],"buttonAnimation":[function(require,module,exports){
exports.buttonAnimation = function(button) {
  var buttonAni, buttonAniReverse;
  buttonAni = new Animation({
    layer: button,
    properties: {
      scale: 0.94,
      opacity: 0.72
    },
    time: 0.2
  });
  buttonAniReverse = buttonAni.reverse();
  buttonAni.start();
  return button.on(Events.AnimationEnd, function() {
    return buttonAniReverse.start();
  });
};

//以上为按钮效果１，以下为按钮效果２
},{}],"but_An":[function(require,module,exports){
exports.but_An = function(button) {
  var buttonAni, buttonAniReverse;
  buttonAni = new Animation({
    layer: button,
    properties: {
      opacity: 0.72
    },
    time: 0.2
  });
  buttonAniReverse = buttonAni.reverse();
  buttonAni.start();
  return button.on(Events.AnimationEnd, function() {
    return buttonAniReverse.start();
  });
};


},{}],"but_An_OO":[function(require,module,exports) {
exports.but_An_OO = function(event, layer, ripple) {	
  ripple = new Layer({
    midX: event.offsetX,
    midY: event.offsetY,
    width: 120,
    height: 120,
    superLayer: layer,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: '50%',
    scale: 0.05,
    force2d: true
  });
  ripple.animate({
    properties: {
      scale: 4,
      opacity: 0
    },
    animationOptions: {
      time: 6
    }
  });
  return ripple;
  ripple.on("end", function() {
    return ripple.destroy();
  });
 };
},{}]},{},[])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvVmlld05hdmlnYXRpb25Db250cm9sbGVyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgZXhwb3J0cy5WaWV3TmF2aWdhdGlvbkNvbnRyb2xsZXIgZXh0ZW5kcyBMYXllclxuXG5cdCMgU2V0dXAgQ2xhc3MgQ29uc3RhbnRzXG5cdElOSVRJQUxfVklFV19OQU1FID0gXCJpbml0aWFsVmlld1wiXG5cblx0QkFDS0JVVFRPTl9WSUVXX05BTUUgPSBcInZuYy1iYWNrQnV0dG9uXCJcblxuXHRBTklNQVRJT05fT1BUSU9OUyA9IFxuXHRcdHRpbWU6IDAuM1xuXHRcdGN1cnZlOiBcImVhc2UtaW4tb3V0XCJcblxuXHRCQUNLX0JVVFRPTl9GUkFNRSA9IFxuXHRcdHg6IDBcblx0XHR5OiA0MFxuXHRcdHdpZHRoOiA4OFxuXHRcdGhlaWdodDogODhcblxuXHRQVVNIID1cblx0XHRVUDogICAgIFwicHVzaFVwXCJcblx0XHRET1dOOiAgIFwicHVzaERvd25cIlxuXHRcdExFRlQ6ICAgXCJwdXNoTGVmdFwiXG5cdFx0UklHSFQ6ICBcInB1c2hSaWdodFwiXG5cdFx0Q0VOVEVSOiBcInB1c2hDZW50ZXJcIlxuXG5cdERJUiA9XG5cdFx0VVA6ICAgIFwidXBcIlxuXHRcdERPV046ICBcImRvd25cIlxuXHRcdExFRlQ6ICBcImxlZnRcIlxuXHRcdFJJR0hUOiBcInJpZ2h0XCJcblxuXHRERUJVR19NT0RFID0gZmFsc2VcblxuXHQjIFNldHVwIEluc3RhbmNlIGFuZCBJbnN0YW5jZSBWYXJpYWJsZXNcblx0Y29uc3RydWN0b3I6IChAb3B0aW9ucz17fSkgLT5cblxuXHRcdEB2aWV3cyA9IEBoaXN0b3J5ID0gQGluaXRpYWxWaWV3ID0gQGN1cnJlbnRWaWV3ID0gQHByZXZpb3VzVmlldyA9IEBpbml0aWFsVmlld05hbWUgPSBudWxsXG5cdFx0QG9wdGlvbnMud2lkdGggICAgICAgICAgID89IFNjcmVlbi53aWR0aFxuXHRcdEBvcHRpb25zLmhlaWdodCAgICAgICAgICA/PSBTY3JlZW4uaGVpZ2h0XG5cdFx0QG9wdGlvbnMuY2xpcCAgICAgICAgICAgID89IHRydWVcblx0XHRAb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IgPz0gXCIjOTk5XCJcblxuXHRcdHN1cGVyIEBvcHRpb25zXG5cblx0XHRAdmlld3MgICA9IFtdXG5cdFx0QGhpc3RvcnkgPSBbXVxuXHRcdEBhbmltYXRpb25PcHRpb25zID0gQG9wdGlvbnMuYW5pbWF0aW9uT3B0aW9ucyBvciBBTklNQVRJT05fT1BUSU9OU1xuXHRcdEBpbml0aWFsVmlld05hbWUgID0gQG9wdGlvbnMuaW5pdGlhbFZpZXdOYW1lICBvciBJTklUSUFMX1ZJRVdfTkFNRVxuXHRcdEBiYWNrQnV0dG9uRnJhbWUgID0gQG9wdGlvbnMuYmFja0J1dHRvbkZyYW1lICBvciBCQUNLX0JVVFRPTl9GUkFNRVxuXG5cdFx0QGRlYnVnTW9kZSA9IGlmIEBvcHRpb25zLmRlYnVnTW9kZT8gdGhlbiBAb3B0aW9ucy5kZWJ1Z01vZGUgZWxzZSBERUJVR19NT0RFXG5cblx0XHRALm9uIFwiY2hhbmdlOnN1YkxheWVyc1wiLCAoY2hhbmdlTGlzdCkgLT5cblx0XHRcdFV0aWxzLmRlbGF5IDAsID0+XG5cdFx0XHRcdEBhZGRWaWV3IHN1YkxheWVyLCB0cnVlIGZvciBzdWJMYXllciBpbiBjaGFuZ2VMaXN0LmFkZGVkXG5cblx0YWRkVmlldzogKHZpZXcsIHZpYUludGVybmFsQ2hhbmdlRXZlbnQpIC0+XG5cblx0XHR2bmNXaWR0aCAgPSBAb3B0aW9ucy53aWR0aFxuXHRcdHZuY0hlaWdodCA9IEBvcHRpb25zLmhlaWdodFxuXG5cdFx0dmlldy5zdGF0ZXMuYWRkXG5cdFx0XHRcIiN7IFBVU0guVVAgfVwiOlxuXHRcdFx0XHR4OiAwXG5cdFx0XHRcdHk6IC12bmNIZWlnaHRcblx0XHRcdFwiI3sgUFVTSC5MRUZUIH1cIjpcblx0XHRcdFx0eDogLXZuY1dpZHRoXG5cdFx0XHRcdHk6IDBcblx0XHRcdFwiI3sgUFVTSC5DRU5URVIgfVwiOlxuXHRcdFx0XHR4OiAwXG5cdFx0XHRcdHk6IDBcblx0XHRcdFwiI3sgUFVTSC5SSUdIVCB9XCI6XG5cdFx0XHRcdHg6IHZuY1dpZHRoXG5cdFx0XHRcdHk6IDBcblx0XHRcdFwiI3sgUFVTSC5ET1dOIH1cIjpcblx0XHRcdFx0eDogMFxuXHRcdFx0XHR5OiB2bmNIZWlnaHRcblxuXHRcdHZpZXcuc3RhdGVzLmFuaW1hdGlvbk9wdGlvbnMgPSBAYW5pbWF0aW9uT3B0aW9uc1xuXG5cdFx0aWYgdmlldy5uYW1lIGlzIEBpbml0aWFsVmlld05hbWVcblx0XHRcdEBpbml0aWFsVmlldyA9IHZpZXdcblx0XHRcdEBjdXJyZW50VmlldyA9IHZpZXdcblx0XHRcdHZpZXcuc3RhdGVzLnN3aXRjaEluc3RhbnQgUFVTSC5DRU5URVJcblx0XHRcdEBoaXN0b3J5LnB1c2ggdmlld1xuXHRcdGVsc2Vcblx0XHRcdHZpZXcuc3RhdGVzLnN3aXRjaEluc3RhbnQgUFVTSC5SSUdIVFxuXG5cdFx0dW5sZXNzIHZpZXcuc3VwZXJMYXllciBpcyBAIG9yIHZpYUludGVybmFsQ2hhbmdlRXZlbnRcblx0XHRcdHZpZXcuc3VwZXJMYXllciA9IEBcblxuXHRcdEBfYXBwbHlCYWNrQnV0dG9uIHZpZXcgdW5sZXNzIHZpZXcubmFtZSBpcyBAaW5pdGlhbFZpZXdOYW1lXG5cblx0XHRAdmlld3MucHVzaCB2aWV3XG5cblx0dHJhbnNpdGlvbjogKHZpZXcsIGRpcmVjdGlvbiA9IERJUi5SSUdIVCwgc3dpdGNoSW5zdGFudCA9IGZhbHNlLCBwcmV2ZW50SGlzdG9yeSA9IGZhbHNlKSAtPlxuXG5cdFx0cmV0dXJuIGZhbHNlIGlmIHZpZXcgaXMgQGN1cnJlbnRWaWV3XG5cblx0XHQjIFNldHVwIFZpZXdzIGZvciB0aGUgdHJhbnNpdGlvblxuXHRcdGlmIGRpcmVjdGlvbiBpcyBESVIuUklHSFRcblx0XHRcdHZpZXcuc3RhdGVzLnN3aXRjaEluc3RhbnQgIFBVU0guUklHSFRcblx0XHRcdEBjdXJyZW50Vmlldy5zdGF0ZXMuc3dpdGNoIFBVU0guTEVGVFxuXHRcdGVsc2UgaWYgZGlyZWN0aW9uIGlzIERJUi5ET1dOXG5cdFx0XHR2aWV3LnN0YXRlcy5zd2l0Y2hJbnN0YW50ICBQVVNILkRPV05cblx0XHRcdEBjdXJyZW50Vmlldy5zdGF0ZXMuc3dpdGNoIFBVU0guVVBcblx0XHRlbHNlIGlmIGRpcmVjdGlvbiBpcyBESVIuTEVGVFxuXHRcdFx0dmlldy5zdGF0ZXMuc3dpdGNoSW5zdGFudCAgUFVTSC5MRUZUXG5cdFx0XHRAY3VycmVudFZpZXcuc3RhdGVzLnN3aXRjaCBQVVNILlJJR0hUXG5cdFx0ZWxzZSBpZiBkaXJlY3Rpb24gaXMgRElSLlVQXG5cdFx0XHR2aWV3LnN0YXRlcy5zd2l0Y2hJbnN0YW50ICBQVVNILlVQXG5cdFx0XHRAY3VycmVudFZpZXcuc3RhdGVzLnN3aXRjaCBQVVNILkRPV05cblx0XHRlbHNlXG5cdFx0XHQjIElmIHRoZXkgc3BlY2lmaWVkIHNvbWV0aGluZyBkaWZmZXJlbnQganVzdCBzd2l0Y2ggaW1tZWRpYXRlbHlcblx0XHRcdHZpZXcuc3RhdGVzLnN3aXRjaEluc3RhbnQgUFVTSC5DRU5URVJcblx0XHRcdEBjdXJyZW50Vmlldy5zdGF0ZXMuc3dpdGNoSW5zdGFudCBQVVNILkxFRlRcblxuXHRcdCMgUHVzaCB2aWV3IHRvIENlbnRlclxuXHRcdHZpZXcuc3RhdGVzLnN3aXRjaCBQVVNILkNFTlRFUlxuXHRcdCMgY3VycmVudFZpZXcgaXMgbm93IG91ciBwcmV2aW91c1ZpZXdcblx0XHRAcHJldmlvdXNWaWV3ID0gQGN1cnJlbnRWaWV3XG5cdFx0IyBTYXZlIHRyYW5zaXRpb24gZGlyZWN0aW9uIHRvIHRoZSBsYXllcidzIGN1c3RvbSBwcm9wZXJ0aWVzXG5cdFx0QHByZXZpb3VzVmlldy5jdXN0b20gPVxuXHRcdFx0bGFzdFRyYW5zaXRpb246IGRpcmVjdGlvblxuXHRcdCMgU2V0IG91ciBjdXJyZW50VmlldyB0byB0aGUgdmlldyB3ZSd2ZSBicm91Z2h0IGluXG5cdFx0QGN1cnJlbnRWaWV3ID0gdmlld1xuXG5cdFx0IyBTdG9yZSB0aGUgbGFzdCB2aWV3IGluIGhpc3Rvcnlcblx0XHRAaGlzdG9yeS5wdXNoIEBwcmV2aW91c1ZpZXcgaWYgcHJldmVudEhpc3RvcnkgaXMgZmFsc2Vcblx0XHRcblx0XHQjIEVtaXQgYW4gZXZlbnQgc28gdGhlIHByb3RvdHlwZSBjYW4gcmVhY3QgdG8gYSB2aWV3IGNoYW5nZVxuXHRcdEBlbWl0IFwiY2hhbmdlOnZpZXdcIlxuXG5cdHJlbW92ZUJhY2tCdXR0b246ICh2aWV3KSAtPlxuXHRcdFV0aWxzLmRlbGF5IDAuMSwgPT5cblx0XHRcdHZpZXcuc3ViTGF5ZXJzQnlOYW1lKEJBQ0tCVVRUT05fVklFV19OQU1FKVswXS52aXNpYmxlID0gZmFsc2VcblxuXHRiYWNrOiAoKSAtPlxuXHRcdGxhc3RWaWV3ID0gQF9nZXRMYXN0SGlzdG9yeUl0ZW0oKVxuXHRcdGxhc3RUcmFuc2l0aW9uID0gbGFzdFZpZXcuY3VzdG9tLmxhc3RUcmFuc2l0aW9uXG5cdFx0b3Bwb3NpdGVUcmFuc2l0aW9uID0gQF9nZXRPcHBvc2l0ZURpcmVjdGlvbihsYXN0VHJhbnNpdGlvbilcblx0XHRAdHJhbnNpdGlvbihsYXN0VmlldywgZGlyZWN0aW9uID0gb3Bwb3NpdGVUcmFuc2l0aW9uLCBzd2l0Y2hJbnN0YW50ID0gZmFsc2UsIHByZXZlbnRIaXN0b3J5ID0gdHJ1ZSlcblx0XHRAaGlzdG9yeS5wb3AoKVxuXG5cdF9nZXRMYXN0SGlzdG9yeUl0ZW06ICgpIC0+XG5cdFx0cmV0dXJuIEBoaXN0b3J5W0BoaXN0b3J5Lmxlbmd0aCAtIDFdXG5cblx0X2FwcGx5QmFja0J1dHRvbjogKHZpZXcsIGZyYW1lID0gQGJhY2tCdXR0b25GcmFtZSkgLT5cblx0XHRVdGlscy5kZWxheSAwLCA9PlxuXHRcdFx0aWYgdmlldy5iYWNrQnV0dG9uIGlzbnQgZmFsc2Vcblx0XHRcdFx0YmFja0J1dHRvbiA9IG5ldyBMYXllclxuXHRcdFx0XHRcdG5hbWU6IEJBQ0tCVVRUT05fVklFV19OQU1FXG5cdFx0XHRcdFx0d2lkdGg6IDgwXG5cdFx0XHRcdFx0aGVpZ2h0OiA4MFxuXHRcdFx0XHRcdHN1cGVyTGF5ZXI6IHZpZXdcblxuXHRcdFx0XHRpZiBAZGVidWdNb2RlIGlzIGZhbHNlXG5cdFx0XHRcdFx0YmFja0J1dHRvbi5iYWNrZ3JvdW5kQ29sb3IgPSBcInRyYW5zcGFyZW50XCJcblxuXHRcdFx0XHRiYWNrQnV0dG9uLmZyYW1lID0gZnJhbWVcblxuXHRcdFx0XHRiYWNrQnV0dG9uLm9uIEV2ZW50cy5DbGljaywgPT5cblx0XHRcdFx0XHRAYmFjaygpXG5cblx0X2dldE9wcG9zaXRlRGlyZWN0aW9uOiAoaW5pdGlhbERpcmVjdGlvbikgLT5cblx0XHRpZiBpbml0aWFsRGlyZWN0aW9uIGlzIERJUi5VUFxuXHRcdFx0cmV0dXJuIERJUi5ET1dOXG5cdFx0ZWxzZSBpZiBpbml0aWFsRGlyZWN0aW9uIGlzIERJUi5ET1dOXG5cdFx0XHRyZXR1cm4gRElSLlVQXG5cdFx0ZWxzZSBpZiBpbml0aWFsRGlyZWN0aW9uIGlzIERJUi5SSUdIVFxuXHRcdFx0cmV0dXJuIERJUi5MRUZUXG5cdFx0ZWxzZSBpZiBpbml0aWFsRGlyZWN0aW9uIGlzIERJUi5MRUZUXG5cdFx0XHRyZXR1cm4gRElSLlJJR0hUXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIERJUi5MRUZUXG5cbiMjI1xuXG5VU0FHRSBFWEFNUExFIDEgLSBEZWZpbmUgSW5pdGlhbFZpZXdOYW1lXG5cbmluaXRpYWxWaWV3S2V5ID0gXCJ2aWV3MVwiXG5cbnZuYyA9IG5ldyBWaWV3TmF2aWdhdGlvbkNvbnRyb2xsZXJcblx0aW5pdGlhbFZpZXdOYW1lOiBpbml0aWFsVmlld0tleVxuXG52aWV3MSA9IG5ldyBMYXllclxuXHRuYW1lOiBpbml0aWFsVmlld0tleVxuXHR3aWR0aDogIFNjcmVlbi53aWR0aFxuXHRoZWlnaHQ6IFNjcmVlbi5oZWlnaHRcblx0YmFja2dyb3VuZENvbG9yOiBcInJlZFwiXG5cdHBhcmVudDogdm5jXG5cbiMjI1xuIyMjXG5cblVTQUdFIEVYQU1QTEUgMiAtIFVzZSBkZWZhdWx0IGluaXRpYWxWaWV3TmFtZSBcImluaXRpYWxWaWV3XCJcblxudm5jID0gbmV3IFZpZXdOYXZpZ2F0aW9uQ29udHJvbGxlclxuXG52aWV3MSA9IG5ldyBMYXllclxuXHRuYW1lOiBcImluaXRpYWxWaWV3XCJcblx0d2lkdGg6ICBTY3JlZW4ud2lkdGhcblx0aGVpZ2h0OiBTY3JlZW4uaGVpZ2h0XG5cdGJhY2tncm91bmRDb2xvcjogXCJyZWRcIlxuXHRwYXJlbnQ6IHZuY1xuXG52aWV3MiA9IG5ldyBMYXllclxuXHR3aWR0aDogIFNjcmVlbi53aWR0aFxuXHRoZWlnaHQ6IFNjcmVlbi5oZWlnaHRcblx0YmFja2dyb3VuZENvbG9yOiBcImdyZWVuXCJcblx0cGFyZW50OiB2bmNcblxudmlldzEub25DbGljayAtPlxuXHR2bmMudHJhbnNpdGlvbiB2aWV3MlxuXG52aWV3Mi5vbkNsaWNrIC0+XG5cdHZuYy5iYWNrKClcblxuIyMjIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFDQUE7QURBQSxJQUFBOzs7QUFBTSxPQUFPLENBQUM7QUFHYixNQUFBOzs7O0VBQUEsaUJBQUEsR0FBb0I7O0VBRXBCLG9CQUFBLEdBQXVCOztFQUV2QixpQkFBQSxHQUNDO0lBQUEsSUFBQSxFQUFNLEdBQU47SUFDQSxLQUFBLEVBQU8sYUFEUDs7O0VBR0QsaUJBQUEsR0FDQztJQUFBLENBQUEsRUFBRyxDQUFIO0lBQ0EsQ0FBQSxFQUFHLEVBREg7SUFFQSxLQUFBLEVBQU8sRUFGUDtJQUdBLE1BQUEsRUFBUSxFQUhSOzs7RUFLRCxJQUFBLEdBQ0M7SUFBQSxFQUFBLEVBQVEsUUFBUjtJQUNBLElBQUEsRUFBUSxVQURSO0lBRUEsSUFBQSxFQUFRLFVBRlI7SUFHQSxLQUFBLEVBQVEsV0FIUjtJQUlBLE1BQUEsRUFBUSxZQUpSOzs7RUFNRCxHQUFBLEdBQ0M7SUFBQSxFQUFBLEVBQU8sSUFBUDtJQUNBLElBQUEsRUFBTyxNQURQO0lBRUEsSUFBQSxFQUFPLE1BRlA7SUFHQSxLQUFBLEVBQU8sT0FIUDs7O0VBS0QsVUFBQSxHQUFhOztFQUdBLGtDQUFDLE9BQUQ7QUFFWixRQUFBO0lBRmEsSUFBQyxDQUFBLDRCQUFELFVBQVM7SUFFdEIsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsZUFBRCxHQUFtQjs7VUFDN0UsQ0FBQyxRQUFtQixNQUFNLENBQUM7OztXQUMzQixDQUFDLFNBQW1CLE1BQU0sQ0FBQzs7O1dBQzNCLENBQUMsT0FBbUI7OztXQUNwQixDQUFDLGtCQUFtQjs7SUFFNUIsMERBQU0sSUFBQyxDQUFBLE9BQVA7SUFFQSxJQUFDLENBQUEsS0FBRCxHQUFXO0lBQ1gsSUFBQyxDQUFBLE9BQUQsR0FB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
