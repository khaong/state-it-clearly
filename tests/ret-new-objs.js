var expect = require('expect');
var _ = require('lodash');

var challengeSeen = function (rcvdTimestamp, controller) {
  return {
    start: rcvdTimestamp
  };
};

var response = function (rcvdTimestamp, controller) {
  if (controller.state === 'ready') {
    return {
      state: "started"
    };
  }
  if (controller.state === 'started') {
    return {
      state: 'complete',
      score: rcvdTimestamp - controller.start
    };
  }

  return {};
};

var reset = function (controller) {
  if (controller.state !== 'complete') {
      return {}
  }

  return {
    score: 0,
    start: 0,
    state: "ready",
  };
};

var extendArray = function (controller) {
  return {
    list: controller.list.concat(3)
  }
}

describe("as before but return new objects of state", function () {
  var global;
  var scopedState;

  beforeEach(function () {
    global = {
      controller: {
        start: 0,
        score: 0,
        state: 'ready',
        list: [4]
      }
    };

    var makeStateImmutable = function(global) {
      return function() {
        return global.controller;
      }
    }
    scopedState = makeStateImmutable(global);
  });

  it("should allow a standard game", function () {
    var serverStartTime = 4000;
    var clientStartTime = 5000;
    var completeTime = 7000;



    global.controller = _.defaults(response(serverStartTime, scopedState()), scopedState());
    expect(global.controller.state).toBe('started');
    expect(global.controller.start).toBe(0);



    global.controller = _.defaults(challengeSeen(clientStartTime, scopedState()), scopedState());
    expect(global.controller.start).toBe(5000);



    global.controller = _.defaults(response(completeTime, scopedState()), scopedState());
    expect(global.controller.state).toBe('complete');
    expect(global.controller.start).toBe(5000);
    expect(global.controller.score).toBe(2000);



    global.controller = _.defaults(reset(scopedState()), scopedState());
    expect(global.controller.state).toBe('ready');
    expect(global.controller.start).toBe(0);
    expect(global.controller.score).toBe(0);
  });

  it("should work with adding to arrays", function () {
    global.controller = _.defaults(extendArray(scopedState()), scopedState());
    expect(global.controller.list).toEqual([4, 3]);
  });
});